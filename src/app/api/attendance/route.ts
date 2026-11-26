import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '2026-11-25';
    const employeeId = searchParams.get('employeeId');

    const attendances = await prisma.attendance.findMany({
      where: {
        date: date || undefined,
        employeeId: employeeId || undefined,
      },
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true, designation: true, role: true, department: true },
        },
      },
      orderBy: { checkInTime: 'asc' },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, type, location } = body; // type: 'CHECK_IN' | 'CHECK_OUT'
    const todayStr = '2026-11-25';

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayStr,
        },
      },
    });

    if (type === 'CHECK_IN') {
      const attendance = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId,
            date: todayStr,
          },
        },
        create: {
          employeeId,
          date: todayStr,
          checkInTime: new Date(),
          status: 'PRESENT',
          location: location || 'MindLyft HQ Campus',
        },
        update: {
          checkInTime: new Date(),
          status: 'PRESENT',
        },
      });
      return NextResponse.json(attendance);
    } else {
      // CHECK_OUT
      const checkIn = existing?.checkInTime || new Date();
      const checkOut = new Date();
      const hours = Math.round(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 10) / 10;

      const attendance = await prisma.attendance.update({
        where: {
          employeeId_date: {
            employeeId,
            date: todayStr,
          },
        },
        data: {
          checkOutTime: checkOut,
          workHours: hours > 0 ? hours : 8.5,
        },
      });
      return NextResponse.json(attendance);
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
