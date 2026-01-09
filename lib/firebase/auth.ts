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
import { auth, db } from '../../firebase.config';
import { UserDocument } from '../../types/firebase';

export class AuthService {
    // Sign in with email and password
    static async signIn(email: string, password: string) {
        console.log("🔥 AuthService.signIn called with:", { email, password: "***" });

        try {
            console.log("🔥 Attempting Firebase signInWithEmailAndPassword...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ Firebase auth successful, user:", user.uid);

            // Update last login
            console.log("📝 Updating last login...");
            await this.updateLastLogin(user.uid);

            // Get user profile
            console.log("👤 Getting user profile...");
            const userProfile = await this.getUserProfile(user.uid);
            console.log("✅ User profile loaded:", userProfile);

            return {
                user,
                profile: userProfile
            };
        } catch (error: any) {
            console.error("❌ Firebase auth error:", error);
            throw new Error(this.getAuthErrorMessage(error.code));
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
        console.log("🔥 AuthService.signUp called with:", { email, profile });

        try {
            console.log("🔥 Creating Firebase Auth user...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ Firebase Auth user created:", user.uid);

            // Update Firebase Auth profile
            console.log("📝 Updating Firebase Auth profile...");
            await updateProfile(user, {
                displayName: profile.name
            });
            console.log("✅ Firebase Auth profile updated");

            // Create user document in Firestore
            console.log("📄 Creating Firestore user document...");
            const userDoc = {
                id: user.uid,
                email: user.email!,
                name: profile.name,
                role: profile.role,
                status: 'active',

                profile: {
                    phone: profile.phone || '',
                    department: profile.department || (profile.role === 'customer' ? 'Customer' : ''),
                    position: profile.position || (profile.role === 'customer' ? 'Customer' : '')
                },

                permissions: this.getDefaultPermissions(profile.role),
                orders: 0,
                totalSpent: 0,

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            };

            console.log("📄 User document structure:", userDoc);

            try {
                // Use merge: true to handle any potential conflicts
                await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });
                console.log("✅ Firestore user document created successfully");

                // Verify the document was created by reading it back
                console.log("🔍 Verifying document creation...");
                const createdDoc = await getDoc(doc(db, 'users', user.uid));
                if (createdDoc.exists()) {
                    console.log("✅ Document verification successful:", createdDoc.data());
                } else {
                    console.error("❌ Document verification failed - document not found");
                    throw new Error("User document was not created properly");
                }
            } catch (firestoreError: any) {
                console.error("❌ Firestore document creation failed:", firestoreError);
                console.error("Error code:", firestoreError.code);
                console.error("Error message:", firestoreError.message);

                // If Firestore fails, we should delete the Firebase Auth user to keep things consistent
                try {
                    await user.delete();
                    console.log("🧹 Cleaned up Firebase Auth user after Firestore failure");
                } catch (cleanupError) {
                    console.error("❌ Failed to cleanup Firebase Auth user:", cleanupError);
                }

                throw new Error(`Failed to create user profile: ${firestoreError.message}`);
            }

            return {
                user,
                profile: userDoc
            };
        } catch (error: any) {
            console.error("❌ AuthService.signUp error:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                name: error.name
            });

            // Always throw the original error so useAuth can handle Firebase API issues
            // and fall back to mock authentication when needed
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
                return { ...userDoc.data(), id: userDoc.id } as UserDocument;
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
    static onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
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
            'auth/requires-recent-login': 'Please sign in again to complete this action.',
            'auth/invalid-credential': 'Invalid email or password.',
            'permission-denied': 'Permission denied. Unable to create user profile.',
            'unavailable': 'Service temporarily unavailable. Please try again.',
            'failed-precondition': 'Operation failed due to system constraints.',
            'resource-exhausted': 'Service quota exceeded. Please try again later.'
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