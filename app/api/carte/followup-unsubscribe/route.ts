import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return new NextResponse('Lien invalide.', { status: 400 });

  let leadId: string;
  try {
    leadId = Buffer.from(token, 'base64').toString('utf-8');
  } catch {
    return new NextResponse('Lien invalide.', { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('carte_leads')
    .update({ followup_unsubscribed: true })
    .eq('id', leadId);

  if (error) return new NextResponse('Une erreur est survenue.', { status: 500 });

  return new NextResponse(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Désabonnement confirmé</title></head>
    <body style="font-family:Arial,sans-serif;background:#f4f6fa;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
    <div style="max-width:400px;text-align:center;padding:40px 24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      <div style="font-size:3rem;margin-bottom:16px">✅</div>
      <h1 style="color:#1B3464;font-size:1.4rem;margin:0 0 12px">Désabonnement confirmé</h1>
      <p style="color:#6B7280;font-size:0.95rem;line-height:1.6;margin:0">
        Vous ne recevrez plus de messages de suivi. Merci pour votre visite.
      </p>
    </div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
