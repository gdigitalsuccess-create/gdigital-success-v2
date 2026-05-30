import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BREVO_KEY   = process.env.BREVO_API_KEY!;
const AGENCY_EMAIL = 'contact@digitalsucces.tech';
const PAUL_EMAIL   = 'paulgildericnyamamoukagni@gmail.com';
const AGENCY_NAME  = 'G+Digital Success';

const PLAN_LABELS: Record<string, string> = {
  starter:  'Starter — $99/mois',
  business: 'Business — $199/mois',
  premium:  'Premium — $299/mois',
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
    throw new Error((err as { message?: string }).message || `Brevo ${res.status}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, business, plan, message } = body;

    if (!name || !email || !phone || !business || !plan) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const planLabel = PLAN_LABELS[plan] || plan;

    // 1. Sauvegarder dans Supabase
    await supabase.from('leads').insert([{
      name,
      email,
      subject: `Commande Agent IA — ${planLabel}`,
      message: `Téléphone: ${phone}\nEntreprise: ${business}\nPlan: ${planLabel}\n\n${message || ''}`,
      status: 'new',
      lang: 'fr',
    }]);

    // 2. Email de notification à Paul
    const notifHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      <div style="background:#1B3464;padding:24px 32px">
        <h1 style="color:#D4A843;margin:0;font-size:20px">🎉 Nouvelle commande Agent IA !</h1>
      </div>
      <div style="padding:28px 32px;color:#333;font-size:15px;line-height:1.7">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#888;font-size:13px;width:130px">Plan</td><td style="font-weight:700;color:#1B3464">${planLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Nom</td><td style="font-weight:700">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td><a href="mailto:${email}" style="color:#1B3464">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">WhatsApp</td><td><a href="https://wa.me/${phone.replace(/[^0-9]/g,'')}" style="color:#1B3464">${phone}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Entreprise</td><td>${business}</td></tr>
          ${message ? `<tr><td style="padding:8px 0;color:#888;font-size:13px;vertical-align:top">Message</td><td style="font-size:14px;color:#555">${message}</td></tr>` : ''}
        </table>
        <div style="margin-top:24px;padding:16px;background:#fff8e7;border:2px solid #D4A843;border-radius:8px;font-size:14px">
          <strong style="color:#92400e">Action requise :</strong> Contacter ${name} sous 24h pour configurer l'agent et recevoir le paiement.
        </div>
      </div>
      <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">${AGENCY_NAME} · digitalsucces.tech</div>
    </div></body></html>`;

    // 3. Email de confirmation au client
    const confirmHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      <div style="background:#1B3464;padding:28px 32px;text-align:center">
        <h1 style="color:#D4A843;margin:0;font-size:20px">Votre commande est enregistrée ✅</h1>
        <p style="color:rgba(255,255,255,.7);margin:8px 0 0;font-size:14px">${AGENCY_NAME}</p>
      </div>
      <div style="padding:32px;color:#333;font-size:15px;line-height:1.7">
        <p>Bonjour <strong>${name}</strong>,</p>
        <p>Nous avons bien reçu votre commande pour le plan <strong style="color:#1B3464">${planLabel}</strong>.</p>
        <div style="background:#f0f4ff;border-left:4px solid #1B3464;border-radius:6px;padding:16px 20px;margin:20px 0;font-size:14px">
          <strong>Prochaine étape :</strong> nous vous contacterons dans les <strong>24h</strong> via WhatsApp ou email pour configurer votre agent IA et finaliser le paiement.
        </div>
        <p>En attendant, si vous avez des questions :</p>
        <p>📱 WhatsApp : <a href="https://wa.me/971582680034" style="color:#1B3464">+971 58 268 0034</a><br/>
           ✉️ Email : <a href="mailto:${AGENCY_EMAIL}" style="color:#1B3464">${AGENCY_EMAIL}</a></p>
      </div>
      <div style="background:#f8faff;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">${AGENCY_NAME} · <a href="https://digitalsucces.tech" style="color:#aaa">digitalsucces.tech</a></div>
    </div></body></html>`;

    await Promise.all([
      sendMail({ to: PAUL_EMAIL, subject: `🎉 Nouvelle commande Agent IA — ${name} (${planLabel})`, html: notifHtml }),
      sendMail({ to: email,      subject: `Votre commande Agent IA est enregistrée — ${AGENCY_NAME}`, html: confirmHtml }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[commande-agent]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
