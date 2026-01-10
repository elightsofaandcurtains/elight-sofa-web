"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck,
  UserCog,
  Truck,
  User as UserIcon,
  Building2,
  Phone,
  Mail,
  Loader2,
  RefreshCw
} from "lucide-react";
import { UsersService, FirebaseUser, FirebaseSupplier } from "@/lib/firebase/users";
import { User, Supplier } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import AddUserModal from "./AddUserModal";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

const roleTabs = ["All", "Admin", "Employee", "Customer", "Supplier"];
const statusOptions = ["All", "Active", "Inactive", "Blocked"];

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: "-50%" }}
    animate={{ opacity: 1, y: 0, x: "-50%" }}
    exit={{ opacity: 0, y: 50, x: "-50%" }}
    className={cn(
      "fixed bottom-6 left-1/2 transform px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-[100]",
      type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
    )}
  >
    <CheckCircle size={20} />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-80 text-xl">×</button>
  </motion.div>
);

export default function UsersTab() {
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Filter states
  const [activeRoleFilter, setActiveRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState<{ user: User; supplier?: Supplier } | null>(null);
  const [editUser, setEditUser] = useState<{ user: User; supplier?: Supplier } | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { hasPermission } = useAuth();

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Firebase Real-time Subscriptions
  useEffect(() => {
    setIsLoading(true);
    let loadingTimeout: NodeJS.Timeout;

    loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Subscribe to users
    const unsubUsers = UsersService.subscribeToUsers((data) => {
      console.log('Users data received:', data.length);
      setUsers(data);
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    });

    // Subscribe to suppliers
    const unsubSuppliers = UsersService.subscribeToSuppliers((data) => {
      console.log('Suppliers data received:', data.length);
      setSuppliers(data);
    });

    return () => {
      unsubUsers();
      unsubSuppliers();
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Get supplier for a user
  const getSupplierForUser = (userId: string): Supplier | undefined => {
    return suppliers.find(s => s.userId === userId);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesRole = activeRoleFilter === "All" || user.role.toLowerCase() === activeRoleFilter.toLowerCase();
    const matchesStatus = statusFilter === "All" || user.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    employee: users.filter(u => u.role === 'employee').length,
    customer: users.filter(u => u.role === 'customer').length,
    supplier: users.filter(u => u.role === 'supplier').length,
    active: users.filter(u => u.status === 'active').length
  };

  // Handlers
  const handleAddUser = async (userData: any, supplierData?: any, adminPassword?: string) => {
    setIsSubmitting(true);
    try {
      // Get admin email from localStorage
      let adminEmail = '';
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          adminEmail = parsed.email || '';
        }
      }

      // Create user with admin credentials for re-authentication
      const userId = await UsersService.createUser({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role,
        department: userData.department,
        status: userData.status,
        address: userData.address,
        notes: userData.notes
      }, adminPassword ? { email: adminEmail, password: adminPassword } : undefined);

      // If supplier, create supplier record
      if (userData.role === 'supplier' && supplierData) {
        await UsersService.createSupplier({
          userId,
          supplierName: supplierData.supplierName,
          contactPerson: supplierData.contactPerson,
          phone: supplierData.phone,
          email: supplierData.email,
          address: supplierData.address,
          gstNumber: supplierData.gstNumber,
          supplierType: supplierData.supplierType,
          paymentTerms: supplierData.paymentTerms,
          notes: supplierData.notes,
          status: 'active'
        });
      }

      showToast('User created successfully!', 'success');
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      showToast(error.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<FirebaseUser>, supplierData?: Partial<FirebaseSupplier>) => {
    setIsSubmitting(true);
    try {
      await UsersService.updateUser(userId, userData);

      if (supplierData) {
        await UsersService.updateSupplierByUserId(userId, supplierData);
      }

      showToast('User updated successfully!', 'success');
      setEditUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      showToast(error.message || 'Failed to update user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await UsersService.updateUserStatus(user.id, newStatus);
      showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    }
    setActionMenuOpen(null);
  };

  const handleDeleteUser = async (userId: string) => {
    setIsSubmitting(true);
    try {
      // Check if trying to delete super admin
      const user = users.find(u => u.id === userId);
      if (user?.email === 'superadmin@elightsofa.com') {
        showToast('Cannot delete Super Admin!', 'error');
        return;
      }

      await UsersService.deleteUser(userId);
      showToast('User deleted successfully!', 'success');
      setDeleteUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(error.message || 'Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role badge colors
  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: ShieldCheck },
      employee: { bg: 'bg-blue-100', text: 'text-blue-800', icon: UserCog },
      customer: { bg: 'bg-green-100', text: 'text-green-800', icon: UserIcon },
      supplier: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck }
    };
    return badges[role] || badges.customer;
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-800' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
      blocked: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return badges[status] || badges.inactive;
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [actionMenuOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mb-2" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-[#D4AF37]" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage users, roles, permissions & suppliers</p>
        </div>
        {hasPermission('users.write') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#D4AF37] text-white px-5 py-2.5 rounded-lg hover:bg-[#B8941F] flex items-center gap-2 font-medium shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.employee}</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.customer}</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.supplier}</p>
              <p className="text-xs text-gray-500">Suppliers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {roleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRoleFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeRoleFilter === tab
                    ? "bg-white text-[#D4AF37] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status} Status</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department / Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.status);
                const supplier = user.role === 'supplier' ? getSupplierForUser(user.id) : undefined;
                const RoleIcon = roleBadge.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize",
                        roleBadge.bg, roleBadge.text
                      )}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'supplier' && supplier ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-900">{supplier.supplierName}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            supplier.supplierType === 'raw' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'
                          )}>
                            {supplier.supplierType === 'raw' ? 'Raw Material' : 'Shop Material'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600">{user.department || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        statusBadge.bg, statusBadge.text
                      )}>
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(actionMenuOpen === user.id ? null : user.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {actionMenuOpen === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setViewUser({ user, supplier });
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                {hasPermission('users.write') && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditUser({ user, supplier });
                                        setActionMenuOpen(null);
                                      }}
                                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit User
                                    </button>
                                    <button
                                      onClick={() => handleStatusToggle(user)}
                                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </>
                                )}
                                {hasPermission('users.delete') && user.email !== 'superadmin@elightsofa.com' && (
                                  <button
                                    onClick={() => {
                                      setDeleteUser(user);
                                      setActionMenuOpen(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || activeRoleFilter !== 'All' || statusFilter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding a new user.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddUser}
            isSubmitting={isSubmitting}
          />
        )}

        {viewUser && (
          <ViewUserModal
            user={viewUser.user}
            supplier={viewUser.supplier}
            onClose={() => setViewUser(null)}
            onEdit={() => {
              setEditUser(viewUser);
              setViewUser(null);
            }}
          />
        )}

        {editUser && (
          <EditUserModal
            user={editUser.user}
            supplier={editUser.supplier}
            onClose={() => setEditUser(null)}
            onSave={handleUpdateUser}
            isSubmitting={isSubmitting}
          />
        )}

        {deleteUser && (
          <DeleteUserModal
            user={deleteUser}
            onClose={() => setDeleteUser(null)}
            onConfirm={() => handleDeleteUser(deleteUser.id)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
