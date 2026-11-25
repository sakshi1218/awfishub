import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        assignedBy: true,
        assignedTo: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task details:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      status,
      progressPercentage,
      priority,
      deadline,
      approvalStatus,
      approvalComments,
      newComment,
      authorId,
    } = body;

    const currentTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: { assignedBy: true, assignedTo: true },
    });

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let completedAt = currentTask.completedAt;
    if (status === 'COMPLETED' && currentTask.status !== 'COMPLETED') {
      completedAt = new Date();
    } else if (status !== 'COMPLETED') {
      completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: status !== undefined ? status : undefined,
        progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : undefined,
        priority: priority !== undefined ? priority : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        approvalStatus: approvalStatus !== undefined ? approvalStatus : undefined,
        approvalComments: approvalComments !== undefined ? approvalComments : undefined,
        completedAt,
      },
      include: {
        department: true,
        assignedBy: true,
        assignedTo: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If a comment was added
    if (newComment && authorId) {
      await prisma.taskComment.create({
        data: {
          taskId: params.id,
          authorId,
          content: newComment,
        },
      });
    }

    // Send notification on status change
    if (status && status !== currentTask.status) {
      const recipientId =
        status === 'SUBMITTED_FOR_REVIEW'
          ? currentTask.assignedById
          : currentTask.assignedToId;

      await prisma.notification.create({
        data: {
          recipientId,
          title: `Task Status: ${currentTask.taskId}`,
          message: `Task "${currentTask.title}" changed status to ${status.replace('_', ' ')}.`,
          type: 'TASK',
          linkUrl: '/tasks',
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
