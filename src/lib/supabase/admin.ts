import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE ROLE KEY. 
// It bypasses Row Level Security. NEVER use this in the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
