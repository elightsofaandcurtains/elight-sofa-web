// Fix admin user - handles existing user with different password
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } = require('firebase/auth');
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

async function fixAdminUser() {
    console.log('🔧 Fixing Admin User Setup');
    console.log('===========================');
    console.log('');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('🔍 Checking admin user status...');

        // Try different common passwords
        const possiblePasswords = ['admin123', 'password', '123456', 'admin', 'elightsofa123'];
        let user = null;
        let workingPassword = null;

        for (const password of possiblePasswords) {
            try {
                console.log(`🔐 Trying password: ${password.replace(/./g, '*')}`);
                const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
                user = userCredential.user;
                workingPassword = password;
                console.log(`✅ Found working password: ${password}`);
                break;
            } catch (error) {
                // Continue to next password
            }
        }

        if (!user) {
            console.log('❌ Could not sign in with any common passwords');
            console.log('');
            console.log('🔄 Sending password reset email...');

            try {
                await sendPasswordResetEmail(auth, ADMIN_EMAIL);
                console.log('✅ Password reset email sent to:', ADMIN_EMAIL);
                console.log('');
                console.log('📧 Next steps:');
                console.log('1. Check your email for the password reset link');
                console.log('2. Reset the password to: admin123');
                console.log('3. Run this script again: npm run setup-complete-admin');
                return;
            } catch (resetError) {
                console.log('❌ Could not send password reset email:', resetError.message);
                console.log('');
                console.log('💡 Manual solution:');
                console.log('1. Go to Firebase Console: https://console.firebase.google.com');
                console.log('2. Select your project: elight-sofa');
                console.log('3. Go to Authentication > Users');
                console.log('4. Find admin@elightsofa.com and reset password to: admin123');
                console.log('5. Run: npm run setup-complete-admin');
                return;
            }
        }

        console.log('✅ Successfully signed in as:', user.email);
        console.log('🆔 User ID:', user.uid);

        // Now check/create Firestore document
        console.log('📝 Checking Firestore document...');
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            console.log('✅ Firestore document already exists');
            const userData = userDocSnap.data();
            console.log('📄 User data:', {
                name: userData.name,
                role: userData.role,
                status: userData.status
            });
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
            console.log('✅ Firestore document created successfully');
        }

        // Sign out
        await auth.signOut();

        console.log('');
        console.log('🎉 SUCCESS! Admin user is now properly set up');
        console.log('');
        console.log('🔐 Login Credentials:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', workingPassword);
        console.log('');
        console.log('🔗 Test your login:');
        console.log('   Login page: http://localhost:3000/auth/login');
        console.log('   Debug page: http://localhost:3000/debug-auth');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('💡 Manual steps to fix:');
        console.log('1. Go to Firebase Console');
        console.log('2. Authentication > Users');
        console.log('3. Delete the existing admin@elightsofa.com user');
        console.log('4. Run: npm run setup-complete-admin');
    }
}

fixAdminUser();