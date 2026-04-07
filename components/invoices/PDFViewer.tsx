// components/invoices/PDFViewer.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, X } from "lucide-react";
import { generateInvoicePDF } from "./InvoicePDF";

interface PDFViewerProps {
  invoice: any;
  business: any;
  onClose: () => void;
}

export default function PDFViewer({ invoice, business, onClose }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const generatePDF = () => {
      const doc = generateInvoicePDF(invoice, business);
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    };

    generatePDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [invoice, business]);

  const handleDownload = () => {
    const doc = generateInvoicePDF(invoice, business);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleDownload} leftIcon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
          <Button variant="secondary" onClick={onClose} leftIcon={<X className="h-4 w-4" />}>
            Close
          </Button>
        </div>
      </div>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[600px]"
            title={`Invoice ${invoice.invoiceNumber}`}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
}