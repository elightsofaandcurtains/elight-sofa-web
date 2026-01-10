// Reset admin account - use this if you can't login
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc",
    authDomain: "elight-sofa.firebaseapp.com",
    projectId: "elight-sofa",
    storageBucket: "elight-sofa.firebasestorage.app",
    messagingSenderId: "700236647248",
    appId: "1:700236647248:web:274b32f4529da1d6257a55"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Change this to your admin email
const ADMIN_EMAIL = 'admin@elightsofa.com';

async function resetAdmin() {
    console.log('🔧 Admin Account Reset Tool\n');
    console.log('Email:', ADMIN_EMAIL);

    try {
        // Check if user exists in Firestore
        console.log('\n📋 Checking Firestore for user document...');
        const usersSnapshot = await getDoc(doc(db, 'users', 'admin-check'));

        // Try to send password reset email
        console.log('\n📧 Sending password reset email...');
        await sendPasswordResetEmail(auth, ADMIN_EMAIL);
        console.log('✅ Password reset email sent to:', ADMIN_EMAIL);
        console.log('\n👉 Check your email and click the reset link to set a new password.');

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log('\n❌ User not found in Firebase Auth!');
            console.log('👉 You need to create the admin account first.');
            console.log('   Run: node scripts/create-admin-simple.js');
        } else if (error.code === 'auth/invalid-email') {
            console.log('\n❌ Invalid email address');
        } else {
            console.log('\n❌ Error:', error.message);
            console.log('Error code:', error.code);
        }
    }

    process.exit(0);
}

resetAdmin();
