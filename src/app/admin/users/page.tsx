"use client";

import { useState } from "react";
import { useAdminUsers, CreateUserData } from "@/hooks/useAdminUsers";
import type { UserProfile, UserRole } from "@/types/database";

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  staff: "bg-blue-100 text-blue-800 border-blue-200",
  customer: "bg-green-100 text-green-800 border-green-200",
};

const roleOptions: UserRole[] = ['admin', 'staff', 'customer'];

export default function UsersPage() {
  const { users, loading, createUser, updateUser, deleteUser, toggleUserStatus, changeUserRole } = useAdminUsers();
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create user form state
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: "",
    full_name: "",
    phone: "",
    role: "customer",
    password: "",
  });

  // Filter and search users
  const filteredUsers = users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "active") return u.is_active;
      if (filter === "inactive") return !u.is_active;
      return u.role === filter;
    })
    .filter(
      (u) =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const result = await createUser(newUser);
    
    if (result.success) {
      setShowCreateModal(false);
      setNewUser({ email: "", full_name: "", phone: "", role: "customer", password: "" });
    } else {
      setFormError(result.error || "Failed to create user");
    }
    setFormLoading(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setFormLoading(true);
    setFormError(null);

    const result = await updateUser(editingUser.id, {
      full_name: editingUser.full_name,
      phone: editingUser.phone,
      role: editingUser.role,
    });

    if (result.success) {
      setEditingUser(null);
    } else {
      setFormError(result.error || "Failed to update user");
    }
    setFormLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setFormLoading(true);
    const result = await deleteUser(userId);
    if (result.success) {
      setDeleteConfirm(null);
    }
    setFormLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bark">User Management</h1>
          <p className="text-charcoal/60">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Total Users</p>
          <p className="font-serif text-2xl font-bold text-bark">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Admins</p>
          <p className="font-serif text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Staff</p>
          <p className="font-serif text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'staff').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Active Users</p>
          <p className="font-serif text-2xl font-bold text-olive">
            {users.filter(u => u.is_active).length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'admin', 'staff', 'customer', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-bark text-cream"
                  : "bg-white text-charcoal hover:bg-wheat border border-wheat"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-wheat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wheat">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        user.role === 'admin' ? 'bg-purple-500' : user.role === 'staff' ? 'bg-blue-500' : 'bg-olive'
                      }`}>
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-bark">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-charcoal/60">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize border cursor-pointer ${roleColors[user.role]}`}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role} className="bg-white text-bark">
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        user.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/70">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-charcoal/60 hover:text-olive transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-2 text-charcoal/60 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/60">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-bark/50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-bark">Create New User</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">
                    Password <span className="text-charcoal/50">(optional)</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                    placeholder="Leave blank for auto-generated"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50"
                  >
                    {formLoading ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <>
          <div className="fixed inset-0 bg-bark/50 z-50" onClick={() => setEditingUser(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-bark">Edit User</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-wheat bg-wheat/50 text-charcoal/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.full_name || ""}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as UserRole } : null)}
                    className="w-full px-4 py-2 rounded-xl border border-wheat focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-bark/50 z-50" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-bark mb-2">Delete User?</h3>
                <p className="text-charcoal/60 mb-6">
                  This action cannot be undone. The user will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(deleteConfirm)}
                    disabled={formLoading}
                    className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {formLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

