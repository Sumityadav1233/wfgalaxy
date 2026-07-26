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

    let accountName = '@wf.galaxy';
    let accessToken = 'mock-instagram-access-token';
    let refreshToken = 'mock-instagram-refresh-token';
    let expiresAt = new Date(Date.now() + 3600 * 1000 * 24 * 60); // Meta long-lived tokens last 60 days

    // If it's a real code and client credentials are set
    if (code !== 'mock-auth-code' && process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) {
      const redirectUri = `${protocol}://${host}/api/auth/callback/instagram`;

      // 1. Exchange auth code for Meta access token
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.META_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${process.env.META_CLIENT_SECRET}` +
        `&code=${code}`
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Meta Token Exchange Failed:', errorData);
        return NextResponse.redirect(`${protocol}://${host}/admin/social?error=meta_token_failed`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600 * 24 * 60) * 1000);

      // 2. Fetch linked Instagram Business Profile details
      const profileResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{username,name}&access_token=${accessToken}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.data && profileData.data[0] && profileData.data[0].instagram_business_account) {
          accountName = `@${profileData.data[0].instagram_business_account.username}`;
        }
      }
    }

    // 3. Save to database
    const existing = await prisma.socialAccount.findFirst({
      where: { platform: 'instagram' },
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
          platform: 'instagram',
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
    console.error('Instagram Callback Error:', err);
    return NextResponse.redirect(`${protocol}://${host}/admin/social?error=internal_error`);
  }
}
