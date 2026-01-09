"use client";

import { motion } from "framer-motion";
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { User } from "@/types";

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function DeleteUserModal({ user, onClose, onConfirm, isSubmitting }: DeleteUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 flex items-center justify-between border-b border-red-100">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete User
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete the user account
              {user.role === 'supplier' && ' and all associated supplier data'}.
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this user? All associated data will be removed from the system.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete User
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
