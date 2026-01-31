"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Search, X, Clock, CheckCircle, AlertCircle, Plus,
  User, Factory, AlertTriangle, Eye, Download, FileText, Edit, Trash2,
  Banknote, History, Receipt, Truck, Package, Layers, Loader2,
  TrendingUp, TrendingDown, Coins, Building2, Smartphone,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";
import { PaymentsService, CustomerPayment, SupplierPayment, PaymentHistoryItem } from "@/lib/firebase/payments";
import { downloadPaymentStatementPDF, PaymentStatementData } from "@/lib/pdfService";

type CustomerCategory = 'all' | 'paid' | 'partial' | 'pending' | 'cash' | 'online';
type SupplierCategory = 'all' | 'raw' | 'shop' | 'paid' | 'partial' | 'pending';

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: "-50%" }}
    animate={{ opacity: 1, y: 0, x: "-50%" }}
    exit={{ opacity: 0, y: 50, x: "-50%" }}
    className={cn("fixed bottom-6 left-1/2 transform px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-[100]",
      type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white")}
  >
    <CheckCircle size={20} />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-80 text-xl">×</button>
  </motion.div>
);

export default function PaymentsTab() {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [customerCategory, setCustomerCategory] = useState<CustomerCategory>('all');
  const [supplierCategory, setSupplierCategory] = useState<SupplierCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firebase real-time data
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  // Modals
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPayFullModal, setShowPayFullModal] = useState(false);
  const [viewType, setViewType] = useState<'customer' | 'supplier'>('customer');
  const [viewPaymentId, setViewPaymentId] = useState('');
  const [paymentType, setPaymentType] = useState<'customer' | 'supplier'>('customer');
  const [payFullPayment, setPayFullPayment] = useState<{ id: string; type: 'customer' | 'supplier'; name: string; pending: number } | null>(null);

  // Form states for Add Payment Record
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form states for Add New Payment
  const [newPaymentForm, setNewPaymentForm] = useState({
    customerName: '',
    customerPhone: '',
    supplierName: '',
    supplierPhone: '',
    invoiceNumber: '',
    billNo: '',
    productType: '',
    materialType: 'Raw Materials' as 'Raw Materials' | 'Shop Materials',
    totalAmount: '',
    paidAmount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Edit form
  const [editForm, setEditForm] = useState<any>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const modeLabels: Record<string, string> = {
    cash: "Cash", card: "Card", bank_transfer: "Bank Transfer",
    upi: "UPI", cheque: "Cheque", online: "Online", bank: "Bank"
  };

  // PDF Download Handler for Payment Receipt with Payment History
  // Uses standardized PDF service for consistent formatting
  const handleDownloadPaymentPDF = useCallback(async (payment: CustomerPayment | SupplierPayment, type: 'customer' | 'supplier') => {
    try {
      // Fetch payment history from Firebase
      const history = await PaymentsService.getPaymentHistory(payment.id);

      const isCustomer = type === 'customer';
      const customerPayment = payment as CustomerPayment;
      const supplierPayment = payment as SupplierPayment;

      // Build standardized payment statement data
      const statementData: PaymentStatementData = {
        id: payment.id,
        type: type,
        partyName: isCustomer ? customerPayment.customerName : supplierPayment.supplierName,
        partyPhone: isCustomer ? (customerPayment.customerPhone || '') : (supplierPayment.supplierPhone || ''),
        referenceNumber: isCustomer ? (customerPayment.invoiceNumber || '') : (supplierPayment.billNo || ''),
        productOrMaterialType: isCustomer ? (customerPayment.productType || 'N/A') : supplierPayment.materialType,
        orderOrPurchaseDate: isCustomer ? (customerPayment.orderDate || '') : (supplierPayment.purchaseDate || ''),
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        pendingAmount: payment.pendingAmount,
        paymentHistory: history.map(h => ({
          date: h.paymentDate,
          amount: h.amount,
          method: h.paymentMethod,
          reference: h.referenceId || '',
          notes: h.notes || ''
        }))
      };

      // Use standardized PDF service
      await downloadPaymentStatementPDF(statementData);
      showToast('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF', 'error');
    }
  }, [showToast]);

  // Firebase Real-time Subscriptions
  useEffect(() => {
    setIsLoading(true);
    let loadingTimeout: NodeJS.Timeout;

    loadingTimeout = setTimeout(() => setIsLoading(false), 3000);

    // Subscribe to customer payments
    const unsubCustomer = PaymentsService.subscribeToCustomerPayments((data) => {
      console.log('Customer payments received:', data.length);
      setCustomerPayments(data);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    });

    // Subscribe to supplier payments
    const unsubSupplier = PaymentsService.subscribeToSupplierPayments((data) => {
      console.log('Supplier payments received:', data.length);
      setSupplierPayments(data);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubCustomer();
      unsubSupplier();
    };
  }, []);

  // Load payment history when viewing a payment
  useEffect(() => {
    if (viewPaymentId && showViewModal) {
      PaymentsService.getPaymentHistory(viewPaymentId).then(setPaymentHistory);
    }
  }, [viewPaymentId, showViewModal]);

  // Computed values
  const viewedCustomerPayment = customerPayments.find(p => p.id === viewPaymentId);
  const viewedSupplierPayment = supplierPayments.find(p => p.id === viewPaymentId);
  const selectedCustomerPayment = customerPayments.find(p => p.id === selectedPaymentId);
  const selectedSupplierPayment = supplierPayments.find(p => p.id === selectedPaymentId);
  const pendingCustomerPayments = customerPayments.filter(p => p.pendingAmount > 0);
  const pendingSupplierPayments = supplierPayments.filter(p => p.pendingAmount > 0);

  // Customer Stats - Real-time from Firebase
  const customerStats = useMemo(() => ({
    all: customerPayments.length,
    paid: customerPayments.filter(p => p.paymentStatus === 'paid').length,
    partial: customerPayments.filter(p => p.paymentStatus === 'partial').length,
    pending: customerPayments.filter(p => p.paymentStatus === 'pending').length,
    cash: customerPayments.filter(p => p.paymentMethod === 'cash').length,
    online: customerPayments.filter(p => ['upi', 'card', 'bank_transfer', 'online', 'bank'].includes(p.paymentMethod)).length,
    totalAmount: customerPayments.reduce((s, p) => s + p.totalAmount, 0),
    totalPaid: customerPayments.reduce((s, p) => s + p.paidAmount, 0),
    totalPending: customerPayments.reduce((s, p) => s + p.pendingAmount, 0),
  }), [customerPayments]);

  // Supplier Stats - Real-time from Firebase
  const supplierStats = useMemo(() => ({
    all: supplierPayments.length,
    raw: supplierPayments.filter(p => p.materialType === 'Raw Materials').length,
    shop: supplierPayments.filter(p => p.materialType === 'Shop Materials').length,
    paid: supplierPayments.filter(p => p.paymentStatus === 'paid').length,
    partial: supplierPayments.filter(p => p.paymentStatus === 'partial').length,
    pending: supplierPayments.filter(p => p.paymentStatus === 'pending').length,
    totalAmount: supplierPayments.reduce((s, p) => s + p.totalAmount, 0),
    totalPaid: supplierPayments.reduce((s, p) => s + p.paidAmount, 0),
    totalPending: supplierPayments.reduce((s, p) => s + p.pendingAmount, 0),
  }), [supplierPayments]);

  // Filtered Data
  const filteredCustomerPayments = useMemo(() => {
    let data = customerPayments;
    if (customerCategory === 'paid') data = data.filter(p => p.paymentStatus === 'paid');
    else if (customerCategory === 'partial') data = data.filter(p => p.paymentStatus === 'partial');
    else if (customerCategory === 'pending') data = data.filter(p => p.paymentStatus === 'pending');
    else if (customerCategory === 'cash') data = data.filter(p => p.paymentMethod === 'cash');
    else if (customerCategory === 'online') data = data.filter(p => ['upi', 'card', 'bank_transfer', 'online', 'bank'].includes(p.paymentMethod));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => p.customerName.toLowerCase().includes(q) || p.invoiceNumber?.toLowerCase().includes(q));
    }
    return data;
  }, [customerPayments, customerCategory, searchQuery]);

  const filteredSupplierPayments = useMemo(() => {
    let data = supplierPayments;
    if (supplierCategory === 'raw') data = data.filter(p => p.materialType === 'Raw Materials');
    else if (supplierCategory === 'shop') data = data.filter(p => p.materialType === 'Shop Materials');
    else if (supplierCategory === 'paid') data = data.filter(p => p.paymentStatus === 'paid');
    else if (supplierCategory === 'partial') data = data.filter(p => p.paymentStatus === 'partial');
    else if (supplierCategory === 'pending') data = data.filter(p => p.paymentStatus === 'pending');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => p.supplierName.toLowerCase().includes(q) || p.billNo?.toLowerCase().includes(q));
    }
    return data;
  }, [supplierPayments, supplierCategory, searchQuery]);

  // Handlers
  const resetPaymentForm = () => {
    setSelectedPaymentId('');
    setPaymentAmount('');
    setPaymentMode('cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setTransactionRef('');
    setPaymentNotes('');
  };

  const resetNewPaymentForm = () => {
    setNewPaymentForm({
      customerName: '', customerPhone: '', supplierName: '', supplierPhone: '',
      invoiceNumber: '', billNo: '', productType: '', materialType: 'Raw Materials',
      totalAmount: '', paidAmount: '', paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  const openViewModal = (id: string, type: 'customer' | 'supplier') => {
    setViewPaymentId(id);
    setViewType(type);
    setShowViewModal(true);
  };

  const openAddRecordModal = (id: string, type: 'customer' | 'supplier') => {
    resetPaymentForm();
    setSelectedPaymentId(id);
    setPaymentType(type);
    setShowAddRecordModal(true);
  };

  const openEditModal = (payment: CustomerPayment | SupplierPayment, type: 'customer' | 'supplier') => {
    setEditForm({ ...payment, type });
    setShowEditModal(true);
  };

  const openDeleteModal = (id: string, type: 'customer' | 'supplier') => {
    setViewPaymentId(id);
    setViewType(type);
    setShowDeleteModal(true);
  };

  // Add New Payment Record (Customer or Supplier)
  const handleAddNewPayment = async () => {
    setIsSubmitting(true);
    try {
      if (paymentType === 'customer') {
        await PaymentsService.createCustomerPayment({
          customerName: newPaymentForm.customerName,
          customerPhone: newPaymentForm.customerPhone,
          invoiceId: '',
          invoiceNumber: newPaymentForm.invoiceNumber,
          productType: newPaymentForm.productType,
          orderDate: newPaymentForm.paymentDate,
          totalAmount: parseFloat(newPaymentForm.totalAmount) || 0,
          paidAmount: parseFloat(newPaymentForm.paidAmount) || 0,
          paymentMethod: newPaymentForm.paymentMethod as any,
          paymentDate: newPaymentForm.paymentDate,
        });
        showToast('Customer payment added successfully!');
      } else {
        await PaymentsService.createSupplierPayment({
          supplierName: newPaymentForm.supplierName,
          supplierPhone: newPaymentForm.supplierPhone,
          billNo: newPaymentForm.billNo,
          materialType: newPaymentForm.materialType,
          purchaseDate: newPaymentForm.paymentDate,
          totalAmount: parseFloat(newPaymentForm.totalAmount) || 0,
          paidAmount: parseFloat(newPaymentForm.paidAmount) || 0,
          paymentMethod: newPaymentForm.paymentMethod as any,
          paymentDate: newPaymentForm.paymentDate,
        });
        showToast('Supplier payment added successfully!');
      }
      resetNewPaymentForm();
      setShowAddPaymentModal(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to add payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record Payment (Add to existing)
  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount) || 0;
    const maxAmount = paymentType === 'customer'
      ? selectedCustomerPayment?.pendingAmount
      : selectedSupplierPayment?.pendingAmount;

    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }
    if (maxAmount && amount > maxAmount) {
      showToast(`Cannot exceed pending amount (${formatCurrency(maxAmount)})`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentsService.recordPayment(
        selectedPaymentId,
        paymentType,
        amount,
        paymentMode,
        paymentDate,
        transactionRef,
        paymentNotes
      );
      showToast(`Payment of ${formatCurrency(amount)} recorded successfully!`);
      resetPaymentForm();
      setShowAddRecordModal(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to record payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Payment
  const handleEditPayment = async () => {
    if (!editForm) return;
    setIsSubmitting(true);
    try {
      if (editForm.type === 'customer') {
        await PaymentsService.updateCustomerPayment(editForm.id, {
          customerName: editForm.customerName,
          customerPhone: editForm.customerPhone,
          invoiceNumber: editForm.invoiceNumber,
          totalAmount: parseFloat(editForm.totalAmount) || 0,
          paidAmount: parseFloat(editForm.paidAmount) || 0,
          paymentMethod: editForm.paymentMethod,
          paymentDate: editForm.paymentDate,
        });
      } else {
        await PaymentsService.updateSupplierPayment(editForm.id, {
          supplierName: editForm.supplierName,
          billNo: editForm.billNo,
          materialType: editForm.materialType,
          totalAmount: parseFloat(editForm.totalAmount) || 0,
          paidAmount: parseFloat(editForm.paidAmount) || 0,
          paymentMethod: editForm.paymentMethod,
          paymentDate: editForm.paymentDate,
        });
      }
      showToast('Payment updated successfully!');
      setShowEditModal(false);
      setEditForm(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to update payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async () => {
    setIsSubmitting(true);
    try {
      if (viewType === 'customer') {
        await PaymentsService.deleteCustomerPayment(viewPaymentId);
      } else {
        await PaymentsService.deleteSupplierPayment(viewPaymentId);
      }
      showToast('Payment deleted successfully!');
      setShowDeleteModal(false);
      setViewPaymentId('');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pay Full - Mark payment as fully paid
  const openPayFullModal = (id: string, type: 'customer' | 'supplier', name: string, pending: number) => {
    setPayFullPayment({ id, type, name, pending });
    setPaymentMode('cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setShowPayFullModal(true);
  };

  const handlePayFull = async () => {
    if (!payFullPayment) return;

    setIsSubmitting(true);
    try {
      await PaymentsService.recordPayment(
        payFullPayment.id,
        payFullPayment.type,
        payFullPayment.pending,
        paymentMode,
        paymentDate,
        `FULL-${Date.now()}`,
        'Full payment received'
      );
      showToast(`Full payment of ${formatCurrency(payFullPayment.pending)} recorded! ✅`);
      setShowPayFullModal(false);
      setPayFullPayment(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to record payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Cards
  const customerCategoryCards = [
    { key: 'all' as CustomerCategory, label: 'All Payments', icon: <Layers size={20} />, count: customerStats.all, color: 'text-blue-600' },
    { key: 'paid' as CustomerCategory, label: 'Paid', icon: <CheckCircle size={20} />, count: customerStats.paid, color: 'text-green-600' },
    { key: 'partial' as CustomerCategory, label: 'Partial', icon: <AlertCircle size={20} />, count: customerStats.partial, color: 'text-orange-600' },
    { key: 'pending' as CustomerCategory, label: 'Pending', icon: <Clock size={20} />, count: customerStats.pending, color: 'text-red-600' },
    { key: 'cash' as CustomerCategory, label: 'Cash', icon: <Banknote size={20} />, count: customerStats.cash, color: 'text-emerald-600' },
    { key: 'online' as CustomerCategory, label: 'Online', icon: <Smartphone size={20} />, count: customerStats.online, color: 'text-purple-600' },
  ];

  const supplierCategoryCards = [
    { key: 'all' as SupplierCategory, label: 'All Payments', icon: <Layers size={20} />, count: supplierStats.all, color: 'text-blue-600' },
    { key: 'raw' as SupplierCategory, label: 'Raw Materials', icon: <Package size={20} />, count: supplierStats.raw, color: 'text-amber-600' },
    { key: 'shop' as SupplierCategory, label: 'Shop Materials', icon: <Factory size={20} />, count: supplierStats.shop, color: 'text-indigo-600' },
    { key: 'paid' as SupplierCategory, label: 'Paid', icon: <CheckCircle size={20} />, count: supplierStats.paid, color: 'text-green-600' },
    { key: 'partial' as SupplierCategory, label: 'Partial', icon: <AlertCircle size={20} />, count: supplierStats.partial, color: 'text-orange-600' },
    { key: 'pending' as SupplierCategory, label: 'Pending', icon: <Clock size={20} />, count: supplierStats.pending, color: 'text-red-600' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-gray-600">Loading payments from Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage customer and supplier payments • Real-time Firebase Data</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setPaymentType(activeTab); resetNewPaymentForm(); setShowAddPaymentModal(true); }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus size={20} /><span>Add Payment</span>
        </motion.button>
      </motion.div>

      {/* Toggle Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('customer')}
          className={cn("px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2",
            activeTab === 'customer' ? 'bg-[#D4AF37] text-white' : 'text-gray-600 hover:text-gray-900')}>
          <Receipt size={20} /><span>💰 Customer Payments</span>
        </button>
        <button onClick={() => setActiveTab('supplier')}
          className={cn("px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2",
            activeTab === 'supplier' ? 'bg-[#D4AF37] text-white' : 'text-gray-600 hover:text-gray-900')}>
          <Truck size={20} /><span>🏭 Supplier Payments</span>
        </button>
      </div>

      {/* Summary Cards - Real-time from Firebase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-[#D4AF37]" size={24} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-[#2D2926]">
            {formatCurrency(activeTab === 'customer' ? customerStats.totalAmount : supplierStats.totalAmount)}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Coins className="text-green-600" size={24} />
          </div>
          <p className="text-sm text-gray-600">Total {activeTab === 'customer' ? 'Received' : 'Paid'}</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(activeTab === 'customer' ? customerStats.totalPaid : supplierStats.totalPaid)}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-red-500" size={24} />
          </div>
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(activeTab === 'customer' ? customerStats.totalPending : supplierStats.totalPending)}
          </p>
        </motion.div>
      </div>

      {/* Category Cards - Real-time counts */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
          {activeTab === 'customer' ? '💳 Customer Payment Categories' : '🏭 Supplier Payment Categories'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(activeTab === 'customer' ? customerCategoryCards : supplierCategoryCards).map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => activeTab === 'customer' ? setCustomerCategory(card.key as CustomerCategory) : setSupplierCategory(card.key as SupplierCategory)}
              className={cn("p-4 rounded-lg text-center cursor-pointer transition-all",
                (activeTab === 'customer' ? customerCategory : supplierCategory) === card.key
                  ? 'bg-[#D4AF37]/10 border-2 border-[#D4AF37] shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent')}
            >
              <div className={cn("flex justify-center mb-2", card.color)}>{card.icon}</div>
              <h4 className="font-medium text-gray-900 text-sm">{card.label}</h4>
              <p className="text-2xl font-bold text-[#2D2926] mt-1">{card.count}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'customer' ? 'customers' : 'suppliers'}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#2D2926]">
            {activeTab === 'customer' ? 'Customer Payments' : 'Supplier Payments'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {activeTab === 'customer' ? 'Customer' : 'Supplier'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {activeTab === 'customer' ? 'Invoice' : 'Bill No'}
                </th>
                {activeTab === 'supplier' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Material Type</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeTab === 'customer' ? (
                filteredCustomerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Receipt size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No payment records found</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first customer payment to get started</p>
                        <button
                          onClick={() => { setPaymentType('customer'); resetNewPaymentForm(); setShowAddPaymentModal(true); }}
                          className="mt-4 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F]"
                        >
                          Add Customer Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomerPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium">{payment.customerName}</span>
                            {payment.customerPhone && <p className="text-xs text-gray-500">{payment.customerPhone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.invoiceNumber || '-'}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(payment.totalAmount)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(payment.paidAmount)}</td>
                      <td className="px-6 py-4 text-red-600 font-medium">{formatCurrency(payment.pendingAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(payment.paymentStatus))}>
                          {payment.paymentStatus === 'paid' ? '✅ Paid' : payment.paymentStatus === 'partial' ? '⚠️ Partial' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{modeLabels[payment.paymentMethod] || payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <button onClick={() => openViewModal(payment.id, 'customer')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(payment, 'customer')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                            <Edit size={16} />
                          </button>
                          {payment.pendingAmount > 0 && (
                            <>
                              <button onClick={() => openAddRecordModal(payment.id, 'customer')} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded" title="Add Partial Payment">
                                <Plus size={16} />
                              </button>
                              <button onClick={() => openPayFullModal(payment.id, 'customer', payment.customerName, payment.pendingAmount)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Pay Full Amount">
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => openDeleteModal(payment.id, 'customer')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )
              ) : (
                filteredSupplierPayments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Truck size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No payment records found</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first supplier payment to get started</p>
                        <button
                          onClick={() => { setPaymentType('supplier'); resetNewPaymentForm(); setShowAddPaymentModal(true); }}
                          className="mt-4 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F]"
                        >
                          Add Supplier Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSupplierPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 size={16} className="text-gray-400 mr-2" />
                          <span className="font-medium">{payment.supplierName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.billNo || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{payment.materialType}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(payment.totalAmount)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(payment.paidAmount)}</td>
                      <td className="px-6 py-4 text-red-600 font-medium">{formatCurrency(payment.pendingAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(payment.paymentStatus))}>
                          {payment.paymentStatus === 'paid' ? '✅ Paid' : payment.paymentStatus === 'partial' ? '⚠️ Partial' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{modeLabels[payment.paymentMethod] || payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <button onClick={() => openViewModal(payment.id, 'supplier')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(payment, 'supplier')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                            <Edit size={16} />
                          </button>
                          {payment.pendingAmount > 0 && (
                            <>
                              <button onClick={() => openAddRecordModal(payment.id, 'supplier')} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded" title="Add Partial Payment">
                                <Plus size={16} />
                              </button>
                              <button onClick={() => openPayFullModal(payment.id, 'supplier', payment.supplierName, payment.pendingAmount)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Pay Full Amount">
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => openDeleteModal(payment.id, 'supplier')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Payment Modal */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-[#2D2926]">Add New Payment</h2>
                <button onClick={() => setShowAddPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Payment Type Toggle */}
                <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                  <button onClick={() => setPaymentType('customer')}
                    className={cn("flex-1 py-2 rounded-md font-medium transition-colors", paymentType === 'customer' ? 'bg-[#D4AF37] text-white' : 'text-gray-600')}>
                    💰 Customer
                  </button>
                  <button onClick={() => setPaymentType('supplier')}
                    className={cn("flex-1 py-2 rounded-md font-medium transition-colors", paymentType === 'supplier' ? 'bg-[#D4AF37] text-white' : 'text-gray-600')}>
                    🏭 Supplier
                  </button>
                </div>

                {paymentType === 'customer' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                        <input type="text" value={newPaymentForm.customerName} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, customerName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="Customer name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="text" value={newPaymentForm.customerPhone} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, customerPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="Phone number" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                        <input type="text" value={newPaymentForm.invoiceNumber} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, invoiceNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="INV-001" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                        <input type="text" value={newPaymentForm.productType} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, productType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="Sofa, Curtain, etc." />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
                        <input type="text" value={newPaymentForm.supplierName} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, supplierName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="Supplier name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bill No</label>
                        <input type="text" value={newPaymentForm.billNo} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, billNo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="BILL-001" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material Type *</label>
                      <select value={newPaymentForm.materialType} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, materialType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Shop Materials">Shop Materials</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount *</label>
                    <input type="number" value={newPaymentForm.totalAmount || ''} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, totalAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                    <input type="number" value={newPaymentForm.paidAmount || ''} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, paidAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select value={newPaymentForm.paymentMethod} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="card">💳 Card</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="cheque">📝 Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input type="date" value={newPaymentForm.paymentDate} onChange={(e) => setNewPaymentForm({ ...newPaymentForm, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                {/* Preview */}
                {newPaymentForm.totalAmount && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Payment Preview</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-blue-600">Total:</span><p className="font-bold">{formatCurrency(parseFloat(newPaymentForm.totalAmount) || 0)}</p></div>
                      <div><span className="text-blue-600">Paid:</span><p className="font-bold text-green-600">{formatCurrency(parseFloat(newPaymentForm.paidAmount) || 0)}</p></div>
                      <div><span className="text-blue-600">Pending:</span><p className="font-bold text-red-600">{formatCurrency((parseFloat(newPaymentForm.totalAmount) || 0) - (parseFloat(newPaymentForm.paidAmount) || 0))}</p></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button onClick={() => setShowAddPaymentModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={handleAddNewPayment} disabled={isSubmitting || !(paymentType === 'customer' ? newPaymentForm.customerName : newPaymentForm.supplierName) || !newPaymentForm.totalAmount}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] disabled:opacity-50 flex items-center space-x-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Add Payment</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Payment Record Modal (for existing payments) */}
      <AnimatePresence>
        {showAddRecordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#2D2926]">Record Payment</h2>
                <button onClick={() => { setShowAddRecordModal(false); resetPaymentForm(); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Current Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-[#2D2926] mb-3">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{paymentType === 'customer' ? 'Customer' : 'Supplier'}:</span>
                      <p className="font-medium">{paymentType === 'customer' ? selectedCustomerPayment?.customerName : selectedSupplierPayment?.supplierName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{paymentType === 'customer' ? 'Invoice' : 'Bill'}:</span>
                      <p className="font-medium">{paymentType === 'customer' ? selectedCustomerPayment?.invoiceNumber : selectedSupplierPayment?.billNo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <p className="font-medium">{formatCurrency(paymentType === 'customer' ? selectedCustomerPayment?.totalAmount || 0 : selectedSupplierPayment?.totalAmount || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid:</span>
                      <p className="font-medium text-green-600">{formatCurrency(paymentType === 'customer' ? selectedCustomerPayment?.paidAmount || 0 : selectedSupplierPayment?.paidAmount || 0)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Pending:</span>
                      <p className="font-bold text-red-600 text-lg">{formatCurrency(paymentType === 'customer' ? selectedCustomerPayment?.pendingAmount || 0 : selectedSupplierPayment?.pendingAmount || 0)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
                  <input type="number" value={paymentAmount || ''} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="card">💳 Card</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="cheque">📝 Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference ID (Optional)</label>
                  <input type="text" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="Transaction reference"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Additional notes" rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                {/* Preview */}
                {paymentAmount && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">After This Payment</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-600">New Paid:</span>
                        <p className="font-bold text-green-600">
                          {formatCurrency((paymentType === 'customer' ? selectedCustomerPayment?.paidAmount || 0 : selectedSupplierPayment?.paidAmount || 0) + (parseFloat(paymentAmount) || 0))}
                        </p>
                      </div>
                      <div>
                        <span className="text-green-600">New Pending:</span>
                        <p className="font-bold text-red-600">
                          {formatCurrency(Math.max(0, (paymentType === 'customer' ? selectedCustomerPayment?.pendingAmount || 0 : selectedSupplierPayment?.pendingAmount || 0) - (parseFloat(paymentAmount) || 0)))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button onClick={() => { setShowAddRecordModal(false); resetPaymentForm(); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={handleRecordPayment} disabled={isSubmitting || !paymentAmount}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] disabled:opacity-50 flex items-center space-x-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Record Payment</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Payment Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-[#2D2926]">Payment Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                {viewType === 'customer' && viewedCustomerPayment && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-[#2D2926] mb-3 flex items-center"><FileText size={18} className="mr-2" />Order Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Customer:</span><p className="font-medium">{viewedCustomerPayment.customerName}</p></div>
                        <div><span className="text-gray-500">Phone:</span><p className="font-medium">{viewedCustomerPayment.customerPhone || '-'}</p></div>
                        <div><span className="text-gray-500">Invoice:</span><p className="font-medium">{viewedCustomerPayment.invoiceNumber || '-'}</p></div>
                        <div><span className="text-gray-500">Product:</span><p className="font-medium">{viewedCustomerPayment.productType || '-'}</p></div>
                        <div><span className="text-gray-500">Date:</span><p className="font-medium">{formatDate(viewedCustomerPayment.paymentDate)}</p></div>
                        <div><span className="text-gray-500">Method:</span><p className="font-medium capitalize">{modeLabels[viewedCustomerPayment.paymentMethod] || viewedCustomerPayment.paymentMethod}</p></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-[#2D2926] mb-3 flex items-center"><DollarSign size={18} className="mr-2" />Amount Summary</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg"><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{formatCurrency(viewedCustomerPayment.totalAmount)}</p></div>
                        <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-sm text-gray-500">Paid</p><p className="text-xl font-bold text-green-600">{formatCurrency(viewedCustomerPayment.paidAmount)}</p></div>
                        <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-sm text-gray-500">Pending</p><p className="text-xl font-bold text-red-600">{formatCurrency(viewedCustomerPayment.pendingAmount)}</p></div>
                      </div>
                    </div>
                  </>
                )}
                {viewType === 'supplier' && viewedSupplierPayment && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-[#2D2926] mb-3 flex items-center"><FileText size={18} className="mr-2" />Purchase Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Supplier:</span><p className="font-medium">{viewedSupplierPayment.supplierName}</p></div>
                        <div><span className="text-gray-500">Bill No:</span><p className="font-medium">{viewedSupplierPayment.billNo || '-'}</p></div>
                        <div><span className="text-gray-500">Material Type:</span><p className="font-medium">{viewedSupplierPayment.materialType}</p></div>
                        <div><span className="text-gray-500">Date:</span><p className="font-medium">{formatDate(viewedSupplierPayment.paymentDate)}</p></div>
                        <div><span className="text-gray-500">Method:</span><p className="font-medium capitalize">{modeLabels[viewedSupplierPayment.paymentMethod] || viewedSupplierPayment.paymentMethod}</p></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-[#2D2926] mb-3 flex items-center"><DollarSign size={18} className="mr-2" />Amount Summary</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg"><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{formatCurrency(viewedSupplierPayment.totalAmount)}</p></div>
                        <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-sm text-gray-500">Paid</p><p className="text-xl font-bold text-green-600">{formatCurrency(viewedSupplierPayment.paidAmount)}</p></div>
                        <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-sm text-gray-500">Pending</p><p className="text-xl font-bold text-red-600">{formatCurrency(viewedSupplierPayment.pendingAmount)}</p></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Payment History */}
                {paymentHistory.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-[#2D2926] mb-3 flex items-center"><History size={18} className="mr-2" />Payment History</h3>
                    <div className="space-y-2">
                      {paymentHistory.map(h => (
                        <div key={h.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">{formatCurrency(h.amount)}</p>
                            <p className="text-xs text-gray-500">{formatDate(h.paymentDate)} • {modeLabels[h.paymentMethod] || h.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400">{h.referenceId}</span>
                            {h.notes && <p className="text-xs text-gray-500">{h.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => {
                    const payment = viewType === 'customer' ? viewedCustomerPayment : viewedSupplierPayment;
                    if (payment) handleDownloadPaymentPDF(payment, viewType);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <Download size={16} className="mr-2" />Download PDF
                </button>
                <div className="flex space-x-3">
                  {((viewType === 'customer' && viewedCustomerPayment?.pendingAmount && viewedCustomerPayment.pendingAmount > 0) ||
                    (viewType === 'supplier' && viewedSupplierPayment?.pendingAmount && viewedSupplierPayment.pendingAmount > 0)) && (
                      <button onClick={() => { setShowViewModal(false); openAddRecordModal(viewPaymentId, viewType); }}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] flex items-center">
                        <Plus size={16} className="mr-2" />Add Payment
                      </button>
                    )}
                  <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Payment Modal */}
      <AnimatePresence>
        {showEditModal && editForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#2D2926]">Edit Payment</h2>
                <button onClick={() => { setShowEditModal(false); setEditForm(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                {editForm.type === 'customer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                      <input type="text" value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                      <input type="text" value={editForm.invoiceNumber || ''} onChange={(e) => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
                      <input type="text" value={editForm.supplierName} onChange={(e) => setEditForm({ ...editForm, supplierName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bill No</label>
                      <input type="text" value={editForm.billNo || ''} onChange={(e) => setEditForm({ ...editForm, billNo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                      <select value={editForm.materialType} onChange={(e) => setEditForm({ ...editForm, materialType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Shop Materials">Shop Materials</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount *</label>
                    <input type="number" value={editForm.totalAmount || ''} onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                    <input type="number" value={editForm.paidAmount || ''} onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select value={editForm.paymentMethod} onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="card">💳 Card</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="cheque">📝 Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input type="date" value={editForm.paymentDate} onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Updated Summary</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-blue-600">Total:</span><p className="font-bold">{formatCurrency(parseFloat(editForm.totalAmount) || 0)}</p></div>
                    <div><span className="text-blue-600">Paid:</span><p className="font-bold text-green-600">{formatCurrency(parseFloat(editForm.paidAmount) || 0)}</p></div>
                    <div><span className="text-blue-600">Pending:</span><p className="font-bold text-red-600">{formatCurrency((parseFloat(editForm.totalAmount) || 0) - (parseFloat(editForm.paidAmount) || 0))}</p></div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button onClick={() => { setShowEditModal(false); setEditForm(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={handleEditPayment} disabled={isSubmitting}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] disabled:opacity-50 flex items-center space-x-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2926] mb-2">Delete Payment</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this payment record? This action cannot be undone and will also delete all payment history.
                </p>
                <div className="flex justify-center space-x-3">
                  <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                  <button onClick={handleDeletePayment} disabled={isSubmitting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay Full Amount Modal */}
      <AnimatePresence>
        {showPayFullModal && payFullPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2926] mb-2">Pay Full Amount</h3>
                <p className="text-gray-600 mb-2">
                  Mark payment as fully paid for:
                </p>
                <p className="font-semibold text-[#2D2926] text-lg mb-4">{payFullPayment.name}</p>

                {/* Amount Display */}
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-600 mb-1">Amount to be paid</p>
                  <p className="text-3xl font-bold text-green-700">{formatCurrency(payFullPayment.pending)}</p>
                </div>

                {/* Payment Method & Date */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500">
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="card">💳 Card</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="cheque">📝 Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  <button onClick={() => { setShowPayFullModal(false); setPayFullPayment(null); }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                  <button onClick={handlePayFull} disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    <CheckCircle size={18} />
                    <span>Confirm Full Payment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
