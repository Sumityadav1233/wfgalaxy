import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

// Simulated AI fallback engine with natural responses based on store context
async function getSimulatedAIResponse(
  message: string,
  history: { role: string; text: string }[]
): Promise<string> {
  const query = message.toLowerCase();

  // 1. Check for Store Location / Address queries
  if (
    query.includes('where') ||
    query.includes('address') ||
    query.includes('location') ||
    query.includes('located') ||
    query.includes('place') ||
    query.includes('find you') ||
    query.includes('janakpur') ||
    query.includes('chowk')
  ) {
    return `WF GALAXY is located at **Shiv Chowk, Janakpur 45600**. We are right in the heart of the shopping hub! You can find direct directions to our store on [Google Maps](https://www.google.com/maps/place/WF+GALAXY/@26.7296091,85.9296929,19z/data=!4m6!3m5!1s0x39ec4100723dc1ff:0x8098f6dd814716d3!8m2!3d26.729636!4d85.9297216!16s%2Fg%2F11mdxqydpc). Come visit us to try on our collections in person!`;
  }

  // 2. Check for Store Contact / Phone queries
  if (
    query.includes('phone') ||
    query.includes('contact') ||
    query.includes('number') ||
    query.includes('call') ||
    query.includes('whatsapp') ||
    query.includes('reach')
  ) {
    return `You can contact WF GALAXY at any of our three hotlines:
- **9709141876**
- **9709143347**
- **9705447139**
We are available for calls and queries during store hours.`;
  }

  // 3. Check for Store Hours queries
  if (
    query.includes('hour') ||
    query.includes('time') ||
    query.includes('open') ||
    query.includes('close') ||
    query.includes('schedule')
  ) {
    return `WF GALAXY is open daily from **9:00 AM to 8:00 PM**, including weekends.`;
  }

  // 4. Check for Order Status queries
  const orderIdMatch = query.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i) || query.match(/order[-_ ]?([a-z0-9]+)/i);
  if (query.includes('order') || query.includes('status') || query.includes('track') || orderIdMatch) {
    let searchId = '';
    if (orderIdMatch) {
      searchId = orderIdMatch[0].replace(/order[-_ ]?/i, '');
    } else {
      const words = query.split(/\s+/);
      const possibleIds = words.filter(w => w.length > 4);
      if (possibleIds.length > 0) {
        searchId = possibleIds[0];
      }
    }

    if (searchId) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: { contains: searchId } },
              { customerPhone: { contains: searchId } },
              { customerName: { contains: searchId } },
            ]
          },
        });

        if (order) {
          const items = JSON.parse(order.items) as any[];
          const itemsList = items.map((i: any) => `${i.quantity}x ${i.name} (${i.size}, ${i.color})`).join(', ');
          return `I found order **#${order.id.slice(0, 8)}** under the name **${order.customerName}**!
- **Status:** ${order.status}
- **Items:** ${itemsList}
- **Total:** Rs. ${order.totalAmount.toLocaleString()}
- **Placed on:** ${new Date(order.createdAt).toLocaleDateString()}
Let me know if you need to update any delivery details!`;
        }
      } catch (err) {
        console.error('Error tracking order:', err);
      }
    }

    return `I can help you track your order! Please provide your **Order ID** or the **Phone Number** you used at checkout (e.g. "track order 9709141876" or "status of order 5a3b2c1d").`;
  }

  // 5. Check for Product recommendation queries
  let categoryMatch = '';
  if (query.includes('jacket') || query.includes('trench') || query.includes('coat') || query.includes('outerwear')) {
    categoryMatch = 'Outerwear';
  } else if (query.includes('shirt') || query.includes('t-shirt') || query.includes('linen')) {
    categoryMatch = 'Shirts';
  } else if (query.includes('hoodie') || query.includes('sweater') || query.includes('activewear')) {
    categoryMatch = 'Activewear';
  } else if (query.includes('pant') || query.includes('trouser') || query.includes('bottom') || query.includes('jeans')) {
    categoryMatch = 'Pants';
  } else if (query.includes('shoe') || query.includes('sneaker') || query.includes('boot')) {
    categoryMatch = 'Shoes';
  } else if (query.includes('accessory') || query.includes('bag') || query.includes('belt')) {
    categoryMatch = 'Accessories';
  }

  if (categoryMatch || query.includes('product') || query.includes('catalog') || query.includes('clothing') || query.includes('buy') || query.includes('sell') || query.includes('item')) {
    try {
      let productsList: any[] = [];
      
      // Try fetching from Supabase first
      const supabase = await createClient();
      let queryBuilder = supabase.from('products').select('*').limit(3);
      if (categoryMatch) {
        queryBuilder = queryBuilder.ilike('category', `%${categoryMatch}%`);
      }
      const { data: supaProducts } = await queryBuilder;
      
      if (supaProducts && supaProducts.length > 0) {
        productsList = supaProducts;
      } else {
        // Fallback to Prisma
        const prismaProducts = await prisma.product.findMany({
          where: categoryMatch ? { category: { contains: categoryMatch } } : {},
          take: 3,
        });
        if (prismaProducts) productsList = prismaProducts;
      }

      if (productsList.length > 0) {
        const prodLines = productsList.map(
          (p) => `- **[${p.name}](/product/${p.id})** (Rs. ${Number(p.price).toLocaleString()}) — ${p.category || 'Collection'}`
        ).join('\n');
        return `We have some gorgeous pieces in stock! Here are a few featured items in our collection:\n\n${prodLines}\n\nYou can click on any item to view its details or explore all items on our [Shop](/shop) page!`;
      }
    } catch (err) {
      console.error('Error fetching products for chat:', err);
    }
  }

  // 6. Sizing assistance
  if (query.includes('size') || query.includes('sizing') || query.includes('fit') || query.includes('measurement')) {
    return `Our sizing is standard. Here is a quick guide:
- **XS / S:** Tailored for chest 32-35 inches.
- **M / L:** Fitted for chest 36-40 inches.
- **XL / XXL:** Generous fit for chest 41-45 inches.
Most of our garments are designed with a contemporary, slightly relaxed silhouette. If you are between sizes, we recommend sizing up for outerwear!`;
  }

  // 7. Shipping / Return Policy
  if (query.includes('return') || query.includes('refund') || query.includes('exchange') || query.includes('shipping') || query.includes('delivery')) {
    return `We offer free shipping within Janakpur and fast delivery across Nepal!
Our exchange policy allows you to exchange items within **7 days** of purchase at our **Shiv Chowk, Janakpur** store, provided the garments are unworn with original tags attached.`;
  }

  // General welcome/fallback responses
  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('namaste')) {
    return `Namaste! Welcome to WF GALAXY Chat Assistant. 🌟 I am here to help you browse our collections, look up your order status, verify sizing, or give you directions to our store at Shiv Chowk, Janakpur. How can I help you today?`;
  }

  return `I want to make sure I answer you perfectly! Feel free to ask: "Where is your store located?", "Show me shoes or shirts", or "Track order 9709141876". How can I assist you?`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }

    // Save user message to database if possible
    try {
      await prisma.chatMessage.create({
        data: { sessionId, role: 'user', text: message },
      });
    } catch (dbErr) {
      console.warn('Database save warning for user chat message:', dbErr);
    }

    // Retrieve history
    let formattedHistory: { role: string; text: string }[] = [];
    try {
      const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 10,
      });
      formattedHistory = history.map(h => ({ role: h.role, text: h.text }));
    } catch (err) {
      // Ignored if DB history lookup fails
    }

    const replyText = await getSimulatedAIResponse(message, formattedHistory);

    // Save assistant reply if possible
    let savedReply = {
      role: 'assistant',
      text: replyText,
      createdAt: new Date().toISOString(),
    };

    try {
      const dbSaved = await prisma.chatMessage.create({
        data: { sessionId, role: 'assistant', text: replyText },
      });
      savedReply = dbSaved as any;
    } catch (dbErr) {
      console.warn('Database save warning for assistant reply:', dbErr);
    }

    return NextResponse.json(savedReply);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      role: 'assistant', 
      text: 'Namaste! Welcome to WF GALAXY. How can I assist you with our products today?' 
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json([]);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Get Chat History Error:', error);
    return NextResponse.json([]);
  }
}
