import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false } })
  : null;

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          old_price: number | null;
          category_id: string | null;
          images: string[] | null;
          variants: any | null;
          stock: number;
          type: 'ready' | 'custom' | 'combo';
          is_featured: boolean;
          is_combo: boolean;
          created_at: string;
          updated_at: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          name_bn: string | null;
          slug: string;
          image: string | null;
          parent_id: string | null;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_id: string;
          user_id: string | null;
          status: string;
          customer_name: string;
          customer_phone: string;
          shipping_address: string | null;
          area_id: string | null;
          payment_method: string;
          payment_status: string;
          subtotal: number;
          delivery_charge: number;
          discount: number;
          total: number;
          courier: string | null;
          tracking_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
      };
      areas: {
        Row: {
          id: string;
          name: string;
          district: string;
          delivery_charge: number;
          courier: string | null;
          created_at: string;
        };
      };
    };
  };
};