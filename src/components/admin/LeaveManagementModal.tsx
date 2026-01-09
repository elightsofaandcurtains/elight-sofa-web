"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, CheckCircle, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { Employee, EmployeeLeave } from "@/types";
import { formatDate, cn } from "@/lib/utils";

interface LeaveManagementModalProps {
  employee: Employee;
  leaves: EmployeeLeave[];
  onClose: () => void;
  onAddLeave: (leave: Omit<EmployeeLeave, 'id'>) => void;
  onUpdateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected') => void;
  onDeleteLeave?: (leaveId: string, isApproved: boolean) => void;
  isAdmin?: boolean;
}

const leaveTypes = [
  { value: 'paid', label: 'Paid Leave', color: 'bg-green-100 text-green-800' },
  { value: 'unpaid', label: 'Unpaid Leave', color: 'bg-red-100 text-red-800' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'casual', label: 'Casual Leave', color: 'bg-blue-100 text-blue-800' },
  { value: 'half_day', label: 'Half Day', color: 'bg-purple-100 text-purple-800' },
];

// Delete Leave Confirmation Modal
function DeleteLeaveModal({ 
  leave, 
  onClose, 
  onConfirm, 
  isDeleting 
}: { 
  leave: EmployeeLeave; 
  onClose: () => void; 
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const isApproved = leave.status === 'approved';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Remove Leave Record</h3>
              <p className="text-sm text-red-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-100 rounded-full transition-colors">
            <X size={20} className="text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-gray-600 mb-4">
            Are you sure you want to remove this leave record?
          </p>

          {/* Leave Details Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Days</p>
                <p className="font-medium">{leave.totalDays} day(s)</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{leave.leaveType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className={cn("font-medium capitalize", 
                  leave.status === 'approved' ? 'text-green-600' : 
                  leave.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                )}>
                  {leave.status}
                </p>
              </div>
            </div>
            {leave.reason && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Reason</p>
                <p className="text-sm">{leave.reason}</p>
              </div>
            )}
          </div>

          {/* Warning for Approved Leave */}
          {isApproved && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Warning: Approved Leave</p>
                  <p className="text-yellow-700">
                    Removing an approved leave will recalculate the employee's leave balance and may affect salary calculations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What will happen */}
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">After removal:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Leave record will be permanently deleted</li>
              <li>Leave summary counters will be updated</li>
              {isApproved && <li>Employee's remaining leaves will be recalculated</li>}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Yes, Remove</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LeaveManagementModal({ 
  employee, 
  leaves, 
  onClose, 
  onAddLeave, 
  onUpdateLeaveStatus,
  onDeleteLeave,
  isAdmin = true // Default to admin for now
}: LeaveManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteLeave, setDeleteLeave] = useState<EmployeeLeave | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    leaveType: 'paid' as EmployeeLeave['leaveType'],
    reason: '',
  });

  const annualLeaves = employee.annualLeaves || 24;
  const employeeLeaves = leaves.filter(l => l.employeeId === employee.id);
  
  // Calculate leave summary - Real-time from Firebase data
  const paidLeavesUsed = employeeLeaves.filter(l => l.status === 'approved' && l.leaveType === 'paid').reduce((sum, l) => sum + l.totalDays, 0);
  const unpaidLeaves = employeeLeaves.filter(l => l.status === 'approved' && l.leaveType === 'unpaid').reduce((sum, l) => sum + l.totalDays, 0);
  const sickLeaves = employeeLeaves.filter(l => l.status === 'approved' && l.leaveType === 'sick').reduce((sum, l) => sum + l.totalDays, 0);
  const casualLeaves = employeeLeaves.filter(l => l.status === 'approved' && l.leaveType === 'casual').reduce((sum, l) => sum + l.totalDays, 0);
  const halfDayLeaves = employeeLeaves.filter(l => l.status === 'approved' && l.leaveType === 'half_day').reduce((sum, l) => sum + l.totalDays, 0);
  const remainingLeaves = annualLeaves - paidLeavesUsed - sickLeaves - casualLeaves;

  const calculateDays = (from: string, to: string) => {
    if (!from || !to) return 0;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalDays = formData.leaveType === 'half_day' ? 0.5 : calculateDays(formData.fromDate, formData.toDate);
    onAddLeave({
      employeeId: employee.id,
      fromDate: formData.fromDate,
      toDate: formData.leaveType === 'half_day' ? formData.fromDate : formData.toDate,
      totalDays,
      leaveType: formData.leaveType,
      status: 'pending',
      reason: formData.reason,
      appliedDate: new Date().toISOString().split('T')[0],
    });
    setFormData({ fromDate: '', toDate: '', leaveType: 'paid', reason: '' });
    setShowAddForm(false);
  };

  const handleDeleteLeave = async () => {
    if (!deleteLeave || !onDeleteLeave) return;
    
    setIsDeleting(true);
    try {
      await onDeleteLeave(deleteLeave.id, deleteLeave.status === 'approved');
      setDeleteLeave(null);
    } catch (error) {
      console.error('Error deleting leave:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if user can delete this leave
  const canDeleteLeave = (leave: EmployeeLeave) => {
    // Admin can delete any leave
    if (isAdmin) return true;
    // Non-admin can only delete pending or rejected leaves
    return leave.status !== 'approved';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    return leaveTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
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
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Leave Management</h2>
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
                <span>Add Leave</span>
              </motion.button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {/* Leave Summary Cards - Real-time from Firebase */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-medium">Annual Leaves</p>
                <p className="text-2xl font-bold text-blue-800">{annualLeaves}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-xs text-green-600 uppercase font-medium">Paid Used</p>
                <p className="text-2xl font-bold text-green-800">{paidLeavesUsed}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-xs text-red-600 uppercase font-medium">Unpaid</p>
                <p className="text-2xl font-bold text-red-800">{unpaidLeaves}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-xs text-orange-600 uppercase font-medium">Remaining</p>
                <p className="text-2xl font-bold text-orange-800">{remainingLeaves}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-xs text-purple-600 uppercase font-medium">Half Days</p>
                <p className="text-2xl font-bold text-purple-800">{halfDayLeaves}</p>
              </div>
            </div>

            {/* Add Leave Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Apply New Leave</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                    <select
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      required
                    >
                      {leaveTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date *</label>
                    <input
                      type="date"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  {formData.leaveType !== 'half_day' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date *</label>
                      <input
                        type="date"
                        value={formData.toDate}
                        onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  )}
                  <div className={formData.leaveType === 'half_day' ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F]">Submit Leave</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Leave Records Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-[#2D2926]">Leave History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From - To</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employeeLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No leave records found</td>
                      </tr>
                    ) : (
                      employeeLeaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium">{formatDate(leave.fromDate)}</div>
                            <div className="text-gray-500">to {formatDate(leave.toDate)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">{leave.totalDays}</td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getLeaveTypeColor(leave.leaveType))}>
                              {leaveTypes.find(t => t.value === leave.leaveType)?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full capitalize", getStatusBadge(leave.status))}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              {/* Approve/Reject buttons for pending leaves */}
                              {leave.status === 'pending' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUpdateLeaveStatus(leave.id, 'approved')}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle size={18} />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUpdateLeaveStatus(leave.id, 'rejected')}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle size={18} />
                                  </motion.button>
                                </>
                              )}
                              
                              {/* Remove Leave button */}
                              {onDeleteLeave && canDeleteLeave(leave) && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setDeleteLeave(leave)}
                                  className={cn(
                                    "p-1.5 rounded transition-colors",
                                    leave.status === 'approved' 
                                      ? "text-orange-600 hover:bg-orange-50" 
                                      : "text-red-600 hover:bg-red-50"
                                  )}
                                  title="Remove Leave"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              )}
                            </div>
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

        {/* Delete Leave Confirmation Modal */}
        {deleteLeave && (
          <DeleteLeaveModal
            leave={deleteLeave}
            onClose={() => setDeleteLeave(null)}
            onConfirm={handleDeleteLeave}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
