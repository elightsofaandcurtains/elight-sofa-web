"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldX, Users, Crown, Settings } from "lucide-react";
import { UsersService } from "@/lib/firebase/users";
import { UserDocument } from "@/types/firebase";

interface RoleManagementProps {
    user: UserDocument;
    onRoleUpdate: (userId: string, newRole: string) => void;
    disabled?: boolean;
}

const roleConfig = {
    admin: {
        icon: Crown,
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
        description: "Full system access and user management",
        permissions: ["All permissions", "User management", "System settings"]
    },
    manager: {
        icon: Shield,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
        description: "Manage products, employees, and operations",
        permissions: ["Product management", "Employee management", "Analytics access"]
    },
    staff: {
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        description: "Handle daily operations and customer service",
        permissions: ["Product access", "Invoice management", "Payment processing"]
    },
    customer: {
        icon: Users,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
        description: "Browse products and submit inquiries",
        permissions: ["Product browsing", "Inquiry submission"]
    }
};

export default function RoleManagement({ user, onRoleUpdate, disabled = false }: RoleManagementProps) {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleRoleChange = (newRole: string) => {
        if (newRole === user.role) return;
        setSelectedRole(newRole);
        setShowConfirmation(true);
    };

    const confirmRoleChange = async () => {
        setIsUpdating(true);
        try {
            await UsersService.updateUser(user.id, { role: selectedRole as any });
            onRoleUpdate(user.id, selectedRole);
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error updating role:', error);
            setSelectedRole(user.role); // Reset on error
        } finally {
            setIsUpdating(false);
        }
    };

    const cancelRoleChange = () => {
        setSelectedRole(user.role);
        setShowConfirmation(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedRole === role;
                    const isCurrent = user.role === role;

                    return (
                        <motion.div
                            key={role}
                            whileHover={!disabled ? { scale: 1.02 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                            className={`
                                relative p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${isSelected
                                    ? `${config.borderColor} ${config.bgColor}`
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => !disabled && handleRoleChange(role)}
                        >
                            {isCurrent && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Current
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 capitalize">{role}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Permissions:</p>
                                        <ul className="text-xs text-gray-600 space-y-0.5">
                                            {config.permissions.map((permission, index) => (
                                                <li key={index} className="flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    {permission}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Role Change
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to change <strong>{user.name}</strong>'s role from{" "}
                                <span className="capitalize font-medium">{user.role}</span> to{" "}
                                <span className="capitalize font-medium">{selectedRole}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelRoleChange}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRoleChange}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        "Confirm"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}