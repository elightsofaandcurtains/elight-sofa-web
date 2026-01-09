"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, DollarSign, TrendingUp, FileText } from "lucide-react";
import { Employee, EmployeeCommission } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface CommissionManagementModalProps {
  employee: Employee;
  commissions: EmployeeCommission[];
  onClose: () => void;
  onAddCommission: (commission: Omit<EmployeeCommission, 'id'>) => void;
}

const commissionSources = [
  { value: 'sofa_sales', label: 'Sofa Sales' },
  { value: 'curtain_sales', label: 'Curtain Sales' },
  { value: 'custom_orders', label: 'Custom Orders' },
  { value: 'other', label: 'Other' },
];

export default function CommissionManagementModal({ employee, commissions, onClose, onAddCommission }: CommissionManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    saleAmount: '',
    commissionType: 'percentage' as 'fixed' | 'percentage',
    commissionValue: '',
    commissionSource: 'sofa_sales' as EmployeeCommission['commissionSource'],
    commissionDate: new Date().toISOString().split('T')[0],
  });

  const employeeCommissions = commissions.filter(c => c.employeeId === employee.id);
  
  // Calculate totals
  const totalCommission = employeeCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
  const pendingCommission = employeeCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
  const thisMonthCommission = employeeCommissions.filter(c => {
    const commDate = new Date(c.commissionDate);
    const now = new Date();
    return commDate.getMonth() === now.getMonth() && commDate.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + c.commissionAmount, 0);

  const calculateCommission = () => {
    const saleAmount = parseFloat(formData.saleAmount) || 0;
    const value = parseFloat(formData.commissionValue) || 0;
    if (formData.commissionType === 'percentage') {
      return (saleAmount * value) / 100;
    }
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commissionAmount = calculateCommission();
    onAddCommission({
      employeeId: employee.id,
      invoiceNumber: formData.invoiceNumber,
      saleAmount: parseFloat(formData.saleAmount),
      commissionType: formData.commissionType,
      commissionValue: parseFloat(formData.commissionValue),
      commissionAmount,
      commissionSource: formData.commissionSource,
      commissionDate: formData.commissionDate,
      status: 'pending',
    });
    setFormData({
      invoiceNumber: '',
      saleAmount: '',
      commissionType: 'percentage',
      commissionValue: '',
      commissionSource: 'sofa_sales',
      commissionDate: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      sofa_sales: 'bg-blue-100 text-blue-800',
      curtain_sales: 'bg-purple-100 text-purple-800',
      custom_orders: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Commission Management</h2>
                <p className="text-white/70">{employee.name} • {employee.position}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Commission</span>
              </motion.button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {/* Commission Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium">Total Earned</p>
                    <p className="text-2xl font-bold text-green-800">{formatCurrency(totalCommission)}</p>
                  </div>
                  <DollarSign className="text-green-500" size={32} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 uppercase font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">{formatCurrency(pendingCommission)}</p>
                  </div>
                  <DollarSign className="text-yellow-500" size={32} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 uppercase font-medium">This Month</p>
                    <p className="text-2xl font-bold text-blue-800">{formatCurrency(thisMonthCommission)}</p>
                  </div>
                  <TrendingUp className="text-blue-500" size={32} />
                </div>
              </div>
            </div>

            {/* Add Commission Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Add New Commission</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number *</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      placeholder="INV-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Amount *</label>
                    <input
                      type="number"
                      value={formData.saleAmount}
                      onChange={(e) => setFormData({ ...formData, saleAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Source *</label>
                    <select
                      value={formData.commissionSource}
                      onChange={(e) => setFormData({ ...formData, commissionSource: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      required
                    >
                      {commissionSources.map(source => (
                        <option key={source.value} value={source.value}>{source.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type *</label>
                    <select
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="percentage">Percentage of Sale</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.commissionType === 'percentage' ? 'Commission %' : 'Fixed Amount'} *
                    </label>
                    <input
                      type="number"
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      placeholder={formData.commissionType === 'percentage' ? '5' : '1000'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.commissionDate}
                      onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  {formData.saleAmount && formData.commissionValue && (
                    <div className="md:col-span-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        Calculated Commission: <span className="font-bold text-lg">{formatCurrency(calculateCommission())}</span>
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-3 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F]">Add Commission</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Commission Records Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-[#2D2926]">Commission History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employeeCommissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No commission records found</td>
                      </tr>
                    ) : (
                      employeeCommissions.map((comm) => (
                        <tr key={comm.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{comm.invoiceNumber}</td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(comm.saleAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getSourceColor(comm.commissionSource))}>
                              {commissionSources.find(s => s.value === comm.commissionSource)?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {comm.commissionType === 'percentage' ? `${comm.commissionValue}%` : 'Fixed'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(comm.commissionAmount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(comm.commissionDate)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", comm.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                              {comm.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
