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

      // Fetch all user profiles (customers, staff, admins)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all orders to calculate statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, total_amount, created_at')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate order statistics for each customer
      const customersWithStats: CustomerWithStats[] = (profiles || []).map((profile) => {
        const customerOrders = (orders || []).filter(
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

      setCustomers(customersWithStats);
    } catch (err) {
      console.error('Fetch customers error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      // Fallback to demo data
      setCustomers(demoCustomers);
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

