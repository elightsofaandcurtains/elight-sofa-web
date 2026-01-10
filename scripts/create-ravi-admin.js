// Create admin user: sabhadiyaravi2@gmail.com
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

const ADMIN_EMAIL = 'sabhadiyaravi2@gmail.com';
const ADMIN_PASSWORD = 'Ravi@2026';
const ADMIN_NAME = 'Ravi Sabhadiya';

async function createAdmin() {
    console.log('🔧 Creating Admin User\n');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Name:', ADMIN_NAME);

    try {
        // Create Firebase Auth user
        console.log('\n📝 Creating Firebase Auth user...');
        const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        const user = userCredential.user;
        console.log('✅ Firebase Auth user created:', user.uid);

        // Update profile
        await updateProfile(user, { displayName: ADMIN_NAME });
        console.log('✅ Profile updated');

        // Create Firestore document
        console.log('\n📄 Creating Firestore document...');
        const userDoc = {
            id: user.uid,
            email: ADMIN_EMAIL,
            name: ADMIN_NAME,
            fullName: ADMIN_NAME,
            role: 'admin',
            status: 'active',
            phone: '',
            department: 'Management',
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'inventory.read', 'inventory.write', 'inventory.delete',
                'analytics.read', 'settings.read', 'settings.write',
                'suppliers.read', 'suppliers.write', 'suppliers.delete'
            ],
            orders: 0,
            totalSpent: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        };

        await setDoc(doc(db, 'users', user.uid), userDoc);
        console.log('✅ Firestore document created');

        console.log('\n========================================');
        console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
        console.log('========================================');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Password: Ravi@2026');
        console.log('Role: admin');
        console.log('========================================');
        console.log('\nYou can now login with these credentials.');

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('\n⚠️ User already exists! Trying to update Firestore document...');

            // Just create/update the Firestore document
            try {
                const userDoc = {
                    email: ADMIN_EMAIL,
                    name: ADMIN_NAME,
                    fullName: ADMIN_NAME,
                    role: 'admin',
                    status: 'active',
                    phone: '',
                    department: 'Management',
                    permissions: [
                        'users.read', 'users.write', 'users.delete',
                        'products.read', 'products.write', 'products.delete',
                        'employees.read', 'employees.write', 'employees.delete',
                        'invoices.read', 'invoices.write', 'invoices.delete',
                        'payments.read', 'payments.write', 'payments.delete',
                        'inventory.read', 'inventory.write', 'inventory.delete',
                        'analytics.read', 'settings.read', 'settings.write',
                        'suppliers.read', 'suppliers.write', 'suppliers.delete'
                    ],
                    updatedAt: serverTimestamp()
                };

                // We need the UID - try signing in
                const { signInWithEmailAndPassword } = require('firebase/auth');
                const signInResult = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                await setDoc(doc(db, 'users', signInResult.user.uid), userDoc, { merge: true });

                console.log('✅ Firestore document updated');
                console.log('\n✅ User exists and is ready to use!');
                console.log('Email:', ADMIN_EMAIL);
                console.log('Password: Ravi@2026');
            } catch (updateError) {
                console.error('❌ Error updating:', updateError.message);
            }
        } else {
            console.error('\n❌ Error:', error.message);
            console.error('Code:', error.code);
        }
    }

    process.exit(0);
}

createAdmin();
