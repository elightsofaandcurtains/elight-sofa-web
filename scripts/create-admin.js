// Script to create the first admin account
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Admin user details
const ADMIN_USER = {
    email: 'admin@elightsofa.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    department: 'Management',
    position: 'System Administrator'
};

async function createAdminAccount() {
    try {
        console.log('🚀 Initializing Firebase...');

        // Check if Firebase is configured
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo_api_key') {
            console.log('⚠️  Firebase not configured. Using mock authentication.');
            console.log('📝 Mock admin credentials:');
            console.log(`   Email: ${ADMIN_USER.email}`);
            console.log(`   Password: ${ADMIN_USER.password}`);
            console.log('✅ Mock admin account ready for use!');
            return;
        }

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('👤 Creating admin user account...');

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            ADMIN_USER.email,
            ADMIN_USER.password
        );
        const user = userCredential.user;

        console.log(`✅ Firebase Auth user created: ${user.uid}`);

        // Update display name
        await updateProfile(user, {
            displayName: ADMIN_USER.name
        });

        console.log('📝 Creating user profile in Firestore...');

        // Create user document in Firestore
        const userDoc = {
            id: user.uid,
            email: user.email,
            name: ADMIN_USER.name,
            role: ADMIN_USER.role,
            status: 'active',
            profile: {
                department: ADMIN_USER.department,
                position: ADMIN_USER.position
            },
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            orders: 0,
            totalSpent: 0
        };

        await setDoc(doc(db, 'users', user.uid), userDoc);

        console.log('🎉 Admin account created successfully!');
        console.log('📋 Admin Details:');
        console.log(`   Email: ${ADMIN_USER.email}`);
        console.log(`   Password: ${ADMIN_USER.password}`);
        console.log(`   Name: ${ADMIN_USER.name}`);
        console.log(`   Role: ${ADMIN_USER.role}`);
        console.log(`   User ID: ${user.uid}`);
        console.log('');
        console.log('🔐 You can now login with these credentials at /auth/login');
        console.log('⚡ Access the admin panel at /admin');

    } catch (error) {
        console.error('❌ Error creating admin account:', error);

        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️  Admin account already exists!');
            console.log('📋 Use these credentials to login:');
            console.log(`   Email: ${ADMIN_USER.email}`);
            console.log(`   Password: ${ADMIN_USER.password}`);
        } else {
            console.log('💡 Possible solutions:');
            console.log('   1. Check your Firebase configuration in .env.local');
            console.log('   2. Ensure Firebase Auth is enabled in your project');
            console.log('   3. Verify Firestore is set up correctly');
            console.log('   4. Check your internet connection');
        }
    }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the script
createAdminAccount();