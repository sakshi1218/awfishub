import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const assignedToId = searchParams.get('assignedToId');

    const leads = await prisma.salesLead.findMany({
      where: {
        currentStage: stage || undefined,
        assignedToId: assignedToId || undefined,
      },
      include: {
        college: true,
        assignedTo: {
          select: { id: true, name: true, designation: true },
        },
        followups: {
          include: {
            conductedBy: { select: { id: true, name: true } },
          },
          orderBy: { followupDate: 'desc' },
        },
      },
      orderBy: { lastInteractionDate: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching CRM leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      collegeId,
      clientName,
      contactPerson,
      phone,
      email,
      interestedService,
      leadSource,
      assignedToId,
      interestLevel,
      estimatedDealValue,
      currentStage,
      nextFollowupDate,
      notes,
    } = body;

    const lead = await prisma.salesLead.create({
      data: {
        collegeId: collegeId || null,
        clientName,
        contactPerson,
        phone,
        email,
        interestedService: interestedService || 'CAMPUS_TRAINING',
        leadSource: leadSource || 'COLLEGE_VISIT',
        assignedToId: assignedToId || null,
        interestLevel: interestLevel || 'HIGH',
        estimatedDealValue: Number(estimatedDealValue) || 0,
        currentStage: currentStage || 'NEW_LEAD',
        nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
        notes,
      },
      include: {
        college: true,
        assignedTo: true,
      },
    });

    // Notify assigned sales executive
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          recipientId: assignedToId,
          title: `New Sales Lead Assigned: ${clientName}`,
          message: `You were assigned lead for ${clientName} (${contactPerson}) in stage ${currentStage || 'NEW_LEAD'}.`,
          type: 'SALES',
          linkUrl: '/sales/leads',
        },
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating CRM lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      currentStage,
      estimatedDealValue,
      interestLevel,
      lostReason,
      notes,
      newFollowup,
      conductedById,
    } = body;

    const updated = await prisma.salesLead.update({
      where: { id },
      data: {
        currentStage: currentStage || undefined,
        estimatedDealValue: estimatedDealValue !== undefined ? Number(estimatedDealValue) : undefined,
        interestLevel: interestLevel || undefined,
        lostReason: lostReason || undefined,
        notes: notes || undefined,
        lastInteractionDate: new Date(),
      },
      include: {
        college: true,
        assignedTo: true,
        followups: true,
      },
    });

    // Add followup log if provided
    if (newFollowup && conductedById) {
      await prisma.salesFollowup.create({
        data: {
          leadId: id,
          conductedById,
          interactionType: newFollowup.interactionType || 'CALL',
          summary: newFollowup.summary,
          outcome: newFollowup.outcome || 'POSITIVE',
          nextFollowupDate: newFollowup.nextFollowupDate ? new Date(newFollowup.nextFollowupDate) : null,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating CRM lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
