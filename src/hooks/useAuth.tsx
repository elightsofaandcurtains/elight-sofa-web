"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '@/lib/firebase/auth';

interface UserDocument {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff' | 'customer';
    status: 'active' | 'inactive' | 'suspended';
    permissions: string[];
    lastLogin: any;
    createdAt: any;
    updatedAt: any;
    orders: number;
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
    getAllUsers: () => UserDocument[];
    updateUserRole: (userId: string, role: string) => Promise<void>;
    updateUserStatus: (userId: string, status: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin user (always available)
const defaultAdmin = {
    'admin@elightsofa.com': {
        password: 'admin123',
        profile: {
            id: 'admin-1',
            email: 'admin@elightsofa.com',
            name: 'System Administrator',
            role: 'admin' as const,
            status: 'active' as const,
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
            orders: 0
        }
    }
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project' &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo_api_key';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [useFirebase] = useState(isFirebaseConfigured());
    const [dynamicUsers, setDynamicUsers] = useState<Record<string, { password: string; profile: UserDocument }>>({});

    // Load dynamic users from localStorage
    const loadDynamicUsers = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dynamic_users');
            if (stored) {
                setDynamicUsers(JSON.parse(stored));
            }
        }
    };

    // Save dynamic users to localStorage
    const saveDynamicUsers = (users: Record<string, { password: string; profile: UserDocument }>) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('dynamic_users', JSON.stringify(users));
        }
        setDynamicUsers(users);
    };

    // Get all users (default admin + dynamic users)
    const getAllUsers = () => {
        return { ...defaultAdmin, ...dynamicUsers };
    };

    useEffect(() => {
        let isMounted = true;

        // First, immediately restore from localStorage to prevent logout flash
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('auth_user');
            const storedProfile = localStorage.getItem('auth_profile');

            if (storedUser && storedProfile) {
                try {
                    const mockUser = JSON.parse(storedUser);
                    setUser(mockUser as User);
                    setProfile(JSON.parse(storedProfile));
                    setLoading(false); // Set loading false immediately if we have localStorage data
                    console.log("✅ Immediately restored user from localStorage");
                } catch (error) {
                    console.error('Error parsing stored auth:', error);
                }
            }
        }

        if (useFirebase) {
            // Use Firebase authentication
            const unsubscribe = AuthService.onAuthStateChange((firebaseUser, firebaseProfile) => {
                if (!isMounted) return;

                console.log("🔥 Firebase auth state changed:", {
                    hasUser: !!firebaseUser,
                    hasProfile: !!firebaseProfile,
                });

                if (firebaseUser && firebaseProfile) {
                    setUser(firebaseUser);
                    setProfile(firebaseProfile);
                    // Save to localStorage for persistence
                    if (typeof window !== 'undefined') {
                        // Only save serializable user data
                        const serializableUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                        };
                        localStorage.setItem('auth_user', JSON.stringify(serializableUser));
                        localStorage.setItem('auth_profile', JSON.stringify(firebaseProfile));
                        console.log("✅ Saved user to localStorage from auth state change");
                    }
                    setLoading(false);
                } else {
                    // Firebase returned null - check if we should keep localStorage user
                    if (typeof window !== 'undefined') {
                        const storedUser = localStorage.getItem('auth_user');
                        const storedProfile = localStorage.getItem('auth_profile');

                        if (storedUser && storedProfile) {
                            // Keep the localStorage user - don't logout
                            // This handles the brief null state during login/navigation
                            console.log("⚠️ Firebase returned null but localStorage has user - keeping session");
                            // Don't change user/profile state - keep what we have
                            setLoading(false);
                        } else {
                            // No localStorage data - user is actually logged out
                            console.log("🚪 No localStorage data - user is logged out");
                            setUser(null);
                            setProfile(null);
                            setLoading(false);
                        }
                    } else {
                        setUser(null);
                        setProfile(null);
                        setLoading(false);
                    }
                }
            });

            return () => {
                isMounted = false;
                unsubscribe();
            };
        } else {
            // Load dynamic users
            loadDynamicUsers();
            setLoading(false);
        }
    }, [useFirebase]);

    const signIn = async (email: string, password: string) => {
        setLoading(true);

        try {
            if (useFirebase) {
                // Use Firebase authentication
                const result = await AuthService.signIn(email, password);
                setUser(result.user);
                setProfile(result.profile);

                // Save serializable user data to localStorage
                if (typeof window !== 'undefined') {
                    const serializableUser = {
                        uid: result.user.uid,
                        email: result.user.email,
                        displayName: result.user.displayName,
                        photoURL: result.user.photoURL,
                    };
                    localStorage.setItem('auth_user', JSON.stringify(serializableUser));
                    localStorage.setItem('auth_profile', JSON.stringify(result.profile));
                    console.log("✅ Saved user to localStorage after signIn");
                }
            } else {
                // Use mock authentication
                await new Promise(resolve => setTimeout(resolve, 1000));

                const allUsers = getAllUsers();
                const foundUser = allUsers[email];
                if (!foundUser || foundUser.password !== password) {
                    throw new Error('Invalid email or password');
                }

                const user = {
                    uid: foundUser.profile.id,
                    email: foundUser.profile.email,
                    displayName: foundUser.profile.name
                } as User;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    localStorage.setItem('auth_profile', JSON.stringify(foundUser.profile));
                }

                setUser(user);
                setProfile(foundUser.profile);
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, profileData: any) => {
        setLoading(true);

        try {
            if (useFirebase) {
                // Use Firebase authentication
                const result = await AuthService.signUp(email, password, profileData);
                setUser(result.user);
                setProfile(result.profile);
            } else {
                // Use mock authentication
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if user already exists
                const allUsers = getAllUsers();
                if (allUsers[email]) {
                    throw new Error('An account with this email already exists');
                }

                const newProfile: UserDocument = {
                    id: Date.now().toString(),
                    email,
                    name: profileData.name,
                    role: 'customer',
                    status: 'active',
                    permissions: ['products.read'],
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    orders: 0
                };

                // Add to dynamic users
                const newDynamicUsers = {
                    ...dynamicUsers,
                    [email]: {
                        password,
                        profile: newProfile
                    }
                };
                saveDynamicUsers(newDynamicUsers);

                const user = {
                    uid: newProfile.id,
                    email: newProfile.email,
                    displayName: newProfile.name
                } as User;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    localStorage.setItem('auth_profile', JSON.stringify(newProfile));
                }

                setUser(user);
                setProfile(newProfile);
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);

        try {
            // Clear localStorage FIRST before Firebase signOut
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_profile');
                console.log("🗑️ Cleared localStorage auth data");
            }

            if (useFirebase) {
                // Use Firebase authentication
                await AuthService.signOut();
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
        if (useFirebase) {
            await AuthService.resetPassword(email);
        } else {
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const hasPermission = (permission: string) => {
        if (!profile) return false;

        if (useFirebase) {
            return AuthService.hasPermission(profile, permission);
        } else {
            return profile.permissions.includes(permission);
        }
    };

    const hasRole = (role: string) => {
        if (!profile) return false;

        if (useFirebase) {
            return AuthService.hasRole(profile, role);
        } else {
            return profile.role === role;
        }
    };

    const hasAnyRole = (roles: string[]) => {
        if (!profile) return false;

        if (useFirebase) {
            return AuthService.hasAnyRole(profile, roles);
        } else {
            return roles.includes(profile.role);
        }
    };

    const getAllUsersFunction = () => {
        if (useFirebase) {
            // In Firebase mode, this would fetch from Firestore
            return [];
        } else {
            const allUsers = getAllUsers();
            return Object.values(allUsers).map(u => u.profile);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        if (useFirebase) {
            // In Firebase mode, update Firestore document
            return;
        } else {
            // Update in mock system
            const allUsers = getAllUsers();
            const userEntry = Object.entries(allUsers).find(([email, userData]) => userData.profile.id === userId);

            if (userEntry) {
                const [email, userData] = userEntry;

                // Don't allow changing the default admin role
                if (email === 'admin@elightsofa.com') {
                    throw new Error('Cannot change the system administrator role');
                }

                const updatedProfile = {
                    ...userData.profile,
                    role: newRole as any,
                    updatedAt: new Date().toISOString()
                };

                // Update in dynamic users
                const newDynamicUsers = {
                    ...dynamicUsers,
                    [email]: {
                        ...userData,
                        profile: updatedProfile
                    }
                };
                saveDynamicUsers(newDynamicUsers);

                // Update current user if it's the same user
                if (profile && profile.id === userId) {
                    setProfile(updatedProfile);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
                    }
                }
            }
        }
    };

    const updateUserStatus = async (userId: string, newStatus: string) => {
        if (useFirebase) {
            // In Firebase mode, update Firestore document
            return;
        } else {
            // Update in mock system
            const allUsers = getAllUsers();
            const userEntry = Object.entries(allUsers).find(([email, userData]) => userData.profile.id === userId);

            if (userEntry) {
                const [email, userData] = userEntry;

                // Don't allow deactivating the default admin
                if (email === 'admin@elightsofa.com' && newStatus !== 'active') {
                    throw new Error('Cannot deactivate the system administrator');
                }

                const updatedProfile = {
                    ...userData.profile,
                    status: newStatus as any,
                    updatedAt: new Date().toISOString()
                };

                // Update in dynamic users
                const newDynamicUsers = {
                    ...dynamicUsers,
                    [email]: {
                        ...userData,
                        profile: updatedProfile
                    }
                };
                saveDynamicUsers(newDynamicUsers);

                // Update current user if it's the same user
                if (profile && profile.id === userId) {
                    setProfile(updatedProfile);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
                    }
                }
            }
        }
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
        hasAnyRole,
        getAllUsers: getAllUsersFunction,
        updateUserRole,
        updateUserStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}