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

    let accountName = 'WF Galaxy Shop';
    let accessToken = 'mock-facebook-access-token';
    let refreshToken = 'mock-facebook-refresh-token';
    let expiresAt = new Date(Date.now() + 3600 * 1000 * 24 * 60);

    // If it's a real code and client credentials are set
    if (code !== 'mock-auth-code' && process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) {
      const redirectUri = `${protocol}://${host}/api/auth/callback/facebook`;

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

      // 2. Fetch linked Facebook Page name details
      const profileResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=name&access_token=${accessToken}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        accountName = profileData.name || accountName;
      }
    }

    // 3. Save to database
    const existing = await prisma.socialAccount.findFirst({
      where: { platform: 'facebook' },
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
          platform: 'facebook',
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
    console.error('Facebook Callback Error:', err);
    return NextResponse.redirect(`${protocol}://${host}/admin/social?error=internal_error`);
  }
}
