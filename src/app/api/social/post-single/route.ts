import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';

// Helper to check and refresh OAuth tokens if they are expired
async function getFreshAccessToken(platform: string) {
  const account = await prisma.socialAccount.findFirst({
    where: { platform },
  });

  if (!account || !account.accessToken || account.accessToken.startsWith('mock-')) {
    return null;
  }

  // Check if token is expired or close to expiry (within 5 minutes)
  const isExpired = account.expiresAt ? new Date(account.expiresAt).getTime() - Date.now() < 300000 : false;

  if (isExpired && account.refreshToken) {
    try {
      const clientId = platform === 'youtube' ? process.env.GOOGLE_CLIENT_ID : 
                       platform === 'tiktok' ? process.env.TIKTOK_CLIENT_KEY : process.env.META_CLIENT_ID;
      const clientSecret = platform === 'youtube' ? process.env.GOOGLE_CLIENT_SECRET : 
                           platform === 'tiktok' ? process.env.TIKTOK_CLIENT_SECRET : process.env.META_CLIENT_SECRET;
      const tokenUrl = platform === 'youtube' ? 'https://oauth2.googleapis.com/token' : 
                       platform === 'tiktok' ? 'https://open.tiktokapis.com/v2/oauth/token/' : 'https://graph.facebook.com/v18.0/oauth/access_token';

      const bodyParams: any = {
        client_id: clientId || '',
        client_secret: clientSecret || '',
        refresh_token: account.refreshToken,
        grant_type: 'refresh_token',
      };

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(bodyParams),
      });

      if (res.ok) {
        const data = await res.json();
        const nextExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);
        
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: {
            accessToken: data.access_token,
            expiresAt: nextExpiry,
          }
        });
        return data.access_token;
      }
    } catch (err) {
      console.error('Error refreshing token for ' + platform, err);
    }
  }

  return account.accessToken;
}

export async function POST(req: NextRequest) {
  try {
    const { postId, platform, mediaUrl } = await req.json();

    if (!postId || !platform) {
      return NextResponse.json({ error: 'postId and platform are required' }, { status: 400 });
    }

    const socialPost = await prisma.socialPost.findUnique({
      where: { id: postId },
    });

    if (!socialPost) {
      return NextResponse.json({ error: 'Social post record not found' }, { status: 404 });
    }

    // 🚀 LIVE YOUTUBE DATA API UPLOAD
    if (platform === 'youtube') {
      const realToken = await getFreshAccessToken('youtube');

      if (realToken) {
        try {
          // Fetch product to retrieve promo video
          const product = await prisma.product.findFirst({
            where: {
              id: socialPost.productId || undefined,
            },
          });

          // Prioritize custom uploaded media url, then product video url, then fallback
          let videoUrl = mediaUrl || product?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-stylish-autumn-outfit-34406-large.mp4';
          
          // Download video binary data into a server buffer
          let videoBuffer: Buffer;
          if (videoUrl.startsWith('http')) {
            const videoRes = await fetch(videoUrl);
            videoBuffer = Buffer.from(await videoRes.arrayBuffer());
          } else {
            // Read local file path if URL is not remote
            videoBuffer = fs.readFileSync(videoUrl);
          }

          const boundary = 'WF_GALAXY_MULTIPART_BOUNDARY';
          const metadata = {
            snippet: {
              title: (product?.name || 'WF GALAXY Collection') + ' - Special Showcase',
              description: socialPost.caption + '\n\n📍 Visit our shop: Shiv Chowk, Janakpur.\n📞 Call us: 9709141876',
              categoryId: '22', // People & Blogs
            },
            status: {
              privacyStatus: 'public', // Set to public video
              selfDeclaredMadeForKids: false,
            }
          };

          // Build raw multipart related payload
          const bodyParts = [
            `--${boundary}\r\n`,
            `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
            JSON.stringify(metadata),
            `\r\n--${boundary}\r\n`,
            `Content-Type: video/mp4\r\n\r\n`,
            videoBuffer,
            `\r\n--${boundary}--\r\n`
          ];

          // Compute size and allocate binary buffer space
          const totalLength = bodyParts.reduce((acc, part) => {
            if (typeof part === 'string') {
              return acc + Buffer.byteLength(part);
            }
            return acc + part.length;
          }, 0);

          const multipartBody = Buffer.alloc(totalLength);
          let offset = 0;
          for (const part of bodyParts) {
            if (typeof part === 'string') {
              offset += multipartBody.write(part, offset);
            } else {
              part.copy(multipartBody, offset);
              offset += part.length;
            }
          }

          // Trigger resumable Google Upload
          const uploadRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${realToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
              'Content-Length': totalLength.toString(),
            },
            body: multipartBody,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const youtubeVideoId = uploadData.id;

            const statusMap = JSON.parse(socialPost.status);
            const linksMap = socialPost.links ? JSON.parse(socialPost.links) : {};
            statusMap.youtube = 'posted';
            linksMap.youtube = `https://youtube.com/watch?v=${youtubeVideoId}`;

            await prisma.socialPost.update({
              where: { id: socialPost.id },
              data: {
                status: JSON.stringify(statusMap),
                links: JSON.stringify(linksMap),
              },
            });

            return NextResponse.json({
              success: true,
              platform: 'youtube',
              status: 'posted',
              link: linksMap.youtube,
            });
          } else {
            const errBody = await uploadRes.json();
            console.error('YouTube API server error:', errBody);
            throw new Error('Google Upload API rejected request');
          }
        } catch (uploadErr: any) {
          console.error('YouTube live upload failed, falling back:', uploadErr);
          const statusMap = JSON.parse(socialPost.status);
          statusMap.youtube = 'failed';
          await prisma.socialPost.update({
            where: { id: socialPost.id },
            data: { status: JSON.stringify(statusMap) },
          });
          return NextResponse.json({
            success: false,
            platform: 'youtube',
            status: 'failed',
            error: uploadErr.message,
          });
        }
      }
    }

    // 🚀 SANDBOX SIMULATION FALLBACK FLOW
    // Simulate latency based on platform requirements
    const delays: { [key: string]: number } = {
      youtube: 2500,
      tiktok: 1500,
      instagram: 1800,
      facebook: 1200,
    };

    const delay = delays[platform] || 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const isSuccess = Math.random() > 0.15; // 85% success rate simulation

    const statusMap = JSON.parse(socialPost.status);
    const linksMap = socialPost.links ? JSON.parse(socialPost.links) : {};

    if (isSuccess) {
      statusMap[platform] = 'posted';
      
      const mockLinks: { [key: string]: string } = {
        youtube: 'https://youtube.com/shorts/mock-' + Math.random().toString(36).substring(7),
        tiktok: 'https://tiktok.com/@wf_galaxy/video/mock-' + Math.random().toString(36).substring(7),
        instagram: 'https://instagram.com/reel/mock-' + Math.random().toString(36).substring(7),
        facebook: 'https://facebook.com/wfgalaxy/posts/mock-' + Math.random().toString(36).substring(7),
        linkedin: 'https://linkedin.com/posts/mock-' + Math.random().toString(36).substring(7),
        pinterest: 'https://pinterest.com/pin/mock-' + Math.random().toString(36).substring(7),
        threads: 'https://threads.net/post/mock-' + Math.random().toString(36).substring(7),
        twitter: 'https://twitter.com/wfgalaxy/status/mock-' + Math.random().toString(36).substring(7),
        telegram: 'https://t.me/wfgalaxy/mock-' + Math.random().toString(36).substring(7),
        discord: 'https://discord.com/channels/mock-' + Math.random().toString(36).substring(7),
      };

      linksMap[platform] = mockLinks[platform] || `https://${platform}.com/mock-${Math.random().toString(36).substring(7)}`;
    } else {
      statusMap[platform] = 'failed';
    }

    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: JSON.stringify(statusMap),
        links: JSON.stringify(linksMap),
      },
    });

    return NextResponse.json({
      success: isSuccess,
      platform,
      status: statusMap[platform],
      link: linksMap[platform] || '',
    });
  } catch (error: any) {
    console.error('Post Single API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
