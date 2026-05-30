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

  return {
    id: data.id,
    slug: data.slug,
    name: data.full_name ?? data.name ?? "",
    title: data.job_title ?? data.title ?? "",
    company: data.company ?? undefined,
    description: data.description ?? "",
    photo: data.photo_url ?? "",
    cover: data.cover_url ?? undefined,
    coverVideo: data.cover_video_url ?? undefined,
    phone: data.phone ?? "",
    email: data.email ?? "",
    website: data.website ?? undefined,
    location: data.location ?? undefined,
    rdv: data.rdv_url ?? undefined,
    socials: {
      instagram: data.instagram ?? undefined,
      tiktok: data.tiktok ?? undefined,
      facebook: data.facebook ?? undefined,
      linkedin: data.linkedin ?? undefined,
      youtube: data.youtube ?? undefined,
      twitter: data.twitter ?? undefined,
    },
    documents: (data.carte_documents ?? []).map((d: { name: string; url: string; type: string }) => ({
      name: d.name,
      url: d.url,
      type: d.type,
    })),
    portfolio: (data.carte_portfolio ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((p: { id: string; photo_url: string; caption?: string; position: number }) => ({
        id: p.id,
        photo_url: p.photo_url,
        caption: p.caption ?? undefined,
        position: p.position,
      })),
    portfolioTitle: data.portfolio_title ?? "Nos réalisations",
    videos: (data.carte_videos ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((v: { id: string; type: string; url: string; platform?: string; caption?: string; position: number }) => ({
        id: v.id,
        type: v.type,
        url: v.url,
        platform: v.platform ?? detectPlatform(v.url),
        caption: v.caption ?? undefined,
        position: v.position,
      })),
    links: (data.carte_links ?? [])
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
