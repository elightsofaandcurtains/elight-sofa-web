"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Shield, UserCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddUserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: any) => void;
}

export default function AddUserForm({ isOpen, onClose, onSubmit }: AddUserFormProps) {
    const { getAllUsers } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "customer",
        status: "active",
        phone: "",
        address: "",
        permissions: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const roles = [
        { value: "admin", label: "Admin", description: "Full system access" },
        { value: "manager", label: "Manager", description: "Management access" },
        { value: "staff", label: "Staff", description: "Limited access" },
        { value: "customer", label: "Customer", description: "Customer access" },
    ];

    const availablePermissions = [
        "users.read", "users.write", "users.delete",
        "products.read", "products.write", "products.delete",
        "orders.read", "orders.write", "orders.delete",
        "inventory.read", "inventory.write", "inventory.delete",
        "reports.read", "analytics.read",
        "settings.read", "settings.write"
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

        // Check if email already exists
        const existingUsers = getAllUsers();
        if (existingUsers.some(user => user.email === formData.email)) {
            newErrors.email = "An account with this email already exists";
        }

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
        if (!formData.role) newErrors.role = "Role is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const userData = {
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: null,
                orders: 0,
            };

            await onSubmit(userData);

            // Reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "customer",
                status: "active",
                phone: "",
                address: "",
                permissions: [],
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Error adding user:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handlePermissionToggle = (permission: string) => {
        const newPermissions = formData.permissions.includes(permission)
            ? formData.permissions.filter(p => p !== permission)
            : [...formData.permissions, permission];
        handleInputChange("permissions", newPermissions);
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
                            <h2 className="text-2xl font-serif font-bold text-[#2D2926]">Add New User</h2>
                            <p className="text-gray-600">Create a new user account</p>
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
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                <User size={20} />
                                <span>Basic Information</span>
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
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.password ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Enter phone number"
                                />
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
                        </div>

                        {/* Role & Permissions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                <Shield size={20} />
                                <span>Role & Permissions</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => handleInputChange("role", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.role ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    {roles.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label} - {role.description}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
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
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {(formData.role === "admin" || formData.role === "manager" || formData.role === "staff") && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Additional Permissions
                                    </label>
                                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                                        {availablePermissions.map((permission) => (
                                            <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(permission)}
                                                    onChange={() => handlePermissionToggle(permission)}
                                                    className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                                />
                                                <span className="text-sm text-gray-700">{permission}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Select additional permissions for this user. Role-based permissions are automatically included.
                                    </p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Role Summary</h4>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Selected Role:</strong> {roles.find(r => r.value === formData.role)?.label}</p>
                                    <p><strong>Description:</strong> {roles.find(r => r.value === formData.role)?.description}</p>
                                    <p><strong>Additional Permissions:</strong> {formData.permissions.length} selected</p>
                                </div>
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
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <UserCheck size={20} />
                                    <span>Create User</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}