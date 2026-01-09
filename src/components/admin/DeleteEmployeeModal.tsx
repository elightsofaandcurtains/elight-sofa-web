"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, User, Mail, Building, Calendar } from "lucide-react";
import { Employee } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DeleteEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteEmployeeModal({ employee, onClose, onConfirm }: DeleteEmployeeModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onConfirm();
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">Delete Employee</h2>
                <p className="text-sm text-red-600">This action cannot be undone</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to remove this employee from the system?
            </p>

            {/* Employee Preview Card */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border-2 border-[#D4AF37]/30">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#D4AF37]">{employee.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#2D2926]">{employee.name}</h3>
                  <p className="text-gray-600">{employee.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building size={16} className="text-gray-400" />
                  <span className="capitalize">{employee.department}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {formatDate(employee.joinDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="text-gray-400">₹</span>
                  <span>{formatCurrency(employee.salary)}/month</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-2">Warning: Permanent Action</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>Employee record will be permanently removed</li>
                    <li>All associated data and history will be deleted</li>
                    <li>Department statistics will be automatically updated</li>
                    <li>This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>{isDeleting ? "Removing..." : "Remove Employee"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
