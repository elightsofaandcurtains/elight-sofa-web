"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AuthTestPage() {
    const { user, profile, loading, signIn, signOut } = useAuth();
    const [testEmail, setTestEmail] = useState("");
    const [testPassword, setTestPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTestLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            await signIn(testEmail, testPassword);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error: any) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg p-8"
                >
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test</h1>

                    {user && profile ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Logged In Successfully!</h2>
                                <div className="space-y-2 text-sm text-green-800">
                                    <p><strong>Name:</strong> {profile.name}</p>
                                    <p><strong>Email:</strong> {profile.email}</p>
                                    <p><strong>Role:</strong> {profile.role}</p>
                                    <p><strong>Status:</strong> {profile.status}</p>
                                    <p><strong>User ID:</strong> {user.uid}</p>
                                    <p><strong>Permissions:</strong> {profile.permissions.join(', ')}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Login</h2>
                                <p className="text-sm text-blue-800 mb-4">Enter your credentials to test authentication:</p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={testPassword}
                                            onChange={(e) => setTestPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleTestLogin}
                                disabled={isLoading}
                                className="w-full bg-[#D4AF37] text-white py-2 px-4 rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Test Sign In'}
                            </button>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Need an Account?</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>• Register a new account to get started</p>
                                    <p>• Contact admin for role assignments</p>
                                    <p>• Use valid email and strong password</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}