import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { title, body, url } = await req.json();
  if (!title || !body) return NextResponse.json({ error: 'title et body requis' }, { status: 400 });

  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('id, plan, slug')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const plan = (profile.plan ?? 'starter').toLowerCase();
  if (plan === 'starter') {
    return NextResponse.json({ error: 'Fonctionnalité Pro/Business uniquement' }, { status: 403 });
  }

  const { data: subs } = await supabaseAdmin
    .from('carte_push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('profile_id', profile.id)
    .eq('type', 'visitor');

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const payload = JSON.stringify({
    title,
    body,
    icon:  '/assets/logo-gdigital.png',
    url:   url || `https://digitalsucces.tech/c/${profile.slug}`,
  });

  let sent = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          expired.push(sub.endpoint);
        }
      }
    })
  );

  // Supprimer les souscriptions expirées
  if (expired.length > 0) {
    await supabaseAdmin
      .from('carte_push_subscriptions')
      .delete()
      .in('endpoint', expired);
  }

  return NextResponse.json({ ok: true, sent, expired: expired.length });
}
