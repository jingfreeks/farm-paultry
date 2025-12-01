'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/types/database';

// Demo users for when Supabase isn't configured
const demoUsers: UserProfile[] = [
  { id: 'admin-1', email: 'admin@goldenharvest.com', full_name: 'Admin User', phone: '+1234567890', role: 'admin', avatar_url: null, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'staff-1', email: 'staff@goldenharvest.com', full_name: 'Staff Member', phone: '+1987654321', role: 'staff', avatar_url: null, is_active: true, created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 'user-1', email: 'john@example.com', full_name: 'John Doe', phone: '+1122334455', role: 'customer', avatar_url: null, is_active: true, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 'user-2', email: 'jane@example.com', full_name: 'Jane Smith', phone: null, role: 'customer', avatar_url: null, is_active: true, created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },
  { id: 'user-3', email: 'bob@example.com', full_name: 'Bob Wilson', phone: '+1555666777', role: 'customer', avatar_url: null, is_active: false, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
];

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string | null;
  role?: UserRole;
  is_active?: boolean;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setUsers(demoUsers);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUsers(data || demoUsers);
    } catch (err) {
      console.error('Fetch users error:', err);
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Demo mode - add to local state
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone || null,
          role: userData.role,
          avatar_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUsers(prev => [newUser, ...prev]);
        return { success: true };
      }

      const supabase = createClient();

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      });

      if (authError) throw authError;

      // The profile should be created automatically via trigger
      // But we can update the role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            role: userData.role,
            phone: userData.phone || null,
          })
          .eq('id', authData.user.id);

        if (profileError) console.error('Profile update error:', profileError);
      }

      await fetchUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (userId: string, updates: UpdateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Demo mode
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, ...updates, updated_at: new Date().toISOString() } : u
        ));
        return { success: true };
      }

      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Demo mode
        setUsers(prev => prev.filter(u => u.id !== userId));
        return { success: true };
      }

      const supabase = createClient();
      
      // Delete from user_profiles (auth user will cascade)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      return { success: false, error: errorMessage };
    }
  };

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    return updateUser(userId, { is_active: !user.is_active });
  };

  const changeUserRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    return updateUser(userId, { role });
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changeUserRole,
  };
}

// Hook to check if current user is admin
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // Demo mode - assume admin access
          setIsAdmin(true);
          setUserProfile(demoUsers[0]);
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setIsAdmin(profile.role === 'admin' || profile.role === 'staff');
        }
      } catch (err) {
        console.error('Admin check error:', err);
        // In demo mode, allow access
        setIsAdmin(true);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  return { isAdmin, loading, userProfile };
}

