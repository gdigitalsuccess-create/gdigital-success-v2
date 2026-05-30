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

// GET — lire les documents du profil
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Trouver le profil de cet utilisateur
  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabaseAdmin
    .from('carte_documents')
    .select('*')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

// POST — ajouter un document
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { profile_id, name, url, type, position } = await req.json();
  if (!profile_id || !name || !url) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Vérifier que le profil appartient à cet utilisateur
  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('id', profile_id)
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('carte_documents')
    .insert({ profile_id, name, url, type: type ?? 'pdf', position: position ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE — supprimer un document
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { doc_id } = await req.json();
  if (!doc_id) return NextResponse.json({ error: 'doc_id manquant' }, { status: 400 });

  // Vérifier que le doc appartient à un profil de cet utilisateur
  const { data: doc } = await supabaseAdmin
    .from('carte_documents')
    .select('id, profile_id')
    .eq('id', doc_id)
    .single();

  if (doc) {
    const { data: profile } = await supabaseAdmin
      .from('carte_profiles')
      .select('id')
      .eq('id', doc.profile_id)
      .eq('user_id', user.id)
      .single();
    if (!profile) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('carte_documents').delete().eq('id', doc_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
