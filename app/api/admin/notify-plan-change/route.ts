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

const PLAN_PRICES: Record<string, string> = {
  starter:  '$9/mois',
  pro:      '$19/mois',
  business: '$39/mois',
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter:  ['Page digitale active', 'Infos modifiables', '1 vidéo', '6 photos portfolio'],
  pro:      ['Logo, couleurs, PDF', 'Stats de visites', 'Bouton RDV', '2 vidéos', '12 photos portfolio'],
  business: ['Domaine personnalisé', 'Multi-cartes', 'Agent IA intégré', '5 vidéos + upload MP4', 'Photos illimitées'],
};

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
    console.error(`[notify-plan-change] Brevo error → to:${to}`, res.status, err);
    throw new Error(`Brevo ${res.status}`);
  }
  console.log(`[notify-plan-change] Email envoyé → ${to} | ${subject}`);
}

export async function POST(req: NextRequest) {

  const { profile_id, new_plan } = await req.json();
  console.log('[notify-plan-change] Reçu:', { profile_id, new_plan });

  if (!profile_id || !new_plan) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const { data: profile, error: dbError } = await supabaseAdmin
    .from('carte_profiles')
    .select('name, email, slug')
    .eq('id', profile_id)
    .single();

  console.log('[notify-plan-change] Profil trouvé:', profile, 'Erreur DB:', dbError);

  if (!profile || !profile.email) {
    console.warn('[notify-plan-change] Profil introuvable ou sans email', { profile_id });
    return NextResponse.json({ ok: true, warning: 'no_profile_email' });
  }

  const plan    = new_plan.toLowerCase();
  const price   = PLAN_PRICES[plan] ?? '';
  const features = PLAN_FEATURES[plan] ?? [];

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const firstName = profile.name.split(' ')[0];

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">

    <!-- Header festif -->
    <div style="background:linear-gradient(135deg,#1B3464 0%,#2a4f8f 100%);padding:40px 32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <h1 style="color:#D4A843;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px">Félicitations !</h1>
      <p style="color:rgba(255,255,255,.85);margin:10px 0 0;font-size:16px;font-weight:600">
        ${profile.name}, vous êtes désormais au plan <span style="color:#D4A843">${planLabel}</span> !
      </p>
    </div>

    <!-- Bloc plan -->
    <div style="padding:32px 32px 0">
      <div style="background:linear-gradient(135deg,#f0f4ff,#fff8e7);border:2px solid #D4A843;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Votre nouveau plan</p>
        <div style="font-size:32px;font-weight:900;color:#1B3464;letter-spacing:-1px">${planLabel}</div>
        <div style="font-size:20px;font-weight:700;color:#D4A843;margin-top:4px">${price}</div>
      </div>

      <!-- Message perso -->
      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px">
        Bonjour <strong>${firstName}</strong>,<br/>
        Votre changement au plan <strong>${planLabel}</strong> a été effectué avec succès.
        Votre carte digitale bénéficie maintenant de toutes les fonctionnalités incluses dans ce plan.
      </p>

      <!-- Features débloquées -->
      <p style="font-weight:700;color:#1B3464;font-size:14px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em">Ce que vous avez maintenant :</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${features.map(f => `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0">
            <span style="color:#22C55E;font-weight:700;margin-right:8px">✓</span>${f}
          </td>
        </tr>`).join('')}
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px">
        <a href="https://digitalsucces.tech/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#1B3464,#2a4f8f);color:#D4A843;font-weight:800;font-size:15px;padding:16px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.03em;box-shadow:0 4px 16px rgba(27,52,100,0.3)">
          Accéder à mon dashboard →
        </a>
      </div>

      <p style="font-size:13px;color:#6B7280;text-align:center;margin-bottom:24px">
        Des questions ? Contactez-nous :<br/>
        ✉️ <a href="mailto:${AGENCY_EMAIL}" style="color:#1B3464;font-weight:600">${AGENCY_EMAIL}</a>
      </p>
    </div>

    <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee">
      ${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa;text-decoration:none">digitalsucces.tech</a>
    </div>
  </div></body></html>`;

  const adminHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:#1B3464;padding:24px 32px">
      <h1 style="color:#D4A843;margin:0;font-size:18px">Plan activé — Confirmation envoyée ✅</h1>
    </div>
    <div style="padding:28px 32px;color:#333;font-size:15px;line-height:1.7">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888;font-size:13px;width:130px">Client</td><td style="font-weight:700">${profile.name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td><a href="mailto:${profile.email}" style="color:#1B3464">${profile.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:13px">Carte</td><td style="font-family:monospace;color:#6C63FF">digitalsucces.tech/c/${profile.slug}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:13px">Nouveau plan</td><td style="font-weight:700;color:#D4A843;font-size:16px">${planLabel} — ${price}</td></tr>
      </table>
      <p style="font-size:13px;color:#6B7280;margin-top:16px">Le client a reçu un email de confirmation avec la liste des fonctionnalités incluses.</p>
    </div>
    <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">${AGENCY_NAME} · digitalsucces.tech</div>
  </div></body></html>`;

  let clientOk = false;
  let adminOk  = false;

  try {
    await sendMail({
      to: profile.email,
      subject: `Votre plan ${planLabel} est activé — ${AGENCY_NAME}`,
      html,
    });
    clientOk = true;
  } catch (e) {
    console.error('[notify-plan-change] ÉCHEC email client →', profile.email, e);
  }

  try {
    await sendMail({
      to: AGENCY_EMAIL,
      subject: `Plan ${planLabel} activé — ${profile.name}`,
      html: adminHtml,
    });
    adminOk = true;
  } catch (e) {
    console.error('[notify-plan-change] ÉCHEC email admin →', AGENCY_EMAIL, e);
  }

  console.log('[notify-plan-change] Résultat:', { clientOk, adminOk, to: profile.email });
  return NextResponse.json({ ok: true, clientOk, adminOk });
}
