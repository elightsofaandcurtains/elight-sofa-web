"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Users, Settings, Eye, Lock, UserPlus, LogIn } from "lucide-react";

export default function AuthDemoPage() {
    const demoCredentials = [
        {
            role: "Admin",
            email: "admin@elightsofa.com",
            password: "admin123",
            permissions: ["Full system access", "User management", "All features"],
            color: "bg-red-100 text-red-800 border-red-200"
        },
        {
            role: "Manager",
            email: "manager@elightsofa.com",
            password: "manager123",
            permissions: ["Product management", "Employee management", "Analytics"],
            color: "bg-blue-100 text-blue-800 border-blue-200"
        },
        {
            role: "Staff",
            email: "staff@elightsofa.com",
            password: "staff123",
            permissions: ["Product access", "Invoice management", "Payment processing"],
            color: "bg-green-100 text-green-800 border-green-200"
        }
    ];

    const features = [
        {
            icon: UserPlus,
            title: "User Registration",
            description: "Complete registration system with role assignment and profile management"
        },
        {
            icon: LogIn,
            title: "Secure Login",
            description: "Firebase authentication with role-based access control"
        },
        {
            icon: Shield,
            title: "Role Management",
            description: "Admin panel for managing user roles and permissions"
        },
        {
            icon: Users,
            title: "User Management",
            description: "Comprehensive user administration with search and filtering"
        },
        {
            icon: Settings,
            title: "Admin Panel",
            description: "Protected admin interface with role-based navigation"
        },
        {
            icon: Eye,
            title: "Permission System",
            description: "Granular permissions for different user roles and actions"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#E8E6E3] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Authentication System Demo
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Complete user authentication and role management system with registration, login,
                        and admin panel for managing user roles and permissions.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Demo Credentials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Demo Credentials
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {demoCredentials.map((cred, index) => (
                            <motion.div
                                key={cred.role}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className={`border-2 rounded-lg p-4 ${cred.color}`}
                            >
                                <h3 className="font-bold text-lg mb-2">{cred.role}</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Email:</span>
                                        <br />
                                        <code className="bg-white/50 px-2 py-1 rounded text-xs">
                                            {cred.email}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="font-medium">Password:</span>
                                        <br />
                                        <code className="bg-white/50 px-2 py-1 rounded text-xs">
                                            {cred.password}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="font-medium">Permissions:</span>
                                        <ul className="mt-1 space-y-1">
                                            {cred.permissions.map((perm, i) => (
                                                <li key={i} className="flex items-center gap-1 text-xs">
                                                    <div className="w-1 h-1 bg-current rounded-full"></div>
                                                    {perm}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/auth/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors shadow-lg flex items-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Try Login
                        </motion.button>
                    </Link>
                    <Link href="/auth/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border-2 border-[#D4AF37] text-[#D4AF37] font-medium rounded-lg hover:bg-[#D4AF37] hover:text-white transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Register New User
                        </motion.button>
                    </Link>
                    <Link href="/admin">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Settings className="w-5 h-5" />
                            Admin Panel
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6"
                >
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test</h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>Use the demo credentials above to login with different roles</li>
                        <li>Register a new user to see the registration process</li>
                        <li>Access the admin panel to manage users and roles (admin/manager only)</li>
                        <li>Try changing user roles from the admin panel</li>
                        <li>Notice how different roles have different permissions and access levels</li>
                    </ol>
                </motion.div>
            </div>
        </div>
    );
}