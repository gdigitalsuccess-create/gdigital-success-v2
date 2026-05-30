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

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('carte_profiles')
    .select('name, email, slug, plan')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const notifHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:#1B3464;padding:24px 32px">
    <h1 style="color:#D4A843;margin:0;font-size:20px">Demande d'installation — Signature Email</h1>
  </div>
  <div style="padding:28px 32px;color:#333;font-size:15px;line-height:1.7">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px 0;color:#888;font-size:13px;width:130px">Client</td><td style="font-weight:700">${profile.name}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td><a href="mailto:${profile.email}" style="color:#1B3464">${profile.email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Carte</td><td style="font-family:monospace;color:#6C63FF">digitalsucces.tech/c/${profile.slug}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Plan</td><td style="font-weight:700;color:#D4A843">Business</td></tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:#fff8e7;border:2px solid #D4A843;border-radius:8px;font-size:14px">
      <strong style="color:#92400e">Action requise :</strong> Contacter ${profile.name} à <a href="mailto:${profile.email}" style="color:#1B3464">${profile.email}</a> pour configurer la signature email (Gmail / Outlook / Apple Mail).
    </div>
  </div>
  <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">${AGENCY_NAME} · digitalsucces.tech</div>
</div></body></html>`;

  const confirmHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:#1B3464;padding:28px 32px;text-align:center">
    <div style="font-size:40px;margin-bottom:8px">✅</div>
    <h1 style="color:#D4A843;margin:0;font-size:20px">Demande reçue !</h1>
    <p style="color:rgba(255,255,255,.75);margin:8px 0 0;font-size:14px">${AGENCY_NAME}</p>
  </div>
  <div style="padding:32px;color:#333;font-size:15px;line-height:1.7">
    <p>Bonjour <strong>${profile.name.split(' ')[0]}</strong>,</p>
    <p>Nous avons bien reçu votre demande d'installation de signature email professionnelle.</p>
    <div style="background:#f0f4ff;border-left:4px solid #1B3464;border-radius:6px;padding:16px 20px;margin:20px 0;font-size:14px">
      Notre équipe vous contactera dans les <strong>24h</strong> pour configurer votre signature directement dans Gmail, Outlook ou Apple Mail.
    </div>
    <p>Des questions ? Répondez à cet email ou écrivez-nous :</p>
    <p>✉️ <a href="mailto:${AGENCY_EMAIL}" style="color:#1B3464">${AGENCY_EMAIL}</a></p>
  </div>
  <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa">digitalsucces.tech</a></div>
</div></body></html>`;

  await Promise.all([
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ sender: { name: AGENCY_NAME, email: AGENCY_EMAIL }, to: [{ email: AGENCY_EMAIL }], subject: `Installation signature email — ${profile.name}`, htmlContent: notifHtml }),
    }),
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ sender: { name: AGENCY_NAME, email: AGENCY_EMAIL }, to: [{ email: profile.email }], subject: `Votre signature email est en cours de configuration — ${AGENCY_NAME}`, htmlContent: confirmHtml }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
