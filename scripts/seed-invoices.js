/**
 * Seed Invoices to Firebase
 * Run: node scripts/seed-invoices.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc',
  authDomain: 'elight-sofa.firebaseapp.com',
  projectId: 'elight-sofa',
  storageBucket: 'elight-sofa.firebasestorage.app',
  messagingSenderId: '700236647248',
  appId: '1:700236647248:web:274b32f4529da1d6257a55',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Company details
const companyDetails = {
  companyName: 'Elight Sofa House',
  companyAddress: '1/2, Shanti and Soc, Dabholi Rd, Katargam, Surat, Gujarat 395004',
  companyPhone: '+91 9714392926',
  companyEmail: 'elightsofaandcurtains@gmail.com',
  companyGst: '',
};

// Sample invoices
const sampleInvoices = [
  {
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Amit Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'amit.sharma@email.com',
    customerAddress: '456 Residential Complex, Andheri West, Mumbai - 400058',
    customerGst: '27XYZAB1234C1Z5',
    salespersonName: 'Rajesh Kumar',
    orderType: 'Ready',
    invoiceDate: '2026-01-05',
    deliveryDate: '2026-01-10',
    items: [
      {
        id: '1',
        name: 'Elegant Chesterfield Sofa',
        category: 'Sofa',
        material: 'Leather',
        size: '84" W x 38" D x 36" H',
        quantity: 1,
        rate: 32990,
        discount: 10,
        discountType: 'percentage',
        taxRate: 18,
        rowTotal: 35068.44,
      },
      {
        id: '2',
        name: 'Blackout Curtains Set',
        category: 'Curtain',
        material: 'Polyester',
        size: '7 ft x 4 ft',
        quantity: 2,
        rate: 2990,
        discount: 500,
        discountType: 'amount',
        taxRate: 12,
        rowTotal: 6076.8,
      },
    ],
    itemsCount: 2,
    subTotal: 35481,
    taxAmount: 5664.24,
    discount: 3799,
    transportCharges: 1000,
    totalAmount: 41145.24,
    paidAmount: 20000,
    pendingAmount: 21145.24,
    paymentStatus: 'Partial',
    paymentMode: 'UPI',
    paymentDueDate: '2026-02-05',
    amountInWords: 'Forty One Thousand One Hundred Forty Five Rupees Only',
    ...companyDetails,
  },
  {
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Sunita Reddy',
    customerPhone: '+91 87654 32109',
    customerEmail: 'sunita.reddy@email.com',
    customerAddress: '789 Villa Complex, Bandra East, Mumbai - 400051',
    salespersonName: 'Priya Patel',
    orderType: 'Custom Order',
    invoiceDate: '2026-01-06',
    deliveryDate: '2026-02-10',
    items: [
      {
        id: '1',
        name: 'L-Shape Corner Sofa',
        category: 'Sofa',
        material: 'Velvet',
        size: '120" W x 80" D x 36" H',
        quantity: 1,
        rate: 54990,
        discount: 5,
        discountType: 'percentage',
        taxRate: 18,
        rowTotal: 61623.81,
      },
    ],
    itemsCount: 1,
    subTotal: 52240.5,
    taxAmount: 9403.29,
    discount: 2749.5,
    transportCharges: 1500,
    totalAmount: 63143.79,
    paidAmount: 63143.79,
    pendingAmount: 0,
    paymentStatus: 'Paid',
    paymentMode: 'Bank Transfer',
    amountInWords: 'Sixty Three Thousand One Hundred Forty Three Rupees Only',
    ...companyDetails,
  },
  {
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Vikram Joshi',
    customerPhone: '+91 76543 21098',
    customerEmail: 'vikram.joshi@email.com',
    customerAddress: '123 Business Park, Powai, Mumbai - 400076',
    customerGst: '27ABCDE1234F1G6',
    salespersonName: 'Rajesh Kumar',
    orderType: 'Ready',
    invoiceDate: '2026-01-07',
    items: [
      {
        id: '1',
        name: 'Premium Silk Curtains',
        category: 'Curtain',
        material: 'Silk',
        size: '9 ft x 4 ft',
        quantity: 4,
        rate: 7990,
        discount: 0,
        discountType: 'percentage',
        taxRate: 12,
        rowTotal: 35795.2,
      },
      {
        id: '2',
        name: 'Decorative Pillows Set',
        category: 'Pillow',
        material: 'Cotton',
        size: '18" x 18"',
        quantity: 6,
        rate: 890,
        discount: 10,
        discountType: 'percentage',
        taxRate: 5,
        rowTotal: 5048.46,
      },
    ],
    itemsCount: 2,
    subTotal: 36764,
    taxAmount: 4079.66,
    discount: 534,
    transportCharges: 500,
    totalAmount: 41343.66,
    paidAmount: 0,
    pendingAmount: 41343.66,
    paymentStatus: 'Pending',
    paymentMode: 'Cash',
    paymentDueDate: '2026-01-20',
    amountInWords: 'Forty One Thousand Three Hundred Forty Three Rupees Only',
    ...companyDetails,
  },
];

async function seedInvoices() {
  console.log('🚀 Starting invoice seeding...\n');

  for (const invoice of sampleInvoices) {
    try {
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Created invoice: ${invoice.invoiceNumber} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error creating invoice ${invoice.invoiceNumber}:`, error.message);
    }
  }

  console.log('\n✨ Invoice seeding complete!');
  process.exit(0);
}

seedInvoices();
