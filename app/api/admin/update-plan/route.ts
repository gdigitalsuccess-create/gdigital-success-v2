import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { profile_id, new_plan } = await req.json();
  if (!profile_id || !new_plan) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('carte_profiles')
    .update({ plan: new_plan })
    .eq('id', profile_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
