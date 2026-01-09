// Script to seed initial payment data in Firebase
// Run: node scripts/seed-payments.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config - same as your firebase.config.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDDWMzfKe5A-kVpHFGGRzi8w0melPBAsKg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "elight-sofa.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elight-sofa",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "elight-sofa.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1098578585036",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1098578585036:web:c0a1f3f8f8f8f8f8f8f8f8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample Customer Payments
const customerPayments = [
  {
    customerName: "Rajesh Patel",
    customerPhone: "+91 98765 43210",
    invoiceId: "INV-001",
    invoiceNumber: "INV-2026-001",
    productType: "L-Shape Sofa",
    orderDate: "2026-01-05",
    totalAmount: 85000,
    paidAmount: 50000,
    pendingAmount: 35000,
    paymentStatus: "partial",
    paymentMethod: "cash",
    paymentDate: "2026-01-05",
  },
  {
    customerName: "Amit Shah",
    customerPhone: "+91 99887 76655",
    invoiceId: "INV-002",
    invoiceNumber: "INV-2026-002",
    productType: "3-Seater Sofa",
    orderDate: "2026-01-03",
    totalAmount: 45000,
    paidAmount: 45000,
    pendingAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "upi",
    paymentDate: "2026-01-03",
  },
  {
    customerName: "Priya Sharma",
    customerPhone: "+91 87654 32109",
    invoiceId: "INV-003",
    invoiceNumber: "INV-2026-003",
    productType: "Curtains Set",
    orderDate: "2026-01-07",
    totalAmount: 25000,
    paidAmount: 0,
    pendingAmount: 25000,
    paymentStatus: "pending",
    paymentMethod: "cash",
    paymentDate: "2026-01-07",
  },
  {
    customerName: "Vikram Mehta",
    customerPhone: "+91 76543 21098",
    invoiceId: "INV-004",
    invoiceNumber: "INV-2026-004",
    productType: "Recliner Sofa",
    orderDate: "2026-01-02",
    totalAmount: 65000,
    paidAmount: 30000,
    pendingAmount: 35000,
    paymentStatus: "partial",
    paymentMethod: "bank",
    paymentDate: "2026-01-02",
  },
];

// Sample Supplier Payments
const supplierPayments = [
  {
    supplierName: "Gujarat Foam Industries",
    supplierPhone: "+91 98765 11111",
    billNo: "GFI-2026-101",
    materialType: "Raw Materials",
    purchaseDate: "2026-01-04",
    totalAmount: 120000,
    paidAmount: 80000,
    pendingAmount: 40000,
    paymentStatus: "partial",
    paymentMethod: "bank",
    paymentDate: "2026-01-04",
  },
  {
    supplierName: "Surat Fabric House",
    supplierPhone: "+91 98765 22222",
    billNo: "SFH-2026-055",
    materialType: "Shop Materials",
    purchaseDate: "2026-01-06",
    totalAmount: 75000,
    paidAmount: 75000,
    pendingAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "cheque",
    paymentDate: "2026-01-06",
  },
  {
    supplierName: "Wood Craft Suppliers",
    supplierPhone: "+91 98765 33333",
    billNo: "WCS-2026-022",
    materialType: "Raw Materials",
    purchaseDate: "2026-01-08",
    totalAmount: 95000,
    paidAmount: 0,
    pendingAmount: 95000,
    paymentStatus: "pending",
    paymentMethod: "cash",
    paymentDate: "2026-01-08",
  },
  {
    supplierName: "Spring & Hardware Co",
    supplierPhone: "+91 98765 44444",
    billNo: "SHC-2026-033",
    materialType: "Shop Materials",
    purchaseDate: "2026-01-01",
    totalAmount: 45000,
    paidAmount: 25000,
    pendingAmount: 20000,
    paymentStatus: "partial",
    paymentMethod: "upi",
    paymentDate: "2026-01-01",
  },
];

async function seedPayments() {
  console.log('🚀 Starting to seed payment data...\n');

  try {
    // Add Customer Payments
    console.log('📦 Adding Customer Payments...');
    for (const payment of customerPayments) {
      const docRef = await addDoc(collection(db, 'customer_payments'), {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  ✅ Added: ${payment.customerName} - ${payment.invoiceNumber}`);
    }

    // Add Supplier Payments
    console.log('\n🏭 Adding Supplier Payments...');
    for (const payment of supplierPayments) {
      const docRef = await addDoc(collection(db, 'supplier_payments'), {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  ✅ Added: ${payment.supplierName} - ${payment.billNo}`);
    }

    console.log('\n✨ Payment data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Customer Payments: ${customerPayments.length}`);
    console.log(`   Supplier Payments: ${supplierPayments.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedPayments();
