// components/forms/TransactionForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";

interface TransactionFormProps {
  categories: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHECK", label: "Check" },
  { value: "DIGITAL_WALLET", label: "Digital Wallet" },
  { value: "OTHER", label: "Other" },
];

export function TransactionForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const [formData, setFormData] = useState(() =>
    initialData
      ? {
          type: initialData.type,
          amount: Number(initialData.amount).toString(),
          date: format(new Date(initialData.date), "yyyy-MM-dd"),
          categoryId: initialData.categoryId,
          description: initialData.description || "",
          paymentMethod: initialData.paymentMethod,
        }
      : {
          type: "EXPENSE",
          amount: "",
          date: format(new Date(), "yyyy-MM-dd"),
          categoryId: "",
          description: "",
          paymentMethod: "CASH",
        }
  );

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Transaction Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "INCOME", categoryId: "" })}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              formData.type === "INCOME"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-2 border-green-500"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "EXPENSE", categoryId: "" })}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              formData.type === "EXPENSE"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-2 border-red-500"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        required
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
        >
          <option value="">Select a category</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Method
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Enter description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
          {initialData ? "Update" : "Add"} Transaction
        </Button>
      </div>
    </form>
  );
}