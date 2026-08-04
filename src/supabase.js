import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qgvdwrmbbuzyxymanocl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YS66UTEClfU2fIu3eJtjhA_4mf9r5ww';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
