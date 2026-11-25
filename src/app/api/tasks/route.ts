import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedToId = searchParams.get('assignedToId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: assignedToId || undefined,
        departmentId: departmentId || undefined,
        status: status || undefined,
        priority: priority || undefined,
      },
      include: {
        department: true,
        assignedBy: {
          select: { id: true, name: true, designation: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, designation: true, role: true },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, designation: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      departmentId,
      assignedById,
      assignedToId,
      priority,
      startDate,
      deadline,
    } = body;

    // Generate readable Task ID like TSK-1007
    const count = await prisma.task.count();
    const taskId = `TSK-${1000 + count + 1}`;

    const task = await prisma.task.create({
      data: {
        taskId,
        title,
        description,
        departmentId: departmentId || null,
        assignedById,
        assignedToId,
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : new Date(),
        deadline: new Date(deadline),
        status: 'NOT_STARTED',
        progressPercentage: 0,
      },
      include: {
        department: true,
        assignedBy: true,
        assignedTo: true,
      },
    });

    // Notify assigned employee
    await prisma.notification.create({
      data: {
        recipientId: assignedToId,
        title: `New Task Assigned: ${taskId}`,
        message: `${task.assignedBy.name} assigned you: ${title}. Deadline: ${new Date(deadline).toLocaleDateString()}`,
        type: 'TASK',
        linkUrl: '/tasks',
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
