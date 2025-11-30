'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types/database';

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false });
        
        if (category && category !== 'All') {
          query = query.eq('category', category.toLowerCase());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  return { products, loading, error };
}

