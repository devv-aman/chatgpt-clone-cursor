import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get the Supabase client with publishable key for user-facing operations
 * This client respects Row Level Security policies
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return supabaseClient;
};

/**
 * Get the Supabase admin client with secret key
 * This client bypasses Row Level Security - use with caution!
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SECRET_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return supabaseAdminClient;
};

/**
 * Create a Supabase client authenticated with a user's access token
 * Use this for operations that should respect the user's permissions
 */
export const getSupabaseClientWithToken = (accessToken: string): SupabaseClient => {
  return createClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
};

export type { SupabaseClient };
