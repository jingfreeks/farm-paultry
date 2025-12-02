"use client";

import { useState } from "react";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";

export default function CustomersPage() {
  const { customers, loading, error } = useAdminCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">Error loading customers</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Make sure you are logged in as an admin and that the database migrations have been run.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bark">Customers</h1>
          <p className="text-charcoal/60">View and manage customer information</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Total Customers</p>
          <p className="font-serif text-2xl font-bold text-bark">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Total Orders</p>
          <p className="font-serif text-2xl font-bold text-olive">
            {customers.reduce((sum, c) => sum + c.orders, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Total Revenue</p>
          <p className="font-serif text-2xl font-bold text-terracotta">
            ${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
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
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-wheat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wheat">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-olive">
                          {customer.full_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-bark">{customer.full_name || 'No name'}</p>
                        <p className="text-sm text-charcoal/60">ID: #{customer.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-bark">{customer.email}</p>
                      <p className="text-sm text-charcoal/60">{customer.phone || "No phone"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(customer.role)}`}>
                        {customer.role}
                      </span>
                      {!customer.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-bark">{customer.orders}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-terracotta">
                      ${customer.total_spent.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/70">
                    {formatDate(customer.last_order)}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-charcoal/60 font-medium">No customers found</p>
                      <p className="text-sm text-charcoal/40">
                        {searchTerm ? 'Try a different search term' : 'No user profiles exist yet. Users will appear here after they sign up.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredCustomers.length === 0 && customers.length > 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal/60">
                    No customers match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

