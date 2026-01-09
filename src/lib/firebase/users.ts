// Firebase Users & Suppliers Management Service
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../../firebase.config';
import { User, Supplier } from '../../types';

// Firebase User Document Structure
export interface FirebaseUser {
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee' | 'customer' | 'supplier';
  department?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: any;
  address?: string;
  notes?: string;
  permissions?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Firebase Supplier Document Structure
export interface FirebaseSupplier {
  userId: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  supplierType: 'raw' | 'shop';
  paymentTerms: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export class UsersService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly SUPPLIERS_COLLECTION = 'suppliers';

  // ==================== USER CRUD ====================

  // Get all users
  static async getUsers(pageSize: number = 100): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapFirebaseToUser(doc.id, doc.data() as FirebaseUser));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Subscribe to users (real-time)
  static subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => 
        this.mapFirebaseToUser(doc.id, doc.data() as FirebaseUser)
      );
      callback(users);
    }, (error) => {
      console.error('Error in users subscription:', error);
    });
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapFirebaseToUser(doc.id, doc.data() as FirebaseUser));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.mapFirebaseToUser(docSnap.id, docSnap.data() as FirebaseUser);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Create new user with optional Firebase Auth
  static async createUser(userData: {
    email: string;
    password?: string;
    fullName: string;
    phone: string;
    role: 'admin' | 'employee' | 'customer' | 'supplier';
    department?: string;
    status?: 'active' | 'inactive' | 'blocked';
    address?: string;
    notes?: string;
  }): Promise<string> {
    try {
      let userId: string;

      // Create Firebase Auth user if password provided
      if (userData.password) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        userId = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: userData.fullName });
      } else {
        // Generate a random ID for users without auth
        userId = doc(collection(db, this.USERS_COLLECTION)).id;
      }

      const userDoc: FirebaseUser = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        department: userData.department || '',
        status: userData.status || 'active',
        address: userData.address || '',
        notes: userData.notes || '',
        permissions: this.getDefaultPermissions(userData.role),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, this.USERS_COLLECTION, userId), userDoc);
      return userId;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Update user status
  static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'blocked'): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  // Delete user (and supplier if applicable)
  static async deleteUser(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete user document
      batch.delete(doc(db, this.USERS_COLLECTION, userId));
      
      // Check and delete supplier document if exists
      const supplierQuery = query(
        collection(db, this.SUPPLIERS_COLLECTION),
        where('userId', '==', userId)
      );
      const supplierSnapshot = await getDocs(supplierQuery);
      supplierSnapshot.docs.forEach(supplierDoc => {
        batch.delete(supplierDoc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // ==================== SUPPLIER CRUD ====================

  // Get all suppliers
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, this.SUPPLIERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapFirebaseToSupplier(doc.id, doc.data() as FirebaseSupplier));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  // Subscribe to suppliers (real-time)
  static subscribeToSuppliers(callback: (suppliers: Supplier[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.SUPPLIERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const suppliers = snapshot.docs.map(doc => 
        this.mapFirebaseToSupplier(doc.id, doc.data() as FirebaseSupplier)
      );
      callback(suppliers);
    }, (error) => {
      console.error('Error in suppliers subscription:', error);
    });
  }

  // Get supplier by user ID
  static async getSupplierByUserId(userId: string): Promise<Supplier | null> {
    try {
      const q = query(
        collection(db, this.SUPPLIERS_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return this.mapFirebaseToSupplier(doc.id, doc.data() as FirebaseSupplier);
      }
      return null;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw new Error('Failed to fetch supplier');
    }
  }

  // Create supplier
  static async createSupplier(supplierData: Omit<FirebaseSupplier, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docData = {
        ...supplierData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, this.SUPPLIERS_COLLECTION), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }

  // Update supplier
  static async updateSupplier(supplierId: string, updates: Partial<FirebaseSupplier>): Promise<void> {
    try {
      const supplierRef = doc(db, this.SUPPLIERS_COLLECTION, supplierId);
      await updateDoc(supplierRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }

  // Update supplier by user ID
  static async updateSupplierByUserId(userId: string, updates: Partial<FirebaseSupplier>): Promise<void> {
    try {
      const q = query(
        collection(db, this.SUPPLIERS_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const supplierDoc = snapshot.docs[0];
        await updateDoc(supplierDoc.ref, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }

  // ==================== HELPER METHODS ====================

  private static mapFirebaseToUser(id: string, data: FirebaseUser): User {
    return {
      id,
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'customer',
      department: data.department || '',
      status: data.status || 'active',
      lastLogin: data.lastLogin?.toDate?.()?.toISOString() || '',
      address: data.address || '',
      notes: data.notes || '',
      permissions: data.permissions || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      // Legacy compatibility
      name: data.fullName || ''
    };
  }

  private static mapFirebaseToSupplier(id: string, data: FirebaseSupplier): Supplier {
    return {
      id,
      userId: data.userId || '',
      supplierName: data.supplierName || '',
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      gstNumber: data.gstNumber || '',
      supplierType: data.supplierType || 'raw',
      paymentTerms: data.paymentTerms || '',
      notes: data.notes || '',
      status: data.status || 'active',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };
  }

  private static getDefaultPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: [
        'users.read', 'users.write', 'users.delete',
        'products.read', 'products.write', 'products.delete',
        'employees.read', 'employees.write', 'employees.delete',
        'invoices.read', 'invoices.write', 'invoices.delete',
        'payments.read', 'payments.write', 'payments.delete',
        'analytics.read', 'settings.read', 'settings.write',
        'suppliers.read', 'suppliers.write', 'suppliers.delete'
      ],
      employee: [
        'products.read', 'products.write',
        'invoices.read', 'invoices.write',
        'payments.read', 'payments.write'
      ],
      customer: [
        'products.read',
        'inquiries.write'
      ],
      supplier: [
        'products.read'
      ]
    };
    return permissions[role] || permissions.customer;
  }
}
