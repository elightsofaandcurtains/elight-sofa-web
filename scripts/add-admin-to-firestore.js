// Add admin user document to Firestore
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function addAdminToFirestore() {
    console.log('📝 Adding Admin User to Firestore');
    console.log('==================================');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('🔐 Signing in to get user ID...');

        // Sign in to get the user ID
        const userCredential = await signInWithEmailAndPassword(
            auth,
            'admin@elightsofa.com',
            'admin123'
        );

        const user = userCredential.user;
        console.log('✅ Signed in successfully. User ID:', user.uid);

        // Check if user document already exists
        console.log('🔍 Checking if user document exists in Firestore...');
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            console.log('ℹ️  User document already exists in Firestore!');
            console.log('📄 Current document:', userDocSnap.data());
            return;
        }

        console.log('📝 Creating user document in Firestore...');

        // Create the user document
        const userDoc = {
            id: user.uid,
            email: user.email,
            name: 'System Administrator',
            role: 'admin',
            status: 'active',
            profile: {
                department: 'Management',
                position: 'System Administrator',
                phone: '+1-555-123-4567'
            },
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'inventory.read', 'inventory.write', 'inventory.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            orders: 0,
            totalSpent: 0
        };

        await setDoc(userDocRef, userDoc);

        console.log('🎉 SUCCESS! Admin user document created in Firestore');
        console.log('');
        console.log('📋 User Details:');
        console.log('   User ID:', user.uid);
        console.log('   Email:', user.email);
        console.log('   Name: System Administrator');
        console.log('   Role: admin');
        console.log('   Status: active');
        console.log('');
        console.log('✅ You can now login at: http://localhost:3000/auth/login');
        console.log('🔐 Credentials: admin@elightsofa.com / admin123');

        // Sign out
        await auth.signOut();

    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('');
            console.log('❌ Admin user not found in Firebase Auth!');
            console.log('💡 Run this command first: npm run create-firebase-admin');
        } else if (error.code === 'auth/wrong-password') {
            console.log('');
            console.log('❌ Wrong password for admin user!');
            console.log('💡 The admin user exists but password might be different');
        } else {
            console.log('');
            console.log('💡 Possible solutions:');
            console.log('1. Check your Firebase project settings');
            console.log('2. Verify Firestore is enabled');
            console.log('3. Check your internet connection');
            console.log('4. Verify the admin user exists in Firebase Auth');
        }
    }
}

addAdminToFirestore();