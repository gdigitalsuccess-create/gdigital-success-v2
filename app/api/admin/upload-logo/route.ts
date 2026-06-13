import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'gdigital_admin';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !slug) {
    return NextResponse.json({ error: 'file et slug requis' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const ext = file.name.split('.').pop();
  const path = `${slug}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from('carte-images')
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('carte-images')
    .getPublicUrl(path);

  return NextResponse.json({ publicUrl });
}
