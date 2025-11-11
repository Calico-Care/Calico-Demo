import { createClient } from "@supabase/supabase-js";

const env = import.meta.env;

const supabaseUrl =
  env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase URL. Set VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase anon key. Set VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "calico_supabase_auth",
  },
});
