import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'gdigital_admin';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === 'authenticated';
}

// GET — liste toutes les features
export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from('feature_releases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — créer une nouvelle feature
export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { feature_name, description, plans, icon, cta_label } = await req.json();
  if (!feature_name || !description || !plans?.length)
    return NextResponse.json({ error: 'feature_name, description et plans sont requis' }, { status: 400 });
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from('feature_releases')
    .insert({ feature_name, description, plans, icon: icon || '✨', cta_label: cta_label || 'Découvrir la nouveauté' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — supprimer une feature
export async function DELETE(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const supabase = getAdmin();
  const { error } = await supabase.from('feature_releases').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
