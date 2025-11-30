'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submitContactForm(data: ContactFormData) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const supabase = createClient();
      
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message,
        }]);
      
      if (error) throw error;
      
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setError(null);
    setSuccess(false);
  }

  return { submitContactForm, loading, error, success, resetForm };
}

