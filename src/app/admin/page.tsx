"use client";

import { useAdminDashboard } from "@/hooks/useAdminData";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { stats, loading } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bark">Dashboard</h1>
          <p className="text-charcoal/60">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-wheat">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-olive bg-olive/10 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-charcoal/60">Total Revenue</p>
            <p className="font-serif text-2xl font-bold text-bark">
              ${stats?.totalRevenue.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-wheat">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-olive/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-medium text-olive bg-olive/10 px-2 py-1 rounded-full">
              +8.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-charcoal/60">Total Orders</p>
            <p className="font-serif text-2xl font-bold text-bark">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-wheat">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-charcoal/60">Total Products</p>
            <p className="font-serif text-2xl font-bold text-bark">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-wheat">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {(stats?.lowStockProducts || 0) > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Alert
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-charcoal/60">Low Stock Items</p>
            <p className="font-serif text-2xl font-bold text-bark">{stats?.lowStockProducts || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-wheat overflow-hidden">
          <div className="p-6 border-b border-wheat flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-bark">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-olive hover:text-terracotta transition-colors font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wheat">
                {stats?.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-bark">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-bark">{order.customer_name}</p>
                        <p className="text-sm text-charcoal/60">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-bark">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-charcoal/60">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats / Activity */}
        <div className="space-y-6">
          {/* Pending Orders Card */}
          <div className="bg-gradient-to-br from-terracotta to-terracotta-dark rounded-2xl p-6 text-cream">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pending Orders</h3>
              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-serif text-4xl font-bold">{stats?.pendingOrders || 0}</p>
            <p className="text-sm opacity-80 mt-2">Orders awaiting processing</p>
            <Link
              href="/admin/orders?status=pending"
              className="inline-block mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              View Pending
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-wheat">
            <h3 className="font-serif text-lg font-bold text-bark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-colors"
              >
                <div className="w-10 h-10 bg-olive/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-bark">Manage Orders</p>
                  <p className="text-sm text-charcoal/60">View and update orders</p>
                </div>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-colors"
              >
                <div className="w-10 h-10 bg-terracotta/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-bark">Update Inventory</p>
                  <p className="text-sm text-charcoal/60">Manage stock levels</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

