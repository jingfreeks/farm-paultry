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

      // Fetch all user profiles (admins should see all users, not just customers)
      // Remove the role filter so admins can see all users including other admins and staff
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, role, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });
      console.log('Query result - profiles:', profiles);
      console.log('Query result - error:', profilesError);
      
      if (profilesError) {
        console.error('Error fetching user_profiles:', profilesError);
        console.error('Error code:', profilesError.code);
        console.error('Error message:', profilesError.message);
        
        if (profilesError.code === '42501' || profilesError.message.includes('permission denied')) {
          throw new Error('Permission denied. Make sure you are logged in as an admin or staff member.');
        }
        if (profilesError.code === 'PGRST301' || profilesError.message.includes('JWT')) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw profilesError;
      }

      // Use all profiles (admins can see all users)
      // Optionally filter to only customers if needed, but for admin dashboard, show all
      const allProfiles = profiles || [];
      console.log('Total profiles found:', allProfiles.length);

      if (!allProfiles || allProfiles.length === 0) {
        console.warn('No profiles found.');
        setCustomers([]);
        setLoading(false);
        return;
      }

      // Fetch order statistics grouped by customer email (optimized)
      // Only fetch what we need: email, count, sum, and max date
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, total_amount, created_at');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        // Continue without order stats
      }

      // Build order stats map for O(1) lookup
      const orderStatsMap = new Map<string, { count: number; total: number; lastOrder: string | null }>();
      
      if (orders && Array.isArray(orders)) {
        orders.forEach((order: any) => {
          const email = order.customer_email;
          const existing = orderStatsMap.get(email) || { count: 0, total: 0, lastOrder: null };
          
          orderStatsMap.set(email, {
            count: existing.count + 1,
            total: existing.total + (order.total_amount || 0),
            lastOrder: existing.lastOrder 
              ? (order.created_at > existing.lastOrder ? order.created_at : existing.lastOrder)
              : order.created_at,
          });
        });
      }

      // Map all profiles to customers with stats (optimized)
      const customersWithStats: CustomerWithStats[] = allProfiles.map((profile: any) => {
        const stats = orderStatsMap.get(profile.email) || { count: 0, total: 0, lastOrder: null };
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          orders: stats.count,
          total_spent: stats.total,
          last_order: stats.lastOrder,
        };
      });
      setCustomers(customersWithStats);
    } catch (err) {
      console.error('❌ Fetch customers error:', err);
      console.error('Error type:', typeof err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Failed to fetch customers';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error name:', err.name);
        console.error('Error stack:', err.stack);
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      } else if (err && typeof err === 'object' && 'code' in err) {
        const code = String(err.code);
        const message = 'message' in err ? String(err.message) : '';
        errorMessage = `Error ${code}: ${message || 'Unknown error'}`;
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('permission denied') || errorMessage.includes('42501')) {
        errorMessage = 'Permission denied. Make sure you are logged in as an admin or staff member and that your user profile has the correct role.';
      } else if (errorMessage.includes('JWT') || errorMessage.includes('PGRST301')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        errorMessage = 'Database table not found. Please run the database migrations.';
      }
      
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

