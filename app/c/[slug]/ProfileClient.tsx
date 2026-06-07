'use client';

import { useState, useEffect } from 'react';
import styles from './profile.module.css';
import LeadCaptureForm from './LeadCaptureForm';
import PushSubscribeButton from './PushSubscribeButton';
import VisitTracker from './VisitTracker';
import ChatWidget from './ChatWidget';

type Socials = {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  snapchat?: string;
  telegram?: string;
};

type Document = {
  name: string;
  url: string;
  type: string;
};

type PortfolioItem = {
  id: string;
  photo_url: string;
  caption?: string;
  position: number;
};

type VideoItem = {
  id: string;
  type: string;
  url: string;
  platform?: string;
  caption?: string;
  position: number;
};

type CustomLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  position: number;
};

export type Profile = {
  id: string;
  slug: string;
  name: string;
  title: string;
  company?: string;
  description: string;
  photo: string;
  cover?: string;
  coverVideo?: string;
  phone: string;
  email: string;
  website?: string;
  location?: string;
  rdv?: string;
  socials: Socials;
  documents?: Document[];
  portfolio?: PortfolioItem[];
  portfolioTitle?: string;
  videos?: VideoItem[];
  links?: CustomLink[];
  plan?: string;
  logo_url?: string;
  logo_position?: string;
  primary_color?: string;
  secondary_color?: string;
  bg_color?: string;
  text_color?: string;
  font_heading?: string;
  label_rdv?: string;
  label_documents?: string;
  label_videos?: string;
};

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getContrastText(hex: string): string {
  return getLuminance(hex) > 0.5 ? '#1A1A2E' : '#FFFFFF';
}

function getCardColor(bgHex: string): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, n));
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const isDark = getLuminance(bgHex) < 0.5;
  const adj = isDark ? 12 : -15;
  return '#' + [r, g, b].map(c => clamp(c + adj).toString(16).padStart(2, '0')).join('');
}

const GOOGLE_FONTS: Record<string, string> = {
  'Inter': 'Inter:wght@300;400;500;600;700;800;900',
  'Poppins': 'Poppins:wght@300;400;500;600;700;800',
  'Montserrat': 'Montserrat:wght@300;400;500;600;700;800;900',
  'Playfair Display SC': 'Playfair+Display+SC:wght@400;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700;800',
  'Cormorant Garamond': 'Cormorant+Garamond:wght@300;400;500;600;700',
  'Raleway': 'Raleway:wght@300;400;500;600;700;800',
  'Lato': 'Lato:wght@300;400;700;900',
  'Roboto': 'Roboto:wght@300;400;500;700;900',
  'Lora': 'Lora:wght@400;500;600;700',
  'EB Garamond': 'EB+Garamond:wght@400;500;600;700;800',
  'Belleza': 'Belleza',
};

type Props = {
  profile: Profile;
  qrDataUrl: string;
  profileUrl: string;
};

function getDeepLink(platform: keyof Socials, handle: string): string {
  const links: Record<string, string> = {
    instagram: `https://instagram.com/${handle}`,
    tiktok: `https://www.tiktok.com/@${handle}`,
    facebook: `https://facebook.com/${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    youtube: `https://youtube.com/@${handle}`,
    twitter: `https://twitter.com/intent/follow?screen_name=${handle}`,
  };
  return links[platform] ?? '#';
}

function getSaveContactUrl(profile: Profile): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `TITLE:${profile.title}${profile.company ? ` — ${profile.company}` : ''}`,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : '',
    profile.email ? `EMAIL:${profile.email}` : '',
    profile.website ? `URL:${profile.website}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n');
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
}

function getEmbedUrl(url: string, platform: string): string | null {
  if (platform === 'youtube') {
    const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }
  if (platform === 'tiktok') {
    const match = url.match(/\/video\/(\d+)/);
    if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false&width=500`;
  }
  return null;
}

const socialIcons: { key: keyof Socials; bg: string; svg: string }[] = [
  {
    key: 'facebook',
    bg: '#1877F2',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  },
  {
    key: 'instagram',
    bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>`,
  },
  {
    key: 'linkedin',
    bg: '#0A66C2',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  },
  {
    key: 'tiktok',
    bg: '#010101',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z"/></svg>`,
  },
  {
    key: 'youtube',
    bg: '#FF0000',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#FF0000" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/></svg>`,
  },
  {
    key: 'snapchat',
    bg: '#FFFC00',
    svg: `<svg viewBox="0 0 24 24" fill="#000000" width="20" height="20"><path d="M12.206 1c-.972 0-3.414.293-4.681 2.818-.446.88-.334 2.395-.278 3.186l-.005.003c-.084.06-.41.25-1.007.25-.44 0-.89-.126-1.34-.374l-.002-.001c-.206-.107-.4-.16-.577-.16-.545 0-.9.408-.9.81 0 .513.44.837.977 1.056l.012.005c.362.147 1.01.41 1.204.857.048.111.056.222.025.327-.309 1.059-1.468 2.697-3.377 3.063-.198.038-.347.212-.347.413 0 .086.026.17.077.243.35.504 1.43.872 3.3 1.118.086.387.15.822.204 1.056.065.282.273.43.546.43.16 0 .32-.048.523-.103.306-.083.73-.196 1.37-.196.59 0 1.002.163 1.502.374.613.258 1.308.55 2.497.55 1.185 0 1.88-.292 2.492-.55.502-.211.913-.374 1.503-.374.64 0 1.062.113 1.368.196.204.055.365.103.525.103.29 0 .486-.157.546-.43.054-.234.118-.67.204-1.056 1.87-.246 2.95-.614 3.3-1.118a.43.43 0 0 0 .077-.243c0-.201-.149-.375-.347-.413-1.91-.366-3.068-2.004-3.377-3.063-.031-.105-.023-.216.025-.327.194-.448.842-.71 1.204-.857l.012-.005c.537-.22.977-.543.977-1.056 0-.402-.355-.81-.9-.81-.177 0-.371.053-.577.16l-.002.001c-.45.248-.9.374-1.34.374-.597 0-.923-.19-1.007-.25l-.005-.003c.056-.791.168-2.306-.278-3.186C15.62 1.293 13.178 1 12.206 1z"/></svg>`,
  },
  {
    key: 'telegram',
    bg: '#2AABEE',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
  },
  {
    key: 'twitter',
    bg: '#000000',
    svg: `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
];

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function ProfileClient({ profile, qrDataUrl, profileUrl }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const portfolioItems = profile.portfolio ?? [];
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () => setLightboxIndex(i => i !== null ? (i - 1 + portfolioItems.length) % portfolioItems.length : null);
  const lightboxNext = () => setLightboxIndex(i => i !== null ? (i + 1) % portfolioItems.length : null);

  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const activeSocials = socialIcons.filter(({ key }) => profile.socials[key]);
  const hasDocuments = !!profile.documents?.length;
  const hasPortfolio = !!profile.portfolio?.length;
  const hasVideos = !!profile.videos?.length;
  const hasLinks = !!profile.links?.length;
  const hasSocials = activeSocials.length > 0;
  const hasSecondary = hasSocials || hasDocuments || hasPortfolio || hasVideos || hasLinks;

  // ── Thème dynamique ──
  const bgColor        = profile.bg_color        || '#0D0D1A';
  const primaryColor   = profile.primary_color   || '#00CFFF';
  const secondaryColor = profile.secondary_color || '#D4A843';
  const textColor      = profile.text_color      || '#FFFFFF';
  const fontHeading    = profile.font_heading     || 'Inter';
  const cardColor      = getCardColor(bgColor);
  const textOnPrimary  = getContrastText(primaryColor);
  const textOnSecondary = getContrastText(secondaryColor);

  const themeVars = {
    '--c-bg': bgColor,
    '--c-card': cardColor,
    '--c-primary': primaryColor,
    '--c-secondary': secondaryColor,
    '--c-text': textColor,
    '--c-font': `'${fontHeading}', sans-serif`,
    '--c-text-on-primary': textOnPrimary,
    '--c-text-on-secondary': textOnSecondary,
  } as React.CSSProperties;

  // Chargement dynamique Google Font
  useEffect(() => {
    if (fontHeading === 'Inter') return;
    const fontParam = GOOGLE_FONTS[fontHeading];
    if (!fontParam) return;
    const id = `gfont-${fontHeading.replace(/\s+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    document.head.appendChild(link);
  }, [fontHeading]);

  const heroHasMedia = !!(profile.photo || profile.cover || profile.coverVideo);

  return (
    <main className={styles.page} style={themeVars}>
      <VisitTracker profileId={profile.id} />

      <div className={styles.inner}>

        {/* ── HERO WRAPPER (position relative pour le logo qui dépasse) ── */}
        <div className={styles.heroWrapper}>
          <div
            className={styles.hero}
            style={!heroHasMedia ? { background: `linear-gradient(150deg, ${primaryColor} 0%, ${secondaryColor} 100%)` } : undefined}
          >
            {/* Média de fond */}
            {profile.coverVideo ? (
              <video src={profile.coverVideo} autoPlay muted loop playsInline className={styles.heroBg} />
            ) : profile.cover ? (
              <img src={profile.cover} alt="cover" className={styles.heroBg} />
            ) : profile.photo ? (
              <img src={profile.photo} alt={profile.name} className={styles.heroBg} />
            ) : null}

            {/* Dégradé sombre bas */}
            <div className={styles.heroGradient} />

            {/* Nom + Titre */}
            <div className={styles.heroInfo}>
              <h1 className={styles.heroName}>{profile.name}</h1>
              <p className={styles.heroMeta}>
                {profile.title}
                {profile.company && <span className={styles.heroCompany}> · {profile.company}</span>}
              </p>
            </div>
          </div>

          {/* Logo — badge avatar bas droite */}
          {profile.logo_url && (
            <div className={styles.heroLogoWrap}>
              <div className={styles.heroLogoInner}>
                <img
                  src={profile.logo_url}
                  alt={profile.company || profile.name}
                  className={styles.heroLogo}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div className={styles.content}>

          {/* Bouton Enregistrer */}
          <div className={styles.saveBtnWrap}>
            <a
              href={getSaveContactUrl(profile)}
              download={`${profile.slug}.vcf`}
              className={styles.saveBtn}
            >
              Enregistrer le contact
            </a>
          </div>

          {/* Contact icon buttons row */}
          {(profile.phone || profile.email || profile.website || profile.location) && (
            <p className={styles.sectionGroupTitle}>Contacter</p>
          )}
          <div className={styles.contactBtnsRow}>
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className={styles.contactBtn}>
                <div className={styles.contactBtnIcon} style={{ background: '#00CFFF' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span className={styles.contactBtnLabel}>Appeler</span>
              </a>
            )}
            {profile.phone && (
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactBtn}
              >
                <div className={styles.contactBtnIcon} style={{ background: '#25D366' }}>
                  <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </div>
                <span className={styles.contactBtnLabel}>WhatsApp</span>
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className={styles.contactBtn}>
                <div className={styles.contactBtnIcon} style={{ background: '#EA4335' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span className={styles.contactBtnLabel}>Email</span>
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
                <div className={styles.contactBtnIcon} style={{ background: '#4285F4' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className={styles.contactBtnLabel}>Site web</span>
              </a>
            )}
            {profile.location && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactBtn}
              >
                <div className={styles.contactBtnIcon} style={{ background: '#EA4335' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className={styles.contactBtnLabel}>Localisation</span>
              </a>
            )}
          </div>

          <div className={styles.divider} />

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            {/* Primaire : Prendre RDV */}
            {profile.rdv && (
              <a href={profile.rdv} target="_blank" rel="noopener noreferrer" className={styles.pillPrimary}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {profile.label_rdv || 'Prendre RDV — Appel gratuit 30 min'}
              </a>
            )}

            {/* Secondaire : accordéon outline pills */}
            {hasSecondary && (
              <div className={styles.secondaryGrid}>
                {hasSocials && (
                  <button
                    onClick={() => toggleSection('socials')}
                    className={`${styles.pillSecondary} ${openSection === 'socials' ? styles.pillSecondaryActive : ''}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Réseaux sociaux
                    {openSection === 'socials' ? <ChevronUp /> : <ChevronDown />}
                  </button>
                )}
                {hasDocuments && (
                  <button
                    onClick={() => toggleSection('documents')}
                    className={`${styles.pillSecondary} ${openSection === 'documents' ? styles.pillSecondaryActive : ''}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {profile.label_documents || 'Documents'}
                    {openSection === 'documents' ? <ChevronUp /> : <ChevronDown />}
                  </button>
                )}
                {hasPortfolio && (
                  <button
                    onClick={() => toggleSection('portfolio')}
                    className={`${styles.pillSecondary} ${openSection === 'portfolio' ? styles.pillSecondaryActive : ''}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    {profile.portfolioTitle || 'Réalisations'}
                    {openSection === 'portfolio' ? <ChevronUp /> : <ChevronDown />}
                  </button>
                )}
                {hasVideos && (
                  <button
                    onClick={() => toggleSection('videos')}
                    className={`${styles.pillSecondary} ${openSection === 'videos' ? styles.pillSecondaryActive : ''}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    {profile.label_videos || 'Vidéos'}
                    {openSection === 'videos' ? <ChevronUp /> : <ChevronDown />}
                  </button>
                )}
                {hasLinks && (
                  <button
                    onClick={() => toggleSection('links')}
                    className={`${styles.pillSecondary} ${openSection === 'links' ? styles.pillSecondaryActive : ''}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Liens
                    {openSection === 'links' ? <ChevronUp /> : <ChevronDown />}
                  </button>
                )}
              </div>
            )}

            {/* Tertiaire : laisser coordonnées */}
            <button onClick={() => setShowLeadModal(true)} className={styles.pillTertiary}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Laisser mes coordonnées
            </button>

            {/* Tertiaire : push notifications */}
            <PushSubscribeButton profileId={profile.id} profileName={profile.name} />
          </div>

          {/* Accordéon : Réseaux sociaux */}
          {openSection === 'socials' && activeSocials.length > 0 && (
            <div className={styles.accordionSection}>
              <div className={styles.socialsRow}>
                {activeSocials.map(({ key, bg, svg }) => (
                  <a
                    key={key}
                    href={getDeepLink(key, profile.socials[key]!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    style={{ background: bg }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Accordéon : Documents */}
          {openSection === 'documents' && profile.documents && (
            <div className={styles.accordionSection}>
              {profile.documents.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.docItem}>
                  <div className={styles.docIconBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00CFFF" strokeWidth="2" width="20" height="20">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.name}</span>
                    <span className={styles.docType}>{doc.type}</span>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00CFFF" strokeWidth="2" width="16" height="16" className={styles.docArrow}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Accordéon : Portfolio */}
          {openSection === 'portfolio' && profile.portfolio && (
            <div className={styles.accordionSection}>
              <p className={styles.accordionLabel}>{profile.portfolioTitle}</p>
              <div className={styles.portfolioGrid}>
                {profile.portfolio.map((item, idx) => (
                  <div key={item.id} className={styles.portfolioItem} onClick={() => openLightbox(idx)}>
                    <img
                      src={item.photo_url}
                      alt={item.caption ?? 'Réalisation'}
                      className={styles.portfolioImg}
                    />
                    {item.caption && <p className={styles.portfolioCaption}>{item.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accordéon : Vidéos */}
          {openSection === 'videos' && profile.videos && (
            <div className={styles.accordionSection}>
              <div className={styles.videoList}>
                {profile.videos.map((video) => {
                  const platform = video.platform ?? 'upload';
                  const embedUrl = getEmbedUrl(video.url, platform);
                  return (
                    <div key={video.id} className={styles.videoItem}>
                      {video.type === 'upload' ? (
                        <video src={video.url} controls className={styles.videoEmbed} />
                      ) : platform === 'instagram' ? (
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoInstagramBtn}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                          </svg>
                          Voir sur Instagram
                        </a>
                      ) : embedUrl ? (
                        <div className={platform === 'tiktok' ? styles.videoWrapTikTok : styles.videoWrap}>
                          <iframe
                            src={embedUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.videoFrame}
                            title={video.caption ?? 'Vidéo'}
                          />
                        </div>
                      ) : (
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoInstagramBtn}>
                          Voir la vidéo
                        </a>
                      )}
                      {video.caption && <p className={styles.videoCaption}>{video.caption}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accordéon : Liens personnalisés */}
          {openSection === 'links' && profile.links && (
            <div className={styles.accordionSection}>
              {profile.links.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.customLink}>
                  {link.icon && <span className={styles.customLinkIcon}>{link.icon}</span>}
                  <span className={styles.customLinkLabel}>{link.label}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ opacity: 0.4, flexShrink: 0 }}>
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>{/* fin .content */}

        {/* QR Code */}
        <div className={styles.qrCard}>
          <p className={styles.qrLabel}>Partager ma carte</p>
          <div className={styles.qrBox}>
            <img src={qrDataUrl} alt="QR Code" width={160} height={160} />
          </div>
          <p className={styles.qrCaption}>Scannez ce QR code pour accéder à ma carte digitale</p>
          <p className={styles.qrUrl}>{profileUrl}</p>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          Powered by <span className={styles.footerAccent}>G+Digital Success</span> · digitalsucces.tech
        </p>
      </div>

      {/* Agent IA — Pro+ uniquement */}
      {['pro', 'business', 'business_team'].includes(profile.plan?.toLowerCase() ?? '') && (
        <ChatWidget profileId={profile.id} profileName={profile.name} profilePhoto={profile.photo || undefined} />
      )}

      {/* Lightbox : portfolio plein écran */}
      {lightboxIndex !== null && portfolioItems[lightboxIndex] && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {portfolioItems.length > 1 && (
            <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); lightboxPrev(); }} aria-label="Précédent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img
              src={portfolioItems[lightboxIndex].photo_url}
              alt={portfolioItems[lightboxIndex].caption ?? 'Réalisation'}
              className={styles.lightboxImg}
            />
            {portfolioItems[lightboxIndex].caption && (
              <p className={styles.lightboxCaption}>{portfolioItems[lightboxIndex].caption}</p>
            )}
            {portfolioItems.length > 1 && (
              <p className={styles.lightboxCounter}>{lightboxIndex + 1} / {portfolioItems.length}</p>
            )}
          </div>
          {portfolioItems.length > 1 && (
            <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); lightboxNext(); }} aria-label="Suivant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
        </div>
      )}

      {/* Modal : Laisser mes coordonnées */}
      {showLeadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLeadModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowLeadModal(false)} aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <LeadCaptureForm profileId={profile.id} ownerName={profile.name} />
          </div>
        </div>
      )}
    </main>
  );
}
