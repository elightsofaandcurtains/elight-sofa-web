"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Printer,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Loader2,
} from "lucide-react";
import { Invoice } from "@/types";
import { downloadInvoicePDFDirect } from "@/lib/pdfService";

interface ViewInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function ViewInvoiceModal({ invoice, onClose }: ViewInvoiceModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDFDirect(invoice, "Admin");
    } catch (error) {
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Pending":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543] print:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">View Invoice</h2>
                <p className="text-white/70 text-sm">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Printer size={16} />
                <span>Print</span>
              </motion.button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            <div id="invoice-view-content" className="bg-white">
              {/* Company Header */}
              <div className="border-b-2 border-[#D4AF37] pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-[#2D2926]">
                      {invoice.companyDetails.name}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">{invoice.companyDetails.address}</p>
                    <p className="text-sm text-gray-600">Phone: {invoice.companyDetails.contactNumber}</p>
                    <p className="text-sm text-gray-600">Email: {invoice.companyDetails.email}</p>
                    {invoice.companyDetails.gstNumber && (
                      <p className="text-sm text-gray-600">GST: {invoice.companyDetails.gstNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg inline-block mb-2">
                      <h2 className="text-lg font-bold">INVOICE</h2>
                    </div>
                    <p className="text-sm"><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
                    <p className="text-sm"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    <p className="text-sm"><strong>Salesperson:</strong> {invoice.salespersonName}</p>
                    <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border mt-2 ${getStatusColor(invoice.paymentDetails.status)}`}>
                      {invoice.paymentDetails.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#2D2926] mb-2 flex items-center">
                  <User size={16} className="mr-2" /> Bill To:
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">{invoice.customerDetails.name}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin size={14} className="mr-1" /> {invoice.customerDetails.address}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone size={14} className="mr-1" /> {invoice.customerDetails.mobileNumber}
                  </p>
                  {invoice.customerDetails.email && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Mail size={14} className="mr-1" /> {invoice.customerDetails.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#2D2926] mb-2 flex items-center">
                  <Package size={16} className="mr-2" /> Items ({invoice.products.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#D4AF37] text-white">
                        <th className="border px-2 py-2 text-left">#</th>
                        <th className="border px-2 py-2 text-left">Product</th>
                        <th className="border px-2 py-2 text-left">Category</th>
                        <th className="border px-2 py-2 text-center">Qty</th>
                        <th className="border px-2 py-2 text-right">Rate</th>
                        <th className="border px-2 py-2 text-right">Discount</th>
                        <th className="border px-2 py-2 text-center">GST</th>
                        <th className="border px-2 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.products.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-2">{index + 1}</td>
                          <td className="border px-2 py-2 font-medium">{product.name}</td>
                          <td className="border px-2 py-2">{product.category}</td>
                          <td className="border px-2 py-2 text-center">{product.quantity}</td>
                          <td className="border px-2 py-2 text-right">Rs. {product.rate.toLocaleString()}</td>
                          <td className="border px-2 py-2 text-right">
                            {product.discountType === "percentage" ? `${product.discount}%` : `Rs. ${product.discount}`}
                          </td>
                          <td className="border px-2 py-2 text-center">{product.taxRate}%</td>
                          <td className="border px-2 py-2 text-right font-medium">Rs. {product.rowTotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="flex justify-end mb-4">
                <div className="w-72">
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">Rs. {invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">- Rs. {invoice.totalDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST:</span>
                      <span className="font-medium">Rs. {invoice.gstAmount.toLocaleString()}</span>
                    </div>
                    {invoice.transportCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transport:</span>
                        <span className="font-medium">Rs. {invoice.transportCharges.toLocaleString()}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-base font-bold">
                      <span>Grand Total:</span>
                      <span className="text-[#D4AF37]">Rs. {invoice.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="mb-4">
                <div className="bg-[#D4AF37]/10 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Amount in Words:</p>
                  <p className="font-medium text-[#2D2926]">{invoice.amountInWords}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2926] mb-2 flex items-center">
                    <CreditCard size={16} className="mr-2" /> Payment Details
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-600">Mode:</span> {invoice.paymentDetails.mode}</p>
                    <p><span className="text-gray-600">Status:</span> <span className={invoice.paymentDetails.status === 'Paid' ? 'text-green-600 font-medium' : invoice.paymentDetails.status === 'Partial' ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>{invoice.paymentDetails.status}</span></p>
                    <p><span className="text-gray-600">Advance Paid:</span> Rs. {invoice.paymentDetails.advancePaid.toLocaleString()}</p>
                    <p><span className="text-gray-600">Balance:</span> Rs. {invoice.paymentDetails.balanceAmount.toLocaleString()}</p>
                    {invoice.paymentDetails.dueDate && (
                      <p><span className="text-gray-600">Due Date:</span> {new Date(invoice.paymentDetails.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2926] mb-2 flex items-center">
                    <Calendar size={16} className="mr-2" /> Order Info
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-600">Order Type:</span> {invoice.orderType}</p>
                    <p><span className="text-gray-600">Invoice Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    {invoice.deliveryDate && (
                      <p><span className="text-gray-600">Delivery Date:</span> {new Date(invoice.deliveryDate).toLocaleDateString()}</p>
                    )}
                    <p><span className="text-gray-600">Created:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-3 text-center text-gray-500 text-xs">
                <p>Thank you for your business!</p>
                <p className="mt-1">This is a computer-generated invoice.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
