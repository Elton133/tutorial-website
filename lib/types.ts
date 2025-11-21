/**
 * Database type definitions for the video tutorial platform
 * These types represent the structure of tables in Supabase
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string; // Supabase Storage URL
  thumbnail_url?: string;
  price: number; // Price in smallest currency unit (e.g., kobo for NGN)
  created_at: string;
  updated_at: string;
  duration?: number; // Duration in seconds
  category?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  video_id: string;
  amount_paid: number;
  paystack_reference: string;
  payment_status: 'pending' | 'success' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Paystack payment response types
export interface PaystackPaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    customer: {
      id: number;
      email: string;
    };
    metadata?: {
      video_id: string;
      user_id: string;
    };
  };
}
