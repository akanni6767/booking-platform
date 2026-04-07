// components/invoices/InvoicesClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Eye,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Send
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import dynamic from "next/dynamic";

// Dynamic import for PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import("@/components/invoices/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  ),
});

interface InvoicesClientProps {
  initialInvoices: any[];
  business: any;
}

export function InvoicesClient({ initialInvoices, business }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.clientName.toLowerCase().includes(query) ||
          inv.clientEmail?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    return filtered;
  }, [invoices, searchQuery, statusFilter]);

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${String(count).padStart(4, "0")}`;
  };

  const handleCreateInvoice = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          businessId: business.id,
          invoiceNumber: getNextInvoiceNumber(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      const newInvoice = await response.json();
      setInvoices((prev) => [newInvoice, ...prev]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = async (data: any) => {
    if (!selectedInvoice) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update invoice");

      const updatedInvoice = await response.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete invoice");

      setInvoices((prev) => prev.filter((inv) => inv.id !== selectedInvoice.id));
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoice: any) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark as paid");

      const updatedInvoice = await response.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendInvoice = async (invoice: any) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to send invoice");

      const updatedInvoice = await response.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: "default",
      SENT: "info",
      PAID: "success",
      OVERDUE: "error",
      CANCELLED: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const hasFilters = searchQuery || statusFilter !== "ALL";

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card>
        <Card.Body>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Input
                placeholder="Search invoices..."
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-2">
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear
                </Button>
              )}
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{filteredInvoices.length}</span> of{" "}
          <span className="font-medium">{invoices.length}</span> invoices
        </p>
      </div>

      {/* Invoices Table */}
      <Card>
        <Card.Body padding="none">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Invoice #</Table.Head>
                <Table.Head>Client</Table.Head>
                <Table.Head>Issue Date</Table.Head>
                <Table.Head>Due Date</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head className="text-right">Amount</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredInvoices.length === 0 ? (
                <Table.Empty 
                  colSpan={7} 
                  message={hasFilters ? "No invoices match your filters" : "No invoices yet"} 
                />
              ) : (
                filteredInvoices.map((invoice) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {invoice.clientName}
                        </p>
                        {invoice.clientEmail && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.clientEmail}
                          </p>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{formatDate(invoice.issueDate)}</Table.Cell>
                    <Table.Cell>{formatDate(invoice.dueDate)}</Table.Cell>
                    <Table.Cell>{getStatusBadge(invoice.status)}</Table.Cell>
                    <Table.Cell className="text-right font-medium">
                      {formatCurrency(invoice.total, business.currency)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                          title="View/Download PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {invoice.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice)}
                            title="Send Invoice"
                          >
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        
                        {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice)}
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedInvoice(invoice);
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
        title="Create Invoice"
        size="lg"
      >
        <InvoiceForm
          business={business}
          onSubmit={handleCreateInvoice}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Edit Invoice"
        size="lg"
      >
        <InvoiceForm
          business={business}
          initialData={selectedInvoice}
          onSubmit={handleUpdateInvoice}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          isLoading={isLoading}
        />
      </Modal>

      {/* View/Download PDF Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        size="xl"
      >
        {selectedInvoice && (
          <PDFViewer 
            invoice={selectedInvoice} 
            business={business}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedInvoice(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${selectedInvoice?.invoiceNumber}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </div>
  );
}