import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user ?? null;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabaseAdmin
    .from('carte_links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { profile_id, label, url, icon, position } = await req.json();
  if (!profile_id || !label || !url) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('id', profile_id)
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('carte_links')
    .insert({ profile_id, label, url, icon: icon ?? null, position: position ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { link_id } = await req.json();
  if (!link_id) return NextResponse.json({ error: 'link_id manquant' }, { status: 400 });

  const { data: link } = await supabaseAdmin
    .from('carte_links')
    .select('id, profile_id')
    .eq('id', link_id)
    .single();

  if (link) {
    const { data: profile } = await supabaseAdmin
      .from('carte_profiles')
      .select('id')
      .eq('id', link.profile_id)
      .eq('user_id', user.id)
      .single();
    if (!profile) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('carte_links').delete().eq('id', link_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
