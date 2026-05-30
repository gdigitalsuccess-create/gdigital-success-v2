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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoIso = threeDaysAgo.toISOString();

  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const fourDaysAgoIso = fourDaysAgo.toISOString();

  // Souscriptions de visiteurs scannées il y a exactement 3 jours (fenêtre 24h)
  const { data: subs } = await supabaseAdmin
    .from('carte_push_subscriptions')
    .select('id, endpoint, p256dh, auth, visitor_name, profile_id, carte_profiles(name, slug)')
    .eq('type', 'visitor')
    .gte('scanned_at', fourDaysAgoIso)
    .lte('scanned_at', threeDaysAgoIso);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  const expired: string[] = [];

  type SubRow = {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    visitor_name: string | null;
    profile_id: string;
    carte_profiles: { name: string; slug: string } | { name: string; slug: string }[] | null;
  };

  await Promise.allSettled(
    subs.map(async (sub: SubRow) => {
      const cp          = Array.isArray(sub.carte_profiles) ? sub.carte_profiles[0] : sub.carte_profiles;
      const profileName = cp?.name ?? 'votre contact';
      const slug        = cp?.slug ?? '';
      const visitorName = sub.visitor_name ? ` ${sub.visitor_name}` : '';

      const payload = JSON.stringify({
        title: `Rappel — ${profileName}`,
        body:  `Vous avez scanné la carte de${visitorName ? '' : ' ' + profileName} il y a 3 jours. Pensez à recontacter${visitorName} !`,
        icon:  '/assets/logo-gdigital.png',
        url:   `https://digitalsucces.tech/c/${slug}`,
      });

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

  if (expired.length > 0) {
    await supabaseAdmin
      .from('carte_push_subscriptions')
      .delete()
      .in('endpoint', expired);
  }

  console.log(`[cron/push-reminders] Envoyé: ${sent}, Expirés: ${expired.length}`);
  return NextResponse.json({ ok: true, sent, expired: expired.length });
}
