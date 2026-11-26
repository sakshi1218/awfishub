import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.fDPSession.findMany({
      include: {
        college: true,
        trainer: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching FDP sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch FDP sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      collegeId,
      topic,
      sessionDate,
      trainerName,
      trainerEmployeeId,
      participantsCount,
      durationHours,
      feedbackSummary,
      certificatesIssuedCount,
      status,
    } = body;

    const session = await prisma.fDPSession.create({
      data: {
        collegeId,
        topic,
        sessionDate: new Date(sessionDate),
        trainerName,
        trainerEmployeeId: trainerEmployeeId || null,
        participantsCount: Number(participantsCount) || 0,
        durationHours: Number(durationHours) || 4.0,
        feedbackSummary,
        certificatesIssuedCount: Number(certificatesIssuedCount) || 0,
        status: status || 'COMPLETED',
      },
      include: {
        college: true,
        trainer: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating FDP session:', error);
    return NextResponse.json({ error: 'Failed to create FDP session' }, { status: 500 });
  }
}
