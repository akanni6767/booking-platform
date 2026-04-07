// components/expenses/ExpensesClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { RecurringExpenseForm } from "@/components/forms/RecurringExpenseForm";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { 
  Plus, 
  Search, 
  Repeat,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { usePapaParse } from "react-papaparse";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";

interface ExpensesClientProps {
  initialExpenses: any[];
  categories: any[];
  recurringExpenses: any[];
  monthlyBreakdown: any[];
  businessId: string;
  currency: string;
}

export function ExpensesClient({
  initialExpenses,
  categories,
  recurringExpenses,
  monthlyBreakdown,
  businessId,
  currency,
}: ExpensesClientProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [recurring, setRecurring] = useState(recurringExpenses);
  const [activeTab, setActiveTab] = useState<"expenses" | "recurring">("expenses");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { jsonToCSV } = usePapaParse();

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description?.toLowerCase().includes(query) ||
          e.category.name.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((e) => e.categoryId === categoryFilter);
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      filtered = filtered.filter((e) => {
        const date = new Date(e.date);
        return date >= start && date <= end;
      });
    }

    return filtered;
  }, [expenses, searchQuery, categoryFilter, dateRange]);

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const recurringTotal = useMemo(() => {
    return recurring.reduce((sum, r) => sum + Number(r.amount), 0);
  }, [recurring]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc: any, expense: any) => {
      const catName = expense.category.name;
      if (!acc[catName]) {
        acc[catName] = {
          name: catName,
          value: 0,
          color: expense.category.color,
        };
      }
      acc[catName].value += Number(expense.amount);
      return acc;
    }, {});
    return Object.values(grouped);
  }, [filteredExpenses]);

  const handleAddExpense = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId, type: "EXPENSE" }),
      });

      if (!response.ok) throw new Error("Failed to create expense");

      const newExpense = await response.json();
      setExpenses((prev) => [newExpense, ...prev]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecurring = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recurring-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId }),
      });

      if (!response.ok) throw new Error("Failed to create recurring expense");

      const newRecurring = await response.json();
      setRecurring((prev) => [newRecurring, ...prev]);
      setIsRecurringModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setRecurring((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const data = filteredExpenses.map((e) => ({
      Date: formatDate(e.date),
      Category: e.category.name,
      Description: e.description || "",
      Amount: Number(e.amount),
      "Payment Method": e.paymentMethod.replace(/_/g, " "),
    }));

    const csv = jsonToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      DAILY: "Daily",
      WEEKLY: "Weekly",
      BIWEEKLY: "Bi-weekly",
      MONTHLY: "Monthly",
      QUARTERLY: "Quarterly",
      YEARLY: "Yearly",
    };
    return labels[freq] || freq;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setDateRange({ startDate: null, endDate: null });
  };

  const hasFilters = searchQuery || categoryFilter !== "ALL" || dateRange?.startDate;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-red-100 dark:bg-red-900/20 p-3">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(totalExpenses, currency)}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-indigo-100 dark:bg-indigo-900/20 p-3">
                <Repeat className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recurring / Month
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(recurringTotal, currency)}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-amber-100 dark:bg-amber-900/20 p-3">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Recurring
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {recurring.length}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "expenses"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab("recurring")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "recurring"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Recurring Expenses
          </button>
        </nav>
      </div>

      {activeTab === "expenses" ? (
        <>
          {/* Filters */}
          <Card>
            <Card.Body>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Search expenses..."
                    leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-72">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <Datepicker
                    value={dateRange}
                    onChange={setDateRange}
                    showShortcuts={true}
                    placeholder="Select date range"
                    inputClassName="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
                    containerClassName="relative w-full"
                  />
                </div>

                <div className="flex gap-2">
                  {hasFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={handleExportCSV}
                    disabled={filteredExpenses.length === 0}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add Expense
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Chart & Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <Card.Header title="Expense Breakdown" subtitle="By category" />
              <Card.Body className="h-80">
                {chartData.length > 0 ? (
                  <ExpensePieChart data={chartData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No expenses to display
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="lg:col-span-2">
              <Card.Header 
                title="Recent Expenses" 
                subtitle={`${filteredExpenses.length} transactions`}
              />
              <Card.Body padding="none">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Date</Table.Head>
                      <Table.Head>Category</Table.Head>
                      <Table.Head>Description</Table.Head>
                      <Table.Head>Payment</Table.Head>
                      <Table.Head className="text-right">Amount</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredExpenses.length === 0 ? (
                      <Table.Empty colSpan={5} message="No expenses found" />
                    ) : (
                      filteredExpenses.map((expense) => (
                        <Table.Row key={expense.id}>
                          <Table.Cell>{formatDate(expense.date)}</Table.Cell>
                          <Table.Cell>
                            <span 
                              className="inline-flex items-center gap-2"
                              style={{ color: expense.category.color || undefined }}
                            >
                              <span 
                                className="h-2 w-2 rounded-full" 
                                style={{ backgroundColor: expense.category.color || undefined }}
                              />
                              {expense.category.name}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="max-w-xs truncate">
                            {expense.description || "-"}
                          </Table.Cell>
                          <Table.Cell className="capitalize">
                            {expense.paymentMethod.replace(/_/g, " ").toLowerCase()}
                          </Table.Cell>
                          <Table.Cell className="text-right font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(expense.amount, currency)}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </Card.Body>
            </Card>
          </div>
        </>
      ) : (
        /* Recurring Expenses Tab */
        <Card>
          <Card.Header 
            title="Recurring Expenses" 
            subtitle="Automatically generated expenses"
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsRecurringModalOpen(true)}
              >
                Add Recurring
              </Button>
            }
          />
          <Card.Body padding="none">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Frequency</Table.Head>
                  <Table.Head>Next Due</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recurring.length === 0 ? (
                  <Table.Empty colSpan={7} message="No recurring expenses set up" />
                ) : (
                  recurring.map((item) => {
                    const nextDue = calculateNextDue(item);
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </Table.Cell>
                        <Table.Cell>
                          <span 
                            className="inline-flex items-center gap-2"
                            style={{ color: item.category.color || undefined }}
                          >
                            <span 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: item.category.color || undefined }}
                            />
                            {item.category.name}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(item.amount, currency)}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="info">{getFrequencyLabel(item.frequency)}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {nextDue ? formatDate(nextDue) : "-"}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={item.isActive ? "success" : "secondary"}>
                            {item.isActive ? "Active" : "Paused"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteRecurring(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Expense"
        size="md"
      >
        <ExpenseForm
          categories={categories}
          onSubmit={handleAddExpense}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Add Recurring Modal */}
      <Modal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        title="Add Recurring Expense"
        size="md"
      >
        <RecurringExpenseForm
          categories={categories}
          onSubmit={handleAddRecurring}
          onCancel={() => setIsRecurringModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}

// Helper function to calculate next due date
function calculateNextDue(recurring: any): Date | null {
  if (!recurring.isActive) return null;
  
  const now = new Date();
  const start = new Date(recurring.startDate);
  const lastGenerated = recurring.lastGenerated ? new Date(recurring.lastGenerated) : null;
  
  if (recurring.endDate && new Date(recurring.endDate) < now) return null;
  
  // Simple calculation - in production, use a proper date library
  const baseDate = lastGenerated || start;
  const nextDue = new Date(baseDate);
  
  switch (recurring.frequency) {
    case "DAILY":
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case "WEEKLY":
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case "BIWEEKLY":
      nextDue.setDate(nextDue.getDate() + 14);
      break;
    case "MONTHLY":
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case "QUARTERLY":
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;
    case "YEARLY":
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }
  
  return nextDue;
}