// Create a test inquiry
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc",
    authDomain: "elight-sofa.firebaseapp.com",
    projectId: "elight-sofa",
    storageBucket: "elight-sofa.firebasestorage.app",
    messagingSenderId: "700236647248",
    appId: "1:700236647248:web:274b32f4529da1d6257a55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestInquiry() {
    console.log('📝 Creating test inquiry...\n');

    try {
        const inquiryData = {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phone: '9876543210',
            interestArea: 'Sofas',
            budgetRange: '₹50,000 - ₹1,00,000',
            message: 'This is a test inquiry to verify the system is working.',
            preferredContact: 'whatsapp',
            productName: 'Test Sofa',
            productCategory: 'Sofas',
            status: 'new',
            isViewed: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);

        console.log('✅ Test inquiry created successfully!');
        console.log('ID:', docRef.id);
        console.log('\nNow check the admin panel - Inquiries tab should show this inquiry.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

createTestInquiry();
