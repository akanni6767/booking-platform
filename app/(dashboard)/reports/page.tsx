// app/(dashboard)/reports/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { Card } from "@/components/ui/Card";

async function getReportsData(businessId: string, startDate: Date, endDate: Date) {
  // P&L Data
  const [incomeTransactions, expenseTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        businessId,
        type: "INCOME",
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        businessId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Cash Flow Data (all transactions)
  const cashFlowTransactions = await prisma.transaction.findMany({
    where: {
      businessId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Monthly trend data
  const monthlyData = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', date) as month,
      type,
      SUM(amount) as total
    FROM "Transaction"
    WHERE "businessId" = ${businessId}
      AND date >= ${startDate}
      AND date <= ${endDate}
    GROUP BY DATE_TRUNC('month', date), type
    ORDER BY month ASC
  `;

  // Category breakdown
  const categoryData = await prisma.$queryRaw`
    SELECT 
      c.name as category,
      c.type,
      c.color,
      SUM(t.amount) as total
    FROM "Transaction" t
    JOIN "Category" c ON t."categoryId" = c.id
    WHERE t."businessId" = ${businessId}
      AND t.date >= ${startDate}
      AND t.date <= ${endDate}
    GROUP BY c.name, c.type, c.color
    ORDER BY total DESC
  `;

  // Invoice aging
  const invoiceAging = await prisma.$queryRaw`
    SELECT 
      status,
      SUM(total - "paidAmount") as outstanding,
      COUNT(*) as count
    FROM "Invoice"
    WHERE "businessId" = ${businessId}
      AND status IN ('SENT', 'OVERDUE')
    GROUP BY status
  `;

  return {
    incomeTransactions,
    expenseTransactions,
    cashFlowTransactions,
    monthlyData: monthlyData as any[],
    categoryData: categoryData as any[],
    invoiceAging: invoiceAging as any[],
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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

  // Default to current year
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), 0, 1);
  const defaultEnd = new Date(now.getFullYear(), 11, 31);

  const startDate = searchParams.startDate 
    ? new Date(searchParams.startDate as string)
    : defaultStart;
  const endDate = searchParams.endDate
    ? new Date(searchParams.endDate as string)
    : defaultEnd;

  const data = await getReportsData(business.id, startDate, endDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
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
        <ReportsClient 
          initialData={data}
          business={business}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  );
}