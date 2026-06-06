import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Récupérer les IDs de tous les membres
  const { data: members } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('team_owner_id', user.id);

  if (!members?.length) return NextResponse.json({});

  const memberIds = members.map(m => m.id);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 29);
  since30.setHours(0, 0, 0, 0);

  // Compter les vues par membre (30 jours)
  const { data: visits } = await supabaseAdmin
    .from('carte_visits')
    .select('profile_id')
    .in('profile_id', memberIds)
    .gte('visited_at', since30.toISOString());

  // Compter les leads par membre (30 jours)
  const { data: leads } = await supabaseAdmin
    .from('carte_leads')
    .select('profile_id')
    .in('profile_id', memberIds)
    .gte('created_at', since30.toISOString());

  // Agréger par membre
  const stats: Record<string, { visits: number; leads: number }> = {};
  for (const id of memberIds) stats[id] = { visits: 0, leads: 0 };
  (visits ?? []).forEach((v: { profile_id: string }) => { if (stats[v.profile_id]) stats[v.profile_id].visits++; });
  (leads  ?? []).forEach((l: { profile_id: string }) => { if (stats[l.profile_id]) stats[l.profile_id].leads++; });

  return NextResponse.json(stats);
}
