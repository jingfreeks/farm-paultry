"use client";

import { useState } from "react";
import { useAdminOrders } from "@/hooks/useAdminData";
import type { Order } from "@/types/database";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusOptions: Order['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus } = useAdminOrders();
  const [filter, setFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    setUpdating(orderId);
    await updateOrderStatus(orderId, status);
    setUpdating(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <h1 className="font-serif text-3xl font-bold text-bark">Orders</h1>
          <p className="text-charcoal/60">Manage and track customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "all"
              ? "bg-bark text-cream"
              : "bg-white text-charcoal hover:bg-wheat border border-wheat"
          }`}
        >
          All ({orders.length})
        </button>
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
                filter === status
                  ? "bg-bark text-cream"
                  : "bg-white text-charcoal hover:bg-wheat border border-wheat"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-wheat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wheat">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-bark">
                      #{order.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-bark">{order.customer_name}</p>
                      <p className="text-sm text-charcoal/60">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal/70">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-bark">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      disabled={updating === order.id}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize border cursor-pointer ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      } ${updating === order.id ? 'opacity-50' : ''}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status} className="bg-white text-bark">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-olive hover:text-terracotta transition-colors font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal/60">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-bark/50 z-50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-bark">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-charcoal/60">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-charcoal/60">Customer</p>
                    <p className="font-medium text-bark">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal/60">Email</p>
                    <p className="font-medium text-bark">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal/60">Phone</p>
                    <p className="font-medium text-bark">{selectedOrder.customer_phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal/60">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusColors[selectedOrder.status]
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-charcoal/60">Shipping Address</p>
                  <p className="font-medium text-bark">{selectedOrder.shipping_address}</p>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-charcoal/60">Notes</p>
                    <p className="font-medium text-bark">{selectedOrder.notes}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-wheat">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-bark">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-terracotta">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

