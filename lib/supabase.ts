import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Lead = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  budget: string | null;
  delai: string | null;
  message: string | null;
  lang: 'fr' | 'en';
  status: 'new' | 'contacted' | 'converted' | 'lost';
  created_at: string;
};
