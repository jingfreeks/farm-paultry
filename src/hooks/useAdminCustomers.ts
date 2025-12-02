'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/database';

export interface CustomerWithStats {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Order statistics
  orders: number;
  total_spent: number;
  last_order: string | null;
}

// Demo data for when Supabase isn't configured
const demoCustomers: CustomerWithStats[] = [
  {
    id: '1',
    email: 'john@example.com',
    full_name: 'John Doe',
    phone: '+1234567890',
    role: 'customer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    orders: 5,
    total_spent: 456.50,
    last_order: '2024-01-15',
  },
  {
    id: '2',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    phone: '+1987654321',
    role: 'customer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    orders: 3,
    total_spent: 234.00,
    last_order: '2024-01-12',
  },
  {
    id: '3',
    email: 'bob@example.com',
    full_name: 'Bob Wilson',
    phone: null,
    role: 'customer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    orders: 8,
    total_spent: 892.75,
    last_order: '2024-01-10',
  },
];

export function useAdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use demo data
        setCustomers(demoCustomers);
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch all user profiles (customers, staff, admins)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching user_profiles:', profilesError);
        // Check if it's an RLS error
        if (profilesError.code === '42501' || profilesError.message.includes('permission denied')) {
          throw new Error('Permission denied. Make sure you are logged in as an admin.');
        }
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles?.length || 0, 'profiles');

      // Fetch all orders to calculate statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, total_amount, created_at')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        // Don't throw - we can still show profiles without order stats
      }

      const ordersList = orders || [];

      // Calculate order statistics for each customer
      const customersWithStats: CustomerWithStats[] = (profiles || []).map((profile) => {
        const customerOrders = ordersList.filter(
          (order) => order.customer_email === profile.email
        );

        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        );

        const lastOrder = customerOrders.length > 0 ? customerOrders[0].created_at : null;

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          orders: customerOrders.length,
          total_spent: totalSpent,
          last_order: lastOrder,
        };
      });

      console.log('Setting customers:', customersWithStats.length);
      setCustomers(customersWithStats);
    } catch (err) {
      console.error('Fetch customers error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      // Only fallback to demo data if Supabase is not configured
      // Otherwise, show empty array so user knows there's an issue
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setCustomers(demoCustomers);
      } else {
        setCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
  };
}

