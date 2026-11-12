import { createClient } from '@supabase/supabase-js';
// Server-only. Never import this file from a client component.
export const db = () => {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set.');
  return createClient(url, key, { auth: { persistSession: false } });
};
