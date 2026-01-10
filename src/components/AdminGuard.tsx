"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requiredPermissions?: string[];
}

export default function AdminGuard({
    children,
    requiredRoles = ["admin"],
    requiredPermissions = []
}: AdminGuardProps) {
    const { user, profile, loading, hasRole, hasAnyRole, hasPermission } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Check if user is authenticated - also check localStorage as backup
        let currentUser = user;
        let currentProfile = profile;

        if (!currentUser && typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('auth_user');
            const storedProfile = localStorage.getItem('auth_profile');
            if (storedUser && storedProfile) {
                try {
                    currentUser = JSON.parse(storedUser);
                    currentProfile = JSON.parse(storedProfile);
                    console.log("🔒 AdminGuard: Using localStorage user as backup");
                } catch (e) {
                    console.error('Error parsing stored auth in AdminGuard:', e);
                }
            }
        }

        if (!currentUser) {
            router.push("/auth/login?redirect=/admin");
            return;
        }

        // Check if user has required roles
        const userRole = currentProfile?.role;
        const hasRequiredRole = requiredRoles.length === 0 || (userRole && requiredRoles.includes(userRole));

        // Check if user has required permissions
        const userPermissions = currentProfile?.permissions || [];
        const hasRequiredPermissions = requiredPermissions.length === 0 ||
            requiredPermissions.every(permission => userPermissions.includes(permission));

        if (hasRequiredRole && hasRequiredPermissions) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }

        setAuthChecked(true);
    }, [user, profile, loading, requiredRoles, requiredPermissions, router]);

    // Show loading spinner while checking authentication
    if (loading || !authChecked) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-lg p-8 text-center"
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying access permissions...</p>
                </motion.div>
            </div>
        );
    }

    // Show unauthorized message if user doesn't have required permissions
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full"
                >
                    <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>

                    <h1 className="text-2xl font-serif font-bold text-[#2D2926] mb-4">
                        Access Denied
                    </h1>

                    <p className="text-gray-600 mb-6">
                        You don't have the required permissions to access the admin panel.
                        Please contact your administrator if you believe this is an error.
                    </p>

                    <div className="space-y-3">
                        <div className="text-sm text-gray-500">
                            <p><strong>Required Role:</strong> {requiredRoles.join(", ")}</p>
                            {requiredPermissions.length > 0 && (
                                <p><strong>Required Permissions:</strong> {requiredPermissions.join(", ")}</p>
                            )}
                            <p><strong>Your Role:</strong> {profile?.role || "None"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/")}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Go to Home</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/contact")}
                            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Shield size={20} />
                            <span>Contact Admin</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Render children if user is authorized
    return <>{children}</>;
}