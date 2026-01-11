// Check inquiries in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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

async function checkInquiries() {
    console.log('🔍 Checking inquiries in Firebase...\n');

    try {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        console.log(`📋 Found ${snapshot.size} inquiries:\n`);

        if (snapshot.size === 0) {
            console.log('No inquiries found in the database.');
            console.log('\nTo test, submit an inquiry from the website:');
            console.log('1. Go to a product page');
            console.log('2. Click "Request Inquiry"');
            console.log('3. Fill out the form and submit');
        } else {
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`--- Inquiry ${index + 1} ---`);
                console.log('ID:', doc.id);
                console.log('Name:', data.firstName, data.lastName);
                console.log('Email:', data.email);
                console.log('Phone:', data.phone);
                console.log('Status:', data.status);
                console.log('Interest:', data.interestArea);
                console.log('Product:', data.productName || 'N/A');
                console.log('Created:', data.createdAt?.toDate?.() || 'N/A');
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
    }

    process.exit(0);
}

checkInquiries();
