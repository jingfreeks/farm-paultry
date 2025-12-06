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
  authUser: { id: string; email: string; user_metadata?: { full_name?: string } } | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
    userProfile: null,
    authUser: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        setState({
          isAuthenticated: false,
          isAdmin: false,
          loading: false,
          userProfile: null,
          authUser: null,
        });
        return;
      }

      // Check demo mode first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // In demo mode, check localStorage
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
            authUser: {
              id: 'demo-admin',
              email: 'admin@goldenharvest.com',
              user_metadata: { full_name: 'Demo Admin' },
            },
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
            authUser: null,
          });
        }
        return;
      }

      const supabase = createClient();
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      // If there's an error getting user, check demo login as fallback
      if (getUserError) {
        console.warn('Error getting user:', getUserError);
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
            authUser: {
              id: 'demo-admin',
              email: 'admin@goldenharvest.com',
              user_metadata: { full_name: 'Demo Admin' },
            },
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
            authUser: null,
          });
        }
        return;
      }

      if (!user) {
        // Also check demo login as fallback
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
            authUser: {
              id: 'demo-admin',
              email: 'admin@goldenharvest.com',
              user_metadata: { full_name: 'Demo Admin' },
            },
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
            authUser: null,
          });
        }
        return;
      }

      // Store auth user data
      const authUserData = {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata || {},
      };

      // Get user profile with error handling
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        // If profile doesn't exist, user is authenticated but not admin
        setState({
          isAuthenticated: true,
          isAdmin: false,
          loading: false,
          userProfile: null,
          authUser: authUserData,
        });
        return;
      }

      if (profile) {
        const profileData = profile as UserProfile;
        const isAdmin = profileData.role === 'admin' || profileData.role === 'staff';
        // Merge auth user data with profile, prioritizing auth user's full_name
        const mergedProfile: UserProfile = {
          ...profileData,
          full_name: user.user_metadata?.full_name || profileData.full_name || null,
          email: user.email || profileData.email,
        };
        setState({
          isAuthenticated: true,
          isAdmin,
          loading: false,
          userProfile: mergedProfile,
          authUser: authUserData,
        });
      } else {
        setState({
          isAuthenticated: true,
          isAdmin: false,
          loading: false,
          userProfile: null,
          authUser: authUserData,
        });
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Always set loading to false on error
      // Fallback to demo check
      if (typeof window !== 'undefined') {
        const demoLoggedIn = localStorage.getItem('demo_admin_logged_in');
        if (demoLoggedIn === 'true') {
          setState({
            isAuthenticated: true,
            isAdmin: true,
            loading: false,
            userProfile: DEMO_ADMIN,
            authUser: {
              id: 'demo-admin',
              email: 'admin@goldenharvest.com',
              user_metadata: { full_name: 'Demo Admin' },
            },
          });
        } else {
          setState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            userProfile: null,
            authUser: null,
          });
        }
      } else {
        setState({
          isAuthenticated: false,
          isAdmin: false,
          loading: false,
          userProfile: null,
          authUser: null,
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
        authUser: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.warn('Auth check timeout, setting loading to false');
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 10000); // 10 second timeout

    checkAuth().catch(err => {
      console.error('Auth check failed:', err);
      setState({
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        userProfile: null,
        authUser: null,
      });
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkAuth]);

  return {
    ...state,
    checkAuth,
    logout,
  };
}

