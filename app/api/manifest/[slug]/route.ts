import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data } = await supabaseServer
    .from('carte_profiles')
    .select('name, title, company, photo_url')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  const name      = data?.name ?? 'Carte Digitale';
  const shortName = name.split(' ').slice(0, 2).join(' ');
  const subtitle  = [data?.title, data?.company].filter(Boolean).join(' · ');
  const fullName  = subtitle ? `${name} — ${subtitle}` : name;
  const icon      = data?.photo_url ?? 'https://digitalsucces.tech/assets/logo-gdigital.png';

  const manifest = {
    name:             fullName,
    short_name:       shortName,
    description:      `Carte de visite digitale de ${name}`,
    start_url:        `/c/${slug}`,
    scope:            `/c/${slug}`,
    display:          'standalone',
    background_color: '#0D0D1A',
    theme_color:      '#0D0D1A',
    orientation:      'portrait',
    icons: [
      { src: icon,                                                                   sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'https://digitalsucces.tech/assets/logo.png',                          sizes: '240x240', type: 'image/png', purpose: 'any' },
      { src: 'https://digitalsucces.tech/assets/icon-maskable.png',                 sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
