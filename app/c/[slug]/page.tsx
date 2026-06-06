import type { Metadata } from "next";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";
import ProfileClient, { type Profile } from "./ProfileClient";

export const dynamic = "force-dynamic";

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  return 'upload';
}

async function getProfile(slug: string): Promise<Profile | null> {
  const { data, error } = await supabaseServer
    .from("carte_profiles")
    .select("*, carte_documents(*), carte_portfolio(*), carte_videos(*), carte_links(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  // Si carte membre d'équipe → charger les données entreprise de l'owner
  let src = data;
  if (data.team_owner_id) {
    const { data: owner } = await supabaseServer
      .from("carte_profiles")
      .select("*, carte_documents(*), carte_portfolio(*), carte_videos(*), carte_links(*)")
      .eq("user_id", data.team_owner_id)
      .single();
    if (owner) src = owner;
  }

  return {
    id: data.id,
    slug: data.slug,
    plan: data.plan ?? undefined,
    // Données personnelles → toujours du membre
    name: data.full_name ?? data.name ?? "",
    title: data.job_title ?? data.title ?? "",
    photo: data.photo_url ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    description: data.description ?? "",
    // Données entreprise → owner si membre, sinon ses propres données
    company: src.company ?? undefined,
    cover: (data.allow_custom_cover && data.cover_url) ? data.cover_url : (src.cover_url ?? undefined),
    coverVideo: (data.allow_custom_cover && data.cover_url) ? undefined : (src.cover_video_url ?? undefined),
    website: src.website ?? undefined,
    location: src.location ?? undefined,
    rdv: src.rdv_url ?? undefined,
    socials: {
      instagram: src.instagram ?? undefined,
      tiktok: src.tiktok ?? undefined,
      facebook: src.facebook ?? undefined,
      linkedin: data.linkedin ?? src.linkedin ?? undefined,
      youtube: src.youtube ?? undefined,
      twitter: data.twitter ?? src.twitter ?? undefined,
      snapchat: src.snapchat ?? undefined,
      telegram: src.telegram ?? undefined,
    },
    logo_url: src.logo_url ?? undefined,
    logo_position: src.logo_position ?? 'center',
    primary_color: src.primary_color ?? undefined,
    secondary_color: src.secondary_color ?? undefined,
    bg_color: src.bg_color ?? undefined,
    text_color: src.text_color ?? undefined,
    font_heading: src.font_heading ?? undefined,
    documents: (src.carte_documents ?? []).map((d: { name: string; url: string; type: string }) => ({
      name: d.name,
      url: d.url,
      type: d.type,
    })),
    portfolio: (src.carte_portfolio ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((p: { id: string; photo_url: string; caption?: string; position: number }) => ({
        id: p.id,
        photo_url: p.photo_url,
        caption: p.caption ?? undefined,
        position: p.position,
      })),
    portfolioTitle: src.portfolio_title ?? "Nos réalisations",
    videos: (src.carte_videos ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((v: { id: string; type: string; url: string; platform?: string; caption?: string; position: number }) => ({
        id: v.id,
        type: v.type,
        url: v.url,
        platform: v.platform ?? detectPlatform(v.url),
        caption: v.caption ?? undefined,
        position: v.position,
      })),
    links: (src.carte_links ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((l: { id: string; label: string; url: string; icon: string | null; position: number }) => ({
        id: l.id,
        label: l.label,
        url: l.url,
        icon: l.icon ?? null,
        position: l.position,
      })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return { title: "Profil introuvable" };

  const title = `${profile.name} — ${profile.title}${profile.company ? ` · ${profile.company}` : ""}`;
  const appleIcon = profile.photo || `${process.env.NEXT_PUBLIC_BASE_URL}/assets/logo-gdigital.png`;

  return {
    title,
    description: profile.description,
    manifest: `/api/manifest/${slug}`,
    appleWebApp: {
      capable: true,
      title: profile.name,
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: appleIcon,
    },
    themeColor: "#0D0D1A",
    openGraph: {
      images: profile.photo ? [{ url: profile.photo }] : [],
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-touch-fullscreen": "yes",
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D1A' }}>
        <p style={{ color: 'white', fontSize: '1.25rem', fontFamily: 'Inter, sans-serif' }}>Profil introuvable.</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://digitalsucces.tech";
  const profileUrl = `${baseUrl}/c/${profile.slug}`;
  const qrDataUrl = await QRCode.toDataURL(profileUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#0D0D1A", light: "#ffffff" },
  });

  return <ProfileClient profile={profile} qrDataUrl={qrDataUrl} profileUrl={profileUrl} />;
}
