import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');

    const notifications = await prisma.notification.findMany({
      where: recipientId ? { recipientId } : undefined,
      include: {
        recipient: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientId, title, message, type, linkUrl } = body;

    const notif = await prisma.notification.create({
      data: {
        recipientId,
        title,
        message,
        type: type || 'SYSTEM',
        linkUrl,
      },
    });

    return NextResponse.json(notif, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
