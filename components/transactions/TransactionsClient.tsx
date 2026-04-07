// components/transactions/TransactionsClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { 
  Plus, 
  Search, 
  Download, 
  Filter, 
  ArrowUpDown,
  Calendar,
  Trash2,
  Edit
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { usePapaParse } from "react-papaparse";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";

interface TransactionsClientProps {
  initialTransactions: any[];
  categories: any[];
  businessId: string;
  currency: string;
}

export function TransactionsClient({
  initialTransactions,
  categories,
  businessId,
  currency,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { jsonToCSV } = usePapaParse();

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.category.name.toLowerCase().includes(query) ||
          t.paymentMethod.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((t) => t.categoryId === categoryFilter);
    }

    // Date range filter
    if (dateRange?.startDate && dateRange?.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        if (sortConfig.key === "date") {
          return sortConfig.direction === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortConfig.key === "amount") {
          return sortConfig.direction === "asc"
            ? Number(a.amount) - Number(b.amount)
            : Number(b.amount) - Number(a.amount);
        }
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const handleExportCSV = () => {
    const data = filteredTransactions.map((t) => ({
      Date: formatDate(t.date),
      Type: t.type,
      Category: t.category.name,
      Description: t.description || "",
      "Payment Method": t.paymentMethod.replace(/_/g, " "),
      Amount: t.type === "INCOME" ? Number(t.amount) : -Number(t.amount),
    }));

    const csv = jsonToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId }),
      });

      if (!response.ok) throw new Error("Failed to create transaction");

      const newTransaction = await response.json();
      setTransactions((prev) => [newTransaction, ...prev]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (data: any) => {
    if (!selectedTransaction) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update transaction");

      const updatedTransaction = await response.json();
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      setTransactions((prev) => prev.filter((t) => t.id !== selectedTransaction.id));
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setDateRange({ startDate: null, endDate: null });
    setSortConfig(null);
  };

  const hasFilters = searchQuery || typeFilter !== "ALL" || categoryFilter !== "ALL" || dateRange?.startDate;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card>
        <Card.Body>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
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

            {/* Date Range */}
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

            {/* Actions */}
            <div className="flex gap-2">
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear
                </Button>
              )}
              <Button
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportCSV}
                disabled={filteredTransactions.length === 0}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Transaction
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{filteredTransactions.length}</span> of{" "}
          <span className="font-medium">{transactions.length}</span> transactions
        </p>
      </div>

      {/* Transactions Table */}
      <Card>
        <Card.Body className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig?.key === "date" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Category</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>Payment Method</Table.Head>
                <Table.Head 
                  className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    {sortConfig?.key === "amount" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredTransactions.length === 0 ? (
                <Table.Empty 
                  colSpan={7} 
                  message={hasFilters ? "No transactions match your filters" : "No transactions yet"} 
                />
              ) : (
                filteredTransactions.map((transaction) => (
                  <Table.Row key={transaction.id}>
                    <Table.Cell>{formatDate(transaction.date)}</Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
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
                    <Table.Cell className="capitalize">
                      {transaction.paymentMethod.replace(/_/g, " ").toLowerCase()}
                    </Table.Cell>
                    <Table.Cell className={`text-right font-medium ${
                      transaction.type === "INCOME" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Transaction"
        size="md"
      >
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        title="Edit Transaction"
        size="md"
      >
        <TransactionForm
          categories={categories}
          initialData={selectedTransaction}
          onSubmit={handleEditTransaction}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          isLoading={isLoading}
        />
      </Modal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </div>
  );
}