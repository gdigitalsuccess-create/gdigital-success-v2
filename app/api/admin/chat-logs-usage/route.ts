import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { profile_ids, since } = await req.json();
  if (!Array.isArray(profile_ids) || profile_ids.length === 0) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseAdmin
    .from('carte_chat_logs')
    .select('profile_id, created_at')
    .in('profile_id', profile_ids)
    .gte('created_at', since);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
