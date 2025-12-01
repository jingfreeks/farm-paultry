"use client";

import { useState, useEffect } from "react";

// Demo customer data
const demoCustomers = [
  { id: '1', email: 'john@example.com', full_name: 'John Doe', phone: '+1234567890', orders: 5, total_spent: 456.50, last_order: '2024-01-15' },
  { id: '2', email: 'jane@example.com', full_name: 'Jane Smith', phone: '+1987654321', orders: 3, total_spent: 234.00, last_order: '2024-01-12' },
  { id: '3', email: 'bob@example.com', full_name: 'Bob Wilson', phone: null, orders: 8, total_spent: 892.75, last_order: '2024-01-10' },
  { id: '4', email: 'alice@example.com', full_name: 'Alice Brown', phone: '+1122334455', orders: 2, total_spent: 89.99, last_order: '2024-01-08' },
  { id: '5', email: 'charlie@example.com', full_name: 'Charlie Davis', phone: '+1555666777', orders: 12, total_spent: 1234.50, last_order: '2024-01-05' },
];

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  orders: number;
  total_spent: number;
  last_order: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCustomers(demoCustomers);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                          {customer.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-bark">{customer.full_name}</p>
                        <p className="text-sm text-charcoal/60">ID: #{customer.id}</p>
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
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/60">
                    No customers found
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

