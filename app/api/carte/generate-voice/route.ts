import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VOICE_IDS = {
  female: 'EXAVITQu4vr4xnSDxMaL',
  male:   'pNInz6obpgDQGcFmaJgB',
};

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const supabaseCheck = getAdmin();
  const { data: { user } } = await supabaseCheck.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { text, voice, slug } = await req.json();
  if (!text?.trim() || !slug) return NextResponse.json({ error: 'text et slug requis' }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ error: 'Message trop long (500 caractères max)' }, { status: 400 });

  const voiceId = VOICE_IDS[voice as 'female' | 'male'] ?? VOICE_IDS.female;

  // Appel ElevenLabs TTS
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key':   process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    console.error('[TTS] ElevenLabs error:', err);
    return NextResponse.json({ error: 'Erreur génération audio' }, { status: 500 });
  }

  const audioBuffer = await ttsRes.arrayBuffer();

  // Upload vers Supabase Storage
  const supabase = getAdmin();
  const path = `${slug}/voice-message.mp3`;
  const { error: uploadErr } = await supabase.storage
    .from('carte-images')
    .upload(path, Buffer.from(audioBuffer), {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;

  // Sauvegarder l'URL dans carte_profiles
  await supabase.from('carte_profiles')
    .update({ voice_message_url: url, voice_message_text: text })
    .eq('slug', slug);

  return NextResponse.json({ url });
}
