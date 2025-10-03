import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxlksmhjzndopuavihlw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bGtzbWhqem5kb3B1YXZpaGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODI5MDcsImV4cCI6MjA3NDg1ODkwN30.h2x8L4emY-i8tefhX7JsE-HSWXuRKE_abQ2qm-bHMQA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Execute SQL query using Supabase RPC or direct query
 * Note: This is a placeholder. Use the table API methods directly instead.
 */
export async function executeSql(_query: string, _params?: any[]) {
  // Since we're using the JavaScript client, we'll use the table API instead of raw SQL
  // This is a helper that maps to the appropriate table operations
  throw new Error('Use table-specific methods instead of raw SQL')
}
