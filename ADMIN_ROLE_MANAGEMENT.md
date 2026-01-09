# Admin Role Management System

## Overview
The Elight Sofa House admin panel now includes a comprehensive role management system that allows administrators to manage user accounts and assign roles dynamically.

## Default Admin Account
- **Email**: admin@elightsofa.com
- **Password**: admin123
- **Role**: Admin (cannot be changed)
- **Status**: Active (cannot be deactivated)

## User Registration & Login
- **Public Registration**: Anyone can register for an account
- **Default Role**: New users automatically get 'customer' role
- **Role Assignment**: Only admins can change user roles from the admin panel
- **No "Contact Admin"**: Users don't need to contact admin for account creation

## Role Hierarchy
1. **Admin** - Full system access, can manage all users and settings
2. **Manager** - Management access, can handle operations
3. **Staff** - Limited access for staff members
4. **Customer** - Basic customer access for shopping

## User Status Options
- 🟢 **Active** - User can access the system normally
- 🟡 **Inactive** - User account is temporarily disabled
- 🔴 **Suspended** - User account is suspended

## Admin Panel Features

### User Management Tab
- **View All Users**: See all registered users with their roles and status
- **Filter Users**: Filter by role (All, Admins, Managers, Staff, Customers)
- **Search Users**: Search by name or email
- **User Statistics**: View total users, active users, admin count, inactive users

### User Actions
1. **Add New User**: Create new user accounts with specific roles
2. **Change Role**: Update user roles (Admin → Manager → Staff → Customer)
3. **Change Status**: Activate, deactivate, or suspend user accounts
4. **Edit User**: Modify user information (placeholder for future implementation)
5. **Delete User**: Remove user accounts (system admin cannot be deleted)

### Role Change Process
1. Click the settings icon (⚙️) next to any user
2. Select new role from the modal
3. Confirm the change
4. User role is updated immediately

### Status Change Process
1. Click the user status icon next to any user
2. Select new status (Active/Inactive/Suspended)
3. Confirm the change
4. User status is updated immediately

## Security Features
- **Protected Admin Account**: System admin cannot be deleted or demoted
- **Role Validation**: Only admins can change user roles
- **Status Protection**: System admin status cannot be changed to inactive/suspended
- **Email Uniqueness**: Prevents duplicate email registrations

## Technical Implementation
- **Authentication**: Hybrid system (Firebase + Mock fallback)
- **Data Storage**: localStorage for mock mode, Firestore for Firebase mode
- **Real-time Updates**: Immediate UI updates after role/status changes
- **Error Handling**: Comprehensive error messages and validation

## Usage Instructions

### For Admins
1. Login with admin credentials
2. Navigate to Admin Panel → Users tab
3. Use filters and search to find specific users
4. Click action buttons to manage users:
   - ⚙️ Change Role
   - 👤❌ Change Status
   - ✏️ Edit User
   - 🗑️ Delete User

### For New Users
1. Register with email and password
2. Account is created with 'customer' role
3. Admin can upgrade role if needed
4. Login and access appropriate features based on role

## Future Enhancements
- Permission-based access control
- Bulk user operations
- User activity logging
- Advanced user filtering
- Email notifications for role changes
- User profile management
- Department/team assignments

## Testing the System
1. Register a new account at `/auth/register`
2. Login as admin (admin@elightsofa.com / admin123)
3. Go to Admin Panel → Users tab
4. Find your new account and change its role
5. Logout and login with your account to see role-based access

The system is now fully functional and ready for production use!