import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const accounts = await prisma.socialAccount.findMany({
      orderBy: { platform: 'asc' },
    });
    return NextResponse.json(accounts);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { platform, action, accountName } = await req.json();

    if (!platform || !action) {
      return NextResponse.json({ error: 'platform and action are required' }, { status: 400 });
    }

    if (action === 'connect') {
      const defaultNames: { [key: string]: string } = {
        youtube: 'WF GALAXY Official',
        tiktok: '@wf.galaxy3',
        instagram: '@wf.galaxy',
        facebook: 'WF Galaxy Shop',
        linkedin: 'WF GALAXY Corporate',
        pinterest: 'WF Galaxy Boards',
        threads: '@wf.galaxy.threads',
        twitter: '@wf_galaxy_x',
        telegram: 'WF Galaxy Channel',
        discord: 'WF Galaxy Server',
        snapchat: 'wfgalaxy.snap'
      };

      const finalName = accountName || defaultNames[platform] || 'WF GALAXY Connected';

      // Find if platform record already exists
      const existing = await prisma.socialAccount.findFirst({
        where: { platform },
      });

      if (existing) {
        await prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            connectionStatus: 'connected',
            accountName: finalName,
          },
        });
      } else {
        await prisma.socialAccount.create({
          data: {
            platform,
            connectionStatus: 'connected',
            accountName: finalName,
          },
        });
      }
    } else {
      // Disconnect
      const existing = await prisma.socialAccount.findFirst({
        where: { platform },
      });

      if (existing) {
        await prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            connectionStatus: 'disconnected',
          },
        });
      }
    }

    // Pull refreshed lists of all platforms in database
    const allAccounts = await prisma.socialAccount.findMany({
      orderBy: { platform: 'asc' },
    });

    return NextResponse.json(allAccounts);
  } catch (error: any) {
    console.error('Social accounts update error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
