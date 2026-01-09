// Complete admin setup - creates both Firebase Auth user and Firestore document
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } = require('firebase/auth');
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

const ADMIN_EMAIL = 'admin@elightsofa.com';
const ADMIN_PASSWORD = 'admin123';

async function setupCompleteAdmin() {
    console.log('🚀 Complete Admin Setup');
    console.log('=======================');
    console.log('This will create both Firebase Auth user and Firestore document');
    console.log('');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        let user;
        let userCreated = false;

        // Step 1: Try to sign in (check if user exists)
        console.log('🔍 Step 1: Checking if admin user exists...');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            user = userCredential.user;
            console.log('✅ Admin user exists in Firebase Auth:', user.uid);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log('ℹ️  Admin user not found, creating new user...');

                // Step 2: Create Firebase Auth user
                console.log('🔐 Step 2: Creating Firebase Auth user...');
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                    user = userCredential.user;
                    userCreated = true;
                    console.log('✅ Firebase Auth user created:', user.uid);

                    // Update display name
                    await updateProfile(user, {
                        displayName: 'System Administrator'
                    });
                    console.log('✅ Display name updated');

                } catch (createError) {
                    if (createError.code === 'auth/email-already-in-use') {
                        console.log('⚠️  User exists but password might be different');
                        console.log('💡 Try resetting password in Firebase Console or use different credentials');
                        return;
                    }
                    throw createError;
                }
            } else {
                throw error;
            }
        }

        // Step 3: Check/Create Firestore document
        console.log('📝 Step 3: Checking Firestore document...');
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            console.log('✅ Firestore document already exists');
            console.log('📄 Current document:', JSON.stringify(userDocSnap.data(), null, 2));
        } else {
            console.log('📝 Creating Firestore document...');

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
            console.log('✅ Firestore document created');
        }

        // Step 4: Final verification
        console.log('🔍 Step 4: Final verification...');
        try {
            // Sign out first
            await auth.signOut();

            // Try to sign in again
            const testCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            const testUser = testCredential.user;

            // Get the Firestore document
            const testDocSnap = await getDoc(doc(db, 'users', testUser.uid));

            if (testDocSnap.exists()) {
                const userData = testDocSnap.data();
                console.log('🎉 SUCCESS! Complete admin setup verified');
                console.log('');
                console.log('📋 Admin Account Details:');
                console.log('   User ID:', testUser.uid);
                console.log('   Email:', testUser.email);
                console.log('   Name:', userData.name);
                console.log('   Role:', userData.role);
                console.log('   Status:', userData.status);
                console.log('   Permissions:', userData.permissions.length, 'permissions');
                console.log('');
                console.log('🔐 Login Credentials:');
                console.log('   Email:', ADMIN_EMAIL);
                console.log('   Password:', ADMIN_PASSWORD);
                console.log('');
                console.log('🔗 Login URL: http://localhost:3000/auth/login');
                console.log('🔗 Debug URL: http://localhost:3000/debug-auth');

                // Sign out
                await auth.signOut();
            } else {
                console.log('❌ Verification failed: Firestore document not found');
            }

        } catch (verifyError) {
            console.log('❌ Verification failed:', verifyError.message);
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('💡 Troubleshooting:');
        console.log('1. Check your Firebase project settings');
        console.log('2. Ensure Authentication is enabled in Firebase Console');
        console.log('3. Enable Email/Password provider');
        console.log('4. Ensure Firestore is enabled');
        console.log('5. Check your internet connection');
    }
}

setupCompleteAdmin();