// Simple admin creation - bypasses Firestore rules issue
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } = require('firebase/auth');
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

// SIMPLE ADMIN CREDENTIALS
const ADMIN_EMAIL = 'superadmin@elightsofa.com';
const ADMIN_PASSWORD = 'superadmin123';

async function createAdminSimple() {
    console.log('🚀 Creating Super Admin Account');
    console.log('===============================');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('🔐 Step 1: Creating Firebase Auth user...');

        let user;
        try {
            // Try to create new user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                ADMIN_EMAIL,
                ADMIN_PASSWORD
            );
            user = userCredential.user;
            console.log('✅ New Firebase Auth user created:', user.uid);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('ℹ️  User already exists, signing in...');
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    ADMIN_EMAIL,
                    ADMIN_PASSWORD
                );
                user = userCredential.user;
                console.log('✅ Signed in to existing user:', user.uid);
            } else {
                throw error;
            }
        }

        // Update display name
        await updateProfile(user, {
            displayName: 'Super Admin'
        });
        console.log('✅ Display name updated');

        console.log('📝 Step 2: Creating Firestore document...');
        console.log('⚠️  Note: If this fails due to permissions, you need to temporarily update Firestore rules');

        try {
            // Create Firestore document
            const userDoc = {
                id: user.uid,
                email: user.email,
                name: 'Super Admin',
                role: 'admin',
                status: 'active',
                profile: {
                    department: 'Management',
                    position: 'Super Administrator',
                    phone: '+1-555-000-0000'
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
            console.log('✅ Firestore document created successfully');

        } catch (firestoreError) {
            console.log('❌ Firestore permission error:', firestoreError.message);
            console.log('');
            console.log('🔧 MANUAL FIX REQUIRED:');
            console.log('1. Go to Firebase Console: https://console.firebase.google.com');
            console.log('2. Select your project: elight-sofa');
            console.log('3. Go to Firestore Database > Rules');
            console.log('4. Temporarily replace rules with:');
            console.log('');
            console.log('rules_version = \'2\';');
            console.log('service cloud.firestore {');
            console.log('  match /databases/{database}/documents {');
            console.log('    match /{document=**} {');
            console.log('      allow read, write: if request.auth != null;');
            console.log('    }');
            console.log('  }');
            console.log('}');
            console.log('');
            console.log('5. Click "Publish"');
            console.log('6. Run this script again: npm run create-admin-simple');
            console.log('7. After success, restore original rules from firestore.rules file');
            console.log('');
            console.log('⚠️  Firebase Auth user was created successfully, just need Firestore document');
            return;
        }

        // Sign out
        await auth.signOut();

        console.log('');
        console.log('🎉 SUCCESS! Super admin account created');
        console.log('');
        console.log('🔐 LOGIN CREDENTIALS:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('');
        console.log('🔗 LOGIN NOW:');
        console.log('   http://localhost:3000/auth/login');
        console.log('');
        console.log('✨ DONE! Use these credentials to login immediately!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('💡 Check:');
        console.log('1. Internet connection');
        console.log('2. Firebase project exists and is active');
        console.log('3. Authentication is enabled in Firebase Console');
    }
}

createAdminSimple();