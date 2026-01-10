"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Building2, Shield, Truck, FileText, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddUserModalProps {
  onClose: () => void;
  onSave: (userData: any, supplierData?: any, adminPassword?: string) => void;
  isSubmitting: boolean;
}

const roles = [
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600' },
  { value: 'employee', label: 'Employee', icon: User, color: 'text-blue-600' },
  { value: 'customer', label: 'Customer', icon: User, color: 'text-green-600' },
  { value: 'supplier', label: 'Supplier', icon: Truck, color: 'text-purple-600' }
];

const departments = ['Sales', 'Production', 'Design', 'Management', 'Finance', 'HR', 'Warehouse', 'Customer Service'];
const supplierTypes = [
  { value: 'raw', label: 'Raw Material' },
  { value: 'shop', label: 'Shop Material' }
];

export default function AddUserModal({ onClose, onSave, isSubmitting }: AddUserModalProps) {
  // Common fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as 'admin' | 'employee' | 'customer' | 'supplier',
    status: 'active' as 'active' | 'inactive',
    department: '',
    address: '',
    notes: ''
  });

  // Admin password for re-authentication after creating user
  const [adminPassword, setAdminPassword] = useState('');

  // Supplier-specific fields
  const [supplierData, setSupplierData] = useState({
    supplierName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    supplierType: 'raw' as 'raw' | 'shop',
    paymentTerms: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!adminPassword || adminPassword.length < 6) newErrors.adminPassword = 'Enter your admin password to stay logged in';

    // Supplier validation
    if (formData.role === 'supplier') {
      if (!supplierData.supplierName.trim()) newErrors.supplierName = 'Supplier name is required';
      if (!supplierData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formData.role === 'supplier') {
      onSave(formData, {
        ...supplierData,
        phone: supplierData.phone || formData.phone,
        email: supplierData.email || formData.email
      }, adminPassword);
    } else {
      onSave(formData, undefined, adminPassword);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D2926] to-[#4A4543] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New User
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-4 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value as any })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      formData.role === role.value
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", role.color)} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                      errors.email ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                      errors.phone ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                    errors.password ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="Min 6 characters"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Admin Password *</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                    errors.adminPassword ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="Enter your password to stay logged in"
                />
                {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                <p className="text-xs text-gray-500 mt-1">Required to keep you logged in after creating user</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Department for Admin/Employee */}
              {(formData.role === 'admin' || formData.role === 'employee') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Fields */}
            {formData.role === 'customer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </>
            )}

            {/* Supplier Fields */}
            {formData.role === 'supplier' && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mt-6 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Supplier Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name (Company) *</label>
                    <input
                      type="text"
                      value={supplierData.supplierName}
                      onChange={(e) => setSupplierData({ ...supplierData, supplierName: e.target.value })}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                        errors.supplierName ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Company name"
                    />
                    {errors.supplierName && <p className="text-red-500 text-xs mt-1">{errors.supplierName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      value={supplierData.contactPerson}
                      onChange={(e) => setSupplierData({ ...supplierData, contactPerson: e.target.value })}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                        errors.contactPerson ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Contact person name"
                    />
                    {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Type</label>
                    <select
                      value={supplierData.supplierType}
                      onChange={(e) => setSupplierData({ ...supplierData, supplierType: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      {supplierTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={supplierData.gstNumber}
                      onChange={(e) => setSupplierData({ ...supplierData, gstNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="GST number (optional)"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={supplierData.address}
                      onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Supplier address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={supplierData.paymentTerms}
                      onChange={(e) => setSupplierData({ ...supplierData, paymentTerms: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="e.g., Net 30, COD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={supplierData.notes}
                      onChange={(e) => setSupplierData({ ...supplierData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
