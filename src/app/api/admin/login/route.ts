import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // Default password check
    if (password === 'admin123') {
      const response = NextResponse.json({ success: true });
      
      // Set HttpOnly cookie for session tracking (lasts 1 day)
      response.cookies.set({
        name: 'wf_galaxy_admin_session',
        value: 'true',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json({ error: 'Incorrect credentials' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
