import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey.trim() !== ''
  );
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (!isSupabaseConfigured()) {
    return null;
  }

  clientInstance = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  return clientInstance;
}
