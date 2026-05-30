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

  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ total: 0, thisWeek: 0, thisMonth: 0, daily: [] });

  const now       = new Date();
  const day7ago   = new Date(now); day7ago.setDate(now.getDate() - 6);
  const month1ago = new Date(now); month1ago.setDate(now.getDate() - 29);

  day7ago.setHours(0, 0, 0, 0);
  month1ago.setHours(0, 0, 0, 0);

  // Total all-time
  const { count: total } = await supabaseAdmin
    .from('carte_visits')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id);

  // Ce mois (30 jours)
  const { count: thisMonth } = await supabaseAdmin
    .from('carte_visits')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)
    .gte('visited_at', month1ago.toISOString());

  // Cette semaine (7 jours)
  const { count: thisWeek } = await supabaseAdmin
    .from('carte_visits')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)
    .gte('visited_at', day7ago.toISOString());

  // Détail 7 derniers jours (pour le graphique)
  const { data: raw } = await supabaseAdmin
    .from('carte_visits')
    .select('visited_at, is_mobile')
    .eq('profile_id', profile.id)
    .gte('visited_at', day7ago.toISOString())
    .order('visited_at', { ascending: true });

  // Grouper par jour
  const dayMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(day7ago);
    d.setDate(day7ago.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  (raw ?? []).forEach((v: { visited_at: string }) => {
    const key = v.visited_at.slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  });

  const daily = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // Mobile vs desktop (30 jours)
  const mobile  = (raw ?? []).filter((v: { is_mobile: boolean }) => v.is_mobile).length;
  const desktop = (raw ?? []).length - mobile;

  return NextResponse.json({
    total:     total     ?? 0,
    thisMonth: thisMonth ?? 0,
    thisWeek:  thisWeek  ?? 0,
    daily,
    mobile,
    desktop,
  });
}
