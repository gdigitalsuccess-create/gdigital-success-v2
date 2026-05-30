import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

const BREVO_KEY    = process.env.BREVO_API_KEY!;
const AGENCY_EMAIL = 'contact@digitalsucces.tech';
const AGENCY_NAME  = 'G+Digital Success';

async function sendLeadMail({ to, ownerName, visitorMsg, agentReply }: { to: string; ownerName: string; visitorMsg: string; agentReply: string }) {
  const firstName = ownerName.split(' ')[0];
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0D0D1A 0%,#13131F 100%);padding:28px 32px;border-bottom:2px solid #00CFFF">
    <h1 style="color:#00CFFF;margin:0;font-size:18px;font-weight:900">🤖 Prospect détecté par votre assistant IA</h1>
    <p style="color:rgba(255,255,255,.6);margin:8px 0 0;font-size:13px">Un visiteur de votre carte digitale montre un intérêt d'achat</p>
  </div>
  <div style="padding:28px 32px">
    <p style="color:#333;font-size:15px;margin:0 0 20px">Bonjour <strong>${firstName}</strong>,<br>votre assistant IA a détecté qu'un visiteur est potentiellement intéressé par vos services.</p>
    <div style="margin-bottom:20px">
      <p style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Message du visiteur</p>
      <div style="background:#f8faff;border-left:3px solid #00CFFF;border-radius:0 8px 8px 0;padding:12px 16px;font-size:14px;color:#333;line-height:1.6">${visitorMsg}</div>
    </div>
    <div style="margin-bottom:24px">
      <p style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Réponse de l'assistant</p>
      <div style="background:#f8faff;border-left:3px solid #6C63FF;border-radius:0 8px 8px 0;padding:12px 16px;font-size:14px;color:#555;line-height:1.6;font-style:italic">${agentReply}</div>
    </div>
    <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0">Suivez cette conversation depuis votre dashboard → Conversations IA</p>
  </div>
  <div style="background:#f8faff;padding:14px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee">
    ${AGENCY_NAME} · <a href="https://digitalsucces.tech/dashboard" style="color:#aaa;text-decoration:none">Mon dashboard</a>
  </div>
</div></body></html>`;

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: AGENCY_NAME, email: AGENCY_EMAIL },
      to: [{ email: to }],
      subject: `🤖 Prospect détecté — votre assistant IA`,
      htmlContent: html,
    }),
  }).catch(e => console.error('[chat] Brevo error:', e));
}

const PLAN_ALLOWED = ['pro', 'business', 'business_team'];
const MONTHLY_LIMITS: Record<string, number> = { pro: 200, business: 500, business_team: 500 };

function billingCycleStart(createdAt: string): Date {
  const anchorDay = new Date(createdAt).getDate();
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const anniversary = new Date(year, month, Math.min(anchorDay, daysInCurrentMonth));
  anniversary.setHours(0, 0, 0, 0);
  if (anniversary > now) {
    month -= 1;
    if (month < 0) { month = 11; year -= 1; }
    const daysInPrevMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(anchorDay, daysInPrevMonth));
  }
  return anniversary;
}

export async function POST(req: NextRequest) {
  const { profile_id, message, history = [] } = await req.json();
  if (!profile_id || !message?.trim()) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from('carte_profiles')
    .select('*, carte_documents(*), carte_portfolio(*), carte_links(*)')
    .eq('id', profile_id)
    .eq('active', true)
    .single();

  if (profileError) console.error('[chat] Supabase error:', profileError.message);

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const plan = profile.plan?.toLowerCase() ?? '';
  if (!PLAN_ALLOWED.includes(plan)) {
    return NextResponse.json({ error: 'Plan Pro ou supérieur requis' }, { status: 403 });
  }

  // Vérification de la limite mensuelle (plan + messages supplémentaires achetés)
  const baseLimit = MONTHLY_LIMITS[plan] ?? 0;
  const extra = profile.extra_chat_messages ?? 0;
  const limit = baseLimit + extra;

  const cycleStart = billingCycleStart(profile.created_at);

  const { count } = await supabaseServer
    .from('carte_chat_logs')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile_id)
    .gte('created_at', cycleStart.toISOString());

  if ((count ?? 0) >= limit) {
    return NextResponse.json({
      error: 'Limite mensuelle atteinte',
      limit_reached: true,
      limit,
    }, { status: 429 });
  }

  const name = profile.name ?? '';
  const jobTitle = profile.job_title ?? profile.title ?? '';
  const docs = (profile.carte_documents ?? []).map((d: { name: string }) => d.name).join(', ');
  const links = (profile.carte_links ?? []).map((l: { label: string; url: string }) => `${l.label}: ${l.url}`).join('\n');
  const aiInstructions = profile.ai_instructions?.trim() ?? '';

  const system = `Tu es l'assistant IA de ${name}${jobTitle ? `, ${jobTitle}` : ''}${profile.company ? ` chez ${profile.company}` : ''}.
Tu aides les visiteurs de sa carte de visite digitale à obtenir des informations et à le contacter.

Informations de contact :
${profile.description ? `- Description : ${profile.description}` : ''}
${profile.phone ? `- Téléphone : ${profile.phone}` : ''}
${profile.email ? `- Email : ${profile.email}` : ''}
${profile.website ? `- Site web : ${profile.website}` : ''}
${profile.location ? `- Localisation : ${profile.location}` : ''}
${profile.rdv_url ? `- Prise de RDV : ${profile.rdv_url}` : ''}
${docs ? `- Documents disponibles : ${docs}` : ''}
${links ? `- Liens utiles :\n${links}` : ''}
${aiInstructions ? `\nInstructions spécifiques du professionnel :\n${aiInstructions}` : ''}

Règles :
- Réponds toujours dans la langue du visiteur (français ou anglais selon le message reçu)
- Sois concis, chaleureux et professionnel
- Si quelqu'un veut prendre RDV${profile.rdv_url ? `, dirige-le vers : ${profile.rdv_url}` : ', propose de contacter directement'}
- Si le visiteur montre un intérêt concret (demande de prix, de disponibilité, envie de travailler ensemble), demande-lui poliment son prénom et un moyen de le contacter (téléphone ou email) pour que ${name} puisse le rappeler
- Si tu ne sais pas quelque chose, propose de contacter ${name} directement
- Ne donne jamais de fausses informations

DÉTECTION DE PROSPECT : À la toute fin de ta réponse, ajoute sur une nouvelle ligne UNIQUEMENT l'un de ces tags (le visiteur ne le verra pas) :
[LEAD:YES] si le visiteur montre un intérêt d'achat, demande un prix, veut travailler ensemble, demande à être contacté
[LEAD:NO] dans tous les autres cas`;

  const messages = [
    ...history.slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message.trim() },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error('[chat] Anthropic error:', errBody);
    return NextResponse.json({ error: 'Erreur IA' }, { status: 502 });
  }

  const data = await res.json();
  let raw = data.content?.[0]?.text ?? '';

  // Extraire le tag de détection prospect
  const isLead = raw.includes('[LEAD:YES]');
  let reply = raw
    .replace(/\[LEAD:YES\]\s*$/m, '')
    .replace(/\[LEAD:NO\]\s*$/m, '')
    .trim();

  // Sauvegarder l'échange en base
  const { error: logError } = await supabaseServer.from('carte_chat_logs').insert({
    profile_id: profile_id,
    visitor_message: message.trim(),
    agent_reply: reply,
    is_lead: isLead,
  });
  if (logError) console.error('[chat] Log insert error:', logError.message);

  // Envoyer un mail si prospect détecté
  if (isLead && profile.email) {
    await sendLeadMail({
      to: profile.email,
      ownerName: name,
      visitorMsg: message.trim(),
      agentReply: reply,
    });
  }

  return NextResponse.json({ reply });
}
