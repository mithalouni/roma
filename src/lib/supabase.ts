import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserAlert {
  id: string
  wallet_address: string
  email: string
  track_favorites: boolean
  track_my_domains: boolean
  track_trends: boolean
  track_other: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  last_sent_at: string | null
  next_send_at: string | null
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * Execute SQL query using Supabase RPC or direct query
 * Note: This is a placeholder. Use the table API methods directly instead.
 */
export async function executeSql(_query: string, _params?: any[]) {
  // Since we're using the JavaScript client, we'll use the table API instead of raw SQL
  // This is a helper that maps to the appropriate table operations
  throw new Error('Use table-specific methods instead of raw SQL')
}
