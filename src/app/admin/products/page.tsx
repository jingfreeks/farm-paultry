"use client";

import { useState } from "react";
import { useAdminProducts } from "@/hooks/useAdminData";
import type { Product } from "@/types/database";

export default function ProductsPage() {
  const { products, loading, updateStock, updateProduct } = useAdminProducts();
  const [filter, setFilter] = useState<string>("all");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = filter === "all"
    ? products
    : filter === "low-stock"
    ? products.filter(p => p.stock < 20)
    : products.filter(p => p.category === filter);

  const handleStockUpdate = async (productId: string) => {
    await updateStock(productId, stockValue);
    setEditingStock(null);
  };

  const handleToggleAvailability = async (product: Product) => {
    await updateProduct(product.id, { is_available: !product.is_available });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock < 10) return { label: "Critical", color: "bg-red-100 text-red-800" };
    if (stock < 20) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
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
          <h1 className="font-serif text-3xl font-bold text-bark">Products & Inventory</h1>
          <p className="text-charcoal/60">Manage product stock and availability</p>
        </div>
        <button className="px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Total Products</p>
          <p className="font-serif text-2xl font-bold text-bark">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">In Stock</p>
          <p className="font-serif text-2xl font-bold text-olive">
            {products.filter(p => p.stock >= 20).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Low Stock</p>
          <p className="font-serif text-2xl font-bold text-yellow-600">
            {products.filter(p => p.stock > 0 && p.stock < 20).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-wheat">
          <p className="text-sm text-charcoal/60">Out of Stock</p>
          <p className="font-serif text-2xl font-bold text-red-600">
            {products.filter(p => p.stock === 0).length}
          </p>
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
          All Products
        </button>
        <button
          onClick={() => setFilter("low-stock")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "low-stock"
              ? "bg-bark text-cream"
              : "bg-white text-charcoal hover:bg-wheat border border-wheat"
          }`}
        >
          🔴 Low Stock
        </button>
        <button
          onClick={() => setFilter("poultry")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "poultry"
              ? "bg-bark text-cream"
              : "bg-white text-charcoal hover:bg-wheat border border-wheat"
          }`}
        >
          🐔 Poultry
        </button>
        <button
          onClick={() => setFilter("eggs")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "eggs"
              ? "bg-bark text-cream"
              : "bg-white text-charcoal hover:bg-wheat border border-wheat"
          }`}
        >
          🥚 Eggs
        </button>
        <button
          onClick={() => setFilter("produce")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "produce"
              ? "bg-bark text-cream"
              : "bg-white text-charcoal hover:bg-wheat border border-wheat"
          }`}
        >
          🥬 Produce
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                !product.is_available ? "opacity-60 border-red-200" : "border-wheat"
              }`}
            >
              {/* Product Header */}
              <div className="p-4 bg-gradient-to-br from-wheat/50 to-cream flex items-center justify-between">
                <span className="text-4xl">{product.emoji}</span>
                <div className="flex items-center gap-2">
                  {product.badge && (
                    <span className={`px-2 py-0.5 ${product.badge_color} text-cream text-xs font-medium rounded-full`}>
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-bark">{product.name}</h3>
                  <p className="text-sm text-charcoal/60 capitalize">{product.category}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-terracotta">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-charcoal/60">{product.unit}</span>
                </div>

                {/* Stock Section */}
                <div className="pt-3 border-t border-wheat">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-charcoal/60">Stock Level</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>

                  {editingStock === product.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={stockValue}
                        onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 rounded-lg border border-wheat text-center font-semibold"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockUpdate(product.id)}
                        className="px-3 py-2 bg-olive text-cream rounded-lg text-sm font-medium hover:bg-olive-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingStock(null)}
                        className="px-3 py-2 bg-wheat text-charcoal rounded-lg text-sm font-medium hover:bg-wheat/70"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold text-bark">
                          {product.stock}
                        </span>
                        <span className="text-sm text-charcoal/60">units</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingStock(product.id);
                          setStockValue(product.stock);
                        }}
                        className="text-olive hover:text-terracotta transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Stock Progress Bar */}
                  <div className="mt-2 h-2 bg-wheat rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        product.stock === 0
                          ? "bg-red-500"
                          : product.stock < 20
                          ? "bg-yellow-500"
                          : "bg-olive"
                      }`}
                      style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      product.is_available
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {product.is_available ? "Available" : "Unavailable"}
                  </button>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-charcoal/60 hover:text-bark transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-charcoal/60">
            No products found
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <>
          <div
            className="fixed inset-0 bg-bark/50 z-50"
            onClick={() => setEditingProduct(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-bark">Edit Product</h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{editingProduct.emoji}</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-bark">
                      {editingProduct.name}
                    </h3>
                    <p className="text-charcoal/60 capitalize">{editingProduct.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60">$</span>
                      <input
                        type="number"
                        value={editingProduct.price}
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-wheat"
                        step="0.01"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ""}
                    className="w-full px-4 py-2 rounded-lg border border-wheat resize-none"
                    rows={3}
                    readOnly
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
                  >
                    Close
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

