import { createClient } from '@supabase/supabase-js'

// In a real app, these should be in .env.local
// For this educational project/demo, we'll provide a mock mechanism for when keys are missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// A mocked auth flag if keys aren't provided yet
export const isMocked = !import.meta.env.VITE_SUPABASE_URL;
