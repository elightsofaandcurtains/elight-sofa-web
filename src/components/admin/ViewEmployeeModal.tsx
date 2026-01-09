"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Mail, Phone, Calendar, Building, DollarSign, Clock, User, Briefcase, MapPin, Star } from "lucide-react";
import { Employee } from "@/types";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";

interface ViewEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewEmployeeModal({ employee, onClose, onEdit }: ViewEmployeeModalProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "on_leave": return "On Leave";
      case "inactive": return "Inactive";
      default: return status;
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      production: "bg-blue-100 text-blue-800",
      design: "bg-purple-100 text-purple-800",
      sales: "bg-green-100 text-green-800",
      management: "bg-orange-100 text-orange-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  // Calculate years of service
  const joinDate = new Date(employee.joinDate);
  const today = new Date();
  const yearsOfService = Math.floor((today.getTime() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const monthsOfService = Math.floor(((today.getTime() - joinDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header with Profile */}
          <div className="relative bg-gradient-to-r from-[#2D2926] to-[#4A4543] p-6 pb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-5">
                {/* Employee Avatar */}
                <div className="w-24 h-24 bg-[#D4AF37]/30 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{employee.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                  <p className="text-white/80 text-lg">{employee.position}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <span className={cn("px-3 py-1 text-xs font-semibold rounded-full", getDepartmentColor(employee.department))}>
                      {employee.department.charAt(0).toUpperCase() + employee.department.slice(1)}
                    </span>
                    <span className={cn("px-3 py-1 text-xs font-semibold rounded-full", getStatusColor(employee.status))}>
                      {getStatusLabel(employee.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onEdit}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span>Edit</span>
                </motion.button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <Briefcase className="mx-auto text-blue-600 mb-2" size={24} />
                <p className="text-xl font-bold text-blue-800">#{employee.id}</p>
                <p className="text-xs text-blue-600">Employee ID</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                <Clock className="mx-auto text-green-600 mb-2" size={24} />
                <p className="text-xl font-bold text-green-800">{yearsOfService}y {monthsOfService}m</p>
                <p className="text-xs text-green-600">Service Duration</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                <DollarSign className="mx-auto text-purple-600 mb-2" size={24} />
                <p className="text-lg font-bold text-purple-800">{formatCurrency(employee.salary)}</p>
                <p className="text-xs text-purple-600">Monthly Salary</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                <Building className="mx-auto text-orange-600 mb-2" size={24} />
                <p className="text-lg font-bold text-orange-800 capitalize">{employee.department}</p>
                <p className="text-xs text-orange-600">Department</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#2D2926] mb-4 flex items-center space-x-2 border-b pb-2">
                <User size={20} className="text-[#D4AF37]" />
                <span>Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                    <p className="font-medium text-[#2D2926]">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                    <p className="font-medium text-[#2D2926]">{employee.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#2D2926] mb-4 flex items-center space-x-2 border-b pb-2">
                <Building size={20} className="text-[#D4AF37]" />
                <span>Employment Details</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Position</p>
                  <p className="font-semibold text-[#2D2926] mt-1">{employee.position}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                  <p className="font-semibold text-[#2D2926] mt-1 capitalize">{employee.department}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Join Date</p>
                  <p className="font-semibold text-[#2D2926] mt-1">{formatDate(employee.joinDate)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="font-semibold text-[#2D2926] mt-1">{getStatusLabel(employee.status)}</p>
                </div>
              </div>
            </div>

            {/* Salary & Compensation */}
            <div className="p-5 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
              <h3 className="text-lg font-semibold text-[#2D2926] mb-4 flex items-center space-x-2">
                <DollarSign size={20} className="text-[#D4AF37]" />
                <span>Compensation Details</span>
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Monthly Salary</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(employee.salary)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Salary</p>
                  <p className="text-2xl font-bold text-[#2D2926]">{formatCurrency(employee.salary * 12)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Rate</p>
                  <p className="text-2xl font-bold text-gray-600">{formatCurrency(Math.round(employee.salary / 30))}</p>
                </div>
              </div>
            </div>

            {/* Footer with timestamps */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>Employee ID: #{employee.id}</span>
              <div className="flex space-x-4">
                <span>Created: {formatDate(employee.joinDate)}</span>
                <span>Last Updated: {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
