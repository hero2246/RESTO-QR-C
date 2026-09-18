import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = import.meta.env;
const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || '';

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('[v0] Supabase client variables are not exposed to the Vite bundle.');
}

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
