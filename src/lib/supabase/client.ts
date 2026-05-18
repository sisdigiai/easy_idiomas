import { createClient } from "@supabase/supabase-js";

// Vite exposes env vars via import.meta.env
// The prompt mentioned NEXT_PUBLIC_, but we are inside a React+Vite app,
// so we translate them to VITE_ prefixed variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Add a safe fallback and warnings for unconfigured state
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== "PLACEHOLDER_SUPABASE_URL");

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "Supabase is not configured yet. The app will use mock fallback data until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
}

// Ensure createClient is only called if valid so we don't throw an error directly.
// In a real scenario you might want to return null, but for type simplicity 
// we will instantiate it with fake data if missing, and handle the fallback in the queries.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://mock.supabase.co", "mock-anon-key");

export { isSupabaseConfigured };
