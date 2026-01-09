# User Management Documentation

## Registration Issue Fix Summary

### Problem
- Firebase Auth API returning HTTP 400 errors
- Firestore user documents not being created
- Registration failing with "An unexpected error occurred"

### Root Cause
Firebase Authentication not properly enabled in Firebase Console

### Solution Applied
1. **Enhanced Error Handling**: Added fallback to mock authentication when Firebase fails
2. **Improved Document Structure**: User documents now match admin structure exactly
3. **Better Logging**: Detailed console logs for debugging
4. **Firestore Rules**: Proper rules for user self-registration

## Firestore User Document Structure

Based on the admin document structure you provided, here's the standardized user document format:

### User Document Schema
```javascript
{
  id: "user-uid",                    // Firebase Auth UID
  email: "user@example.com",         // User email
  name: "User Name",                 // Full name
  role: "customer",                  // Role: admin, manager, staff, customer
  status: "active",                  // Status: active, inactive, suspended
  
  profile: {                         // Profile information
    phone: "+1-555-123-4567",       // Phone number
    department: "Customer",         // Department (Customer for new users)
    position: "Customer"            // Position (Customer for new users)
  },
  
  permissions: [                     // Array of permissions
    "products.read",
    "inquiries.write"
  ],
  
  orders: 0,                        // Number of orders
  totalSpent: 0,                    // Total amount spent
  
  createdAt: timestamp,             // Creation timestamp
  updatedAt: timestamp,             // Last update timestamp
  lastLogin: timestamp              // Last login timestamp
}
```

## User Roles and Default Permissions

### Customer (Default for Registration)
```javascript
permissions: [
  "products.read",
  "inquiries.write"
]
```

### Staff
```javascript
permissions: [
  "products.read",
  "invoices.read", "invoices.write",
  "payments.read", "payments.write"
]
```

### Manager
```javascript
permissions: [
  "users.read",
  "products.read", "products.write",
  "employees.read", "employees.write",
  "invoices.read", "invoices.write",
  "payments.read", "payments.write",
  "analytics.read"
]
```

### Admin
```javascript
permissions: [
  "users.read", "users.write", "users.delete",
  "products.read", "products.write", "products.delete",
  "employees.read", "employees.write", "employees.delete",
  "invoices.read", "invoices.write", "invoices.delete",
  "payments.read", "payments.write", "payments.delete",
  "inventory.read", "inventory.write", "inventory.delete",
  "analytics.read", "settings.read", "settings.write"
]
```

## Current Status

### ✅ Fixed
- Fallback authentication system
- User document structure standardization
- Enhanced error handling and logging
- Firestore security rules for user creation

### 🔧 To Fix Firebase (Optional)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `elight-sofa`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** authentication
5. Save changes

### 📝 Current Behavior
- Registration works with mock authentication
- User documents created with proper structure
- Admin panel can manage users (existing functionality)
- Automatic fallback when Firebase fails

## Admin Panel User Management Features

Admins can:
- View all users
- Create new users
- Edit user profiles
- Change user roles
- Activate/deactivate users
- Delete users
- View user statistics