import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [visits, fdpSessions, agreements, leads, targets, employees] = await Promise.all([
      prisma.collegeVisit.findMany({ include: { visitedBy: true, college: true } }),
      prisma.fDPSession.findMany({ include: { trainer: true, college: true } }),
      prisma.collegeAgreement.findMany({ include: { college: true } }),
      prisma.salesLead.findMany({ include: { assignedTo: true, college: true } }),
      prisma.salesTarget.findMany({ include: { employee: true, department: true } }),
      prisma.employee.findMany({
        where: { role: { in: ['SALES_DIRECTOR', 'SALES_EMPLOYEE', 'MANAGER'] } },
      }),
    ]);

    // Aggregate statistics
    const totalVisits = visits.length;
    const totalFDPs = fdpSessions.length;
    const totalAgreements = agreements.length;
    const totalLeads = leads.length;
    const convertedLeads = leads.filter((l) => l.currentStage === 'CONVERTED').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    const pipelineRevenue = leads
      .filter((l) => l.currentStage !== 'LOST')
      .reduce((acc, curr) => acc + (curr.estimatedDealValue || 0), 0);

    const closedRevenue = leads
      .filter((l) => l.currentStage === 'CONVERTED')
      .reduce((acc, curr) => acc + (curr.estimatedDealValue || 0), 0);

    // Stage breakdown for pipeline charts
    const stageCounts: Record<string, number> = {
      NEW_LEAD: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      MEETING_SCHEDULED: 0,
      PROPOSAL_SENT: 0,
      NEGOTIATION: 0,
      CONVERTED: 0,
      LOST: 0,
    };
    leads.forEach((l) => {
      if (stageCounts[l.currentStage] !== undefined) {
        stageCounts[l.currentStage]++;
      }
    });

    // Employee-wise visits & lead count
    const employeePerformance = employees.map((emp) => {
      const empVisits = visits.filter((v) => v.visitedById === emp.id).length;
      const empLeads = leads.filter((l) => l.assignedToId === emp.id);
      const empConverted = empLeads.filter((l) => l.currentStage === 'CONVERTED').length;
      const empRevenue = empLeads
        .filter((l) => l.currentStage === 'CONVERTED')
        .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

      return {
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        visits: empVisits,
        leadsAssigned: empLeads.length,
        converted: empConverted,
        revenue: empRevenue,
      };
    });

    return NextResponse.json({
      summary: {
        totalVisits,
        totalFDPs,
        totalAgreements,
        totalLeads,
        convertedLeads,
        conversionRate,
        pipelineRevenue,
        closedRevenue,
      },
      stageCounts,
      employeePerformance,
      targets,
    });
  } catch (error) {
    console.error('Error fetching sales performance:', error);
    return NextResponse.json({ error: 'Failed to fetch sales performance' }, { status: 500 });
  }
}
