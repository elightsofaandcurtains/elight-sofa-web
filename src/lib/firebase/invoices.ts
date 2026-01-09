// Firebase Invoice Service - Real-time Invoice Management
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

// ==================== TYPES ====================

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type OrderType = 'Ready' | 'Custom Order';

export interface InvoiceItem {
  id: string;
  name: string;
  category: 'Sofa' | 'Curtain' | 'Pillow' | 'Accessory';
  material?: string;
  size?: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  taxRate: number;
  rowTotal: number;
}

export interface FirebaseInvoice {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerGst?: string;
  salespersonName: string;
  orderType: OrderType;
  invoiceDate: string;
  deliveryDate?: string;
  items: InvoiceItem[];
  itemsCount: number;
  subTotal: number;
  taxAmount: number;
  discount: number;
  transportCharges: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  paymentDueDate?: string;
  amountInWords: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGst: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface InvoiceDocument extends FirebaseInvoice {
  id: string;
}

export interface InvoiceFilters {
  status?: PaymentStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  partial: number;
  pending: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

// ==================== HELPER FUNCTIONS ====================

// Calculate payment status based on amounts
export function calculatePaymentStatus(paidAmount: number, totalAmount: number): PaymentStatus {
  if (paidAmount >= totalAmount) return 'Paid';
  if (paidAmount > 0) return 'Partial';
  return 'Pending';
}

// Generate invoice number
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  try {
    // Get all invoices and find the highest number (simpler approach, no index needed)
    const snapshot = await getDocs(collection(db, 'invoices'));
    
    let maxNumber = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const invoiceNum = data.invoiceNumber;
      if (invoiceNum && invoiceNum.startsWith(prefix)) {
        const numPart = parseInt(invoiceNum.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based number
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// Number to words conversion for Indian currency
export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Rupees Only';
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const roundedNum = Math.round(num);
  
  if (roundedNum < 1000) {
    return convertLessThanThousand(roundedNum) + ' Rupees Only';
  }
  
  if (roundedNum < 100000) {
    const thousands = Math.floor(roundedNum / 1000);
    const remainder = roundedNum % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' + 
      (remainder ? ' ' + convertLessThanThousand(remainder) : '') + ' Rupees Only';
  }
  
  if (roundedNum < 10000000) {
    const lakhs = Math.floor(roundedNum / 100000);
    const remainder = roundedNum % 100000;
    return convertLessThanThousand(lakhs) + ' Lakh' + 
      (remainder >= 1000 ? ' ' + convertLessThanThousand(Math.floor(remainder / 1000)) + ' Thousand' : '') +
      (remainder % 1000 ? ' ' + convertLessThanThousand(remainder % 1000) : '') + ' Rupees Only';
  }
  
  return 'Amount exceeds conversion limit';
}

// ==================== INVOICE SERVICE CLASS ====================

export class InvoiceService {
  private static readonly COLLECTION = 'invoices';

  // ==================== CREATE ====================

  static async createInvoice(data: Omit<FirebaseInvoice, 'invoiceNumber' | 'paymentStatus' | 'pendingAmount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating invoice with data:', JSON.stringify(data, null, 2));
      
      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();
      console.log('Generated invoice number:', invoiceNumber);
      
      // Calculate payment status and pending amount
      const pendingAmount = data.totalAmount - data.paidAmount;
      const paymentStatus = calculatePaymentStatus(data.paidAmount, data.totalAmount);
      const amountInWords = numberToWords(data.totalAmount);

      const invoiceDoc = {
        ...data,
        invoiceNumber,
        pendingAmount: Math.max(0, pendingAmount),
        paymentStatus,
        amountInWords,
        itemsCount: data.items.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Saving invoice to Firebase...');
      const docRef = await addDoc(collection(db, this.COLLECTION), invoiceDoc);
      
      console.log('✅ Invoice created successfully:', docRef.id, invoiceNumber);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error creating invoice:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you are logged in as admin.');
      }
      throw new Error(`Failed to create invoice: ${error.message || 'Unknown error'}`);
    }
  }

  // ==================== READ ====================

  // Get all invoices
  static async getInvoices(filters: InvoiceFilters = {}): Promise<InvoiceDocument[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      
      let invoices: InvoiceDocument[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InvoiceDocument));

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        invoices = invoices.filter(inv => inv.paymentStatus === filters.status);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        invoices = invoices.filter(inv =>
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          inv.customerName.toLowerCase().includes(searchLower) ||
          inv.salespersonName.toLowerCase().includes(searchLower) ||
          inv.customerPhone.includes(searchLower)
        );
      }

      if (filters.dateFrom) {
        invoices = invoices.filter(inv => inv.invoiceDate >= filters.dateFrom!);
      }

      if (filters.dateTo) {
        invoices = invoices.filter(inv => inv.invoiceDate <= filters.dateTo!);
      }

      // Sort by date descending
      invoices.sort((a, b) => (b.invoiceDate || '').localeCompare(a.invoiceDate || ''));

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  // Get single invoice
  static async getInvoice(invoiceId: string): Promise<InvoiceDocument | null> {
    try {
      const docRef = doc(db, this.COLLECTION, invoiceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as InvoiceDocument;
      }
      return null;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  // ==================== UPDATE ====================

  static async updateInvoice(invoiceId: string, updates: Partial<FirebaseInvoice>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, invoiceId);
      
      // Recalculate status if amounts changed
      if (updates.paidAmount !== undefined || updates.totalAmount !== undefined) {
        const current = await this.getInvoice(invoiceId);
        if (current) {
          const newPaid = updates.paidAmount ?? current.paidAmount;
          const newTotal = updates.totalAmount ?? current.totalAmount;
          updates.pendingAmount = Math.max(0, newTotal - newPaid);
          updates.paymentStatus = calculatePaymentStatus(newPaid, newTotal);
        }
      }

      // Update items count if items changed
      if (updates.items) {
        updates.itemsCount = updates.items.length;
      }

      // Update amount in words if total changed
      if (updates.totalAmount !== undefined) {
        updates.amountInWords = numberToWords(updates.totalAmount);
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Invoice updated:', invoiceId);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }
  }

  // ==================== DELETE ====================

  static async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, invoiceId);
      await deleteDoc(docRef);
      console.log('Invoice deleted:', invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  // Subscribe to all invoices (real-time)
  static subscribeToInvoices(callback: (invoices: InvoiceDocument[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.COLLECTION);
      console.log('Setting up invoices subscription...');
      
      return onSnapshot(collectionRef,
        (snapshot) => {
          console.log('Invoices snapshot received, docs count:', snapshot.docs.length);
          const invoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as InvoiceDocument));
          
          // Sort by date descending
          invoices.sort((a, b) => (b.invoiceDate || '').localeCompare(a.invoiceDate || ''));
          callback(invoices);
        },
        (error) => {
          console.error('Error in invoices subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up invoices subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // ==================== STATISTICS ====================

  static calculateStats(invoices: InvoiceDocument[]): InvoiceStats {
    return {
      total: invoices.length,
      paid: invoices.filter(inv => inv.paymentStatus === 'Paid').length,
      partial: invoices.filter(inv => inv.paymentStatus === 'Partial').length,
      pending: invoices.filter(inv => inv.paymentStatus === 'Pending').length,
      totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      paidAmount: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
      pendingAmount: invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0),
    };
  }

  // ==================== RECORD PAYMENT ====================

  static async recordPayment(
    invoiceId: string,
    amount: number,
    paymentMode: PaymentMode,
    paymentDate: string
  ): Promise<void> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const newPaidAmount = invoice.paidAmount + amount;
      const newPendingAmount = Math.max(0, invoice.totalAmount - newPaidAmount);
      const newStatus = calculatePaymentStatus(newPaidAmount, invoice.totalAmount);

      await this.updateInvoice(invoiceId, {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        paymentStatus: newStatus,
        paymentMode
      });

      console.log('Payment recorded for invoice:', invoiceId);
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
}
