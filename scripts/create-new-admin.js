// Create a brand new admin account - simple and clean
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

// NEW ADMIN CREDENTIALS - completely fresh
const NEW_ADMIN_EMAIL = 'newadmin@elightsofa.com';
const NEW_ADMIN_PASSWORD = 'newadmin123';

async function createNewAdmin() {
    console.log('🚀 Creating Brand New Admin Account');
    console.log('====================================');
    console.log('Email:', NEW_ADMIN_EMAIL);
    console.log('Password:', NEW_ADMIN_PASSWORD);
    console.log('');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('🔐 Creating Firebase Auth user...');

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            NEW_ADMIN_EMAIL,
            NEW_ADMIN_PASSWORD
        );

        const user = userCredential.user;
        console.log('✅ Firebase Auth user created:', user.uid);

        // Update display name
        await updateProfile(user, {
            displayName: 'New Admin'
        });
        console.log('✅ Display name set');

        console.log('📝 Creating Firestore document...');

        // Create Firestore document
        const userDoc = {
            id: user.uid,
            email: user.email,
            name: 'New Admin',
            role: 'admin',
            status: 'active',
            profile: {
                department: 'Management',
                position: 'Administrator',
                phone: '+1-555-999-0000'
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

        await setDoc(doc(db, 'users', user.uid), userDoc);
        console.log('✅ Firestore document created');

        // Sign out
        await auth.signOut();

        console.log('');
        console.log('🎉 SUCCESS! New admin account created');
        console.log('');
        console.log('🔐 NEW ADMIN CREDENTIALS:');
        console.log('   Email:', NEW_ADMIN_EMAIL);
        console.log('   Password:', NEW_ADMIN_PASSWORD);
        console.log('');
        console.log('🔗 LOGIN NOW:');
        console.log('   http://localhost:3000/auth/login');
        console.log('');
        console.log('✨ Use these credentials to login immediately!');

    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('');
            console.log('✅ Account already exists! Use these credentials:');
            console.log('   Email:', NEW_ADMIN_EMAIL);
            console.log('   Password:', NEW_ADMIN_PASSWORD);
        } else {
            console.log('');
            console.log('💡 Check:');
            console.log('1. Internet connection');
            console.log('2. Firebase project settings');
            console.log('3. Authentication enabled in Firebase Console');
        }
    }
}

createNewAdmin();