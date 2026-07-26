import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const history = await prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
    });
    return NextResponse.json(history);
  } catch (err: any) {
    console.error('Fetch post history error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
