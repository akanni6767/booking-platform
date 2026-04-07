// components/reports/ReportsClient.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
  ArrowRight
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useReactToPrint } from "react-to-print";

interface ReportsClientProps {
  initialData: any;
  business: any;
  startDate: Date;
  endDate: Date;
}

export function ReportsClient({ initialData, business, startDate: initialStart, endDate: initialEnd }: ReportsClientProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeReport, setActiveReport] = useState<"pnl" | "cashflow" | "expenses" | "aging">("pnl");
  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: new Date(initialStart.toISOString().split("T")[0]),
    endDate: new Date(initialEnd.toISOString().split("T")[0]),
  });
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${activeReport.toUpperCase()}_Report_${business.name}`,
  });

  // Calculate P&L
  const pnlData = useMemo(() => {
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    
    let totalIncome = 0;
    let totalExpense = 0;

    initialData.incomeTransactions.forEach((t: any) => {
      const cat = t.category.name;
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + Number(t.amount);
      totalIncome += Number(t.amount);
    });

    initialData.expenseTransactions.forEach((t: any) => {
      const cat = t.category.name;
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount);
      totalExpense += Number(t.amount);
    });

    return {
      income: Object.entries(incomeByCategory).map(([name, amount]) => ({ name, amount })),
      expenses: Object.entries(expenseByCategory).map(([name, amount]) => ({ name, amount })),
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }, [initialData]);

  // Cash Flow Data
  const cashFlowData = useMemo(() => {
    let runningBalance = 0;
    return initialData.cashFlowTransactions.map((t: any) => {
      const amount = Number(t.amount);
      if (t.type === "INCOME") {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      return {
        date: formatDate(t.date),
        income: t.type === "INCOME" ? amount : 0,
        expense: t.type === "EXPENSE" ? amount : 0,
        balance: runningBalance,
      };
    });
  }, [initialData]);

  // Monthly Trend
  const monthlyTrend = useMemo(() => {
    const grouped: Record<string, { month: string; income: number; expense: number }> = {};
    
    initialData.monthlyData.forEach((m: any) => {
      const month = new Date(m.month).toLocaleString("default", { month: "short" });
      if (!grouped[month]) {
        grouped[month] = { month, income: 0, expense: 0 };
      }
      if (m.type === "INCOME") {
        grouped[month].income = Number(m.total);
      } else {
        grouped[month].expense = Number(m.total);
      }
    });
    
    return Object.values(grouped);
  }, [initialData]);

  const textColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";

  const handleDateChange = (newValue: DateValueType) => {
    setDateRange(newValue);
    if (newValue?.startDate && newValue?.endDate) {
      // Update URL with new dates
      const params = new URLSearchParams(window.location.search);
      params.set("startDate", newValue.startDate.toISOString().split("T")[0]);
      params.set("endDate", newValue.endDate.toISOString().split("T")[0]);
      window.history.pushState({}, "", `${window.location.pathname}?${params}`);
      // In production, you'd use router.push() to trigger server refetch
      window.location.reload();
    }
  };

  const exportToCSV = () => {
    let csv = "";
    const filename = `${activeReport}_report_${new Date().toISOString().split("T")[0]}.csv`;
    
    if (activeReport === "pnl") {
      csv = "Category,Type,Amount\n";
      pnlData.income.forEach((item: any) => {
        csv += `${item.name},Income,${item.amount}\n`;
      });
      pnlData.expenses.forEach((item: any) => {
        csv += `${item.name},Expense,${item.amount}\n`;
      });
      csv += `\nTotal Income,,${pnlData.totalIncome}\n`;
      csv += `Total Expenses,,${pnlData.totalExpense}\n`;
      csv += `Net Profit,,${pnlData.netProfit}\n`;
    }
    
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <Card.Body>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeReport === "pnl" ? "primary" : "secondary"}
                onClick={() => setActiveReport("pnl")}
                leftIcon={<FileText className="h-4 w-4" />}
              >
                P&L Statement
              </Button>
              <Button
                variant={activeReport === "cashflow" ? "primary" : "secondary"}
                onClick={() => setActiveReport("cashflow")}
                leftIcon={<Activity className="h-4 w-4" />}
              >
                Cash Flow
              </Button>
              <Button
                variant={activeReport === "expenses" ? "primary" : "secondary"}
                onClick={() => setActiveReport("expenses")}
                leftIcon={<PieChartIcon className="h-4 w-4" />}
              >
                Expense Report
              </Button>
              <Button
                variant={activeReport === "aging" ? "primary" : "secondary"}
                onClick={() => setActiveReport("aging")}
                leftIcon={<Calendar className="h-4 w-4" />}
              >
                Invoice Aging
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Datepicker
                value={dateRange}
                onChange={handleDateChange}
                showShortcuts={true}
                inputClassName="w-64 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
              />
              <Button variant="secondary" onClick={exportToCSV} leftIcon={<Download className="h-4 w-4" />}>
                Export
              </Button>
              <Button variant="secondary" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
                Print
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Report Content */}
      <div ref={printRef} className="space-y-6">
        {/* Report Header for Print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {activeReport === "pnl" && "Profit & Loss Statement"}
            {activeReport === "cashflow" && "Cash Flow Report"}
            {activeReport === "expenses" && "Expense Analysis"}
            {activeReport === "aging" && "Invoice Aging Report"}
          </h1>
          <p className="text-gray-600">{business.name}</p>
          <p className="text-gray-600">
            Period: {formatDate(dateRange?.startDate?.toISOString().split("T")[0] as string)} - {formatDate(dateRange?.endDate?.toISOString().split("T")[0] as string)}
          </p>
        </div>

        {activeReport === "pnl" && (
          <div className="space-y-6">
            {/* P&L Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Card>
                <Card.Body>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(pnlData.totalIncome, business.currency)}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Body>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-red-100 p-3">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(pnlData.totalExpense, business.currency)}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Body>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${pnlData.netProfit >= 0 ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                      <DollarSign className={`h-6 w-6 ${pnlData.netProfit >= 0 ? 'text-indigo-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Net Profit</p>
                      <p className={`text-2xl font-semibold ${pnlData.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(pnlData.netProfit, business.currency)}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Monthly Trend Chart */}
              <Card>
                <Card.Header title="Monthly Trend" subtitle="Revenue vs Expenses" />
                <Card.Body className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="month" tick={{ fill: textColor }} />
                      <YAxis tick={{ fill: textColor }} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderColor: gridColor }}
                        formatter={(value, name) => [
                          formatCurrency(Number(value ?? 0), business.currency),
                          String(name ?? ""),
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Revenue" fill="#10B981" />
                      <Bar dataKey="expense" name="Expenses" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>

              {/* Profit Margin */}
              <Card>
                <Card.Header title="Profit Margin" subtitle="Net profit percentage" />
                <Card.Body className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-indigo-600">
                      {pnlData.totalIncome > 0 
                        ? ((pnlData.netProfit / pnlData.totalIncome) * 100).toFixed(1) 
                        : 0}%
                    </div>
                    <p className="mt-2 text-gray-500">Net Profit Margin</p>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between gap-8">
                        <span>Gross Profit:</span>
                        <span className="font-medium">{formatCurrency(pnlData.totalIncome, business.currency)}</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span>Operating Expenses:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(pnlData.totalExpense, business.currency)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between gap-8 font-bold">
                        <span>Net Profit:</span>
                        <span className={pnlData.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(pnlData.netProfit, business.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Detailed P&L Table */}
            <Card>
              <Card.Header title="Detailed Profit & Loss" />
              <Card.Body>
                <div className="space-y-6">
                  {/* Income Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-3">Revenue</h3>
                    <Table>
                      <Table.Body>
                        {pnlData.income.map((item: any) => (
                          <Table.Row key={item.name}>
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell className="text-right text-green-600">
                              {formatCurrency(item.amount, business.currency)}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                        <Table.Row className="bg-green-50 font-semibold">
                          <Table.Cell>Total Revenue</Table.Cell>
                          <Table.Cell className="text-right text-green-700">
                            {formatCurrency(pnlData.totalIncome, business.currency)}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Expense Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-3">Expenses</h3>
                    <Table>
                      <Table.Body>
                        {pnlData.expenses.map((item: any) => (
                          <Table.Row key={item.name}>
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell className="text-right text-red-600">
                              -{formatCurrency(item.amount, business.currency)}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                        <Table.Row className="bg-red-50 font-semibold">
                          <Table.Cell>Total Expenses</Table.Cell>
                          <Table.Cell className="text-right text-red-700">
                            -{formatCurrency(pnlData.totalExpense, business.currency)}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Net Profit */}
                  <div className="border-t-2 border-gray-200 pt-4">
                    <Table>
                      <Table.Body>
                        <Table.Row className={`${pnlData.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} font-bold text-lg`}>
                          <Table.Cell>NET PROFIT</Table.Cell>
                          <Table.Cell className={`text-right ${pnlData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {pnlData.netProfit >= 0 ? '+' : ''}
                            {formatCurrency(pnlData.netProfit, business.currency)}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeReport === "cashflow" && (
          <div className="space-y-6">
            <Card>
              <Card.Header title="Cash Flow Analysis" subtitle="Running balance over time" />
              <Card.Body className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: textColor }} />
                    <YAxis tick={{ fill: textColor }} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderColor: gridColor }}
                      formatter={(value, name) => [
                        formatCurrency(Number(value ?? 0), business.currency),
                        String(name ?? ""),
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      name="Cash Balance" 
                      stroke="#4F46E5" 
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                    />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Cash Flow Summary" />
              <Card.Body>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Metric</Table.Head>
                      <Table.Head className="text-right">Amount</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>Opening Balance</Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(0, business.currency)}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell className="text-green-600">Total Inflows</Table.Cell>
                      <Table.Cell className="text-right text-green-600">
                        +{formatCurrency(
                          cashFlowData.reduce(
                            (sum: number, d: { income: number }) => sum + d.income,
                            0
                          ),
                          business.currency
                        )}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell className="text-red-600">Total Outflows</Table.Cell>
                      <Table.Cell className="text-right text-red-600">
                        -{formatCurrency(
                          cashFlowData.reduce(
                            (sum: number, d: { expense: number }) => sum + d.expense,
                            0
                          ),
                          business.currency
                        )}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row className="font-bold bg-indigo-50">
                      <Table.Cell>Closing Balance</Table.Cell>
                      <Table.Cell className="text-right text-indigo-700">
                        {formatCurrency(
                          cashFlowData[cashFlowData.length - 1]?.balance || 0,
                          business.currency
                        )}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeReport === "expenses" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <Card.Header title="Expense by Category" />
                <Card.Body className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={initialData.categoryData.filter((c: any) => c.type === "EXPENSE")}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="category"
                      >
                        {initialData.categoryData
                          .filter((c: any) => c.type === "EXPENSE")
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || "#6B7280"} />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value ?? 0), business.currency),
                          String(name ?? ""),
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header title="Top Expenses" />
                <Card.Body>
                  <div className="space-y-4">
                    {initialData.categoryData
                      .filter((c: any) => c.type === "EXPENSE")
                      .sort((a: any, b: any) => Number(b.total) - Number(a.total))
                      .slice(0, 5)
                      .map((cat: any, idx: number) => (
                        <div key={cat.category} className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{cat.category}</span>
                              <span className="text-red-600">
                                {formatCurrency(cat.total, business.currency)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${(Number(cat.total) / pnlData.totalExpense * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {activeReport === "aging" && (
          <div className="space-y-6">
            <Card>
              <Card.Header title="Invoice Aging Summary" />
              <Card.Body>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
                  {initialData.invoiceAging.map((bucket: any) => (
                    <Card key={bucket.status}>
                      <Card.Body>
                        <p className="text-sm font-medium text-gray-500">{bucket.status}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(bucket.outstanding, business.currency)}
                        </p>
                        <p className="text-sm text-gray-500">{bucket.count} invoices</p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}