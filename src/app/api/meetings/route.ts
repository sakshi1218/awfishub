import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        host: {
          select: { id: true, name: true, designation: true },
        },
        participants: {
          include: {
            employee: {
              select: { id: true, name: true, designation: true, role: true },
            },
          },
        },
        actionItems: {
          include: {
            assignedTo: {
              select: { id: true, name: true, designation: true },
            },
            convertedTask: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      meetingType,
      agenda,
      scheduledAt,
      durationMinutes,
      locationOrLink,
      hostId,
      participantIds,
      actionItems,
    } = body;

    const meeting = await prisma.meeting.create({
      data: {
        title,
        meetingType: meetingType || 'DEPARTMENT_MEETING',
        agenda,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: Number(durationMinutes) || 45,
        locationOrLink: locationOrLink || 'MindLyft Conference Room',
        hostId,
        participants: {
          create: (participantIds || []).map((empId: string) => ({
            employeeId: empId,
            attendanceStatus: 'INVITED',
          })),
        },
        actionItems: {
          create: (actionItems || []).map((item: any) => ({
            title: item.title,
            assignedToId: item.assignedToId,
            deadline: new Date(item.deadline),
          })),
        },
      },
      include: {
        host: true,
        participants: { include: { employee: true } },
        actionItems: { include: { assignedTo: true } },
      },
    });

    // Notify participants
    for (const empId of participantIds || []) {
      await prisma.notification.create({
        data: {
          recipientId: empId,
          title: `Meeting Invitation: ${title}`,
          message: `You are invited to ${title} on ${new Date(scheduledAt).toLocaleString()}.`,
          type: 'MEETING',
          linkUrl: '/meetings',
        },
      });
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
