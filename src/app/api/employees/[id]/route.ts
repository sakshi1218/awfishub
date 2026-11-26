import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        reportingManager: true,
        reportingDirector: true,
        subordinates: true,
        directorSubordinates: true,
        tasksAssigned: { take: 5, orderBy: { createdAt: 'desc' } },
        tasksReceived: { orderBy: { updatedAt: 'desc' } },
        dailyReports: { take: 7, orderBy: { reportDate: 'desc' } },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const [history, profileUpdateHistory] = await Promise.all([
      prisma.reportingHistory.findMany({
        where: { employeeId: params.id },
        orderBy: { changeDate: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: {
          entity: 'Employee',
          entityId: params.id,
          action: 'UPDATE',
          details: { startsWith: 'Self-service profile updated:' },
        },
        select: {
          id: true,
          createdAt: true,
          details: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      ...employee,
      reportingHistory: history,
      profileUpdateHistory,
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid profile update' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const allowedKeys = new Set(['currentUserId', 'name', 'email', 'phone', 'avatarUrl']);
    if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
      return NextResponse.json({ error: 'Only permitted profile fields can be updated' }, { status: 400 });
    }

    if (typeof input.currentUserId !== 'string' || input.currentUserId !== params.id) {
      return NextResponse.json({ error: 'You can only update your own profile' }, { status: 403 });
    }

    const current = await prisma.employee.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      avatarUrl?: string | null;
    } = {};

    if ('name' in input) {
      if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 120) {
        return NextResponse.json({ error: 'Name must be between 1 and 120 characters' }, { status: 400 });
      }
      data.name = input.name.trim();
    }

    if ('email' in input) {
      if (
        typeof input.email !== 'string' ||
        input.email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
      ) {
        return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
      }
      data.email = input.email.trim().toLowerCase();
    }

    if ('phone' in input) {
      if (input.phone !== null && typeof input.phone !== 'string') {
        return NextResponse.json({ error: 'Contact number must be text' }, { status: 400 });
      }
      const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
      if (phone.length > 40) {
        return NextResponse.json({ error: 'Contact number must be 40 characters or fewer' }, { status: 400 });
      }
      data.phone = phone || null;
    }

    if ('avatarUrl' in input) {
      if (input.avatarUrl !== null && typeof input.avatarUrl !== 'string') {
        return NextResponse.json({ error: 'Profile photo must be a URL' }, { status: 400 });
      }
      const avatarUrl = typeof input.avatarUrl === 'string' ? input.avatarUrl.trim() : '';
      if (avatarUrl.length > 2048) {
        return NextResponse.json({ error: 'Profile photo URL is too long' }, { status: 400 });
      }
      if (avatarUrl) {
        try {
          const parsedUrl = new URL(avatarUrl);
          if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
            return NextResponse.json({ error: 'Profile photo URL must use HTTP or HTTPS' }, { status: 400 });
          }
        } catch {
          return NextResponse.json({ error: 'Enter a valid profile photo URL' }, { status: 400 });
        }
      }
      data.avatarUrl = avatarUrl || null;
    }

    const changedFields = [
      data.name !== undefined && data.name !== current.name ? 'Full name' : null,
      data.email !== undefined && data.email !== current.email ? 'Email' : null,
      data.phone !== undefined && data.phone !== current.phone ? 'Contact number' : null,
      data.avatarUrl !== undefined && data.avatarUrl !== current.avatarUrl ? 'Profile photo' : null,
    ].filter((field): field is string => field !== null);

    if (changedFields.length === 0) {
      return NextResponse.json({ message: 'No profile changes to save' });
    }

    if (data.email && data.email !== current.email) {
      const existing = await prisma.employee.findFirst({
        where: { email: data.email, id: { not: current.id } },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: 'That email address is already in use' }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const employee = await transaction.employee.update({
        where: { id: params.id },
        data,
        include: {
          department: true,
          reportingManager: true,
          reportingDirector: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          userId: params.id,
          action: 'UPDATE',
          entity: 'Employee',
          entityId: params.id,
          details: `Self-service profile updated: ${changedFields.join(', ')}`,
        },
      });

      return employee;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json({ error: 'Failed to update employee profile' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft deactivate or delete
    const updated = await prisma.employee.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error deactivating employee:', error);
    return NextResponse.json({ error: 'Failed to deactivate employee' }, { status: 500 });
  }
}
