"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
} from "lucide-react";
import { InvoiceService, InvoiceDocument, InvoiceItem, PaymentMode, OrderType, numberToWords } from "@/lib/firebase/invoices";
import { getInvoiceCompanyDetails } from "@/lib/companyConfig";
import { calculateSofaRate, isSofaCategory } from "@/lib/pricingUtils";

interface InvoiceFormProps {
  invoice?: InvoiceDocument | null;
  onSave: () => void;
  onCancel: () => void;
}

// Get default company details from centralized config
const companyConfig = getInvoiceCompanyDetails();

const defaultItem: Omit<InvoiceItem, 'id'> = {
  name: "",
  category: "Sofa",
  material: "",
  size: "",
  footPrice: 0,
  quantity: 1,
  rate: 0,
  discount: 0,
  discountType: "percentage",
  taxRate: 18,
  rowTotal: 0,
};

export default function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Company Details (from config)
  const [companyName] = useState(companyConfig.name);
  const [companyAddress] = useState(companyConfig.address);
  const [companyPhone] = useState(companyConfig.contactNumber);
  const [companyEmail] = useState(companyConfig.email);
  const [companyGst] = useState(companyConfig.gstNumber);

  // Customer Details
  const [customerName, setCustomerName] = useState(invoice?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(invoice?.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState(invoice?.customerEmail || "");
  const [customerAddress, setCustomerAddress] = useState(invoice?.customerAddress || "");
  const [customerGst, setCustomerGst] = useState(invoice?.customerGst || "");

  // Invoice Details
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate || new Date().toISOString().split('T')[0]);
  const [salespersonName, setSalespersonName] = useState(invoice?.salespersonName || "");
  const [orderType, setOrderType] = useState<OrderType>(invoice?.orderType || "Ready");
  const [deliveryDate, setDeliveryDate] = useState(invoice?.deliveryDate || "");
  const [transportCharges, setTransportCharges] = useState(invoice?.transportCharges || 0);

  // Items
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [{ ...defaultItem, id: "1" }]
  );

  // Payment Details
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(invoice?.paymentMode || "Cash");
  const [paidAmount, setPaidAmount] = useState(invoice?.paidAmount || 0);
  const [paymentDueDate, setPaymentDueDate] = useState(invoice?.paymentDueDate || "");

  // Calculate totals
  const subTotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.rate;
    const discountAmount = item.discountType === 'percentage'
      ? (itemTotal * item.discount) / 100
      : item.discount;
    return sum + (itemTotal - discountAmount);
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.rate;
    return sum + (item.discountType === 'percentage'
      ? (itemTotal * item.discount) / 100
      : item.discount);
  }, 0);

  const taxAmount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.rate;
    const discountAmount = item.discountType === 'percentage'
      ? (itemTotal * item.discount) / 100
      : item.discount;
    const taxableAmount = itemTotal - discountAmount;
    return sum + (taxableAmount * item.taxRate) / 100;
  }, 0);

  const totalAmount = subTotal + taxAmount + transportCharges;
  const pendingAmount = totalAmount - paidAmount;

  // Update item row totals when items change
  useEffect(() => {
    setItems(prevItems => prevItems.map(item => {
      const itemTotal = item.quantity * item.rate;
      const discountAmount = item.discountType === 'percentage'
        ? (itemTotal * item.discount) / 100
        : item.discount;
      const taxableAmount = itemTotal - discountAmount;
      const taxAmt = (taxableAmount * item.taxRate) / 100;
      return { ...item, rowTotal: taxableAmount + taxAmt };
    }));
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      ...defaultItem,
      id: Date.now().toString(),
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Auto-calculate rate for Sofa category based on size and footPrice
        if (isSofaCategory(updatedItem.category)) {
          // If category, size, or footPrice changed for Sofa
          if (field === 'category' || field === 'size' || field === 'footPrice') {
            const sizeValue = field === 'size' ? value : updatedItem.size;
            const footPriceValue = field === 'footPrice' ? value : (updatedItem.footPrice || 0);

            if (sizeValue && footPriceValue > 0) {
              const calculation = calculateSofaRate(sizeValue, footPriceValue);
              if (calculation.isValid) {
                updatedItem.rate = calculation.rate;
              }
            } else if (!sizeValue || footPriceValue <= 0) {
              updatedItem.rate = 0;
            }
          }
        }

        // If category changed FROM Sofa to something else, reset footPrice
        if (field === 'category' && !isSofaCategory(value)) {
          updatedItem.footPrice = 0;
        }

        // Recalculate row total
        const itemTotal = updatedItem.quantity * updatedItem.rate;
        const discountAmount = updatedItem.discountType === 'percentage'
          ? (itemTotal * updatedItem.discount) / 100
          : updatedItem.discount;
        const taxableAmount = itemTotal - discountAmount;
        const taxAmt = (taxableAmount * updatedItem.taxRate) / 100;
        updatedItem.rowTotal = taxableAmount + taxAmt;
        return updatedItem;
      }
      return item;
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (!customerPhone.trim()) {
      setError("Customer phone is required");
      return false;
    }
    if (!customerAddress.trim()) {
      setError("Customer address is required");
      return false;
    }
    if (!salespersonName.trim()) {
      setError("Salesperson name is required");
      return false;
    }
    if (items.length === 0) {
      setError("At least one item is required");
      return false;
    }
    for (const item of items) {
      if (!item.name.trim()) {
        setError("All items must have a name");
        return false;
      }
      if (item.quantity <= 0) {
        setError("Item quantity must be greater than 0");
        return false;
      }
      if (item.rate < 0) {
        setError("Item rate cannot be negative");
        return false;
      }
      if (item.rate === 0) {
        setError("Item rate must be greater than 0");
        return false;
      }
      // Validate size and footPrice for Sofa category
      if (isSofaCategory(item.category)) {
        if (!item.size || !item.size.trim()) {
          setError("Size is required for Sofa items (e.g., '8ft' or '8 x 6 ft')");
          return false;
        }
        if (!item.footPrice || item.footPrice <= 0) {
          setError("Foot Price (₹/ft) is required for Sofa items");
          return false;
        }
        const calculation = calculateSofaRate(item.size, item.footPrice);
        if (!calculation.isValid) {
          setError(`Invalid size format for Sofa: ${calculation.error}. Use formats like '8ft' or '8 x 6 ft'`);
          return false;
        }
      }
    }
    if (paidAmount < 0) {
      setError("Paid amount cannot be negative");
      return false;
    }
    if (paidAmount > totalAmount && totalAmount > 0) {
      setError("Paid amount cannot exceed total amount");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      // Recalculate row totals before saving and clean up undefined values
      const updatedItems = items.map(item => {
        const itemTotal = item.quantity * item.rate;
        const discountAmount = item.discountType === 'percentage'
          ? (itemTotal * item.discount) / 100
          : item.discount;
        const taxableAmount = itemTotal - discountAmount;
        const taxAmt = (taxableAmount * item.taxRate) / 100;

        // Create clean item object without undefined values
        const cleanItem: any = {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          discountType: item.discountType,
          taxRate: item.taxRate,
          rowTotal: taxableAmount + taxAmt,
        };

        // Only add optional fields if they have values
        if (item.material) cleanItem.material = item.material;
        if (item.size) cleanItem.size = item.size;
        if (item.footPrice && item.footPrice > 0) cleanItem.footPrice = item.footPrice;

        return cleanItem;
      });

      const invoiceData: any = {
        customerName,
        customerPhone,
        customerAddress,
        salespersonName,
        orderType,
        invoiceDate,
        items: updatedItems,
        itemsCount: updatedItems.length,
        subTotal,
        taxAmount,
        discount: totalDiscount,
        transportCharges,
        totalAmount,
        paidAmount,
        pendingAmount: Math.max(0, pendingAmount),
        paymentMode,
        amountInWords: numberToWords(totalAmount),
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyGst,
      };

      // Only add optional fields if they have values (Firebase doesn't accept undefined)
      if (customerEmail) invoiceData.customerEmail = customerEmail;
      if (customerGst) invoiceData.customerGst = customerGst;
      if (deliveryDate) invoiceData.deliveryDate = deliveryDate;
      if (paymentDueDate) invoiceData.paymentDueDate = paymentDueDate;

      console.log('Saving invoice...', invoiceData);

      if (invoice?.id) {
        // Update existing invoice
        await InvoiceService.updateInvoice(invoice.id, invoiceData);
        console.log('Invoice updated successfully');
        setSuccess('Invoice updated successfully!');
      } else {
        // Create new invoice
        const newId = await InvoiceService.createInvoice(invoiceData);
        console.log('Invoice created successfully with ID:', newId);
        setSuccess('Invoice created successfully!');
      }

      // Wait a moment to show success message, then close
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err: any) {
      console.error('Error saving invoice:', err);
      setError(err.message || 'Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#2D2926]">
              {invoice ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <p className="text-gray-600">
              {invoice ? `Editing ${invoice.invoiceNumber}` : 'Fill in the details to generate invoice'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          <span>{saving ? 'Saving...' : 'Save Invoice'}</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details (Read-only) */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Company Details</h3>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium">{companyName}</span></div>
            <div><span className="text-gray-500">Address:</span> <span className="font-medium">{companyAddress}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{companyPhone}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{companyEmail}</span></div>
            <div><span className="text-gray-500">GST:</span> <span className="font-medium">{companyGst}</span></div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Customer Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                value={customerGst}
                onChange={(e) => setCustomerGst(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Meta Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Invoice Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson Name *</label>
            <input
              type="text"
              value={salespersonName}
              onChange={(e) => setSalespersonName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              required
            >
              <option value="Ready">Ready</option>
              <option value="Custom Order">Custom Order</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2D2926]">Product Details</h3>
          <button
            onClick={addItem}
            className="flex items-center space-x-2 px-3 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Product Name *</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Material</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Size</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">₹/ft</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Qty *</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Rate (₹) *</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Discount</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">GST %</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Total (₹)</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Product name"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Sofa">Sofa</option>
                      <option value="Curtain">Curtain</option>
                      <option value="Pillow">Pillow</option>
                      <option value="Accessory">Accessory</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.material || ''}
                      onChange={(e) => updateItem(item.id, 'material', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Material"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div>
                      <input
                        type="text"
                        value={item.size || ''}
                        onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                        className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:border-[#D4AF37] ${isSofaCategory(item.category)
                          ? 'border-[#D4AF37] bg-amber-50'
                          : 'border-gray-300'
                          }`}
                        placeholder={isSofaCategory(item.category) ? "e.g., 8ft or 8x6ft" : "Size"}
                      />
                      {isSofaCategory(item.category) && item.size && item.footPrice && item.footPrice > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Info size={10} className="text-amber-600" />
                          <span className="text-[10px] text-amber-600">
                            {(() => {
                              const calc = calculateSofaRate(item.size, item.footPrice);
                              return calc.isValid
                                ? `${calc.totalFeet} ft × ₹${item.footPrice.toLocaleString()}`
                                : calc.error;
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    {isSofaCategory(item.category) ? (
                      <input
                        type="number"
                        value={item.footPrice || ''}
                        onChange={(e) => updateItem(item.id, 'footPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-[#D4AF37] bg-amber-50 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                        placeholder="₹/ft"
                        min="0"
                        step="1"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none ${isSofaCategory(item.category)
                          ? 'border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed'
                          : 'border-gray-300 focus:border-[#D4AF37]'
                          }`}
                        min="0"
                        step="0.01"
                        disabled={isSofaCategory(item.category)}
                        title={isSofaCategory(item.category)
                          ? 'Rate is auto-calculated for Sofa based on size × ₹/ft'
                          : 'Enter rate'}
                      />
                      {isSofaCategory(item.category) && (
                        <span className="text-[10px] text-gray-500 block mt-1">Auto</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-l text-sm focus:outline-none focus:border-[#D4AF37]"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={item.discountType}
                        onChange={(e) => updateItem(item.id, 'discountType', e.target.value)}
                        className="px-1 py-1 border-l-0 border border-gray-300 rounded-r text-sm focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="percentage">%</option>
                        <option value="amount">₹</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="py-2 px-2 text-sm font-medium">₹{item.rowTotal.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={items.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Calculation & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Payment Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                min="0"
                max={totalAmount}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Charges (₹)</label>
              <input
                type="number"
                value={transportCharges}
                onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                min="0"
                step="0.01"
              />
            </div>
            {/* Payment Status Preview */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Payment Status:</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${paidAmount >= totalAmount ? 'bg-green-100 text-green-800' :
                paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {paidAmount >= totalAmount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Bill Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Discount:</span>
              <span className="font-medium text-red-600">- ₹{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST Amount:</span>
              <span className="font-medium">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {transportCharges > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transport Charges:</span>
                <span className="font-medium">₹{transportCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span className="text-[#D4AF37]">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium text-green-600">₹{paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Balance Due:</span>
              <span className={`font-medium ${pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.max(0, pendingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <hr />
            <div className="bg-[#D4AF37]/10 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Amount in Words:</p>
              <p className="font-medium text-[#2D2926] text-sm">{numberToWords(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
