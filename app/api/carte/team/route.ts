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

const TEAM_LIMITS: Record<string, number> = {
  pro: 2,
  business: 5,
  business_team: 10,
};

async function getPlanLimit(userId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('carte_profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();
  return TEAM_LIMITS[data?.plan?.toLowerCase() ?? ''] ?? 0;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

// GET — liste les cartes de l'équipe
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .select('id, slug, name, title, email, phone, active, photo_url, created_at')
    .eq('team_owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

// POST — crée une carte membre
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const limit = await getPlanLimit(user.id);
  if (limit === 0) {
    return NextResponse.json({ error: 'Plan Pro ou supérieur requis' }, { status: 403 });
  }

  const { count } = await supabaseAdmin
    .from('carte_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('team_owner_id', user.id);

  if ((count ?? 0) >= limit) {
    return NextResponse.json({ error: `Limite de ${limit} membres atteinte` }, { status: 400 });
  }

  const { name, title, email, phone, slug: slugInput } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
  }

  const slug = slugInput?.trim() || slugify(name);

  const { data: existing } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('slug', slug).single();
  if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 });

  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .insert({ slug, name: name.trim(), title: title?.trim() || null, email: email.trim(), phone: phone?.trim() || null, active: true, plan: 'starter', team_owner_id: user.id })
    .select('id, slug, name, title, email, phone, active, photo_url')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// PATCH — modifie une carte membre (infos ou active)
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const { data: member } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('id', id).eq('team_owner_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const allowed = ['name', 'title', 'email', 'phone', 'active', 'slug'];
  const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .update(update)
    .eq('id', id)
    .select('id, slug, name, title, email, phone, active, photo_url')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE — supprime une carte membre
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const { data: member } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('id', id).eq('team_owner_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { error } = await supabaseAdmin.from('carte_profiles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
