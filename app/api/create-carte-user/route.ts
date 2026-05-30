import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'gdigital_admin';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, password, slug } = await req.json();
  if (!email || !password || !slug) {
    return NextResponse.json({ error: 'email, password et slug requis' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Créer le compte Supabase Auth (email confirmé automatiquement)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Lier le user_id au profil carte
  await supabaseAdmin
    .from('carte_profiles')
    .update({ user_id: data.user.id })
    .eq('slug', slug);

  return NextResponse.json({ user_id: data.user.id });
}
