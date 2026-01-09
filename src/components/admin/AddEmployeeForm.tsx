"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Calendar, DollarSign, Building, UserCheck } from "lucide-react";

interface AddEmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (employeeData: any) => void;
}

export default function AddEmployeeForm({ isOpen, onClose, onSubmit }: AddEmployeeFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        salary: "",
        joinDate: "",
        status: "active",
        emergencyContact: "",
        address: "",
        employeeId: "",
        skills: "",
        experience: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const departments = ["production", "design", "sales", "management", "hr", "finance"];
    const positions = [
        "Carpenter", "Designer", "Sales Executive", "Manager", "HR Executive",
        "Accountant", "Production Supervisor", "Quality Controller", "Marketing Executive"
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Phone must be 10 digits";
        if (!formData.position.trim()) newErrors.position = "Position is required";
        if (!formData.department) newErrors.department = "Department is required";
        if (!formData.salary.trim()) newErrors.salary = "Salary is required";
        else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) newErrors.salary = "Salary must be a positive number";
        if (!formData.joinDate) newErrors.joinDate = "Join date is required";
        if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const employeeData = {
                ...formData,
                salary: Number(formData.salary),
                skills: formData.skills.split(",").map(skill => skill.trim()).filter(Boolean),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await onSubmit(employeeData);

            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                position: "",
                department: "",
                salary: "",
                joinDate: "",
                status: "active",
                emergencyContact: "",
                address: "",
                employeeId: "",
                skills: "",
                experience: "",
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Error adding employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
                            <User className="text-[#D4AF37]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#2D2926]">Add New Employee</h2>
                            <p className="text-gray-600">Fill in the employee details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                <User size={20} />
                                <span>Personal Information</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.name ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter full name"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.email ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.phone ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Enter address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Emergency Contact
                                </label>
                                <input
                                    type="tel"
                                    value={formData.emergencyContact}
                                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Emergency contact number"
                                />
                            </div>
                        </div>

                        {/* Job Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                <Building size={20} />
                                <span>Job Information</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.employeeId}
                                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.employeeId ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter employee ID"
                                />
                                {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Position *
                                </label>
                                <select
                                    value={formData.position}
                                    onChange={(e) => handleInputChange("position", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.position ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select position</option>
                                    {positions.map((position) => (
                                        <option key={position} value={position}>
                                            {position}
                                        </option>
                                    ))}
                                </select>
                                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department *
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => handleInputChange("department", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.department ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Salary *
                                </label>
                                <div className="relative">
                                    <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => handleInputChange("salary", e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.salary ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter monthly salary"
                                    />
                                </div>
                                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Join Date *
                                </label>
                                <div className="relative">
                                    <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.joinDate}
                                        onChange={(e) => handleInputChange("joinDate", e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.joinDate ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                </div>
                                {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange("status", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                >
                                    <option value="active">Active</option>
                                    <option value="on_leave">On Leave</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => handleInputChange("skills", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="e.g., Carpentry, Design, Leadership"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Experience (years)
                                </label>
                                <input
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange("experience", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Years of experience"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <UserCheck size={20} />
                                    <span>Add Employee</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}