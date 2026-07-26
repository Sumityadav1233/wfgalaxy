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

  console.log('Seeding products...');

  const products = [
    {
      name: 'Autumn Oversized Trench Coat',
      description: 'A premium, double-breasted trench coat tailored from mid-weight cotton-gabardine. Features storm flaps, adjustable wrist cuffs, and a matching belt for an elegant, cinched silhouette. Perfect for layering in transitioning weather.',
      price: 129.99,
      category: 'Outerwear',
      sizes: 'S,M,L,XL',
      colors: 'Camel,Black,Khaki',
      images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-stylish-autumn-outfit-34406-large.mp4',
    },
    {
      name: 'Signature Raw Denim Jacket',
      description: 'Crafted from 100% organic Japanese raw denim. This classic trucker jacket is structured, double-stitched for durability, and will form unique distress marks over time. Finished with brand-engraved metal buttons.',
      price: 89.99,
      category: 'Outerwear',
      sizes: 'S,M,L,XL,XXL',
      colors: 'Indigo,Classic Blue,Faded Black',
      images: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-posing-39843-large.mp4',
    },
    {
      name: 'Classic Linen Button-Down',
      description: 'Woven from breathable French flax linen, pre-washed for extra softness. This relaxed-fit shirt features a button-down collar, chest pocket, and curved hem. Keeps you cool and polished in warm climates.',
      price: 59.99,
      category: 'Shirts',
      sizes: 'M,L,XL',
      colors: 'Off-White,Olive,Light Blue',
      images: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      videoUrl: '',
    },
    {
      name: 'WF Galaxy Cozy Cotton Hoodie',
      description: 'An ultra-soft fleece hoodie spun from premium long-staple cotton and recycled polyester. Features a double-lined hood, heavy-duty drawstrings, and a spacious kangaroo pocket. Heavyweight fabric designed for ultimate comfort.',
      price: 69.99,
      category: 'Activewear',
      sizes: 'S,M,L,XL',
      colors: 'Ash Grey,Charcoal,Sand Gold',
      images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
      videoUrl: '',
    },
    {
      name: 'Tailored Wide-Leg Trousers',
      description: 'High-waisted trousers with double front pleats and a relaxed wide-leg cut. Structured from a premium wool-viscose blend that drapes beautifully. Features hidden side pockets and a secure hook-and-bar closure.',
      price: 79.99,
      category: 'Pants',
      sizes: 'XS,S,M,L',
      colors: 'Taupe,Dark Charcoal,Cream',
      images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
      videoUrl: '',
    },
    {
      name: 'Minimalist Silk Slip Dress',
      description: 'Cut on the bias from luxurious mulberry silk, creating a fluid, body-skimming silhouette. Features a subtle cowl neckline, adjustable crossover spaghetti straps, and a side slit. An effortlessly elegant evening piece.',
      price: 110.00,
      category: 'Dresses',
      sizes: 'XS,S,M,L',
      colors: 'Emerald Green,Champagne,Midnight Black',
      images: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80',
      videoUrl: '',
    }
  ];

  const dbProducts = [];
  for (const prod of products) {
    const created = await prisma.product.create({
      data: prod,
    });
    dbProducts.push(created);
    console.log(`- Created product: ${created.name}`);
  }

  // Create generated video crops for products that have a video
  console.log('Seeding product video crops...');
  const productWithVideo = dbProducts[0];
  const videoRecord = await prisma.productVideo.create({
    data: {
      productId: productWithVideo.id,
      rawUrl: productWithVideo.videoUrl || '',
      verticalUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-stylish-autumn-outfit-34406-large.mp4',
      squareUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-stylish-autumn-outfit-34406-large.mp4',
      horizontalUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-stylish-autumn-outfit-34406-large.mp4',
    }
  });
  console.log(`- Created video crop record for: ${productWithVideo.name}`);

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

  console.log('Seeding social posts history...');
  await prisma.socialPost.create({
    data: {
      caption: 'New Autumn collection is officially live at Shiv Chowk, Janakpur! 🍂 Check out the premium Trench Coat. #WFGALAXY #AutumnFashion',
      targetPlatforms: JSON.stringify(['youtube', 'tiktok', 'instagram']),
      status: JSON.stringify({ youtube: 'posted', tiktok: 'posted', instagram: 'posted' }),
      links: JSON.stringify({
        youtube: 'https://youtube.com/shorts/mock1',
        tiktok: 'https://tiktok.com/@wf_galaxy/video/mock1',
        instagram: 'https://instagram.com/p/mock1',
      }),
      videoId: videoRecord.id,
      productId: productWithVideo.id,
    }
  });

  console.log('Seeding orders...');
  // Generate some orders spread out over the last few days
  const now = new Date();
  const pastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d;
  };

  const sampleOrders = [
    {
      customerName: 'Abhishek Mishra',
      customerPhone: '9709141876',
      customerAddress: 'Janakpur Dham, Ward 4',
      items: JSON.stringify([
        { productId: dbProducts[0].id, name: dbProducts[0].name, quantity: 1, price: dbProducts[0].price, size: 'L', color: 'Camel' },
        { productId: dbProducts[2].id, name: dbProducts[2].name, quantity: 1, price: dbProducts[2].price, size: 'M', color: 'Off-White' }
      ]),
      totalAmount: dbProducts[0].price + dbProducts[2].price,
      status: 'DELIVERED',
      createdAt: pastDate(5),
    },
    {
      customerName: 'Priya Raj',
      customerPhone: '9709143347',
      customerAddress: 'Zero Mile, Janakpur',
      items: JSON.stringify([
        { productId: dbProducts[5].id, name: dbProducts[5].name, quantity: 1, price: dbProducts[5].price, size: 'S', color: 'Emerald Green' }
      ]),
      totalAmount: dbProducts[5].price,
      status: 'PAID',
      createdAt: pastDate(3),
    },
    {
      customerName: 'Rohan Yadav',
      customerPhone: '9705447139',
      customerAddress: 'Shiv Chowk, Janakpur',
      items: JSON.stringify([
        { productId: dbProducts[1].id, name: dbProducts[1].name, quantity: 2, price: dbProducts[1].price, size: 'XL', color: 'Indigo' }
      ]),
      totalAmount: dbProducts[1].price * 2,
      status: 'SHIPPED',
      createdAt: pastDate(2),
    },
    {
      customerName: 'Sita Kumari',
      customerPhone: '9812345678',
      customerAddress: 'Pidari Chowk, Janakpur',
      items: JSON.stringify([
        { productId: dbProducts[3].id, name: dbProducts[3].name, quantity: 1, price: dbProducts[3].price, size: 'M', color: 'Ash Grey' }
      ]),
      totalAmount: dbProducts[3].price,
      status: 'PENDING',
      createdAt: pastDate(1),
    },
    {
      customerName: 'Janak Bahadur',
      customerPhone: '9801234567',
      customerAddress: 'Ramanand Chowk, Janakpur',
      items: JSON.stringify([
        { productId: dbProducts[4].id, name: dbProducts[4].name, quantity: 1, price: dbProducts[4].price, size: 'M', color: 'Taupe' },
        { productId: dbProducts[2].id, name: dbProducts[2].name, quantity: 1, price: dbProducts[2].price, size: 'L', color: 'Light Blue' }
      ]),
      totalAmount: dbProducts[4].price + dbProducts[2].price,
      status: 'PENDING',
      createdAt: now,
    }
  ];

  for (const ord of sampleOrders) {
    await prisma.order.create({
      data: ord,
    });
  }
  console.log('- Seeded 5 sample orders.');

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
