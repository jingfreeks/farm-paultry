"use client";

import { useState } from "react";
import { useAdminProducts } from "@/hooks/useAdminData";
import type { Product } from "@/types/database";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: 'poultry' | 'eggs' | 'produce';
  emoji: string;
  badge: string;
  badge_color: string;
  stock: string;
  is_available: boolean;
  image_url: string;
};

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  unit: '',
  category: 'poultry',
  emoji: '🐔',
  badge: '',
  badge_color: '',
  stock: '0',
  is_available: true,
  image_url: '',
};

const badgeColorOptions = [
  { value: '', label: 'None' },
  { value: 'bg-terracotta', label: 'Terracotta' },
  { value: 'bg-olive', label: 'Olive' },
  { value: 'bg-gold', label: 'Gold' },
  { value: 'bg-sage', label: 'Sage' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-blue-500', label: 'Blue' },
];

const emojiOptions = {
  poultry: ['🐔', '🍗', '🦆', '🦃', '🐓'],
  eggs: ['🥚', '🦆', '🥚'],
  produce: ['🌽', '🥬', '🍅', '🥕', '🥔', '🧅'],
};

export default function ProductsPage() {
  const { products, loading, updateStock, updateProduct, createProduct, deleteProduct } = useAdminProducts();
  const [filter, setFilter] = useState<string>("all");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category,
        emoji: formData.emoji || null,
        badge: formData.badge || null,
        badge_color: formData.badge_color || null,
        stock: parseInt(formData.stock) || 0,
        is_available: formData.is_available,
        image_url: formData.image_url || null,
      };

      const result = await createProduct(productData);
      if (result.success) {
        setIsCreating(false);
        setFormData(initialFormData);
      } else {
        alert(result.error || 'Failed to create product');
      }
    } catch (error) {
      alert('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    
    try {
      const updates = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category,
        emoji: formData.emoji || null,
        badge: formData.badge || null,
        badge_color: formData.badge_color || null,
        stock: parseInt(formData.stock) || 0,
        is_available: formData.is_available,
        image_url: formData.image_url || null,
      };

      const result = await updateProduct(editingProduct.id, updates);
      if (result.success) {
        setEditingProduct(null);
        setFormData(initialFormData);
      } else {
        alert(result.error || 'Failed to update product');
      }
    } catch (error) {
      alert('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    
    setIsSubmitting(true);
    try {
      const result = await deleteProduct(deletingProductId);
      if (result.success) {
        setDeletingProductId(null);
      } else {
        alert(result.error || 'Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      unit: product.unit,
      category: product.category,
      emoji: product.emoji || '🐔',
      badge: product.badge || '',
      badge_color: product.badge_color || '',
      stock: product.stock.toString(),
      is_available: product.is_available,
      image_url: product.image_url || '',
    });
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
        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors inline-flex items-center gap-2"
        >
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-olive hover:text-terracotta transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingProductId(product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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

      {/* Create Product Modal */}
      {isCreating && (
        <>
          <div
            className="fixed inset-0 bg-bark/50 z-50"
            onClick={() => {
              if (!isSubmitting) {
                setIsCreating(false);
                setFormData(initialFormData);
              }
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in my-8">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-bark">Create New Product</h2>
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setIsCreating(false);
                      setFormData(initialFormData);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateProduct} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const category = e.target.value as 'poultry' | 'eggs' | 'produce';
                        setFormData({ 
                          ...formData, 
                          category,
                          emoji: emojiOptions[category][0] || '🐔',
                        });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      required
                    >
                      <option value="poultry">Poultry</option>
                      <option value="eggs">Eggs</option>
                      <option value="produce">Produce</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-wheat resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-wheat"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Unit *</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      placeholder="per kg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Emoji</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.emoji}
                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg border border-wheat text-2xl"
                      >
                        {emojiOptions[formData.category].map((emoji) => (
                          <option key={emoji} value={emoji}>{emoji}</option>
                        ))}
                      </select>
                      <span className="text-3xl flex items-center">{formData.emoji}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Badge</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      placeholder="Best Seller"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Badge Color</label>
                    <select
                      value={formData.badge_color}
                      onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                    >
                      {badgeColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-bark">
                    Product is available
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setFormData(initialFormData);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <>
          <div
            className="fixed inset-0 bg-bark/50 z-50"
            onClick={() => {
              if (!isSubmitting) {
                setEditingProduct(null);
                setFormData(initialFormData);
              }
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in my-8">
              <div className="p-6 border-b border-wheat flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-bark">Edit Product</h2>
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setEditingProduct(null);
                      setFormData(initialFormData);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const category = e.target.value as 'poultry' | 'eggs' | 'produce';
                        setFormData({ 
                          ...formData, 
                          category,
                          emoji: emojiOptions[category][0] || formData.emoji,
                        });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      required
                    >
                      <option value="poultry">Poultry</option>
                      <option value="eggs">Eggs</option>
                      <option value="produce">Produce</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-wheat resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-wheat"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Unit *</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Emoji</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.emoji}
                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg border border-wheat text-2xl"
                      >
                        {emojiOptions[formData.category].map((emoji) => (
                          <option key={emoji} value={emoji}>{emoji}</option>
                        ))}
                      </select>
                      <span className="text-3xl flex items-center">{formData.emoji}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Badge</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                      placeholder="Best Seller"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-1">Badge Color</label>
                    <select
                      value={formData.badge_color}
                      onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-wheat"
                    >
                      {badgeColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                  />
                  <label htmlFor="edit_is_available" className="text-sm font-medium text-bark">
                    Product is available
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setFormData(initialFormData);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <>
          <div
            className="fixed inset-0 bg-bark/50 z-50"
            onClick={() => {
              if (!isSubmitting) {
                setDeletingProductId(null);
              }
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-wheat">
                <h2 className="font-serif text-xl font-bold text-bark">Delete Product</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-charcoal">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setDeletingProductId(null)}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-red-500 text-cream rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete'}
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
