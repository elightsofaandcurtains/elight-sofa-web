# Complete Firebase Setup Guide for Elight Sofa House

## 🚀 Quick Start

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `elight-sofa-house`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Step 3: Setup Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

### Step 4: Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. App nickname: `elight-sofa-house-web`
5. Click "Register app"
6. Copy the configuration object

### Step 5: Configure Environment Variables
Create `.env.local` file in your project root:

```env
# Firebase Configuration (Replace with your actual values)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=Elight Sofa House
NEXT_PUBLIC_COMPANY_EMAIL=info@elightsofahouse.com
NEXT_PUBLIC_COMPANY_PHONE=+1-555-123-4567
```

### Step 6: Deploy Firestore Security Rules
1. In Firebase Console → Firestore Database
2. Go to "Rules" tab
3. Replace the default rules with the content from `firestore.rules`
4. Click "Publish"

### Step 7: Initialize Sample Data (Optional)
For development and testing, you can initialize sample data:

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin --save-dev
```

2. Download Service Account Key:
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `scripts/serviceAccountKey.json`

3. Run initialization script:
```bash
npm run init-firebase
```

This will create:
- Admin user: `admin@elightsofa.com` / `admin123`
- Manager user: `manager@elightsofa.com` / `manager123`
- Staff user: `staff@elightsofa.com` / `staff123`
- Sample categories and company settings

## 🔧 Manual Setup (Alternative)

If you prefer manual setup, create these users in Firebase Console:

### Create Admin User
1. Go to Authentication → Users
2. Click "Add user"
3. Email: `admin@elightsofa.com`
4. Password: `admin123`
5. Click "Add user"

### Create User Document in Firestore
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: (use the UID from Authentication)
5. Add these fields:

```json
{
  "id": "user_uid_here",
  "email": "admin@elightsofa.com",
  "name": "Admin User",
  "role": "admin",
  "status": "active",
  "permissions": [
    "users.read", "users.write", "users.delete",
    "products.read", "products.write", "products.delete",
    "employees.read", "employees.write", "employees.delete",
    "invoices.read", "invoices.write", "invoices.delete",
    "payments.read", "payments.write", "payments.delete",
    "inventory.read", "inventory.write", "inventory.delete",
    "analytics.read", "settings.read", "settings.write"
  ],
  "orders": 0,
  "totalSpent": 0,
  "profile": {
    "phone": "+1-555-123-4567",
    "department": "management",
    "position": "System Administrator"
  }
}
```

## 🧪 Testing the Setup

1. Start your development server:
```bash
npm run dev
```

2. Go to `http://localhost:3000/auth/login`

3. Use these credentials to test:
   - **Admin**: `admin@elightsofa.com` / `admin123`
   - **Manager**: `manager@elightsofa.com` / `manager123`
   - **Staff**: `staff@elightsofa.com` / `staff123`

4. Verify you can access the admin panel at `/admin`

## 🔒 Security Rules Explanation

The Firestore security rules implement role-based access control:

- **Admin**: Full access to all collections
- **Manager**: Can manage products, employees, invoices, payments, inventory
- **Staff**: Can read most data, create/update invoices and payments
- **Customer**: Can read products, create inquiries and orders

## 📊 Collections Structure

### Users Collection (`/users/{userId}`)
- User profiles with roles and permissions
- Authentication data linked to Firebase Auth

### Products Collection (`/products/{productId}`)
- Product catalog (publicly readable)
- Admin/Manager can manage

### Employees Collection (`/employees/{employeeId}`)
- Employee records
- Admin/Manager access only

### Invoices Collection (`/invoices/{invoiceId}`)
- Invoice management
- Staff+ can create/update, Admin can delete

### Payments Collection (`/payments/{paymentId}`)
- Payment tracking
- Staff+ access

### Inventory Collections
- `/inventory/{itemId}` - General inventory
- `/raw-materials/{materialId}` - Raw materials
- `/shop-materials/{materialId}` - Shop materials

### Analytics Collection (`/analytics/{reportId}`)
- Business analytics and reports
- Admin/Manager read access

## 🚀 Production Deployment

### 1. Update Security Rules
Change Firestore rules from "test mode" to production mode:

```javascript
// Remove this rule in production:
allow read, write: if request.time < timestamp.date(2024, 12, 31);
```

### 2. Environment Variables
Set up environment variables in your hosting platform (Vercel, Netlify, etc.)

### 3. Firebase Hosting (Optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 4. Monitoring and Backup
- Enable Firebase Performance Monitoring
- Set up Firestore backup schedules
- Configure error reporting

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check Firebase project settings
   - Verify domain is authorized

2. **Authentication Fails**
   - Verify API keys in `.env.local`
   - Check if Email/Password provider is enabled

3. **Firestore Permission Denied**
   - Check security rules
   - Verify user has correct role in user document

4. **Environment Variables Not Loading**
   - Ensure variables start with `NEXT_PUBLIC_`
   - Restart development server after changes

### Debug Mode:
Add this to your `.env.local` for debugging:
```env
NEXT_PUBLIC_DEBUG_FIREBASE=true
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase Console for authentication/database issues
3. Review the security rules in Firestore
4. Check that all environment variables are set correctly

## 🎯 Next Steps

After Firebase is configured:
1. Test all authentication flows
2. Verify admin panel access control
3. Test CRUD operations for all entities
4. Set up production environment
5. Configure monitoring and analytics