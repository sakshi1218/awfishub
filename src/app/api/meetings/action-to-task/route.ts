import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionItemId, departmentId, assignedById } = body;

    const actionItem = await prisma.meetingActionItem.findUnique({
      where: { id: actionItemId },
      include: { meeting: true, assignedTo: true },
    });

    if (!actionItem) {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
    }

    if (actionItem.convertedTaskId) {
      return NextResponse.json({ error: 'Action item already converted to task' }, { status: 400 });
    }

    const taskCount = await prisma.task.count();
    const taskId = `TSK-${1000 + taskCount + 1}`;

    // Create task
    const task = await prisma.task.create({
      data: {
        taskId,
        title: `[Action Item] ${actionItem.title}`,
        description: `Action item originated from meeting "${actionItem.meeting.title}". Assigned to ${actionItem.assignedTo.name}.`,
        departmentId: departmentId || actionItem.assignedTo.departmentId || null,
        assignedById: assignedById || actionItem.meeting.hostId,
        assignedToId: actionItem.assignedToId,
        priority: 'HIGH',
        deadline: actionItem.deadline,
        status: 'IN_PROGRESS',
        progressPercentage: 0,
      },
    });

    // Link action item to task
    await prisma.meetingActionItem.update({
      where: { id: actionItemId },
      data: { convertedTaskId: task.id },
    });

    // Notify assignee
    await prisma.notification.create({
      data: {
        recipientId: actionItem.assignedToId,
        title: `Meeting Action Item Converted to Task: ${taskId}`,
        message: `Your action item "${actionItem.title}" has been created as Task ${taskId}.`,
        type: 'TASK',
        linkUrl: '/tasks',
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error converting action item to task:', error);
    return NextResponse.json({ error: 'Failed to convert action item' }, { status: 500 });
  }
}
