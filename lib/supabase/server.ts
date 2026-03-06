import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Server-side client with elevated privileges (uses secret key)
 * Use for: Webhook endpoints, admin operations, bypassing RLS
 * Note: Uses new sb_secret_ key (replaces old service_role key)
 */
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Server-side client with auth-based access (uses publishable key)
 * Use for: Server components, API routes that respect RLS
 * Note: Uses new sb_publishable_ key (replaces old anon key)
 */
export function createServerAuthClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
