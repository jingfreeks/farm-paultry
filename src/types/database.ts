export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          unit: string;
          category: 'poultry' | 'eggs' | 'produce';
          image_url: string | null;
          emoji: string | null;
          badge: string | null;
          badge_color: string | null;
          stock: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          unit: string;
          category: 'poultry' | 'eggs' | 'produce';
          image_url?: string | null;
          emoji?: string | null;
          badge?: string | null;
          badge_color?: string | null;
          stock?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          unit?: string;
          category?: 'poultry' | 'eggs' | 'produce';
          image_url?: string | null;
          emoji?: string | null;
          badge?: string | null;
          badge_color?: string | null;
          stock?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          shipping_address: string;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          shipping_address: string;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          shipping_address?: string;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          content: string;
          author: string;
          role: string | null;
          avatar: string | null;
          rating: number;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author: string;
          role?: string | null;
          avatar?: string | null;
          rating?: number;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author?: string;
          role?: string | null;
          avatar?: string | null;
          rating?: number;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'staff' | 'customer';
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'staff' | 'customer';
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'staff' | 'customer';
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      product_category: 'poultry' | 'eggs' | 'produce';
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      user_role: 'admin' | 'staff' | 'customer';
    };
  };
};

// Helper types
export type Product = Database['public']['Tables']['products']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];

