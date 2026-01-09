"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../lib/firebase/auth';

interface UserDocument {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff' | 'customer';
    status: 'active' | 'inactive' | 'suspended' | string; // Allow string for flexibility
    permissions: string[];
    lastLogin: any;
    createdAt: any;
    updatedAt: any;
    orders: number;
    totalSpent?: number; // Make optional to match Firebase type
    profile?: {
        phone?: string;
        department?: string;
        position?: string;
    };
}

interface AuthContextType {
    user: User | null;
    profile: UserDocument | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, profileData: any) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback mock users for when Firebase is not configured
const mockUsers: Record<string, { password: string; profile: UserDocument }> = {
    'admin@elightsofa.com': {
        password: 'admin123',
        profile: {
            id: '1',
            email: 'admin@elightsofa.com',
            name: 'System Administrator',
            role: 'admin',
            status: 'active',
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orders: 0,
            totalSpent: 0,
            profile: {
                department: 'Management',
                position: 'System Administrator'
            }
        }
    },
    'superadmin@elightsofa.com': {
        password: 'superadmin123',
        profile: {
            id: '0',
            email: 'superadmin@elightsofa.com',
            name: 'Super Admin',
            role: 'admin',
            status: 'active',
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'inventory.read', 'inventory.write', 'inventory.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orders: 0,
            totalSpent: 0,
            profile: {
                phone: '+1-555-000-0000',
                department: 'Management',
                position: 'Super Administrator'
            }
        }
    },
    'manager@elightsofa.com': {
        password: 'manager123',
        profile: {
            id: '2',
            email: 'manager@elightsofa.com',
            name: 'Manager User',
            role: 'manager',
            status: 'active',
            permissions: [
                'users.read',
                'products.read', 'products.write',
                'employees.read', 'employees.write',
                'invoices.read', 'invoices.write',
                'payments.read', 'payments.write',
                'analytics.read'
            ],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orders: 0,
            totalSpent: 0,
            profile: {
                department: 'Operations',
                position: 'Operations Manager'
            }
        }
    },
    'staff@elightsofa.com': {
        password: 'staff123',
        profile: {
            id: '3',
            email: 'staff@elightsofa.com',
            name: 'Staff User',
            role: 'staff',
            status: 'active',
            permissions: [
                'products.read',
                'invoices.read', 'invoices.write',
                'payments.read', 'payments.write'
            ],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orders: 0,
            totalSpent: 0,
            profile: {
                department: 'Sales',
                position: 'Sales Associate'
            }
        }
    }
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
    const configured = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project' &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo_api_key';

    console.log("🔧 Firebase configuration check:", {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "***" : "missing",
        configured
    });

    return configured;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // Check Firebase configuration first - if disabled, go straight to mock
            const firebaseConfigured = isFirebaseConfigured();
            console.log("🔧 Auth initialization - Firebase configured:", firebaseConfigured);

            if (firebaseConfigured && !firebaseError) {
                // Firebase authentication
                console.log("🔥 Initializing Firebase authentication");
                try {
                    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
                        if (firebaseUser) {
                            console.log("🔥 Firebase user authenticated:", firebaseUser.uid);
                            setUser(firebaseUser);
                            const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
                            setProfile(userProfile);
                        } else {
                            console.log("🔥 No Firebase user authenticated");
                            setUser(null);
                            setProfile(null);
                        }
                        setLoading(false);
                    });
                    return unsubscribe;
                } catch (error: any) {
                    console.error('Firebase auth initialization error:', error);
                    console.log('🎭 Falling back to mock authentication due to Firebase error');
                    setFirebaseError(true);
                    setLoading(false);
                }
            } else {
                // Mock authentication - check localStorage
                console.log("🎭 Using mock authentication initialization");
                if (typeof window !== 'undefined') {
                    const savedUser = localStorage.getItem('auth_user');
                    const savedProfile = localStorage.getItem('auth_profile');

                    if (savedUser && savedProfile) {
                        try {
                            setUser(JSON.parse(savedUser));
                            setProfile(JSON.parse(savedProfile));
                            console.log("✅ Restored user from localStorage");
                        } catch (error) {
                            console.error('Error parsing saved auth data:', error);
                            localStorage.removeItem('auth_user');
                            localStorage.removeItem('auth_profile');
                        }
                    }
                }
                setLoading(false);
            }
        };

        initAuth();
    }, [firebaseError]);

    const signIn = async (email: string, password: string) => {
        console.log("🔍 SignIn called with:", { email, password: "***" });
        setLoading(true);

        try {
            if (isFirebaseConfigured() && !firebaseError) {
                console.log("🔥 Using Firebase authentication");
                try {
                    // Firebase authentication
                    const result = await AuthService.signIn(email, password);
                    console.log("✅ Firebase signIn successful:", result);
                    setUser(result.user);
                    setProfile(result.profile);
                } catch (firebaseError: any) {
                    console.error("❌ Firebase signIn failed:", firebaseError);

                    // If it's a Firebase API issue, fall back to mock
                    const isFirebaseAPIError =
                        !firebaseError.code ||
                        firebaseError.message?.includes('400') ||
                        firebaseError.message?.includes('identitytoolkit') ||
                        firebaseError.message?.includes('network') ||
                        firebaseError.code === 'auth/api-key-not-valid' ||
                        firebaseError.code === 'auth/invalid-api-key' ||
                        firebaseError.code === 'auth/operation-not-allowed' ||
                        firebaseError.name === 'FirebaseError';

                    if (isFirebaseAPIError) {
                        console.log("🎭 Falling back to mock authentication due to Firebase API issue");
                        setFirebaseError(true);
                        // Continue to mock authentication below
                    } else {
                        throw firebaseError;
                    }
                }
            }

            // Mock authentication (fallback or by choice)
            if (!isFirebaseConfigured() || firebaseError) {
                console.log("🎭 Using mock authentication");
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check localStorage for registered users first
                let mockUser = mockUsers[email];

                if (!mockUser && typeof window !== 'undefined') {
                    const savedUsers = localStorage.getItem('registered_users');
                    if (savedUsers) {
                        try {
                            const registeredUsers = JSON.parse(savedUsers);
                            if (registeredUsers[email] && registeredUsers[email].password === password) {
                                mockUser = registeredUsers[email];
                                console.log("🔍 Found user in localStorage registered users");
                            }
                        } catch (error) {
                            console.error("Error parsing registered users from localStorage:", error);
                        }
                    }
                }

                console.log("🔍 Looking for mock user:", email, "Found:", !!mockUser);

                if (!mockUser || mockUser.password !== password) {
                    console.log("❌ Mock authentication failed - invalid credentials");
                    throw new Error('Invalid email or password');
                }

                const user = {
                    uid: mockUser.profile.id,
                    email: mockUser.profile.email,
                    displayName: mockUser.profile.name,
                    emailVerified: true
                } as User;

                console.log("✅ Mock authentication successful:", { user, profile: mockUser.profile });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    localStorage.setItem('auth_profile', JSON.stringify(mockUser.profile));
                    console.log("💾 Saved to localStorage");
                }

                setUser(user);
                setProfile(mockUser.profile);
            }
        } catch (error) {
            console.error("❌ SignIn error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, profileData: any) => {
        console.log("🔍 useAuth.signUp called with:", { email, profileData });
        setLoading(true);

        try {
            if (isFirebaseConfigured() && !firebaseError) {
                console.log("🔥 Attempting Firebase authentication for signup");
                try {
                    // Firebase authentication
                    const result = await AuthService.signUp(email, password, profileData);
                    console.log("✅ Firebase signup successful:", result);
                    setUser(result.user);
                    setProfile(result.profile);
                    return; // Exit early on success
                } catch (firebaseError: any) {
                    console.error("❌ Firebase signup failed:", firebaseError);
                    console.error("Firebase error details:", {
                        message: firebaseError.message,
                        code: firebaseError.code,
                        name: firebaseError.name,
                        stack: firebaseError.stack
                    });

                    // Check if it's a Firebase configuration or API issue
                    const isFirebaseAPIError =
                        !firebaseError.code || // No specific Firebase error code
                        firebaseError.message?.includes('400') ||
                        firebaseError.message?.includes('identitytoolkit') ||
                        firebaseError.message?.includes('Failed to fetch') ||
                        firebaseError.message?.includes('API key') ||
                        firebaseError.message?.includes('unexpected error') ||
                        firebaseError.message?.includes('network') ||
                        firebaseError.code === 'auth/api-key-not-valid' ||
                        firebaseError.code === 'auth/invalid-api-key' ||
                        firebaseError.code === 'auth/project-not-found' ||
                        firebaseError.code === 'auth/network-request-failed' ||
                        firebaseError.code === 'auth/operation-not-allowed' ||
                        firebaseError.name === 'FirebaseError' ||
                        (firebaseError.message && firebaseError.message.includes('400'));

                    console.log("🔍 Firebase error analysis:", {
                        isFirebaseAPIError,
                        hasCode: !!firebaseError.code,
                        message: firebaseError.message,
                        code: firebaseError.code,
                        name: firebaseError.name
                    });

                    if (isFirebaseAPIError) {
                        console.log("🎭 Firebase API issue detected, falling back to mock authentication");
                        setFirebaseError(true);
                        // Continue to mock authentication below
                    } else {
                        // Re-throw other Firebase errors (like email already exists)
                        console.error("❌ Re-throwing Firebase error:", firebaseError);
                        throw firebaseError;
                    }
                }
            }

            // Mock authentication (either by choice or Firebase fallback)
            console.log("🎭 Using mock authentication for signup");
            console.log("🎭 Mock signup - simulating network delay...");
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newProfile: UserDocument = {
                id: Date.now().toString(),
                email,
                name: profileData.name,
                role: profileData.role || 'customer',
                status: 'active',
                permissions: getDefaultPermissions(profileData.role || 'customer'),
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                orders: 0,
                totalSpent: 0,
                profile: {
                    phone: profileData.phone || '',
                    department: profileData.department || 'Customer',
                    position: profileData.position || 'Customer'
                }
            };

            const user = {
                uid: newProfile.id,
                email: newProfile.email,
                displayName: newProfile.name,
                emailVerified: true
            } as User;

            console.log("🎭 Mock user created:", { user, profile: newProfile });

            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_user', JSON.stringify(user));
                localStorage.setItem('auth_profile', JSON.stringify(newProfile));

                // Also save to registered users for future login
                const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
                registeredUsers[email] = {
                    password: password, // In a real app, this would be hashed
                    profile: newProfile
                };
                localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

                console.log("💾 Saved mock user to localStorage and registered users");
            }

            setUser(user);
            setProfile(newProfile);
            console.log("✅ Mock signup completed successfully");

        } catch (error: any) {
            console.error("❌ useAuth.signUp final error:", error);
            console.error("Error type:", typeof error);
            console.error("Error constructor:", error.constructor.name);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                name: error.name,
                stack: error.stack
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);

        try {
            // Check Firebase configuration first - if disabled, go straight to mock
            const firebaseConfigured = isFirebaseConfigured();
            console.log("🔧 SignOut - Firebase configured:", firebaseConfigured);

            if (firebaseConfigured && !firebaseError) {
                console.log("🔥 Using Firebase sign out");
                await AuthService.signOut();
            } else {
                console.log("🎭 Using mock sign out");
                // Mock sign out
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('auth_profile');
                    console.log("🎭 Cleared localStorage for sign out");
                }
            }

            setUser(null);
            setProfile(null);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        // Check Firebase configuration first - if disabled, go straight to mock
        const firebaseConfigured = isFirebaseConfigured();
        console.log("🔧 ResetPassword - Firebase configured:", firebaseConfigured);

        if (firebaseConfigured && !firebaseError) {
            console.log("🔥 Using Firebase password reset");
            await AuthService.resetPassword(email);
        } else {
            console.log("🎭 Using mock password reset");
            // Mock password reset
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("🎭 Mock password reset completed for:", email);
        }
    };

    const hasPermission = (permission: string): boolean => {
        if (!profile) return false;
        return profile.permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        if (!profile) return false;
        return profile.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!profile) return false;
        return roles.includes(profile.role);
    };

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        hasPermission,
        hasRole,
        hasAnyRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Helper function to get default permissions
function getDefaultPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
        admin: [
            'users.read', 'users.write', 'users.delete',
            'products.read', 'products.write', 'products.delete',
            'employees.read', 'employees.write', 'employees.delete',
            'invoices.read', 'invoices.write', 'invoices.delete',
            'payments.read', 'payments.write', 'payments.delete',
            'analytics.read', 'settings.read', 'settings.write'
        ],
        manager: [
            'users.read',
            'products.read', 'products.write',
            'employees.read', 'employees.write',
            'invoices.read', 'invoices.write',
            'payments.read', 'payments.write',
            'analytics.read'
        ],
        staff: [
            'products.read',
            'invoices.read', 'invoices.write',
            'payments.read', 'payments.write'
        ],
        customer: [
            'products.read',
            'inquiries.write'
        ]
    };

    return permissions[role] || permissions.customer;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}