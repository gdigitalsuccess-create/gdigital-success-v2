import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { profile_id, is_mobile } = await req.json();
  if (!profile_id) return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });

  await supabaseAdmin.from('carte_visits').insert({
    profile_id,
    is_mobile: is_mobile ?? false,
  });

  return NextResponse.json({ ok: true });
}
