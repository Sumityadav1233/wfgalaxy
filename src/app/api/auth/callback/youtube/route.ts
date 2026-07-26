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

    let accountName = 'WF GALAXY Official';
    let accessToken = 'mock-google-access-token';
    let refreshToken = 'mock-google-refresh-token';
    let expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    // If it's a real code and client credentials are set
    if (code !== 'mock-auth-code' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const redirectUri = `${protocol}://${host}/api/auth/callback/youtube`;

      // 1. Exchange auth code for access & refresh tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Google Token Exchange Failed:', errorData);
        return NextResponse.redirect(`${protocol}://${host}/admin/social?error=token_exchange_failed`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token || refreshToken;
      expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

      // 2. Query YouTube channels snippet to retrieve the channel's profile name
      const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items && channelData.items[0]) {
          accountName = channelData.items[0].snippet.title;
        }
      } else {
        // Fallback to Google user info API if YouTube channel isn't created yet
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          accountName = profileData.name || accountName;
        }
      }
    }

    // 3. Save or update connection record in SQLite
    const existing = await prisma.socialAccount.findFirst({
      where: { platform: 'youtube' },
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
          platform: 'youtube',
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
    console.error('Google Callback Error:', err);
    return NextResponse.redirect(`${protocol}://${host}/admin/social?error=internal_error`);
  }
}
