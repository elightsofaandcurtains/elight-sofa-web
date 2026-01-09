// Firebase Payments Service
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
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { PaymentDocument } from '../../types/firebase';

export interface PaymentFilters {
    type?: 'receivable' | 'payable' | 'all';
    status?: string;
    mode?: string;
    dateFrom?: Date;
    dateTo?: Date;
    party?: string;
    minAmount?: number;
    maxAmount?: number;
    invoiceId?: string;
}

export interface PaymentQueryOptions {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export class PaymentsService {
    private static readonly COLLECTION = 'payments';

    // Get all payments with filtering and pagination
    static async getPayments(
        filters: PaymentFilters = {},
        options: PaymentQueryOptions = {}
    ) {
        try {
            let q = query(collection(db, this.COLLECTION));

            // Apply filters
            if (filters.type && filters.type !== 'all') {
                q = query(q, where('type', '==', filters.type));
            }

            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.mode) {
                q = query(q, where('mode', '==', filters.mode));
            }

            if (filters.dateFrom) {
                q = query(q, where('date', '>=', filters.dateFrom));
            }

            if (filters.dateTo) {
                q = query(q, where('date', '<=', filters.dateTo));
            }

            if (filters.minAmount !== undefined) {
                q = query(q, where('amount', '>=', filters.minAmount));
            }

            if (filters.maxAmount !== undefined) {
                q = query(q, where('amount', '<=', filters.maxAmount));
            }

            if (filters.invoiceId) {
                q = query(q, where('invoiceId', '==', filters.invoiceId));
            }

            // Apply ordering
            const orderField = options.orderBy || 'date';
            const orderDirection = options.orderDirection || 'desc';
            q = query(q, orderBy(orderField, orderDirection));

            // Apply pagination
            if (options.startAfter) {
                q = query(q, startAfter(options.startAfter));
            }

            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            const payments: PaymentDocument[] = [];

            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() } as PaymentDocument);
            });

            // Client-side filtering for party name (consider using Algolia for production)
            let filteredPayments = payments;

            if (filters.party) {
                filteredPayments = payments.filter(payment =>
                    payment.party.toLowerCase().includes(filters.party!.toLowerCase())
                );
            }

            return {
                payments: filteredPayments,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === (options.limit || 50)
            };
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw new Error('Failed to fetch payments');
        }
    }

    // Get single payment by ID
    static async getPayment(paymentId: string): Promise<PaymentDocument | null> {
        try {
            const docRef = doc(db, this.COLLECTION, paymentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as PaymentDocument;
            }

            return null;
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw new Error('Failed to fetch payment');
        }
    }

    // Create new payment
    static async createPayment(paymentData: Omit<PaymentDocument, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const docRef = await addDoc(collection(db, this.COLLECTION), {
                ...paymentData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw new Error('Failed to create payment');
        }
    }

    // Update payment
    static async updatePayment(paymentId: string, updates: Partial<PaymentDocument>) {
        try {
            const docRef = doc(db, this.COLLECTION, paymentId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating payment:', error);
            throw new Error('Failed to update payment');
        }
    }

    // Delete payment
    static async deletePayment(paymentId: string) {
        try {
            const docRef = doc(db, this.COLLECTION, paymentId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw new Error('Failed to delete payment');
        }
    }

    // Get receivables (customer payments)
    static async getReceivables(filters: Omit<PaymentFilters, 'type'> = {}) {
        return this.getPayments({ ...filters, type: 'receivable' });
    }

    // Get payables (supplier payments)
    static async getPayables(filters: Omit<PaymentFilters, 'type'> = {}) {
        return this.getPayments({ ...filters, type: 'payable' });
    }

    // Get overdue payments
    static async getOverduePayments() {
        try {
            const today = new Date();
            const q = query(
                collection(db, this.COLLECTION),
                where('status', 'in', ['pending', 'partial']),
                where('dueDate', '<', today),
                orderBy('dueDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const payments: PaymentDocument[] = [];

            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() } as PaymentDocument);
            });

            return payments;
        } catch (error) {
            console.error('Error fetching overdue payments:', error);
            throw new Error('Failed to fetch overdue payments');
        }
    }

    // Get payment statistics
    static async getPaymentStats() {
        try {
            const q = query(collection(db, this.COLLECTION));
            const querySnapshot = await getDocs(q);

            let totalReceivables = 0;
            let totalPayables = 0;
            let paidReceivables = 0;
            let paidPayables = 0;
            let pendingReceivables = 0;
            let pendingPayables = 0;
            let overdueCount = 0;

            const today = new Date();
            const modeCount: Record<string, number> = {};

            querySnapshot.forEach((doc) => {
                const payment = doc.data() as PaymentDocument;

                // Count by type and status
                if (payment.type === 'receivable') {
                    totalReceivables += payment.amount;
                    if (payment.status === 'paid') {
                        paidReceivables += payment.amount;
                    } else {
                        pendingReceivables += payment.amount;
                    }
                } else if (payment.type === 'payable') {
                    totalPayables += payment.amount;
                    if (payment.status === 'paid') {
                        paidPayables += payment.amount;
                    } else {
                        pendingPayables += payment.amount;
                    }
                }

                // Count overdue
                if (
                    payment.dueDate &&
                    payment.dueDate.toDate() < today &&
                    ['pending', 'partial'].includes(payment.status)
                ) {
                    overdueCount++;
                }

                // Count by mode
                modeCount[payment.mode] = (modeCount[payment.mode] || 0) + 1;
            });

            return {
                totalReceivables,
                totalPayables,
                paidReceivables,
                paidPayables,
                pendingReceivables,
                pendingPayables,
                overdueCount,
                modeCount,
                netCashFlow: paidReceivables - paidPayables
            };
        } catch (error) {
            console.error('Error fetching payment stats:', error);
            throw new Error('Failed to fetch payment stats');
        }
    }

    // Get payments by invoice
    static async getPaymentsByInvoice(invoiceId: string) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('invoiceId', '==', invoiceId),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const payments: PaymentDocument[] = [];

            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() } as PaymentDocument);
            });

            return payments;
        } catch (error) {
            console.error('Error fetching payments by invoice:', error);
            throw new Error('Failed to fetch payments by invoice');
        }
    }

    // Get recent payments
    static async getRecentPayments(limit = 10) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('date', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const payments: PaymentDocument[] = [];

            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() } as PaymentDocument);
            });

            return payments;
        } catch (error) {
            console.error('Error fetching recent payments:', error);
            throw new Error('Failed to fetch recent payments');
        }
    }

    // Get payments by party
    static async getPaymentsByParty(partyName: string) {
        try {
            // Note: This requires client-side filtering due to Firestore limitations
            // For production, consider using Algolia or similar for text search
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const payments: PaymentDocument[] = [];

            querySnapshot.forEach((doc) => {
                const payment = { id: doc.id, ...doc.data() } as PaymentDocument;
                if (payment.party.toLowerCase().includes(partyName.toLowerCase())) {
                    payments.push(payment);
                }
            });

            return payments;
        } catch (error) {
            console.error('Error fetching payments by party:', error);
            throw new Error('Failed to fetch payments by party');
        }
    }

    // Update payment status to overdue (for scheduled tasks)
    static async markOverduePayments() {
        try {
            const today = new Date();
            const q = query(
                collection(db, this.COLLECTION),
                where('status', 'in', ['pending', 'partial']),
                where('dueDate', '<', today)
            );

            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);

            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, {
                    status: 'overdue',
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
            return querySnapshot.size;
        } catch (error) {
            console.error('Error marking overdue payments:', error);
            throw new Error('Failed to mark overdue payments');
        }
    }
}