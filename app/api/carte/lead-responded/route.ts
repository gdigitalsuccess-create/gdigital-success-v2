import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { lead_id } = await req.json();
  if (!lead_id) return NextResponse.json({ error: 'lead_id manquant' }, { status: 400 });

  // Vérifier que le lead appartient bien au profil de l'utilisateur connecté
  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const { error } = await supabaseAdmin
    .from('carte_leads')
    .update({ followup_responded_at: new Date().toISOString() })
    .eq('id', lead_id)
    .eq('profile_id', profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
