import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BREVO_KEY    = process.env.BREVO_API_KEY!;
const AGENCY_EMAIL = 'contact@digitalsucces.tech';
const AGENCY_NAME  = 'G+Digital Success';

async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: AGENCY_NAME, email: AGENCY_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[carte/lead] Brevo error', res.status, err);
    throw new Error(`Brevo ${res.status}: ${JSON.stringify(err)}`);
  }
}

export async function POST(req: NextRequest) {
  const { profile_id, visitor_name, visitor_phone, visitor_email, message } = await req.json();

  if (!profile_id || !visitor_name?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  // Sauvegarde en base
  const { error: dbError } = await supabaseAdmin
    .from('carte_leads')
    .insert({
      profile_id,
      visitor_name:  visitor_name.trim(),
      visitor_phone: visitor_phone?.trim() || null,
      visitor_email: visitor_email?.trim() || null,
      message:       message?.trim() || null,
    });

  if (dbError) {
    console.error('[carte/lead] DB error', dbError);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Récupérer le profil du propriétaire pour l'email
  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('name, email, slug')
    .eq('id', profile_id)
    .single();

  console.log('[carte/lead] Profil trouvé:', profile?.email ?? 'PAS D\'EMAIL');

  if (profile?.email) {
    const firstName = profile.name.split(' ')[0];

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">

      <div style="background:linear-gradient(135deg,#1B3464 0%,#2a4f8f 100%);padding:28px 32px">
        <h1 style="color:#D4A843;margin:0;font-size:20px;font-weight:900">Nouveau contact sur votre carte !</h1>
        <p style="color:rgba(255,255,255,.75);margin:8px 0 0;font-size:14px">digitalsucces.tech/c/${profile.slug}</p>
      </div>

      <div style="padding:28px 32px">
        <p style="color:#333;font-size:15px;margin:0 0 20px">
          Bonjour <strong>${firstName}</strong>, un visiteur vient de laisser ses coordonnées sur votre carte digitale.
        </p>

        <div style="background:#f8faff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px">
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 16px;font-size:13px;color:#6B7280;width:120px;font-weight:600">Nom</td>
              <td style="padding:12px 16px;font-size:14px;color:#111;font-weight:700">${visitor_name.trim()}</td>
            </tr>
            ${visitor_phone ? `<tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600">Téléphone</td>
              <td style="padding:12px 16px;font-size:14px;color:#111">
                <a href="tel:${visitor_phone.trim().replace(/\s+/g, '')}" style="color:#1B3464;text-decoration:none;font-weight:600">${visitor_phone.trim()}</a>
              </td>
            </tr>` : ''}
            ${visitor_email ? `<tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600">Email</td>
              <td style="padding:12px 16px;font-size:14px;color:#111">
                <a href="mailto:${visitor_email.trim()}" style="color:#1B3464;text-decoration:none">${visitor_email.trim()}</a>
              </td>
            </tr>` : ''}
            ${message ? `<tr>
              <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;vertical-align:top">Message</td>
              <td style="padding:12px 16px;font-size:14px;color:#333;line-height:1.6">${message.trim()}</td>
            </tr>` : ''}
          </table>
        </div>

        ${visitor_phone ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px">
                    <a href="tel:${visitor_phone.trim().replace(/\s+/g, '')}" style="display:inline-block;background:#1B3464;color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none">
                      📞 Appeler
                    </a>
                  </td>
                  <td>
                    <a href="https://wa.me/${visitor_phone.trim().replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none">
                      WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>` : ''}

        <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0">
          Ce lead a été enregistré automatiquement via votre carte digitale.
        </p>
      </div>

      <div style="background:#f8faff;padding:14px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee">
        ${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa;text-decoration:none">digitalsucces.tech</a>
      </div>
    </div></body></html>`;

    try {
      await sendMail({
        to: profile.email,
        subject: `Nouveau contact — ${visitor_name.trim()} a scanné votre carte`,
        html,
      });
      console.log('[carte/lead] Email envoyé à', profile.email);
    } catch (e) {
      console.error('[carte/lead] Échec envoi email:', e);
    }
  }

  return NextResponse.json({ ok: true });
}
