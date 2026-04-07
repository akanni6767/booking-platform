// app/api/cron/generate-recurring/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This should be protected by a secret key in production
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const generated: any[] = [];

    // Find all active recurring expenses that need to be generated
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        AND: [
          {
            OR: [
              { lastGenerated: null },
              {
                // Check if it's time to generate next one based on frequency
                // This is simplified - in production use a proper date calculation
                lastGenerated: {
                  lte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago for demo
                },
              },
            ],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      include: { category: true },
    });

    for (const recurring of recurringExpenses) {
      // Create the expense transaction
      const expense = await prisma.transaction.create({
        data: {
          type: "EXPENSE",
          amount: recurring.amount,
          date: now,
          description: `${recurring.name} (Recurring)`,
          paymentMethod: "BANK_TRANSFER",
          categoryId: recurring.categoryId,
          businessId: recurring.businessId,
        },
      });

      // Update last generated date
      await prisma.recurringExpense.update({
        where: { id: recurring.id },
        data: { lastGenerated: now },
      });

      generated.push({
        recurringId: recurring.id,
        expenseId: expense.id,
        name: recurring.name,
        amount: recurring.amount,
      });
    }

    return NextResponse.json({
      success: true,
      generated: generated.length,
      expenses: generated,
    });
  } catch (error) {
    console.error("Generate recurring error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}