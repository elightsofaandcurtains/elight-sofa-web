// Firebase Authentication Service
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../firebase.config';
import { UserDocument } from '@/types/firebase';

export class AuthService {
    // Sign in with email and password
    static async signIn(email: string, password: string) {
        try {
            console.log("🔥 AuthService.signIn called with:", { email });

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ Firebase user signed in:", user.uid);

            // Update last login
            await this.updateLastLogin(user.uid);

            // Get user profile
            const userProfile = await this.getUserProfile(user.uid);
            console.log("✅ User profile retrieved");

            return {
                user,
                profile: userProfile
            };
        } catch (error: any) {
            console.error("❌ AuthService.signIn error:", error);
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                name: error.name
            });

            // Preserve the original Firebase error for proper fallback handling
            throw error;
        }
    }

    // Create new user account
    static async signUp(
        email: string,
        password: string,
        profile: {
            name: string;
            role: 'admin' | 'manager' | 'staff' | 'customer';
            phone?: string;
            department?: string;
            position?: string;
        }
    ) {
        try {
            console.log("🔥 AuthService.signUp called with:", {
                email,
                role: profile.role,
                name: profile.name,
                phone: profile.phone,
                department: profile.department,
                position: profile.position,
                profileKeys: Object.keys(profile)
            });

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ Firebase user created:", user.uid);

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: profile.name
            });
            console.log("✅ Firebase profile updated");

            // Create user document in Firestore - completely filter out undefined values
            const baseUserDoc = {
                id: user.uid,
                email: user.email!,
                name: profile.name,
                role: profile.role,
                status: 'active',
                permissions: this.getDefaultPermissions(profile.role),
                lastLogin: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                orders: 0,
                totalSpent: 0
            };

            // Build profile object only with defined values
            const profileData: any = {};
            if (profile.phone && typeof profile.phone === 'string' && profile.phone.trim()) {
                profileData.phone = profile.phone.trim();
            }
            if (profile.department && typeof profile.department === 'string' && profile.department.trim()) {
                profileData.department = profile.department.trim();
            }
            if (profile.position && typeof profile.position === 'string' && profile.position.trim()) {
                profileData.position = profile.position.trim();
            }

            // Only add profile if it has fields
            const userDoc = Object.keys(profileData).length > 0
                ? { ...baseUserDoc, profile: profileData }
                : baseUserDoc;

            // Final safety check - remove any undefined values recursively
            const cleanUserDoc = JSON.parse(JSON.stringify(userDoc, (key, value) => {
                return value === undefined ? null : value;
            }));

            console.log("🔥 Creating Firestore document for user:", user.uid);
            console.log("🔥 Clean document data:", cleanUserDoc);

            await setDoc(doc(db, 'users', user.uid), cleanUserDoc);
            console.log("✅ Firestore document created successfully");

            return {
                user,
                profile: userDoc
            };
        } catch (error: any) {
            console.error("❌ AuthService.signUp error:", error);
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                name: error.name
            });

            // Preserve the original Firebase error for proper fallback handling
            // Don't wrap it in a generic error message
            throw error;
        }
    }

    // Sign out
    static async signOut() {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error('Failed to sign out');
        }
    }

    // Get current user profile
    static async getUserProfile(uid: string): Promise<UserDocument | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data() as UserDocument;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Update user profile
    static async updateUserProfile(uid: string, updates: Partial<UserDocument>) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw new Error('Failed to update profile');
        }
    }

    // Update last login timestamp
    static async updateLastLogin(uid: string) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                lastLogin: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Send password reset email
    static async resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(this.getAuthErrorMessage(error.code));
        }
    }

    // Change password
    static async changePassword(currentPassword: string, newPassword: string) {
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No authenticated user');
            }

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);
        } catch (error: any) {
            throw new Error(this.getAuthErrorMessage(error.code));
        }
    }

    // Auth state observer
    static onAuthStateChange(callback: (user: User | null, profile: UserDocument | null) => void) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profile = await this.getUserProfile(user.uid);
                callback(user, profile);
            } else {
                callback(null, null);
            }
        });
    }

    // Get default permissions based on role
    static getDefaultPermissions(role: string): string[] {
        const permissions: Record<string, string[]> = {
            admin: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'inventory.read', 'inventory.write', 'inventory.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            manager: [
                'users.read', 'users.write',
                'products.read', 'products.write',
                'employees.read', 'employees.write',
                'invoices.read', 'invoices.write',
                'payments.read', 'payments.write',
                'inventory.read', 'inventory.write',
                'analytics.read'
            ],
            staff: [
                'products.read',
                'invoices.read', 'invoices.write',
                'payments.read',
                'inventory.read'
            ],
            customer: [
                'products.read',
                'inquiries.write'
            ]
        };

        return permissions[role] || permissions.customer;
    }

    // Convert Firebase auth error codes to user-friendly messages
    static getAuthErrorMessage(errorCode: string): string {
        const errorMessages: Record<string, string> = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // Check if user has permission
    static hasPermission(userProfile: UserDocument | null, permission: string): boolean {
        if (!userProfile) return false;
        return userProfile.permissions.includes(permission);
    }

    // Check if user has role
    static hasRole(userProfile: UserDocument | null, role: string): boolean {
        if (!userProfile) return false;
        return userProfile.role === role;
    }

    // Check if user has any of the specified roles
    static hasAnyRole(userProfile: UserDocument | null, roles: string[]): boolean {
        if (!userProfile) return false;
        return roles.includes(userProfile.role);
    }
}