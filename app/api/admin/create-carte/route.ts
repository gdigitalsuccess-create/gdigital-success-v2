import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, name, email, title, company, plan, bg_color, primary_color, secondary_color, text_color, font_heading, logo_url, logo_position } = body;

  if (!slug || !name || !email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('carte_profiles').insert({
    slug,
    name,
    email:       email    || null,
    title:       title    || null,
    company:     company  || null,
    phone:       '',
    description: '',
    plan:        plan || 'starter',
    active:      true,
    bg_color:        bg_color        || '#0D0D1A',
    primary_color:   primary_color   || '#00CFFF',
    secondary_color: secondary_color || '#D4A843',
    text_color:      text_color      || '#FFFFFF',
    font_heading:    font_heading    || 'Inter',
    ...(logo_url        ? { logo_url }        : {}),
    ...(logo_position   ? { logo_position }   : {}),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message.includes('unique') ? 'Ce slug est déjà utilisé.' : error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
