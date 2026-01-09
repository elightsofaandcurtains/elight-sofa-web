"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Building2, Truck, MapPin, Loader2 } from "lucide-react";
import { User as UserType, Supplier } from "@/types";
import { FirebaseUser, FirebaseSupplier } from "@/lib/firebase/users";
import { cn } from "@/lib/utils";

interface EditUserModalProps {
  user: UserType;
  supplier?: Supplier;
  onClose: () => void;
  onSave: (userId: string, userData: Partial<FirebaseUser>, supplierData?: Partial<FirebaseSupplier>) => void;
  isSubmitting: boolean;
}

const departments = ['Sales', 'Production', 'Design', 'Management', 'Finance', 'HR', 'Warehouse', 'Customer Service'];
const supplierTypes = [
  { value: 'raw', label: 'Raw Material' },
  { value: 'shop', label: 'Shop Material' }
];

export default function EditUserModal({ user, supplier, onClose, onSave, isSubmitting }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    department: '',
    address: '',
    notes: ''
  });

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

  useEffect(() => {
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      status: user.status || 'active',
      department: user.department || '',
      address: user.address || '',
      notes: user.notes || ''
    });

    if (supplier) {
      setSupplierData({
        supplierName: supplier.supplierName || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        gstNumber: supplier.gstNumber || '',
        supplierType: supplier.supplierType || 'raw',
        paymentTerms: supplier.paymentTerms || '',
        notes: supplier.notes || ''
      });
    }
  }, [user, supplier]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

    if (user.role === 'supplier') {
      if (!supplierData.supplierName.trim()) newErrors.supplierName = 'Supplier name is required';
      if (!supplierData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData: Partial<FirebaseUser> = {
      fullName: formData.fullName,
      phone: formData.phone,
      status: formData.status,
      department: formData.department,
      address: formData.address,
      notes: formData.notes
    };

    if (user.role === 'supplier' && supplier) {
      onSave(user.id, userData, supplierData);
    } else {
      onSave(user.id, userData);
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
            Edit User
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Info Header */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>

          {/* Basic Fields */}
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
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
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
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {(user.role === 'admin' || user.role === 'employee') && (
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

              {user.role === 'customer' && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Supplier Fields */}
            {user.role === 'supplier' && supplier && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mt-6 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Supplier Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={supplierData.supplierName}
                      onChange={(e) => setSupplierData({ ...supplierData, supplierName: e.target.value })}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent",
                        errors.supplierName ? "border-red-500" : "border-gray-300"
                      )}
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
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={supplierData.address}
                      onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={supplierData.paymentTerms}
                      onChange={(e) => setSupplierData({ ...supplierData, paymentTerms: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={supplierData.notes}
                      onChange={(e) => setSupplierData({ ...supplierData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
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
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
