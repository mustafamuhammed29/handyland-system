import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ygpjxgwmdnlahyfujyra.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2WaMUPKEDuyXv25p234jJQ_GHlHpO4G';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
