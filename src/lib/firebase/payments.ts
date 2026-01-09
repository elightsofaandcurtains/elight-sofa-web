// Firebase Payments Service - Real-time Payment Management
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

// ==================== TYPES ====================

export interface CustomerPayment {
  id: string;
  customerName: string;
  customerPhone: string;
  invoiceId: string;
  invoiceNumber: string;
  productType?: string;
  orderDate?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethod: 'cash' | 'online' | 'bank' | 'upi' | 'card' | 'cheque';
  paymentDate: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SupplierPayment {
  id: string;
  supplierName: string;
  supplierPhone?: string;
  billNo: string;
  materialType: 'Raw Materials' | 'Shop Materials';
  purchaseDate?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethod: 'cash' | 'online' | 'bank' | 'upi' | 'card' | 'cheque';
  paymentDate: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PaymentHistoryItem {
  id: string;
  paymentId: string;
  paymentType: 'customer' | 'supplier';
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceId: string;
  paidBy: string;
  notes: string;
  createdAt?: any;
}

// ==================== HELPER FUNCTIONS ====================

// Calculate payment status based on amounts
export function calculatePaymentStatus(paidAmount: number, totalAmount: number): 'paid' | 'partial' | 'pending' {
  if (paidAmount >= totalAmount) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
}

// ==================== PAYMENTS SERVICE ====================

export class PaymentsService {
  private static readonly CUSTOMER_COLLECTION = 'customer_payments';
  private static readonly SUPPLIER_COLLECTION = 'supplier_payments';
  private static readonly HISTORY_COLLECTION = 'payment_history';

  // ==================== CUSTOMER PAYMENTS ====================

  // Create customer payment
  static async createCustomerPayment(data: Omit<CustomerPayment, 'id' | 'paymentStatus' | 'pendingAmount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const pendingAmount = data.totalAmount - data.paidAmount;
      const paymentStatus = calculatePaymentStatus(data.paidAmount, data.totalAmount);

      const docRef = await addDoc(collection(db, this.CUSTOMER_COLLECTION), {
        ...data,
        pendingAmount,
        paymentStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Customer payment created:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating customer payment:', error);
      throw new Error('Failed to create customer payment');
    }
  }

  // Get all customer payments
  static async getCustomerPayments(): Promise<CustomerPayment[]> {
    try {
      const snapshot = await getDocs(collection(db, this.CUSTOMER_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CustomerPayment));
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      return [];
    }
  }

  // Get single customer payment
  static async getCustomerPayment(paymentId: string): Promise<CustomerPayment | null> {
    try {
      const docRef = doc(db, this.CUSTOMER_COLLECTION, paymentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CustomerPayment;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer payment:', error);
      return null;
    }
  }

  // Update customer payment
  static async updateCustomerPayment(paymentId: string, updates: Partial<CustomerPayment>): Promise<void> {
    try {
      const docRef = doc(db, this.CUSTOMER_COLLECTION, paymentId);
      
      // Recalculate status if amounts changed
      if (updates.paidAmount !== undefined || updates.totalAmount !== undefined) {
        const current = await this.getCustomerPayment(paymentId);
        if (current) {
          const newPaid = updates.paidAmount ?? current.paidAmount;
          const newTotal = updates.totalAmount ?? current.totalAmount;
          updates.pendingAmount = newTotal - newPaid;
          updates.paymentStatus = calculatePaymentStatus(newPaid, newTotal);
        }
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating customer payment:', error);
      throw new Error('Failed to update customer payment');
    }
  }

  // Delete customer payment
  static async deleteCustomerPayment(paymentId: string): Promise<void> {
    try {
      const docRef = doc(db, this.CUSTOMER_COLLECTION, paymentId);
      await deleteDoc(docRef);
      
      // Also delete related payment history
      await this.deletePaymentHistory(paymentId);
    } catch (error) {
      console.error('Error deleting customer payment:', error);
      throw new Error('Failed to delete customer payment');
    }
  }

  // Subscribe to customer payments (real-time)
  static subscribeToCustomerPayments(callback: (payments: CustomerPayment[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.CUSTOMER_COLLECTION);
      
      return onSnapshot(collectionRef,
        (snapshot) => {
          const payments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as CustomerPayment));
          // Sort by date descending
          payments.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
          callback(payments);
        },
        (error) => {
          console.error('Error in customer payments subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up customer payments subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // ==================== SUPPLIER PAYMENTS ====================

  // Create supplier payment
  static async createSupplierPayment(data: Omit<SupplierPayment, 'id' | 'paymentStatus' | 'pendingAmount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const pendingAmount = data.totalAmount - data.paidAmount;
      const paymentStatus = calculatePaymentStatus(data.paidAmount, data.totalAmount);

      const docRef = await addDoc(collection(db, this.SUPPLIER_COLLECTION), {
        ...data,
        pendingAmount,
        paymentStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Supplier payment created:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating supplier payment:', error);
      throw new Error('Failed to create supplier payment');
    }
  }

  // Get all supplier payments
  static async getSupplierPayments(): Promise<SupplierPayment[]> {
    try {
      const snapshot = await getDocs(collection(db, this.SUPPLIER_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupplierPayment));
    } catch (error) {
      console.error('Error fetching supplier payments:', error);
      return [];
    }
  }

  // Get single supplier payment
  static async getSupplierPayment(paymentId: string): Promise<SupplierPayment | null> {
    try {
      const docRef = doc(db, this.SUPPLIER_COLLECTION, paymentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SupplierPayment;
      }
      return null;
    } catch (error) {
      console.error('Error fetching supplier payment:', error);
      return null;
    }
  }

  // Update supplier payment
  static async updateSupplierPayment(paymentId: string, updates: Partial<SupplierPayment>): Promise<void> {
    try {
      const docRef = doc(db, this.SUPPLIER_COLLECTION, paymentId);
      
      // Recalculate status if amounts changed
      if (updates.paidAmount !== undefined || updates.totalAmount !== undefined) {
        const current = await this.getSupplierPayment(paymentId);
        if (current) {
          const newPaid = updates.paidAmount ?? current.paidAmount;
          const newTotal = updates.totalAmount ?? current.totalAmount;
          updates.pendingAmount = newTotal - newPaid;
          updates.paymentStatus = calculatePaymentStatus(newPaid, newTotal);
        }
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating supplier payment:', error);
      throw new Error('Failed to update supplier payment');
    }
  }

  // Delete supplier payment
  static async deleteSupplierPayment(paymentId: string): Promise<void> {
    try {
      const docRef = doc(db, this.SUPPLIER_COLLECTION, paymentId);
      await deleteDoc(docRef);
      
      // Also delete related payment history
      await this.deletePaymentHistory(paymentId);
    } catch (error) {
      console.error('Error deleting supplier payment:', error);
      throw new Error('Failed to delete supplier payment');
    }
  }

  // Subscribe to supplier payments (real-time)
  static subscribeToSupplierPayments(callback: (payments: SupplierPayment[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.SUPPLIER_COLLECTION);
      
      return onSnapshot(collectionRef,
        (snapshot) => {
          const payments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as SupplierPayment));
          // Sort by date descending
          payments.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
          callback(payments);
        },
        (error) => {
          console.error('Error in supplier payments subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up supplier payments subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // ==================== PAYMENT HISTORY ====================

  // Add payment history entry
  static async addPaymentHistory(history: Omit<PaymentHistoryItem, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.HISTORY_COLLECTION), {
        ...history,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding payment history:', error);
      throw new Error('Failed to add payment history');
    }
  }

  // Get payment history for a payment
  static async getPaymentHistory(paymentId: string): Promise<PaymentHistoryItem[]> {
    try {
      const q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('paymentId', '==', paymentId)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentHistoryItem));
      // Sort by date descending
      history.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
      return history;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // Delete payment history for a payment
  private static async deletePaymentHistory(paymentId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('paymentId', '==', paymentId)
      );
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error('Error deleting payment history:', error);
    }
  }

  // Subscribe to payment history (real-time)
  static subscribeToPaymentHistory(paymentId: string, callback: (history: PaymentHistoryItem[]) => void): Unsubscribe {
    try {
      const q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('paymentId', '==', paymentId)
      );
      
      return onSnapshot(q,
        (snapshot) => {
          const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PaymentHistoryItem));
          history.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
          callback(history);
        },
        (error) => {
          console.error('Error in payment history subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up payment history subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // ==================== RECORD PAYMENT (Main Function) ====================

  // Record a new payment for customer or supplier
  static async recordPayment(
    paymentId: string,
    paymentType: 'customer' | 'supplier',
    amount: number,
    paymentMethod: string,
    paymentDate: string,
    referenceId: string,
    notes: string,
    paidBy: string = 'Admin'
  ): Promise<void> {
    try {
      // Get current payment
      const current = paymentType === 'customer' 
        ? await this.getCustomerPayment(paymentId)
        : await this.getSupplierPayment(paymentId);

      if (!current) {
        throw new Error('Payment record not found');
      }

      // Calculate new amounts
      const newPaidAmount = current.paidAmount + amount;
      const newPendingAmount = current.totalAmount - newPaidAmount;
      const newStatus = calculatePaymentStatus(newPaidAmount, current.totalAmount);

      // Update payment record
      if (paymentType === 'customer') {
        await this.updateCustomerPayment(paymentId, {
          paidAmount: newPaidAmount,
          pendingAmount: Math.max(0, newPendingAmount),
          paymentStatus: newStatus,
          paymentDate,
          paymentMethod: paymentMethod as any
        });
      } else {
        await this.updateSupplierPayment(paymentId, {
          paidAmount: newPaidAmount,
          pendingAmount: Math.max(0, newPendingAmount),
          paymentStatus: newStatus,
          paymentDate,
          paymentMethod: paymentMethod as any
        });
      }

      // Add to payment history
      await this.addPaymentHistory({
        paymentId,
        paymentType,
        amount,
        paymentMethod,
        paymentDate,
        referenceId: referenceId || `REF-${Date.now()}`,
        paidBy,
        notes
      });

    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
}
