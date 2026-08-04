import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qgvdwrmbbuzyxymanocl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YS66UTEClfU2fIu3eJtjhA_4mf9r5ww';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
