// Firebase Initialization Script
// Run this script after setting up Firebase to create initial data

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Console

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

async function initializeFirebase() {
    console.log('🚀 Initializing Firebase with sample data...');

    try {
        // Create admin user
        console.log('👤 Creating admin user...');
        const adminUser = await auth.createUser({
            email: 'admin@elightsofa.com',
            password: 'admin123',
            displayName: 'Admin User',
            emailVerified: true
        });

        // Create admin user document
        await db.collection('users').doc(adminUser.uid).set({
            id: adminUser.uid,
            email: 'admin@elightsofa.com',
            name: 'Admin User',
            role: 'admin',
            status: 'active',
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'products.read', 'products.write', 'products.delete',
                'employees.read', 'employees.write', 'employees.delete',
                'invoices.read', 'invoices.write', 'invoices.delete',
                'payments.read', 'payments.write', 'payments.delete',
                'inventory.read', 'inventory.write', 'inventory.delete',
                'analytics.read', 'settings.read', 'settings.write'
            ],
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            orders: 0,
            totalSpent: 0,
            profile: {
                phone: '+1-555-123-4567',
                department: 'management',
                position: 'System Administrator'
            }
        });

        // Create manager user
        console.log('👤 Creating manager user...');
        const managerUser = await auth.createUser({
            email: 'manager@elightsofa.com',
            password: 'manager123',
            displayName: 'Manager User',
            emailVerified: true
        });

        await db.collection('users').doc(managerUser.uid).set({
            id: managerUser.uid,
            email: 'manager@elightsofa.com',
            name: 'Manager User',
            role: 'manager',
            status: 'active',
            permissions: [
                'users.read', 'users.write',
                'products.read', 'products.write',
                'employees.read', 'employees.write',
                'invoices.read', 'invoices.write',
                'payments.read', 'payments.write',
                'inventory.read', 'inventory.write',
                'analytics.read'
            ],
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            orders: 0,
            totalSpent: 0,
            profile: {
                phone: '+1-555-123-4568',
                department: 'management',
                position: 'Operations Manager'
            }
        });

        // Create staff user
        console.log('👤 Creating staff user...');
        const staffUser = await auth.createUser({
            email: 'staff@elightsofa.com',
            password: 'staff123',
            displayName: 'Staff User',
            emailVerified: true
        });

        await db.collection('users').doc(staffUser.uid).set({
            id: staffUser.uid,
            email: 'staff@elightsofa.com',
            name: 'Staff User',
            role: 'staff',
            status: 'active',
            permissions: [
                'products.read',
                'invoices.read', 'invoices.write',
                'payments.read',
                'inventory.read'
            ],
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            orders: 0,
            totalSpent: 0,
            profile: {
                phone: '+1-555-123-4569',
                department: 'sales',
                position: 'Sales Associate'
            }
        });

        // Create sample categories
        console.log('📂 Creating product categories...');
        const categories = [
            { id: 'sofas', name: 'Sofas', description: 'Comfortable seating solutions', active: true },
            { id: 'chairs', name: 'Chairs', description: 'Individual seating options', active: true },
            { id: 'tables', name: 'Tables', description: 'Dining and coffee tables', active: true },
            { id: 'bedroom', name: 'Bedroom', description: 'Bedroom furniture', active: true },
            { id: 'curtains', name: 'Curtains', description: 'Window treatments', active: true }
        ];

        for (const category of categories) {
            await db.collection('categories').doc(category.id).set({
                ...category,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Create company settings
        console.log('⚙️ Creating company settings...');
        await db.collection('company-settings').doc('general').set({
            companyName: 'Elight Sofa House',
            email: 'info@elightsofahouse.com',
            phone: '+1-555-123-4567',
            address: '123 Furniture Street, Design City, DC 12345',
            website: 'https://elightsofahouse.com',
            taxRate: 0.08,
            currency: 'USD',
            timezone: 'America/New_York',
            businessHours: {
                monday: { open: '09:00', close: '18:00' },
                tuesday: { open: '09:00', close: '18:00' },
                wednesday: { open: '09:00', close: '18:00' },
                thursday: { open: '09:00', close: '18:00' },
                friday: { open: '09:00', close: '18:00' },
                saturday: { open: '10:00', close: '16:00' },
                sunday: { closed: true }
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Firebase initialization completed successfully!');
        console.log('📧 Admin credentials: admin@elightsofa.com / admin123');
        console.log('📧 Manager credentials: manager@elightsofa.com / manager123');
        console.log('📧 Staff credentials: staff@elightsofa.com / staff123');

    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
    }

    process.exit(0);
}

// Run the initialization
initializeFirebase();