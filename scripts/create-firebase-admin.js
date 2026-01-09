// Create admin user in Firebase
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

async function createFirebaseAdmin() {
    console.log('🔥 Creating Firebase Admin User');
    console.log('================================');

    try {
        // Check configuration
        if (!firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project') {
            console.log('❌ Firebase not properly configured');
            console.log('Please check your .env.local file');
            return;
        }

        console.log('✅ Firebase config found for project:', firebaseConfig.projectId);

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('🔥 Creating Firebase Auth user...');

        // Create user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            'admin@elightsofa.com',
            'admin123'
        );

        const user = userCredential.user;
        console.log('✅ Firebase Auth user created:', user.uid);

        // Update profile
        await updateProfile(user, {
            displayName: 'System Administrator'
        });

        console.log('📝 Creating Firestore user document...');

        // Create Firestore document
        const userDoc = {
            id: user.uid,
            email: user.email,
            name: 'System Administrator',
            role: 'admin',
            status: 'active',
            profile: {
                department: 'Management',
                position: 'System Administrator'
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

        console.log('🎉 SUCCESS! Admin user created in Firebase');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   Email: admin@elightsofa.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('🔗 You can now login at: http://localhost:3000/auth/login');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('');
            console.log('ℹ️  Admin user already exists in Firebase!');
            console.log('📋 Use these credentials:');
            console.log('   Email: admin@elightsofa.com');
            console.log('   Password: admin123');
        } else if (error.code === 'auth/weak-password') {
            console.log('❌ Password too weak. Please use a stronger password.');
        } else {
            console.log('');
            console.log('💡 Possible solutions:');
            console.log('1. Check your Firebase project settings');
            console.log('2. Enable Authentication in Firebase Console');
            console.log('3. Enable Email/Password provider');
            console.log('4. Check your internet connection');
        }
    }
}

createFirebaseAdmin();