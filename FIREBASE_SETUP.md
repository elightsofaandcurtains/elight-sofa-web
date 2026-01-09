# Firebase Configuration Guide for Elight Sofa House

## 1. Firebase Console Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `elight-sofa-house`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Setup Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

### Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. App nickname: `elight-sofa-house-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object

## 2. Environment Variables Setup

Create a `.env.local` file in your project root with your Firebase config:

```env
# Firebase Configuration
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

## 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    // Products - public read, admin/manager write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    // Admin only collections
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        && collection in ['employees', 'inventory', 'payments', 'invoices', 'analytics'];
    }
    
    // Inquiries - authenticated users can create, admin can manage
    match /inquiries/{inquiryId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
  }
}
```

## 4. Initial Data Setup

After setting up Firestore, you'll need to create an admin user manually:

1. Go to Authentication in Firebase Console
2. Click "Add user"
3. Email: `admin@elightsofa.com`
4. Password: `admin123`
5. Click "Add user"

Then create the user document in Firestore:
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: (use the UID from Authentication)
5. Add fields as shown in the user document structure

## 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Go to `/auth/login`
3. Use the admin credentials to test login
4. Check if you can access the admin panel

## 6. Production Deployment

For production:
1. Change Firestore rules to production mode
2. Set up proper environment variables in your hosting platform
3. Configure Firebase hosting (optional)
4. Set up backup and monitoring

## Troubleshooting

- If you get CORS errors, check your Firebase project settings
- If authentication fails, verify your API keys in `.env.local`
- If Firestore operations fail, check your security rules
- Make sure all environment variables start with `NEXT_PUBLIC_` for client-side access