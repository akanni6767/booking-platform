// app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

async function getDashboardData(businessId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get summary metrics (outstanding via raw SQL so SUM(total - paidAmount) works even if client cache lags schema)
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

  // Get monthly data for chart
  const monthlyData = await prisma.$queryRaw<{ month: Date; type: string; total: unknown }[]>`
    SELECT 
      DATE_TRUNC('month', date) as month,
      type,
      SUM(amount) as total
    FROM "Transaction"
    WHERE "businessId" = ${businessId}
      AND date >= ${startOfYear}
    GROUP BY DATE_TRUNC('month', date), type
    ORDER BY month ASC
  `;

  // Get expense breakdown
  const expenseBreakdown = await prisma.$queryRaw<{ category: string; color: string | null; total: unknown }[]>`
    SELECT 
      c.name as category,
      c.color,
      SUM(t.amount) as total
    FROM "Transaction" t
    JOIN "Category" c ON t."categoryId" = c.id
    WHERE t."businessId" = ${businessId}
      AND t.type = 'EXPENSE'
      AND t.date >= ${startOfMonth}
    GROUP BY c.name, c.color
    ORDER BY total DESC
  `;

  // Get recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { businessId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 10,
  });

  // Get recent invoices
  const recentInvoices = await prisma.invoice.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const revenue = Number(totalRevenue._sum.amount ?? 0);
  const expenses = Number(totalExpenses._sum.amount ?? 0);
  const serializedMonthlyData = monthlyData.map((row) => ({
    month: row.month,
    type: row.type,
    total: Number(row.total ?? 0),
  }));
  const serializedExpenseBreakdown = expenseBreakdown.map((row) => ({
    category: row.category,
    color: row.color,
    total: Number(row.total ?? 0),
  }));
  const serializedRecentTransactions = recentTransactions.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));
  const serializedRecentInvoices = recentInvoices.map((invoice) => ({
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
    paidAmount: Number(invoice.paidAmount),
  }));

  return {
    summary: {
      revenue,
      expenses,
      profit: revenue - expenses,
      outstanding,
    },
    monthlyData: serializedMonthlyData,
    expenseBreakdown: serializedExpenseBreakdown,
    recentTransactions: serializedRecentTransactions,
    recentInvoices: serializedRecentInvoices,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get user's first business (in a real app, you'd have business selection)
  const business = await prisma.business.findFirst({
    where: { userId: session.user?.id },
  });

  if (!business) {
    redirect("/auth/signup");
  }

  const data = await getDashboardData(business.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {session.user.name}
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent 
          data={data} 
          businessId={business.id}
          currency={business.currency}
        />
      </Suspense>
    </div>
  );
}