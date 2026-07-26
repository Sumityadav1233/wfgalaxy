import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    let host = req.headers.get('host') || 'localhost:3000';
    if (host.includes('127.0.0.1')) {
      host = host.replace('127.0.0.1', 'localhost');
    }
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const redirectUri = `${protocol}://${host}/api/auth/callback/${platform}`;

    // Get client credentials from environment variables
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const tiktokClientKey = process.env.TIKTOK_CLIENT_KEY;
    const metaClientId = process.env.META_CLIENT_ID;

    // 1. YouTube / Google OAuth Redirect
    if (platform === 'youtube') {
      if (!googleClientId) {
        // Fallback to sandbox simulation callback if not configured
        return NextResponse.redirect(`${protocol}://${host}/api/auth/callback/youtube?code=mock-auth-code`);
      }

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile')}` +
        `&access_type=offline` +
        `&prompt=consent`;

      return NextResponse.redirect(googleAuthUrl);
    }

    // 2. TikTok OAuth Redirect
    if (platform === 'tiktok') {
      if (!tiktokClientKey) {
        return NextResponse.redirect(`${protocol}://${host}/api/auth/callback/tiktok?code=mock-auth-code`);
      }

      const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
        `client_key=${tiktokClientKey}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=video.upload,user.info.basic`;

      return NextResponse.redirect(tiktokAuthUrl);
    }

    // 3. Meta (Instagram/Facebook) OAuth Redirect
    if (platform === 'instagram' || platform === 'facebook') {
      if (!metaClientId) {
        return NextResponse.redirect(`${protocol}://${host}/api/auth/callback/${platform}?code=mock-auth-code`);
      }

      const metaAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${metaClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,publish_video')}`;

      return NextResponse.redirect(metaAuthUrl);
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (err: any) {
    console.error('OAuth redirect error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
