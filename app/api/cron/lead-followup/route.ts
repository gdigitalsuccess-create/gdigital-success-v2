import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BREVO_KEY   = process.env.BREVO_API_KEY!;
const BASE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalsucces.tech';
const AGENCY_NAME = 'G+Digital Success';

async function sendMail({ to, fromName, subject, html }: {
  to: string; fromName: string; subject: string; html: string;
}) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender:    { name: fromName, email: 'contact@digitalsucces.tech' },
      to:        [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo ${res.status}: ${JSON.stringify(err)}`);
  }
}

function getDelayHours(step: number): number {
  if (step === 0) return 24;       // 1er envoi : 24h après le lead
  if (step === 1) return 3 * 24;   // 2e envoi : 3 jours après le 1er
  return 7 * 24;                   // ensuite : toutes les semaines
}

function getSubject(step: number, ownerFirstName: string, visitorFirstName: string): string {
  const subjects = [
    `${ownerFirstName} vous a envoyé un message`,
    `Toujours disponible pour vous, ${visitorFirstName}`,
    `Un point de contact de ${ownerFirstName}`,
  ];
  return subjects[step] ?? `Message de ${ownerFirstName}`;
}

function getDefaultMessage(step: number, ownerFirstName: string, visitorFirstName: string): string {
  const messages = [
    `Bonjour ${visitorFirstName}, c'est ${ownerFirstName}. Ravi d'avoir eu votre visite sur ma carte ! Je reste disponible si vous avez des questions ou si vous souhaitez échanger.`,
    `Bonjour ${visitorFirstName}, je me permets de vous recontacter. Avez-vous eu le temps de consulter ma carte ? N'hésitez pas à me contacter si je peux vous être utile.`,
    `Bonjour ${visitorFirstName}, je voulais m'assurer que vous avez bien reçu mes informations. Mon offre est toujours disponible — n'hésitez pas à revenir vers moi.`,
  ];
  return messages[step] ?? `Bonjour ${visitorFirstName}, ${ownerFirstName} pense à vous. N'hésitez pas à me contacter si je peux vous être utile.`;
}

function buildEmail(opts: {
  ownerName: string;
  visitorFirstName: string;
  message: string;
  cardUrl: string;
  unsubscribeUrl: string;
}): string {
  const { ownerName, message, cardUrl, unsubscribeUrl } = opts;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#1B3464 0%,#2a4f8f 100%);padding:28px 32px">
    <h1 style="color:#D4A843;margin:0;font-size:20px;font-weight:900">${ownerName}</h1>
    <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px">${AGENCY_NAME}</p>
  </div>
  <div style="padding:32px;color:#333;font-size:15px;line-height:1.8">
    <p style="margin:0 0 24px">${message.replace(/\n/g, '<br>')}</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${cardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B3464,#2a4f8f);color:#D4A843;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none">
        Voir ma carte digitale
      </a>
    </div>
  </div>
  <div style="background:#f8faff;padding:14px 32px;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee">
    ${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa;text-decoration:none">digitalsucces.tech</a>
    &nbsp;·&nbsp;
    <a href="${unsubscribeUrl}" style="color:#aaa;text-decoration:underline">Ne plus recevoir ces messages</a>
  </div>
</div>
</body></html>`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const now = new Date();

  // Leads éligibles : suivi activé, pas désabonné, pas répondu, email présent
  const { data: leads, error } = await supabaseAdmin
    .from('carte_leads')
    .select(`
      id, visitor_name, visitor_email, followup_step, followup_sent_at, created_at,
      carte_profiles!inner(name, email, slug, followup_enabled, followup_message)
    `)
    .not('visitor_email', 'is', null)
    .is('followup_responded_at', null)
    .not('followup_unsubscribed', 'is', true);

  if (error) {
    console.error('[cron/lead-followup] DB error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;

  for (const lead of leads) {
    const profile = Array.isArray(lead.carte_profiles)
      ? lead.carte_profiles[0]
      : lead.carte_profiles as { name: string; email: string; slug: string; followup_enabled: boolean; followup_message: string };

    if (!profile?.followup_enabled) continue;

    const step        = (lead.followup_step as number) ?? 0;
    const lastSentAt  = lead.followup_sent_at ? new Date(lead.followup_sent_at as string) : null;
    const createdAt   = new Date(lead.created_at as string);
    const delayHours  = getDelayHours(step);

    // Référence temporelle : created_at pour le 1er envoi, last_sent_at pour les suivants
    const reference   = lastSentAt ?? createdAt;
    const readyAt     = new Date(reference.getTime() + delayHours * 60 * 60 * 1000);

    if (now < readyAt) continue; // pas encore le moment

    const ownerFirstName   = (profile.name as string).split(' ')[0];
    const visitorFirstName = (lead.visitor_name as string).split(' ')[0];
    const cardUrl          = `${BASE_URL}/c/${profile.slug}`;
    const unsubToken       = Buffer.from(lead.id as string).toString('base64');
    const unsubscribeUrl   = `${BASE_URL}/api/carte/followup-unsubscribe?token=${unsubToken}`;

    const customMsg = (profile.followup_message as string)?.trim();
    const message   = customMsg || getDefaultMessage(step, ownerFirstName, visitorFirstName);
    const subject   = getSubject(step, ownerFirstName, visitorFirstName);

    try {
      await sendMail({
        to:       lead.visitor_email as string,
        fromName: profile.name as string,
        subject,
        html:     buildEmail({ ownerName: profile.name as string, visitorFirstName, message, cardUrl, unsubscribeUrl }),
      });

      await supabaseAdmin
        .from('carte_leads')
        .update({
          followup_step:    step + 1,
          followup_sent_at: now.toISOString(),
        })
        .eq('id', lead.id);

      sent++;
    } catch (e) {
      console.error(`[cron/lead-followup] Erreur lead ${lead.id}:`, e);
    }
  }

  console.log(`[cron/lead-followup] Envoyé: ${sent}/${leads.length}`);
  return NextResponse.json({ ok: true, sent, total: leads.length });
}
