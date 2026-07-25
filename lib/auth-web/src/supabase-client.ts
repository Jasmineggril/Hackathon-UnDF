import { createClient, type Session, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in your .env',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type { Session, User };
