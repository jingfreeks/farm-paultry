'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Order, Database } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

// Demo data for when Supabase isn't configured
const demoProducts: Product[] = [
  { id: '1', name: 'Whole Chicken', category: 'poultry', price: 12.99, unit: 'per kg', emoji: '🐔', stock: 45, is_available: true, badge: 'Best Seller', badge_color: 'bg-terracotta', description: 'Free-range whole chicken', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Chicken Breast', category: 'poultry', price: 18.99, unit: 'per kg', emoji: '🍗', stock: 32, is_available: true, badge: null, badge_color: null, description: 'Premium chicken breast', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Farm Fresh Eggs', category: 'eggs', price: 6.99, unit: 'dozen', emoji: '🥚', stock: 120, is_available: true, badge: 'Organic', badge_color: 'bg-olive', description: 'Free-range eggs', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Duck Eggs', category: 'eggs', price: 9.99, unit: 'half dozen', emoji: '🦆', stock: 28, is_available: true, badge: null, badge_color: null, description: 'Rich duck eggs', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Whole Duck', category: 'poultry', price: 24.99, unit: 'per kg', emoji: '🦆', stock: 15, is_available: true, badge: 'Premium', badge_color: 'bg-gold', description: 'Tender whole duck', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Organic Corn', category: 'produce', price: 4.99, unit: 'per 6 ears', emoji: '🌽', stock: 80, is_available: true, badge: null, badge_color: null, description: 'Sweet organic corn', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Fresh Vegetables Box', category: 'produce', price: 29.99, unit: 'per box', emoji: '🥬', stock: 22, is_available: true, badge: 'Popular', badge_color: 'bg-sage', description: 'Seasonal vegetables', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Turkey', category: 'poultry', price: 19.99, unit: 'per kg', emoji: '🦃', stock: 8, is_available: true, badge: null, badge_color: null, description: 'Heritage turkey', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const demoOrders: Order[] = [
  { id: 'ord-1', customer_id: null, customer_email: 'john@example.com', customer_name: 'John Doe', customer_phone: '+1234567890', shipping_address: '123 Farm Lane, Springfield, CA 90210', total_amount: 89.95, status: 'delivered', notes: null, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ord-2', customer_id: null, customer_email: 'jane@example.com', customer_name: 'Jane Smith', customer_phone: null, shipping_address: '456 Oak Street, Portland, OR 97201', total_amount: 156.50, status: 'shipped', notes: 'Leave at door', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ord-3', customer_id: null, customer_email: 'bob@example.com', customer_name: 'Bob Wilson', customer_phone: '+1987654321', shipping_address: '789 Pine Ave, Seattle, WA 98101', total_amount: 45.97, status: 'processing', notes: null, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ord-4', customer_id: null, customer_email: 'alice@example.com', customer_name: 'Alice Brown', customer_phone: '+1122334455', shipping_address: '321 Maple Dr, Austin, TX 78701', total_amount: 234.00, status: 'pending', notes: 'Call before delivery', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ord-5', customer_id: null, customer_email: 'charlie@example.com', customer_name: 'Charlie Davis', customer_phone: null, shipping_address: '654 Elm St, Denver, CO 80201', total_amount: 78.45, status: 'confirmed', notes: null, created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
];

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // Use demo data
          setStats({
            totalOrders: demoOrders.length,
            totalRevenue: demoOrders.reduce((sum, o) => sum + o.total_amount, 0),
            totalProducts: demoProducts.length,
            lowStockProducts: demoProducts.filter(p => p.stock < 20).length,
            pendingOrders: demoOrders.filter(o => o.status === 'pending').length,
            recentOrders: demoOrders.slice(0, 5),
          });
          setLoading(false);
          return;
        }

        const supabase = createClient();

        // Fetch orders and products in parallel for better performance
        // Only select columns we actually need
        const [ordersResult, productsResult] = await Promise.all([
          supabase
            .from('orders')
            .select('id, customer_name, customer_email, total_amount, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('products')
            .select('id, stock')
        ]);

        if (ordersResult.error) throw ordersResult.error;
        if (productsResult.error) throw productsResult.error;

        // Type assertions to work around TypeScript inference issues with Supabase types
        const ordersList = (ordersResult.data as OrderRow[]) || [];
        const productsList = (productsResult.data as ProductRow[]) || [];

        setStats({
          totalOrders: ordersList.length,
          totalRevenue: ordersList.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          totalProducts: productsList.length,
          lowStockProducts: productsList.filter(p => p.stock < 20).length,
          pendingOrders: ordersList.filter(o => o.status === 'pending').length,
          recentOrders: ordersList.slice(0, 5),
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        // Fallback to demo data
        setStats({
          totalOrders: demoOrders.length,
          totalRevenue: demoOrders.reduce((sum, o) => sum + o.total_amount, 0),
          totalProducts: demoProducts.length,
          lowStockProducts: demoProducts.filter(p => p.stock < 20).length,
          pendingOrders: demoOrders.filter(o => o.status === 'pending').length,
          recentOrders: demoOrders.slice(0, 5),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setOrders(demoOrders);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      // Only select columns we need for better performance
      const ordersResult = await supabase
        .from('orders')
        .select('id, customer_id, customer_email, customer_name, customer_phone, shipping_address, total_amount, status, notes, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (ordersResult.error) throw ordersResult.error;
      // Type assertion to work around TypeScript inference issue with Supabase types
      setOrders((ordersResult.data as OrderRow[]) || demoOrders);
    } catch (err) {
      console.error('Orders error:', err);
      setOrders(demoOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        return { success: true };
      }

      const supabase = createClient();
      // Type assertion to work around TypeScript inference issue with Supabase types
      const { error } = await (supabase
        .from('orders')
        .update as any)({ status })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setProducts(demoProducts);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      // Only select columns we need for better performance
      const productsResult = await supabase
        .from('products')
        .select('id, name, description, price, unit, category, image_url, emoji, badge, badge_color, stock, is_available, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (productsResult.error) throw productsResult.error;
      // Type assertion to work around TypeScript inference issue with Supabase types
      setProducts((productsResult.data as ProductRow[]) || demoProducts);
    } catch (err) {
      console.error('Products error:', err);
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
        return { success: true };
      }

      const supabase = createClient();
      // Type assertion to work around TypeScript inference issue with Supabase types
      const { error } = await (supabase
        .from('products')
        .update as any)(updates)
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
    }
  };

  const updateStock = async (productId: string, stock: number) => {
    return updateProduct(productId, { stock });
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const newProduct: Product = {
          ...productData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProducts(prev => [newProduct, ...prev]);
        return { success: true, data: newProduct };
      }

      const supabase = createClient();
      // Type assertion to work around TypeScript inference issue with Supabase types
      const { data, error } = await (supabase
        .from('products')
        .insert as any)([productData])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create product' };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        return { success: true };
      }

      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error, 
    refetch: fetchProducts, 
    updateProduct, 
    updateStock,
    createProduct,
    deleteProduct,
  };
}

