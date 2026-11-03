'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Users,
  UserPlus,
  Shield,
  User as UserIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Power,
  Clock,
  AlertTriangle,
  Lock,
  Megaphone,
  Send,
} from 'lucide-react';
import { User, SystemRole } from '@/types';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

export default function UsersView() {
  const {
    users,
    user: currentUser,
    isAdmin,
    deletePortalUser,
    updatePortalUser,
    openComposeMessage,
    setActiveTab,
  } = useWorkOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | SystemRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Compute stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.system_role === 'Admin').length;
  const regularCount = users.filter((u) => u.system_role === 'User').length;
  const activeCount = users.filter((u) => u.status !== 'Inactive').length;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'All' || u.system_role === roleFilter;
      const matchesStatus =
        statusFilter === 'All' || (u.status || 'Active') === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (targetUser: User) => {
    setActionError(null);
    if (targetUser.id === currentUser.id) {
      setActionError('You cannot deactivate your own account.');
      return;
    }
    const newStatus = targetUser.status === 'Inactive' ? 'Active' : 'Inactive';
    const res = await updatePortalUser(targetUser.id, { status: newStatus });
    if (!res.success) {
      setActionError(res.error || 'Failed to update user status.');
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionError(null);
    const res = await deletePortalUser(userToDelete.id);
    if (res.success) {
      setUserToDelete(null);
    } else {
      setActionError(res.error || 'Failed to delete user.');
    }
  };

  // If user is not admin, show Access Denied view
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Access Required
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          User management and onboarding permissions are restricted to Administrators. If you need user management rights, please contact your portal admin.
        </p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-6 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              User Management &amp; Permissions
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Onboard new team members, grant portal access credentials, and manage roles.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => openComposeMessage('all')}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Broadcast Message</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {totalUsers}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Registered accounts
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Administrators</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {adminCount}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Full system permissions
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Standard Users</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {regularCount}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Workspace collaborators
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Status</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Permitted to log in
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or designation..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admins Only</option>
            <option value="User">Users Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-4 sm:px-6">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 hidden md:table-cell">Job Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 hidden lg:table-cell">Last Login</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs sm:text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    No portal users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isCurrent = item.id === currentUser.id;
                  const initials = item.name
                    ? item.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 ${
                              item.system_role === 'Admin'
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                                : 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Role Badge */}
                      <td className="py-3.5 px-4">
                        {item.system_role === 'Admin' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                            <Shield className="w-3 h-3 text-indigo-500" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                            <UserIcon className="w-3 h-3 text-blue-500" />
                            <span>User</span>
                          </span>
                        )}
                      </td>

                      {/* Job Title */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 dark:text-slate-300 text-xs">
                        {item.role || 'Team Member'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === 'Inactive' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-[11px] text-slate-400 dark:text-slate-500">
                        {item.last_login_at ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.last_login_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          'Never'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => openComposeMessage(item.id)}
                            title={`Send notification to ${item.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingUser(item)}
                            title="Edit user details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isCurrent}
                            title={item.status === 'Inactive' ? 'Activate user' : 'Deactivate user'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-slate-300'
                                : item.status === 'Inactive'
                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setUserToDelete(item)}
                            disabled={isCurrent}
                            title="Delete user"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-slate-300'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        userToEdit={editingUser}
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
      />

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-700 dark:text-slate-200">{userToDelete.name}</span> ({userToDelete.email})? This user will no longer be able to log in to the portal.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}