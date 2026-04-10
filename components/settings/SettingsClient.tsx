// components/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { 
  Building2, 
  Tag, 
  Percent, 
  Save, 
  Plus, 
  Trash2, 
  Edit2,
  Palette,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsClientProps {
  business: any;
  initialCategories: any[];
}

export function SettingsClient({ business, initialCategories }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"profile" | "categories" | "tax">("profile");
  const [categories, setCategories] = useState(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Business profile state
  const [profile, setProfile] = useState({
    name: business.name || "",
    ownerName: business.ownerName || "",
    email: business.email || "",
    address: business.address || "",
    currency: business.currency || "USD",
    logo: business.logo || "",
  });

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    vatRate: business.vatRate?.toString() || "0",
    taxNumber: business.taxNumber || "",
  });

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "EXPENSE",
    color: "#6B7280",
  });

  const currencies = [
    { code: "USD", name: "US Dollar ($)", symbol: "$" },
    { code: "EUR", name: "Euro (€)", symbol: "€" },
    { code: "GBP", name: "British Pound (£)", symbol: "£" },
    { code: "JPY", name: "Japanese Yen (¥)", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar (C$)", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar (A$)", symbol: "A$" },
    { code: "INR", name: "Indian Rupee (₹)", symbol: "₹" },
    { code: "NGN", name: "Nigerian Naira (₦)", symbol: "₦" },
    { code: "ZAR", name: "South African Rand (R)", symbol: "R" },
    { code: "KES", name: "Kenyan Shilling (KSh)", symbol: "KSh" },
    { code: "TZS", name: "Tanzanian Shilling (TSh)", symbol: "TSh" },
    { code: "UGX", name: "Ugandan Shilling (USh)", symbol: "USh" },
    { code: "RWF", name: "Rwandan Franc (FRw)", symbol: "FRw" },
    { code: "BIF", name: "Burundian Franc (FBu)", symbol: "FBu" },
    { code: "ETB", name: "Ethiopian Birr (ETB)", symbol: "ETB" },
  ];

  const presetColors = [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
    "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
    "#6B7280", "#000000",
  ];

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to save");

      showSuccess("Business profile updated successfully");
    } catch (error) {
      showError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTax = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}/tax`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vatRate: parseFloat(taxSettings.vatRate) || 0,
          taxNumber: taxSettings.taxNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      showSuccess("Tax settings updated successfully");
    } catch (error) {
      showError("Failed to update tax settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    setIsLoading(true);
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryForm,
          businessId: business.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedCategory = await response.json();
      
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
      } else {
        setCategories(prev => [...prev, savedCategory]);
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", type: "EXPENSE", color: "#6B7280" });
      showSuccess(editingCategory ? "Category updated" : "Category created");
    } catch (error) {
      showError("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setCategories(prev => prev.filter(c => c.id !== editingCategory.id));
      setIsDeleteModalOpen(false);
      setEditingCategory(null);
      showSuccess("Category deleted");
    } catch (error) {
      showError("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color || "#6B7280",
    });
    setIsCategoryModalOpen(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", type: "EXPENSE", color: "#6B7280" });
    setIsCategoryModalOpen(true);
  };

  const incomeCategories = categories.filter(c => c.type === "INCOME");
  const expenseCategories = categories.filter(c => c.type === "EXPENSE");

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-800 dark:text-red-200">{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Business Profile
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "categories"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <Tag className="h-4 w-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("tax")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "tax"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <Percent className="h-4 w-4" />
            Tax Settings
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <Card.Header title="Business Profile" subtitle="Manage your business information" />
          <Card.Body className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Business Name"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                leftIcon={<Building2 className="h-5 w-5 text-gray-400" />}
              />
              <Input
                label="Owner Name"
                required
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                leftIcon={<Building2 className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Address
              </label>
              <textarea
                rows={3}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
                placeholder="Full address..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Currency
              </label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Appearance</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    theme === "light" 
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    theme === "dark" 
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    theme === "system" 
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <Card>
            <Card.Header 
              title="Income Categories" 
              subtitle="Categories for tracking revenue"
              action={
                <Button variant="primary" size="sm" onClick={openAddCategory} leftIcon={<Plus className="h-4 w-4" />}>
                  Add Category
                </Button>
              }
            />
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => openEditCategory(cat)}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.color || "#6B7280" }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                    </div>
                    {cat.isDefault && (
                      <Badge variant="secondary" size="sm">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header 
              title="Expense Categories" 
              subtitle="Categories for tracking costs"
              action={
                <Button variant="primary" size="sm" onClick={openAddCategory} leftIcon={<Plus className="h-4 w-4" />}>
                  Add Category
                </Button>
              }
            />
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => openEditCategory(cat)}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.color || "#6B7280" }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                    </div>
                    {cat.isDefault && (
                      <Badge variant="secondary" size="sm">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Tax Tab */}
      {activeTab === "tax" && (
        <Card>
          <Card.Header title="Tax Settings" subtitle="Configure tax rates for invoicing" />
          <Card.Body className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="VAT/GST Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxSettings.vatRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, vatRate: e.target.value })}
                leftIcon={<Percent className="h-5 w-5 text-gray-400" />}
                hint="Applied automatically to new invoices"
              />
              <Input
                label="Tax Number / VAT ID"
                value={taxSettings.taxNumber}
                onChange={(e) => setTaxSettings({ ...taxSettings, taxNumber: e.target.value })}
                leftIcon={<Tag className="h-5 w-5 text-gray-400" />}
                placeholder="e.g., GB123456789"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                On a $1,000.00 invoice, tax will be:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(1000 * (parseFloat(taxSettings.vatRate) || 0) / 100, profile.currency)}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total with tax:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(1000 * (1 + (parseFloat(taxSettings.vatRate) || 0) / 100), profile.currency)}
                </span>
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveTax}
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Tax Settings
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="e.g., Office Supplies"
          />

          {!editingCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={categoryForm.type}
                onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCategoryForm({ ...categoryForm, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    categoryForm.color === color ? "border-gray-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              className="mt-2 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {editingCategory && !editingCategory.isDefault && (
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              className={editingCategory ? "flex-1" : "flex-1"}
              onClick={() => {
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={handleSaveCategory}
              isLoading={isLoading}
            >
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEditingCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description={`Are you sure you want to delete "${editingCategory?.name}"? This will affect all transactions using this category.`}
        isLoading={isLoading}
      />
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}