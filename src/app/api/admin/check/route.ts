import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    return NextResponse.json({ isAdmin: !!admin });
  } catch (error) {
    console.error('Admin Check Error:', error);
    // Default allowed fallback emails
    const allowedAdmins = ['mrgf7h@gmail.com', 'admin@wfgalaxy.com', 'owner@wfgalaxy.com', 'manager@wfgalaxy.com'];
    return NextResponse.json({ isAdmin: allowedAdmins.includes(email.toLowerCase()) });
  }
}
