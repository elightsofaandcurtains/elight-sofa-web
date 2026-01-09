"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
  IndianRupee,
} from "lucide-react";
import { InvoiceService, InvoiceDocument, InvoiceStats, PaymentStatus } from "@/lib/firebase/invoices";
import InvoiceForm from "./InvoiceForm";
import ViewInvoiceModal from "./ViewInvoiceModal";
import DeleteInvoiceModal from "./DeleteInvoiceModal";
import ShareInvoiceModal from "./ShareInvoiceModal";
import { downloadInvoicePDFDirect } from "@/lib/pdfService";
import { Invoice } from "@/types";

type FilterStatus = "all" | "Paid" | "Partial" | "Pending";

// Convert Firebase invoice to legacy Invoice type for modals/PDF
function convertToLegacyInvoice(inv: InvoiceDocument): Invoice {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    invoiceDate: inv.invoiceDate,
    salespersonName: inv.salespersonName,
    orderType: inv.orderType,
    deliveryDate: inv.deliveryDate,
    companyDetails: {
      name: inv.companyName,
      address: inv.companyAddress,
      contactNumber: inv.companyPhone,
      email: inv.companyEmail,
      gstNumber: inv.companyGst,
    },
    customerDetails: {
      name: inv.customerName,
      mobileNumber: inv.customerPhone,
      email: inv.customerEmail,
      address: inv.customerAddress,
      gstNumber: inv.customerGst,
    },
    products: inv.items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      material: item.material || '',
      size: item.size || '',
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount,
      discountType: item.discountType,
      taxRate: item.taxRate,
      rowTotal: item.rowTotal,
    })),
    subtotal: inv.subTotal,
    totalDiscount: inv.discount,
    gstAmount: inv.taxAmount,
    transportCharges: inv.transportCharges,
    grandTotal: inv.totalAmount,
    amountInWords: inv.amountInWords,
    paymentDetails: {
      mode: inv.paymentMode,
      status: inv.paymentStatus,
      advancePaid: inv.paidAmount,
      balanceAmount: inv.pendingAmount,
      dueDate: inv.paymentDueDate,
    },
    createdAt: inv.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: inv.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export default function InvoiceTab() {
  // State
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceDocument | null>(null);
  
  // Loading states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Real-time subscription to Firebase
  useEffect(() => {
    setLoading(true);
    const unsubscribe = InvoiceService.subscribeToInvoices((data) => {
      setInvoices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter invoices (client-side filtering for real-time data)
  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.salespersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerPhone.includes(searchQuery);
    
    // Status filter
    const matchesStatus = filterStatus === "all" || invoice.paymentStatus === filterStatus;
    
    // Date range filter
    const matchesDateFrom = !dateFrom || invoice.invoiceDate >= dateFrom;
    const matchesDateTo = !dateTo || invoice.invoiceDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Calculate stats from filtered invoices (live from Firebase)
  const stats: InvoiceStats = InvoiceService.calculateStats(invoices);

  // Handlers
  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleViewInvoice = (invoice: InvoiceDocument) => {
    setSelectedInvoice(convertToLegacyInvoice(invoice));
    setShowViewModal(true);
  };

  const handleEditInvoice = (invoice: InvoiceDocument) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteClick = (invoice: InvoiceDocument) => {
    setSelectedInvoice(convertToLegacyInvoice(invoice));
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (invoiceId: string) => {
    await InvoiceService.deleteInvoice(invoiceId);
    // No need to update state - real-time subscription handles it
  };

  const handleShareClick = (invoice: InvoiceDocument) => {
    setSelectedInvoice(convertToLegacyInvoice(invoice));
    setShowShareModal(true);
  };

  const handleDownloadPDF = async (invoice: InvoiceDocument) => {
    setDownloadingId(invoice.id);
    try {
      const legacyInvoice = convertToLegacyInvoice(invoice);
      await downloadInvoicePDFDirect(legacyInvoice, 'Admin');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSaveInvoice = async () => {
    // Form handles saving to Firebase
    setShowForm(false);
    setEditingInvoice(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return <CheckCircle size={14} className="text-green-600" />;
      case 'Partial': return <Clock size={14} className="text-yellow-600" />;
      case 'Pending': return <AlertCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  // Show form view
  if (showForm) {
    return (
      <InvoiceForm
        invoice={editingInvoice}
        onSave={handleSaveInvoice}
        onCancel={() => { setShowForm(false); setEditingInvoice(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2926]">Invoice Management</h2>
          <p className="text-gray-600">Create and manage customer invoices • Live from Firebase</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleCreateInvoice}
          className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Create Invoice</span>
        </motion.button>
      </div>

      {/* Stats Cards - Live from Firebase */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Invoices</p>
            {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>
          <p className="text-2xl font-bold text-[#2D2926]">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle size={14} /> Paid
          </p>
          <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
          <p className="text-sm text-yellow-600 flex items-center gap-1">
            <Clock size={14} /> Partial
          </p>
          <p className="text-2xl font-bold text-yellow-700">{stats.partial}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> Pending
          </p>
          <p className="text-2xl font-bold text-red-700">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#D4AF37]/20">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <IndianRupee size={14} /> Total Amount
          </p>
          <p className="text-xl font-bold text-[#D4AF37]">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600 flex items-center gap-1">
            <IndianRupee size={14} /> Pending Amount
          </p>
          <p className="text-xl font-bold text-blue-700">₹{stats.pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, customer, salesperson, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" 
          />
        </div>
        
        {/* Date Range Filters */}
        <div className="flex gap-2">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
              placeholder="From"
            />
          </div>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
              placeholder="To"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              filterStatus !== "all" ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : "border-gray-300 hover:border-[#D4AF37]"
            }`}
          >
            <Filter size={20} />
            <span>Status{filterStatus !== "all" ? `: ${filterStatus}` : ""}</span>
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-2 py-1">Payment Status</p>
                  {(["all", "Paid", "Partial", "Pending"] as FilterStatus[]).map((status) => (
                    <button 
                      key={status} 
                      onClick={() => { setFilterStatus(status); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterStatus === status ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "hover:bg-gray-100"
                      }`}
                    >
                      {status === "all" ? "All Invoices" : status}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterStatus !== "all" || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
          <span className="ml-3 text-gray-600">Loading invoices from Firebase...</span>
        </div>
      )}

      {/* Invoices Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <motion.tr 
                    key={invoice.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#2D2926]">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.salespersonName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#D4AF37]">₹{invoice.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{invoice.itemsCount} item{invoice.itemsCount > 1 ? "s" : ""}</div>
                      {invoice.pendingAmount > 0 && (
                        <div className="text-xs text-red-500">Pending: ₹{invoice.pendingAmount.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.paymentStatus)}`}>
                        {getStatusIcon(invoice.paymentStatus)}
                        <span>{invoice.paymentStatus}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View Invoice"
                        >
                          <Eye size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" 
                          title="Edit Invoice"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleDeleteClick(invoice)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Delete Invoice"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={downloadingId === invoice.id} 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50" 
                          title="Download PDF"
                        >
                          {downloadingId === invoice.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleShareClick(invoice)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Share Invoice"
                        >
                          <Send size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== "all" || dateFrom || dateTo
                  ? "Try adjusting your search or filter criteria" 
                  : "Create your first invoice to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && !dateFrom && !dateTo && (
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={handleCreateInvoice}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors"
                >
                  Create Invoice
                </motion.button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showViewModal && selectedInvoice && (
          <ViewInvoiceModal 
            invoice={selectedInvoice} 
            onClose={() => { setShowViewModal(false); setSelectedInvoice(null); }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteModal && selectedInvoice && (
          <DeleteInvoiceModal 
            invoice={selectedInvoice} 
            onClose={() => { setShowDeleteModal(false); setSelectedInvoice(null); }} 
            onConfirm={handleDeleteConfirm} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showShareModal && selectedInvoice && (
          <ShareInvoiceModal 
            invoice={selectedInvoice} 
            onClose={() => { setShowShareModal(false); setSelectedInvoice(null); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
