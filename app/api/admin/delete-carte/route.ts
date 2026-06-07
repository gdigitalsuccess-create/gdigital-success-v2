import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant dans Vercel' }, { status: 500 });
  }

  const { profile_id, slug, user_id } = await req.json();

  if (!profile_id || !slug) {
    return NextResponse.json({ error: 'profile_id et slug requis' }, { status: 400 });
  }

  // 1. Supprimer les fichiers Storage (photo, logo, docs, cover)
  const { data: files } = await supabaseAdmin.storage
    .from('carte-images')
    .list(slug);

  if (files && files.length > 0) {
    const paths = files.map(f => `${slug}/${f.name}`);
    await supabaseAdmin.storage.from('carte-images').remove(paths);
  }

  // 2. Supprimer toutes les tables liées
  await supabaseAdmin.from('carte_chat_logs').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_documents').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_portfolio').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_links').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_videos').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_visits').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_leads').delete().eq('profile_id', profile_id);
  await supabaseAdmin.from('carte_push_subscriptions').delete().eq('profile_id', profile_id);

  // 3. Supprimer le profil
  const { error: profileErr } = await supabaseAdmin
    .from('carte_profiles')
    .delete()
    .eq('id', profile_id);

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  // 4. Vérifier que la suppression a bien eu lieu
  const { data: check } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('id', profile_id)
    .single();

  if (check) {
    return NextResponse.json({ ok: false, stillExists: true, error: 'Ligne toujours présente après DELETE (RLS ?)' }, { status: 500 });
  }

  // 5. Supprimer le compte Auth si user_id connu
  if (user_id) {
    await supabaseAdmin.auth.admin.deleteUser(user_id);
  }

  return NextResponse.json({ ok: true, stillExists: false });
}
