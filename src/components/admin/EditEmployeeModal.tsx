"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Phone, Calendar, DollarSign, Building, Briefcase } from "lucide-react";
import { Employee } from "@/types";

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

const departments: Array<'production' | 'design' | 'sales' | 'management'> = ["production", "design", "sales", "management"];
const positions = [
  "Production Manager", "Lead Designer", "Sales Representative", "Interior Designer",
  "Production Supervisor", "Sales Manager", "Quality Inspector", "Senior Designer",
  "Carpenter", "Designer", "Sales Executive", "Manager", "HR Executive",
  "Accountant", "Quality Controller", "Marketing Executive"
];

export default function EditEmployeeModal({ employee, onClose, onSave }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    position: employee.position,
    department: employee.department,
    salary: employee.salary.toString(),
    joinDate: employee.joinDate,
    status: employee.status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.salary.trim()) newErrors.salary = "Salary is required";
    else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) newErrors.salary = "Salary must be positive";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedEmployee: Employee = {
        ...employee,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department as Employee["department"],
        salary: Number(formData.salary),
        joinDate: formData.joinDate,
        status: formData.status as Employee["status"],
      };
      onSave(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-[#D4AF37]/30 rounded-full flex items-center justify-center border-2 border-white/20">
                <span className="text-2xl font-bold text-white">{employee.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Employee</h2>
                <p className="text-white/70 text-sm">{employee.name} • {employee.position}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <h3 className="font-semibold text-[#2D2926]">Employee Status</h3>
                  <p className="text-sm text-gray-500">Set current employment status</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${formData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {formData.status === 'active' ? 'Active' : 'On Leave'}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4 flex items-center space-x-2 border-b pb-2">
                  <User size={20} className="text-[#D4AF37]" />
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.name ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter email"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4 flex items-center space-x-2 border-b pb-2">
                  <Briefcase size={20} className="text-[#D4AF37]" />
                  <span>Job Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.position ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select position</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.department ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary *</label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.salary ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter salary"
                      />
                    </div>
                    {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => handleInputChange("joinDate", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${errors.joinDate ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
