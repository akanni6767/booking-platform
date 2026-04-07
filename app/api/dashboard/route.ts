// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get dashboard data (same queries as in page.tsx)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalRevenue, totalExpenses, outstandingRows] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          businessId,
          type: "INCOME",
          date: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          businessId,
          type: "EXPENSE",
          date: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.$queryRaw<{ outstanding: unknown }[]>`
        SELECT COALESCE(SUM("total" - COALESCE("paidAmount", 0)), 0) AS outstanding
        FROM "Invoice"
        WHERE "businessId" = ${businessId}
          AND status IN ('SENT', 'OVERDUE')
      `,
    ]);

    const outstanding = Number(outstandingRows[0]?.outstanding ?? 0);

    const recentTransactions = await prisma.transaction.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    const recentInvoices = await prisma.invoice.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const revenue = Number(totalRevenue._sum.amount ?? 0);
    const expenses = Number(totalExpenses._sum.amount ?? 0);

    return NextResponse.json({
      summary: {
        revenue,
        expenses,
        profit: revenue - expenses,
        outstanding,
      },
      recentTransactions,
      recentInvoices,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}