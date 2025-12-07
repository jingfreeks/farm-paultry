'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CompanySettings {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySettingsData {
  company_name?: string | null;
  logo_url?: string | null;
}

const DEFAULT_SETTINGS: CompanySettings = {
  id: '00000000-0000-0000-0000-000000000000',
  company_name: 'Golden Harvest Farm',
  logo_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Demo mode
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const result = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (result.error) {
        // If no row exists, use default
        if (result.error.code === 'PGRST116' || result.error.message?.includes('No rows')) {
          setSettings(DEFAULT_SETTINGS);
        } else {
          throw result.error;
        }
      } else {
        // Type assertion to work around TypeScript inference issue with Supabase types
        const data = result.data as CompanySettings;
        // Normalize the data to ensure null instead of undefined
        const normalizedData: CompanySettings = {
          ...data,
          logo_url: data.logo_url ?? null,
        };
        setSettings(normalizedData);
      }
    } catch (err) {
      console.error('Fetch company settings error:', err);
      setSettings(DEFAULT_SETTINGS);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (updates: CompanySettingsData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Demo mode
        setSettings(prev => {
          if (!prev) return null;
          const updated: CompanySettings = {
            ...prev,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          return updated;
        });
        return { success: true };
      }

      const supabase = createClient();
      
      // Check if settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('company_settings')
        .select('id')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();

      // If settings don't exist, create them
      if (checkError && (checkError.code === 'PGRST116' || checkError.message?.includes('No rows'))) {
        const { error: createError } = await supabase
          .from('company_settings')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            company_name: updates.company_name || DEFAULT_SETTINGS.company_name,
            logo_url: updates.logo_url || null,
          });

        if (createError) {
          throw createError;
        }
      } else if (checkError) {
        throw checkError;
      }

      // Update settings
      // Type assertion to work around TypeScript inference issue with Supabase types
      const result = await (supabase
        .from('company_settings')
        .update as any)(updates)
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      // Type assertion to work around TypeScript inference issue with Supabase types
      const updatedData = result.data as CompanySettings;
      // Normalize the data to ensure null instead of undefined
      const normalizedData: CompanySettings = {
        ...updatedData,
        logo_url: updatedData.logo_url ?? null,
      };
      
      setSettings(normalizedData);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}

