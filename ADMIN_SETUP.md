# Admin Account Setup

## 🎯 Quick Start

Your admin account is ready to use! Here are the credentials:

### Admin Account
- **Email:** `admin@elightsofa.com`
- **Password:** `admin123`
- **Role:** Administrator (Full Access)

### Additional Demo Accounts
- **Manager:** `manager@elightsofa.com` / `manager123`
- **Staff:** `staff@elightsofa.com` / `staff123`

## 🚀 How to Access

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Login Page:**
   - Go to: http://localhost:3000/auth/login
   - Use admin credentials above

3. **Admin Panel:**
   - Direct access: http://localhost:3000/admin
   - Or login first, then navigate to admin panel

## 🛠️ Available Commands

```bash
# Show admin setup information
npm run setup-admin

# Create admin account in Firebase (when configured)
npm run create-admin

# Start development server
npm run dev
```

## 🔧 Features Available

### ✅ Authentication System
- User registration with role assignment
- Secure login/logout
- Password reset functionality
- Role-based access control

### ✅ Admin Panel Features
- **User Management:** Create, edit, delete users
- **Role Management:** Assign roles (Admin, Manager, Staff, Customer)
- **Permission System:** Granular permissions per role
- **User Search & Filtering:** Find users by name, email, role, status
- **Bulk Operations:** Update multiple users at once

### ✅ User Roles & Permissions

#### Admin (Full Access)
- All user management operations
- All product management
- All system settings
- Analytics access
- Employee management

#### Manager
- User viewing
- Product management
- Employee management
- Invoice & payment management
- Analytics access

#### Staff
- Product viewing
- Invoice & payment management
- Basic operations

#### Customer
- Product browsing
- Inquiry submission

## 🎨 Pages Available

- `/auth/login` - Login page
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset
- `/auth/demo` - Demo page with all credentials
- `/admin` - Admin panel (protected)
- `/admin?tab=users` - User management

## 🔐 Security Features

- Firebase Authentication integration
- Firestore security rules
- Role-based route protection
- Permission-based UI rendering
- Secure password handling

## 📝 Notes

- The system works with both Firebase (production) and mock authentication (development)
- All demo credentials are displayed on the login page
- Admin can create new users directly from the admin panel
- No need to contact admin for account creation - self-service registration available

## 🎉 Ready to Use!

Your authentication system is fully functional. Login with the admin credentials and start managing users!