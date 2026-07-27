import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.chatMessage.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.socialPost.deleteMany({});
  await prisma.productVideo.deleteMany({});
  await prisma.socialAccount.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('Seeding admins...');
  const defaultAdmins = [
    { email: 'admin@wfgalaxy.com' },
    { email: 'owner@wfgalaxy.com' },
    { email: 'manager@wfgalaxy.com' },
  ];
  for (const admin of defaultAdmins) {
    await prisma.admin.create({ data: admin });
  }
  console.log('- Seeded 3 admin users.');

  console.log('Database clean and ready for real catalog items.');

  console.log('Seeding social accounts...');
  const socialAccounts = [
    { platform: 'youtube', connectionStatus: 'connected', accountName: 'WF GALAXY Official' },
    { platform: 'tiktok', connectionStatus: 'connected', accountName: '@wf_galaxy' },
    { platform: 'instagram', connectionStatus: 'connected', accountName: '@wf.galaxy' },
    { platform: 'facebook', connectionStatus: 'disconnected', accountName: 'WF Galaxy Shop' },
  ];

  for (const sa of socialAccounts) {
    await prisma.socialAccount.create({ data: sa });
  }
  console.log('- Seeded 4 social accounts.');

  console.log('Seeding chat messages...');
  await prisma.chatMessage.create({
    data: {
      sessionId: 'welcome-demo-session',
      role: 'assistant',
      text: 'Namaste! Welcome to WF GALAXY. I can help you find products, check sizing, track your order, or provide details about our physical store at Shiv Chowk, Janakpur. How can I help you today?'
    }
  });

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
