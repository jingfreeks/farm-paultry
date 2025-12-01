'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/database';

export interface UserProfileData {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Demo mode
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          phone: null,
          role: 'customer',
          avatar_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // If profile doesn't exist (PGRST116 = no rows returned), create one
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows')) {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || null,
                role: 'customer',
              })
              .select()
              .single();

            if (createError) {
              // If insert fails (e.g., RLS policy issue), log and use fallback
              console.warn('Could not create profile, using fallback:', createError);
              throw createError;
            }
            setProfile(newProfile);
          } catch (createErr) {
            // If creation fails, use fallback profile from auth user
            console.warn('Profile creation failed, using auth user data:', createErr);
            setProfile({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              phone: null,
              role: 'customer',
              avatar_url: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          // Other errors - log and use fallback
          console.warn('Profile fetch error, using fallback:', fetchError);
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            phone: null,
            role: 'customer',
            avatar_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      const errorMessage = err instanceof Error 
        ? (err.message || JSON.stringify(err))
        : 'Failed to fetch profile';
      setError(errorMessage);
      // Always provide fallback profile from auth user
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        phone: null,
        role: 'customer',
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: UserProfileData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Demo mode - just update local state
        setProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
        return { success: true };
      }

      const supabase = createClient();
      
      // Update user profile (don't set updated_at manually - trigger handles it)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Also update auth user metadata if full_name changed
      if (updates.full_name !== undefined) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: updates.full_name },
        });
        if (authError) console.error('Error updating auth metadata:', authError);
      }

      // Also update customer record (don't set updated_at manually - trigger handles it)
      if (user.email) {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            full_name: updates.full_name || null,
            phone: updates.phone || null,
          })
          .eq('email', user.email);
        
        if (customerError) {
          console.warn('Customer update error (non-critical):', customerError);
          // Don't fail the whole update if customer update fails
        }
      }

      await fetchProfile();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

