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

async function sendWelcomeMember({ memberName, memberEmail, ownerName, slug, tempPassword }: { memberName: string; memberEmail: string; ownerName: string; slug: string; tempPassword: string }) {
  const cardUrl      = `https://digitalsucces.tech/c/${slug}`;
  const dashboardUrl = `https://digitalsucces.tech/dashboard`;
  const subject      = `Votre carte digitale est prête — G+Digital Success`;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;background:#f4f6fa;margin:0;padding:0}
    .wrapper{max-width:580px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .header{background:#1B3464;padding:28px 32px;text-align:center}
    .header h1{color:#fff;margin:12px 0 4px;font-size:20px}
    .header p{color:#D4A843;margin:0;font-size:13px}
    .body{padding:32px;color:#333;font-size:15px;line-height:1.7}
    h2{color:#1B3464;font-size:16px;margin:24px 0 10px}
    .info-box{background:#f0f4ff;border-left:4px solid #1B3464;border-radius:6px;padding:16px 20px;margin:16px 0;font-size:14px}
    .info-box strong{color:#1B3464}
    .step{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
    .step-num{background:#1B3464;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;margin-top:2px}
    .step-text{font-size:14px;color:#444;line-height:1.6}
    .cta{text-align:center;margin:28px 0 16px}
    .cta a{background:#D4A843;color:#1B3464;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block}
    .cta-sec{text-align:center;margin-bottom:24px}
    .cta-sec a{background:#f0f4ff;color:#1B3464;padding:11px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #1B3464;display:inline-block}
    .footer{background:#f8faff;padding:20px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee}
  </style></head><body>
  <div class="wrapper">
    <div class="header">
      <img src="https://digitalsucces.tech/logo-gdigital.png" alt="G+Digital Success" style="height:48px;object-fit:contain;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto">
      <h1>Votre carte digitale est prête !</h1>
      <p>${memberName}</p>
    </div>
    <div class="body">
      <p>Bonjour <strong>${memberName}</strong>,</p>
      <p><strong>${ownerName}</strong> vient de créer votre carte de visite digitale via G+Digital Success. Voici comment démarrer en 3 étapes :</p>

      <h2>Vos identifiants de connexion</h2>
      <div class="info-box">
        <strong>Email :</strong> ${memberEmail}<br/>
        <strong>Mot de passe temporaire :</strong> <span style="background:#e8f0fe;padding:2px 8px;border-radius:4px;font-family:monospace;color:#1B3464">${tempPassword}</span><br/>
        <span style="font-size:12px;color:#888;margin-top:6px;display:block">Pensez à changer votre mot de passe depuis votre dashboard après votre première connexion.</span>
      </div>
      <div class="cta"><a href="${dashboardUrl}">Accéder à mon dashboard</a></div>

      <h2>Comment personnaliser votre carte</h2>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">Connectez-vous sur <a href="${dashboardUrl}" style="color:#1B3464;font-weight:700;text-decoration:underline">${dashboardUrl}</a> avec votre email et mot de passe ci-dessus</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">Complétez votre profil : photo, LinkedIn, téléphone direct, bio personnelle</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">Partagez votre carte — via le QR code, le lien ou la puce NFC</div>
      </div>

      <h2>Votre carte publique</h2>
      <div class="info-box">
        <strong>URL de votre carte :</strong><br/>
        <a href="${cardUrl}" style="color:#1B3464">${cardUrl}</a>
      </div>
      <div class="cta-sec"><a href="${cardUrl}">Voir ma carte en ligne ↗</a></div>

      <h2>Besoin d'aide ?</h2>
      <div class="info-box">
        <strong>Email :</strong> <a href="mailto:${AGENCY_EMAIL}" style="color:#1B3464">${AGENCY_EMAIL}</a><br/>
        <strong>WhatsApp :</strong> <a href="https://wa.me/971582680034" style="color:#1B3464">+971 58 268 0034</a><br/>
        <strong>Site :</strong> <a href="https://digitalsucces.tech" style="color:#1B3464">digitalsucces.tech</a>
      </div>
    </div>
    <div class="footer">${AGENCY_NAME} · ${AGENCY_EMAIL} · digitalsucces.tech</div>
  </div></body></html>`;

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: AGENCY_NAME, email: AGENCY_EMAIL },
      to: [{ email: memberEmail, name: memberName }],
      subject,
      htmlContent: html,
    }),
  });
}

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user ?? null;
}

const TEAM_LIMITS: Record<string, number> = {
  pro: 2,
  business: 5,
  business_team: 10,
};

async function getPlanLimit(userId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('carte_profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();
  return TEAM_LIMITS[data?.plan?.toLowerCase() ?? ''] ?? 0;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

// GET — liste les cartes de l'équipe
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .select('id, slug, name, title, email, phone, active, photo_url, cover_url, linkedin, twitter, allow_custom_cover, created_at')
    .eq('team_owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

// POST — crée une carte membre
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const limit = await getPlanLimit(user.id);
  if (limit === 0) {
    return NextResponse.json({ error: 'Plan Pro ou supérieur requis' }, { status: 403 });
  }

  const { count } = await supabaseAdmin
    .from('carte_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('team_owner_id', user.id);

  if ((count ?? 0) >= limit) {
    return NextResponse.json({ error: `Limite de ${limit} membres atteinte` }, { status: 400 });
  }

  const { name, title, email, phone, slug: slugInput, linkedin, twitter } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
  }

  const slug = slugInput?.trim() || slugify(name);

  const { data: existing } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('slug', slug).single();
  if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 });

  // Vérifier si un compte Auth existe déjà pour cet email
  const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
  const alreadyExists = existingAuth?.users?.some(u => u.email === email.trim());
  if (alreadyExists) return NextResponse.json({ error: 'Un compte existe déjà pour cet email' }, { status: 409 });

  // Créer le compte Supabase Auth du membre
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!';
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const memberId = authData.user.id;

  // Créer le profil avec user_id lié
  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .insert({ slug, name: name.trim(), title: title?.trim() || null, email: email.trim(), phone: phone?.trim() || null, linkedin: linkedin?.trim() || null, twitter: twitter?.trim() || null, active: true, plan: 'starter', team_owner_id: user.id, user_id: memberId })
    .select('id, slug, name, title, email, phone, active, photo_url, cover_url, linkedin, twitter, allow_custom_cover')
    .single();

  if (error) {
    await supabaseAdmin.auth.admin.deleteUser(memberId);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: ownerProfile } = await supabaseAdmin
    .from('carte_profiles').select('name').eq('user_id', user.id).single();

  await sendWelcomeMember({
    memberName: name.trim(),
    memberEmail: email.trim(),
    ownerName: ownerProfile?.name ?? 'Votre entreprise',
    slug,
    tempPassword,
  });

  return NextResponse.json(data);
}

// PATCH — modifie une carte membre (infos ou active)
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const { data: member } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('id', id).eq('team_owner_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const allowed = ['name', 'title', 'email', 'phone', 'active', 'slug', 'linkedin', 'twitter', 'allow_custom_cover', 'cover_url'];
  const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabaseAdmin
    .from('carte_profiles')
    .update(update)
    .eq('id', id)
    .select('id, slug, name, title, email, phone, active, photo_url, cover_url, linkedin, twitter, allow_custom_cover')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE — supprime une carte membre
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const { data: member } = await supabaseAdmin
    .from('carte_profiles').select('id').eq('id', id).eq('team_owner_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { error } = await supabaseAdmin.from('carte_profiles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
