import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerPhone, customerAddress, items, totalAmount, status } = await req.json();

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Write the new order to the database
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        items: JSON.stringify(items),
        totalAmount: parseFloat(totalAmount),
        status: status || 'PENDING',
      },
    });

    return NextResponse.json(newOrder);
  } catch (error: any) {
    console.error('Order Creation API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Order Fetch API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
