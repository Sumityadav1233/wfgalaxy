import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  let host = req.headers.get('host') || 'localhost:3000';
  if (host.includes('127.0.0.1')) {
    host = host.replace('127.0.0.1', 'localhost');
  }
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${protocol}://${host}/admin/social?error=no_code`);
    }

    let accountName = '@wf_galaxy';
    let accessToken = 'mock-tiktok-access-token';
    let refreshToken = 'mock-tiktok-refresh-token';
    let expiresAt = new Date(Date.now() + 3600 * 1000);

    // If it's a real code and client credentials are set
    if (code !== 'mock-auth-code' && process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
      const redirectUri = `${protocol}://${host}/api/auth/callback/tiktok`;

      // 1. Exchange auth code for tokens
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('TikTok Token Exchange Failed:', errorData);
        return NextResponse.redirect(`${protocol}://${host}/admin/social?error=tiktok_token_failed`);
      }

      const tokenData = await tokenResponse.ok ? await tokenResponse.json() : {};
      accessToken = tokenData.access_token || accessToken;
      refreshToken = tokenData.refresh_token || refreshToken;
      expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

      // 2. Fetch TikTok User Info profile details
      const profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.data && profileData.data.user) {
          accountName = `@${profileData.data.user.username}` || profileData.data.user.display_name;
        }
      }
    }

    // 3. Save to database
    const existing = await prisma.socialAccount.findFirst({
      where: { platform: 'tiktok' },
    });

    if (existing) {
      await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          connectionStatus: 'connected',
          accountName,
          accessToken,
          refreshToken,
          expiresAt,
        },
      });
    } else {
      await prisma.socialAccount.create({
        data: {
          platform: 'tiktok',
          connectionStatus: 'connected',
          accountName,
          accessToken,
          refreshToken,
          expiresAt,
        },
      });
    }

    return NextResponse.redirect(`${protocol}://${host}/admin/social?success=connected`);
  } catch (err: any) {
    console.error('TikTok Callback Error:', err);
    return NextResponse.redirect(`${protocol}://${host}/admin/social?error=internal_error`);
  }
}
