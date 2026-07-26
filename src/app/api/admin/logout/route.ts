import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the admin session cookie by setting its maxAge to 0
    response.cookies.set({
      name: 'wf_galaxy_admin_session',
      value: '',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
