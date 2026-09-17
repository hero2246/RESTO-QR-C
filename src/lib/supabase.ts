import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env.VITE_*) and Next.js style (NEXT_PUBLIC_*)
const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') && 
    !supabaseAnonKey.includes('your-anon-key')
  );
};

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Supabase initialization failed, falling back to local client:', err);
  }
}

export const supabase = supabaseInstance;
