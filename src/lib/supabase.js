import { createClient } from '@supabase/supabase-js'

// Supabase is optional. When env vars are absent the portal falls back to a
// localStorage-backed demo store (see ./store.js) so the whole site works offline.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && anonKey)
export const supabase = supabaseEnabled ? createClient(url, anonKey) : null
