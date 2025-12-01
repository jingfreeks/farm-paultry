'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/database';

// Demo admin data
const DEMO_ADMIN: UserProfile = {
  id: 'demo-admin',
  email: 'admin@goldenharvest.com',
  full_name: 'Demo Admin',
  phone: null,
  role: 'admin',
  avatar_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  userProfile: UserProfile | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
    userProfile: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      // Check demo mode first
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // In demo mode, check localStorage
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
          });
        }
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Also check demo login as fallback
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
          });
        }
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const isAdmin = profile.role === 'admin' || profile.role === 'staff';
        setState({
          isAuthenticated: true,
          isAdmin,
          loading: false,
          userProfile: profile,
        });
      } else {
        setState({
          isAuthenticated: true,
          isAdmin: false,
          loading: false,
          userProfile: null,
        });
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Fallback to demo check
      const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
      if (demoLoggedIn === 'true') {
        setState({
          isAuthenticated: true,
          isAdmin: true,
          loading: false,
          userProfile: DEMO_ADMIN,
        });
      } else {
        setState({
          isAuthenticated: false,
          isAdmin: false,
          loading: false,
          userProfile: null,
        });
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear demo login
      localStorage.removeItem('demo_admin_logged_in');
      localStorage.removeItem('demo_admin_email');

      // Try Supabase logout
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }

      setState({
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        userProfile: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    checkAuth,
    logout,
  };
}

