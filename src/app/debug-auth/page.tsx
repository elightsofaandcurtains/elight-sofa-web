"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DebugAuthPage() {
    const { user, profile, loading, signIn } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [testResult, setTestResult] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check Firebase configuration
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const isFirebaseConfigured = firebaseConfig.projectId &&
            firebaseConfig.projectId !== 'demo-project' &&
            firebaseConfig.apiKey &&
            firebaseConfig.apiKey !== 'demo_api_key';

        setDebugInfo({
            firebaseConfig,
            isFirebaseConfigured,
            currentUser: user,
            currentProfile: profile,
            loading,
            localStorage: typeof window !== 'undefined' ? {
                auth_user: localStorage.getItem('auth_user'),
                auth_profile: localStorage.getItem('auth_profile')
            } : null
        });
    }, [user, profile, loading]);

    const testLogin = async () => {
        setIsLoading(true);
        setTestResult("");

        try {
            console.log("🔍 Starting login test...");
            await signIn("admin@elightsofa.com", "admin123");
            setTestResult("✅ Login successful!");
            console.log("✅ Login successful!");
        } catch (error: any) {
            console.error("❌ Login failed:", error);
            setTestResult(`❌ Login failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const clearStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_profile');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>

                {/* Current Auth State */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">User Status</h3>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                                <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
                                <p><strong>User:</strong> {user ? "Logged in" : "Not logged in"}</p>
                                <p><strong>Profile:</strong> {profile ? "Loaded" : "Not loaded"}</p>
                            </div>
                        </div>

                        {profile && (
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Profile Info</h3>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                    <p><strong>Name:</strong> {profile.name}</p>
                                    <p><strong>Email:</strong> {profile.email}</p>
                                    <p><strong>Role:</strong> {profile.role}</p>
                                    <p><strong>Status:</strong> {profile.status}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Firebase Configuration */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
                    <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Test Login */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Login</h2>
                    <div className="space-y-4">
                        <button
                            onClick={testLogin}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? "Testing..." : "Test Login (admin@elightsofa.com)"}
                        </button>

                        <button
                            onClick={clearStorage}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
                        >
                            Clear Storage & Reload
                        </button>

                        {testResult && (
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm">{testResult}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Console Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-800">Debug Instructions</h2>
                    <div className="text-sm text-yellow-700 space-y-2">
                        <p>1. Open your browser's Developer Tools (F12)</p>
                        <p>2. Go to the Console tab</p>
                        <p>3. Click "Test Login" above and watch the console for detailed logs</p>
                        <p>4. Check the Network tab for any failed requests</p>
                        <p>5. Look for any error messages in red</p>
                    </div>
                </div>
            </div>
        </div>
    );
}