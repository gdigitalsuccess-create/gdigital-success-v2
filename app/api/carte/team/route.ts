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
  const cardUrl = `https://digitalsucces.tech/c/${slug}`;
  const dashboardUrl = `https://digitalsucces.tech/dashboard`;
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': BREVO_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: AGENCY_NAME, email: AGENCY_EMAIL },
      to: [{ email: memberEmail, name: memberName }],
      subject: `Votre carte digitale est prête — ${ownerName}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <img src="https://digitalsucces.tech/logo-gdigital.png" alt="G+Digital Success" style="height:36px;margin-bottom:24px" />
          <h2 style="color:#1B3464;font-size:1.3rem;margin:0 0 12px">Bonjour ${memberName},</h2>
          <p style="color:#374151;line-height:1.7;margin:0 0 16px">
            <strong>${ownerName}</strong> vient de créer votre carte de visite digitale via G+Digital Success.
          </p>
          <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px 20px;margin:0 0 20px">
            <p style="color:#1B3464;font-weight:700;font-size:0.9rem;margin:0 0 10px">Vos identifiants de connexion</p>
            <p style="color:#374151;font-size:0.85rem;margin:0 0 4px">Email : <strong>${memberEmail}</strong></p>
            <p style="color:#374151;font-size:0.85rem;margin:0 0 12px">Mot de passe temporaire : <strong style="font-family:monospace;background:#DBEAFE;padding:2px 6px;border-radius:4px">${tempPassword}</strong></p>
            <a href="${dashboardUrl}" style="display:inline-block;background:#1B3464;color:white;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:0.85rem">
              Accéder à mon espace →
            </a>
          </div>
          <p style="color:#6B7280;font-size:0.82rem;line-height:1.6;margin:0 0 16px">
            Pensez à changer votre mot de passe après la première connexion. Votre carte est aussi accessible ici :
          </p>
          <a href="${cardUrl}" style="display:inline-block;background:white;border:1px solid #D4A843;color:#D4A843;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:0.85rem;margin-bottom:24px">
            Voir ma carte publique →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#9CA3AF;font-size:0.75rem;margin:0">G+Digital Success · <a href="https://digitalsucces.tech" style="color:#D4A843;text-decoration:none">digitalsucces.tech</a></p>
        </div>
      `,
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
