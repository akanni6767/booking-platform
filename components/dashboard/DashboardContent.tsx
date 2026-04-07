// components/dashboard/DashboardContent.tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface DashboardContentProps {
  data: any;
  businessId: string;
  currency: string;
}

export function DashboardContent({ data, businessId, currency }: DashboardContentProps) {
  const { summary, monthlyData, expenseBreakdown, recentTransactions, recentInvoices } = data;

  const summaryCards = [
    {
      title: "Total Revenue",
      value: summary.revenue,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "green",
    },
    {
      title: "Total Expenses",
      value: summary.expenses,
      icon: ArrowDownRight,
      trend: "+8.2%",
      trendUp: false,
      color: "red",
    },
    {
      title: "Net Profit",
      value: summary.profit,
      icon: TrendingUp,
      trend: "+15.3%",
      trendUp: true,
      color: "indigo",
    },
    {
      title: "Outstanding Invoices",
      value: summary.outstanding,
      icon: FileText,
      trend: "3 pending",
      trendUp: null,
      color: "amber",
    },
  ];

  const getTrendBadge = (trend: string, trendUp: boolean | null) => {
    if (trendUp === null) return <Badge variant="warning">{trend}</Badge>;
    return trendUp ? (
      <Badge variant="success" className="flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" />
        {trend}
      </Badge>
    ) : (
      <Badge variant="error" className="flex items-center gap-1">
        <ArrowDownRight className="h-3 w-3" />
        {trend}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} padding="md">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md bg-${card.color}-100 dark:bg-${card.color}-900/20 p-3`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(card.value, currency)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              {getTrendBadge(card.trend, card.trendUp)}
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/transactions?action=add-income">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Add Income
          </Button>
        </Link>
        <Link href="/transactions?action=add-expense">
          <Button variant="secondary" leftIcon={<Plus className="h-4 w-4" />}>
            Add Expense
          </Button>
        </Link>
        <Link href="/invoices?action=create">
          <Button variant="secondary" leftIcon={<FileText className="h-4 w-4" />}>
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header title="Revenue vs Expenses" subtitle="Monthly comparison for current year" />
          <Card.Body className="h-80">
            <RevenueChart data={monthlyData} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="Expense Breakdown" subtitle="Current month by category" />
          <Card.Body className="h-80">
            <ExpensePieChart data={expenseBreakdown} />
          </Card.Body>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <Card.Header 
          title="Recent Transactions" 
          subtitle="Last 10 transactions"
          action={
            <Link href="/transactions">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          }
        />
        <Card.Body padding="none">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Date</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Category</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head className="text-right">Amount</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recentTransactions.length === 0 ? (
                <Table.Empty colSpan={5} message="No transactions yet" />
              ) : (
                recentTransactions.map((transaction: any) => (
                  <Table.Row key={transaction.id}>
                    <Table.Cell>{formatDate(transaction.date)}</Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {transaction.description || "-"}
                    </Table.Cell>
                    <Table.Cell>
                      <span 
                        className="inline-flex items-center gap-2"
                        style={{ color: transaction.category.color || undefined }}
                      >
                        <span 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: transaction.category.color || undefined }}
                        />
                        {transaction.category.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={transaction.type === "INCOME" ? "success" : "error"}>
                        {transaction.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className={`text-right font-medium ${
                      transaction.type === "INCOME" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <Card.Header 
          title="Recent Invoices" 
          subtitle="Last 5 invoices"
          action={
            <Link href="/invoices">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          }
        />
        <Card.Body padding="none">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Invoice #</Table.Head>
                <Table.Head>Client</Table.Head>
                <Table.Head>Due Date</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head className="text-right">Amount</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recentInvoices.length === 0 ? (
                <Table.Empty colSpan={5} message="No invoices yet" />
              ) : (
                recentInvoices.map((invoice: any) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </Table.Cell>
                    <Table.Cell>{invoice.clientName}</Table.Cell>
                    <Table.Cell>{formatDate(invoice.dueDate)}</Table.Cell>
                    <Table.Cell>
                      <Badge 
                        variant={
                          invoice.status === "PAID" ? "success" :
                          invoice.status === "OVERDUE" ? "error" :
                          invoice.status === "SENT" ? "info" : "default"
                        }
                      >
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="text-right font-medium">
                      {formatCurrency(invoice.total, currency)}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}