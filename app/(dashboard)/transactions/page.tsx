// app/(dashboard)/transactions/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { TransactionsClient } from "@/components/transactions/TransactionsClient";
import { Card } from "@/components/ui/Card";

async function getTransactionsData(businessId: string) {
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where: { businessId },
      orderBy: { name: "asc" },
    }),
  ]);

  return { transactions, categories };
}

export default async function TransactionsPage() {
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

  const { transactions, categories } = await getTransactionsData(business.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
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
        <TransactionsClient 
          initialTransactions={transactions} 
          categories={categories}
          businessId={business.id}
          currency={business.currency}
        />
      </Suspense>
    </div>
  );
}