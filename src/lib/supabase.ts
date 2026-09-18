import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env.VITE_*) and Next.js style (NEXT_PUBLIC_*)
const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const getSupabaseConfigurationError = (): string | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Variables Supabase absentes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.';
  }
  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.supabase.co')) {
      return 'URL Supabase invalide. Elle doit être une URL https://...supabase.co.';
    }
  } catch {
    return 'URL Supabase invalide.';
  }
  if (supabaseAnonKey.includes('your-anon-key') || supabaseUrl.includes('your-project')) {
    return 'Les identifiants Supabase sont encore des valeurs exemple.';
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => !getSupabaseConfigurationError();

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
    console.error('[v0] Supabase initialization failed:', err);
  }
}

export const supabase = supabaseInstance;
