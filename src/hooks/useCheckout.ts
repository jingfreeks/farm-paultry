'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/context/CartContext';

export interface CheckoutFormData {
  // Contact Info
  email: string;
  fullName: string;
  phone: string;
  // Shipping Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Additional
  notes: string;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async (
    formData: CheckoutFormData,
    items: CartItem[],
    totalAmount: number
  ): Promise<OrderResult> => {
    setLoading(true);
    setError(null);

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Simulate order creation for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setLoading(false);
      return { success: true, orderId: mockOrderId };
    }

    try {
      const supabase = createClient();

      // Create shipping address string
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: formData.email,
          customer_name: formData.fullName,
          customer_phone: formData.phone || null,
          shipping_address: shippingAddress,
          total_amount: totalAmount,
          status: 'pending',
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setLoading(false);
      return { success: true, orderId: order.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    submitOrder,
    loading,
    error,
  };
}

