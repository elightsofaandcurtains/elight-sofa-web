"use client";

import { motion } from "framer-motion";
import { X, Edit, Mail, Phone, Building2, MapPin, Calendar, Shield, Truck, User as UserIcon, FileText } from "lucide-react";
import { User, Supplier } from "@/types";
import { cn } from "@/lib/utils";

interface ViewUserModalProps {
  user: User;
  supplier?: Supplier;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewUserModal({ user, supplier, onClose, onEdit }: ViewUserModalProps) {
  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      admin: { bg: 'bg-red-100', text: 'text-red-800' },
      employee: { bg: 'bg-blue-100', text: 'text-blue-800' },
      customer: { bg: 'bg-green-100', text: 'text-green-800' },
      supplier: { bg: 'bg-purple-100', text: 'text-purple-800' }
    };
    return badges[role] || badges.customer;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2D2926] to-[#4A4543] p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white text-2xl font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold capitalize", roleBadge.bg, roleBadge.text)}>
                  {user.role}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium capitalize",
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#D4AF37]" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone || '-'}</p>
                </div>
              </div>
              {user.department && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">{user.department}</p>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">{user.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Details */}
          {user.role === 'supplier' && supplier && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                Supplier Details
              </h3>
              <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Company Name</p>
                    <p className="text-sm font-semibold text-gray-900">{supplier.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="text-sm font-medium text-gray-900">{supplier.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Supplier Type</p>
                    <span className={cn(
                      "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                      supplier.supplierType === 'raw' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'
                    )}>
                      {supplier.supplierType === 'raw' ? 'Raw Material' : 'Shop Material'}
                    </span>
                  </div>
                  {supplier.gstNumber && (
                    <div>
                      <p className="text-xs text-gray-500">GST Number</p>
                      <p className="text-sm font-medium text-gray-900">{supplier.gstNumber}</p>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{supplier.address}</p>
                    </div>
                  )}
                  {supplier.paymentTerms && (
                    <div>
                      <p className="text-xs text-gray-500">Payment Terms</p>
                      <p className="text-sm font-medium text-gray-900">{supplier.paymentTerms}</p>
                    </div>
                  )}
                  {supplier.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm font-medium text-gray-900">{supplier.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {user.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                Notes
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{user.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] font-medium flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </button>
        </div>
      </motion.div>
    </div>
  );
}
