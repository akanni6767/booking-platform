// app/(dashboard)/expenses/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";
import { Card } from "@/components/ui/Card";

async function getExpensesData(businessId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [expenses, categories, recurringExpenses, monthlyBreakdown] = await Promise.all([
    // Regular expenses
    prisma.transaction.findMany({
      where: { 
        businessId, 
        type: "EXPENSE",
        date: { gte: startOfMonth }
      },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    
    // Expense categories only
    prisma.category.findMany({
      where: { businessId, type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
    
    // Recurring expenses
    prisma.recurringExpense.findMany({
      where: { 
        businessId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      include: { category: true },
      orderBy: { startDate: "desc" },
    }),
    
    // Monthly breakdown for chart
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        c.name as category,
        c.color,
        SUM(amount) as total
      FROM "Transaction" t
      JOIN "Category" c ON t."categoryId" = c.id
      WHERE t."businessId" = ${businessId}
        AND t.type = 'EXPENSE'
        AND t.date >= ${startOfYear}
      GROUP BY DATE_TRUNC('month', date), c.name, c.color
      ORDER BY month DESC, total DESC
    `
  ]);

  return { 
    expenses, 
    categories, 
    recurringExpenses, 
    monthlyBreakdown: monthlyBreakdown as any[]
  };
}

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });

  if (!business) {
    redirect("/auth/signup");
  }

  const data = await getExpensesData(business.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses
        </h1>
      </div>

      <Suspense fallback={
        <Card>
          <Card.Body className="h-96">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </Card.Body>
        </Card>
      }>
        <ExpensesClient 
          initialExpenses={data.expenses}
          categories={data.categories}
          recurringExpenses={data.recurringExpenses}
          monthlyBreakdown={data.monthlyBreakdown}
          businessId={business.id}
          currency={business.currency}
        />
      </Suspense>
    </div>
  );
}