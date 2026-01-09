// Firebase Invoices Service
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
    DocumentData,
    writeBatch,
    runTransaction
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { InvoiceDocument, InvoiceProductDocument } from '../../types/firebase';

export interface InvoiceFilters {
    status?: string;
    salespersonId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    customerName?: string;
    invoiceNumber?: string;
}

export interface InvoiceQueryOptions {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export class InvoicesService {
    private static readonly COLLECTION = 'invoices';
    private static readonly PRODUCTS_SUBCOLLECTION = 'products';

    // Generate unique invoice number
    static async generateInvoiceNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        // Get count of invoices this month
        const startOfMonth = new Date(year, new Date().getMonth(), 1);
        const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);

        const q = query(
            collection(db, this.COLLECTION),
            where('invoiceDate', '>=', startOfMonth),
            where('invoiceDate', '<=', endOfMonth)
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size + 1;

        return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
    }

    // Get all invoices with filtering and pagination
    static async getInvoices(
        filters: InvoiceFilters = {},
        options: InvoiceQueryOptions = {}
    ) {
        try {
            let q = query(collection(db, this.COLLECTION));

            // Apply filters
            if (filters.status) {
                q = query(q, where('paymentDetails.status', '==', filters.status));
            }

            if (filters.salespersonId) {
                q = query(q, where('salespersonId', '==', filters.salespersonId));
            }

            if (filters.dateFrom) {
                q = query(q, where('invoiceDate', '>=', filters.dateFrom));
            }

            if (filters.dateTo) {
                q = query(q, where('invoiceDate', '<=', filters.dateTo));
            }

            // Apply ordering
            const orderField = options.orderBy || 'createdAt';
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
            const invoices: InvoiceDocument[] = [];

            querySnapshot.forEach((doc) => {
                invoices.push({ id: doc.id, ...doc.data() } as InvoiceDocument);
            });

            // Client-side filtering for text search (consider using Algolia for production)
            let filteredInvoices = invoices;

            if (filters.customerName) {
                filteredInvoices = invoices.filter(invoice =>
                    invoice.customerDetails.name.toLowerCase().includes(filters.customerName!.toLowerCase())
                );
            }

            if (filters.invoiceNumber) {
                filteredInvoices = filteredInvoices.filter(invoice =>
                    invoice.invoiceNumber.toLowerCase().includes(filters.invoiceNumber!.toLowerCase())
                );
            }

            return {
                invoices: filteredInvoices,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === (options.limit || 50)
            };
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw new Error('Failed to fetch invoices');
        }
    }

    // Get single invoice by ID with products
    static async getInvoice(invoiceId: string): Promise<(InvoiceDocument & { products: InvoiceProductDocument[] }) | null> {
        try {
            const docRef = doc(db, this.COLLECTION, invoiceId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const invoice = { id: docSnap.id, ...docSnap.data() } as InvoiceDocument;

            // Get invoice products
            const productsQuery = query(
                collection(db, this.COLLECTION, invoiceId, this.PRODUCTS_SUBCOLLECTION),
                orderBy('createdAt', 'asc')
            );

            const productsSnapshot = await getDocs(productsQuery);
            const products: InvoiceProductDocument[] = [];

            productsSnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as InvoiceProductDocument);
            });

            return { ...invoice, products };
        } catch (error) {
            console.error('Error fetching invoice:', error);
            throw new Error('Failed to fetch invoice');
        }
    }

    // Create new invoice with products
    static async createInvoice(
        invoiceData: Omit<InvoiceDocument, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>,
        products: Omit<InvoiceProductDocument, 'id'>[]
    ) {
        try {
            return await runTransaction(db, async (transaction) => {
                // Generate invoice number
                const invoiceNumber = await this.generateInvoiceNumber();

                // Create invoice document
                const invoiceRef = doc(collection(db, this.COLLECTION));
                const invoice: Omit<InvoiceDocument, 'id'> = {
                    ...invoiceData,
                    invoiceNumber,
                    productCount: products.length,
                    pdfGenerated: false,
                    whatsappSent: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                transaction.set(invoiceRef, invoice);

                // Create product subcollection documents
                products.forEach((product, index) => {
                    const productRef = doc(collection(db, this.COLLECTION, invoiceRef.id, this.PRODUCTS_SUBCOLLECTION));
                    transaction.set(productRef, {
                        ...product,
                        createdAt: serverTimestamp()
                    });
                });

                return invoiceRef.id;
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error('Failed to create invoice');
        }
    }

    // Update invoice
    static async updateInvoice(
        invoiceId: string,
        updates: Partial<InvoiceDocument>,
        products?: Omit<InvoiceProductDocument, 'id'>[]
    ) {
        try {
            return await runTransaction(db, async (transaction) => {
                const invoiceRef = doc(db, this.COLLECTION, invoiceId);

                // Update invoice document
                transaction.update(invoiceRef, {
                    ...updates,
                    updatedAt: serverTimestamp()
                });

                // If products are provided, update them
                if (products) {
                    // Delete existing products
                    const existingProductsQuery = query(
                        collection(db, this.COLLECTION, invoiceId, this.PRODUCTS_SUBCOLLECTION)
                    );
                    const existingProductsSnapshot = await getDocs(existingProductsQuery);

                    existingProductsSnapshot.forEach((doc) => {
                        transaction.delete(doc.ref);
                    });

                    // Add new products
                    products.forEach((product) => {
                        const productRef = doc(collection(db, this.COLLECTION, invoiceId, this.PRODUCTS_SUBCOLLECTION));
                        transaction.set(productRef, {
                            ...product,
                            createdAt: serverTimestamp()
                        });
                    });

                    // Update product count
                    transaction.update(invoiceRef, {
                        productCount: products.length
                    });
                }
            });
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw new Error('Failed to update invoice');
        }
    }

    // Delete invoice
    static async deleteInvoice(invoiceId: string) {
        try {
            return await runTransaction(db, async (transaction) => {
                // Delete all products first
                const productsQuery = query(
                    collection(db, this.COLLECTION, invoiceId, this.PRODUCTS_SUBCOLLECTION)
                );
                const productsSnapshot = await getDocs(productsQuery);

                productsSnapshot.forEach((doc) => {
                    transaction.delete(doc.ref);
                });

                // Delete invoice document
                const invoiceRef = doc(db, this.COLLECTION, invoiceId);
                transaction.delete(invoiceRef);
            });
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw new Error('Failed to delete invoice');
        }
    }

    // Update payment status
    static async updatePaymentStatus(
        invoiceId: string,
        paymentDetails: InvoiceDocument['paymentDetails']
    ) {
        try {
            const docRef = doc(db, this.COLLECTION, invoiceId);
            await updateDoc(docRef, {
                paymentDetails,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error('Failed to update payment status');
        }
    }

    // Mark PDF as generated
    static async markPdfGenerated(invoiceId: string) {
        try {
            const docRef = doc(db, this.COLLECTION, invoiceId);
            await updateDoc(docRef, {
                pdfGenerated: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking PDF as generated:', error);
            throw new Error('Failed to mark PDF as generated');
        }
    }

    // Mark WhatsApp as sent
    static async markWhatsappSent(invoiceId: string) {
        try {
            const docRef = doc(db, this.COLLECTION, invoiceId);
            await updateDoc(docRef, {
                whatsappSent: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking WhatsApp as sent:', error);
            throw new Error('Failed to mark WhatsApp as sent');
        }
    }

    // Get invoice statistics
    static async getInvoiceStats() {
        try {
            const q = query(collection(db, this.COLLECTION));
            const querySnapshot = await getDocs(q);

            let totalInvoices = 0;
            let totalRevenue = 0;
            let paidInvoices = 0;
            let pendingInvoices = 0;
            let partialInvoices = 0;
            const monthlySales: Record<string, number> = {};

            querySnapshot.forEach((doc) => {
                const invoice = doc.data() as InvoiceDocument;
                totalInvoices++;
                totalRevenue += invoice.calculations.grandTotal;

                // Count by payment status
                if (invoice.paymentDetails.status === 'Paid') paidInvoices++;
                else if (invoice.paymentDetails.status === 'Pending') pendingInvoices++;
                else if (invoice.paymentDetails.status === 'Partial') partialInvoices++;

                // Monthly sales
                const month = new Date(invoice.invoiceDate.seconds * 1000).toISOString().substring(0, 7);
                monthlySales[month] = (monthlySales[month] || 0) + invoice.calculations.grandTotal;
            });

            return {
                totalInvoices,
                totalRevenue,
                paidInvoices,
                pendingInvoices,
                partialInvoices,
                monthlySales
            };
        } catch (error) {
            console.error('Error fetching invoice stats:', error);
            throw new Error('Failed to fetch invoice stats');
        }
    }

    // Get overdue invoices
    static async getOverdueInvoices() {
        try {
            const today = new Date();
            const q = query(
                collection(db, this.COLLECTION),
                where('paymentDetails.status', 'in', ['Pending', 'Partial']),
                where('paymentDetails.dueDate', '<', today),
                orderBy('paymentDetails.dueDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const invoices: InvoiceDocument[] = [];

            querySnapshot.forEach((doc) => {
                invoices.push({ id: doc.id, ...doc.data() } as InvoiceDocument);
            });

            return invoices;
        } catch (error) {
            console.error('Error fetching overdue invoices:', error);
            throw new Error('Failed to fetch overdue invoices');
        }
    }

    // Get recent invoices
    static async getRecentInvoices(limit = 10) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const invoices: InvoiceDocument[] = [];

            querySnapshot.forEach((doc) => {
                invoices.push({ id: doc.id, ...doc.data() } as InvoiceDocument);
            });

            return invoices;
        } catch (error) {
            console.error('Error fetching recent invoices:', error);
            throw new Error('Failed to fetch recent invoices');
        }
    }
}