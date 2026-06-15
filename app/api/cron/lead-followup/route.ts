import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BREVO_KEY    = process.env.BREVO_API_KEY!;
const AGENCY_NAME  = 'G+Digital Success';

async function sendMail({ to, fromName, fromEmail, subject, html }: {
  to: string; fromName: string; fromEmail: string; subject: string; html: string;
}) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: fromName, email: 'contact@digitalsucces.tech' },
      replyTo: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo ${res.status}: ${JSON.stringify(err)}`);
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Leads créés entre 24h et 48h (fenêtre de 24h pour ne pas rater ni doubler)
  const now = new Date();
  const from = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: leads, error } = await supabaseAdmin
    .from('carte_leads')
    .select(`
      id, visitor_name, visitor_email, message, created_at,
      carte_profiles!inner(id, name, email, slug, followup_enabled, followup_message)
    `)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .is('followup_sent_at', null)
    .not('visitor_email', 'is', null);

  if (error) {
    console.error('[cron/lead-followup] DB error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  const sentIds: string[] = [];

  for (const lead of leads) {
    const profile = Array.isArray(lead.carte_profiles)
      ? lead.carte_profiles[0]
      : lead.carte_profiles;

    if (!profile?.followup_enabled || !profile?.email) continue;

    const ownerFirstName  = (profile.name as string).split(' ')[0];
    const visitorFirstName = (lead.visitor_name as string).split(' ')[0];
    const cardUrl = `https://digitalsucces.tech/c/${profile.slug}`;

    const customMessage = (profile.followup_message as string)?.trim()
      || `Bonjour ${visitorFirstName}, c'est ${ownerFirstName}. Ravi d'avoir eu votre visite sur ma carte ! Je reste disponible si vous avez des questions.`;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#1B3464 0%,#2a4f8f 100%);padding:28px 32px">
    <h1 style="color:#D4A843;margin:0;font-size:20px;font-weight:900">${profile.name}</h1>
    <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px">${AGENCY_NAME}</p>
  </div>
  <div style="padding:32px;color:#333;font-size:15px;line-height:1.7">
    <p style="margin:0 0 20px">${customMessage.replace(/\n/g, '<br>')}</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${cardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B3464,#2a4f8f);color:#D4A843;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none">
        Voir ma carte digitale
      </a>
    </div>
  </div>
  <div style="background:#f8faff;padding:14px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee">
    ${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa;text-decoration:none">digitalsucces.tech</a>
  </div>
</div>
</body></html>`;

    try {
      await sendMail({
        to:        lead.visitor_email as string,
        fromName:  profile.name as string,
        fromEmail: profile.email as string,
        subject:   `${ownerFirstName} vous a envoyé un message`,
        html,
      });
      sentIds.push(lead.id as string);
      sent++;
    } catch (e) {
      console.error(`[cron/lead-followup] Erreur envoi lead ${lead.id}:`, e);
    }
  }

  // Marquer les leads comme traités
  if (sentIds.length > 0) {
    await supabaseAdmin
      .from('carte_leads')
      .update({ followup_sent_at: new Date().toISOString() })
      .in('id', sentIds);
  }

  console.log(`[cron/lead-followup] Envoyé: ${sent}/${leads.length}`);
  return NextResponse.json({ ok: true, sent, total: leads.length });
}
