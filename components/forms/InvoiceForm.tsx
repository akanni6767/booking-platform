// components/forms/InvoiceForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceFormProps {
  business: any;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface InvoiceFormData {
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  items: InvoiceItem[];
}

export function InvoiceForm({
  business,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: InvoiceFormProps) {
  const createDefaultFormData = (): InvoiceFormData => {
    const today = new Date();
    const defaultDueDate = new Date(today);
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    return initialData
      ? {
          clientName: initialData.clientName,
          clientEmail: initialData.clientEmail || "",
          clientAddress: initialData.clientAddress || "",
          issueDate: format(new Date(initialData.issueDate), "yyyy-MM-dd"),
          dueDate: format(new Date(initialData.dueDate), "yyyy-MM-dd"),
          notes: initialData.notes || "",
          items: initialData.items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
        }
      : {
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      issueDate: format(today, "yyyy-MM-dd"),
      dueDate: format(defaultDueDate, "yyyy-MM-dd"),
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }] as InvoiceItem[],
    };
  };

  const [formData, setFormData] = useState<InvoiceFormData>(createDefaultFormData);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_: InvoiceItem, i: number) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxRate = Number(business.vatRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount, total } = calculateTotals();
    onSubmit({
      ...formData,
      subtotal,
      taxAmount,
      total,
    });
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Client Name"
          required
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
        />
        <Input
          label="Client Email"
          type="email"
          value={formData.clientEmail}
          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Client Address
        </label>
        <textarea
          rows={2}
          value={formData.clientAddress}
          onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Issue Date"
          type="date"
          required
          value={formData.issueDate}
          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
        />
        <Input
          label="Due Date"
          type="date"
          required
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addItem} leftIcon={<Plus className="h-4 w-4" />}>
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item: InvoiceItem, index: number) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="w-24 pt-2 text-right font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.quantity * item.unitPrice, business.currency)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(subtotal, business.currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Tax ({business.vatRate || 0}%)
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(taxAmount, business.currency)}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {formatCurrency(total, business.currency)}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          rows={3}
          placeholder="Payment terms, bank details, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
          {initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}