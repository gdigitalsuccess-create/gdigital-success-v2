import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { profile_id, bg_color, primary_color, secondary_color, text_color, font_heading, logo_url, logo_position } = await req.json();
  if (!profile_id) return NextResponse.json({ error: 'profile_id manquant' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('carte_profiles')
    .update({ bg_color, primary_color, secondary_color, text_color, font_heading, logo_url: logo_url || null, logo_position })
    .eq('id', profile_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
