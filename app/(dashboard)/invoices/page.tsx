// app/(dashboard)/invoices/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { InvoicesClient } from "@/components/invoices/InvoicesClient";
import { Card } from "@/components/ui/Card";

async function getInvoicesData(businessId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { businessId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const serializedInvoices = invoices.map((invoice) => ({
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
    paidAmount: Number(invoice.paidAmount),
    items: invoice.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    })),
  }));

  return { invoices: serializedInvoices };
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!business) {
    redirect("/auth/signup");
  }

  const { invoices } = await getInvoicesData(business.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invoices
        </h1>
      </div>

      <Suspense fallback={
        <Card>
          <Card.Body className="h-96">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              {[...Array(5)].map((_, i) => (
                <div key={i} title={`Invoice` + i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </Card.Body>
        </Card>
      }>
        <InvoicesClient 
          initialInvoices={invoices} 
          business={business}
        />
      </Suspense>
    </div>
  );
}