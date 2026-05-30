import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { profile_id, subscription, type, visitor_name } = await req.json();

  if (!profile_id || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('carte_push_subscriptions')
    .upsert(
      {
        profile_id,
        endpoint:     subscription.endpoint,
        p256dh:       subscription.keys.p256dh,
        auth:         subscription.keys.auth,
        type:         type || 'visitor',
        visitor_name: visitor_name || null,
        scanned_at:   new Date().toISOString(),
      },
      { onConflict: 'profile_id,endpoint' }
    );

  if (error) {
    console.error('[push/subscribe]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { profile_id, endpoint } = await req.json();
  if (!profile_id || !endpoint) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });

  await supabaseAdmin
    .from('carte_push_subscriptions')
    .delete()
    .eq('profile_id', profile_id)
    .eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
