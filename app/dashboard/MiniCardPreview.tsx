'use client';

import { useEffect } from 'react';

type FormData = {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  location: string;
};

type ProfileData = {
  photo_url: string;
  cover_url: string;
  cover_video_url: string;
  slug: string;
  logo_url?: string;
};

type Theme = {
  bg_color?: string;
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  font_heading?: string;
};

type Props = {
  form: FormData;
  profile: ProfileData;
  theme?: Theme;
  showLink?: boolean;
};

const GOOGLE_FONTS: Record<string, string> = {
  'Poppins': 'Poppins:wght@400;600;700;800',
  'Montserrat': 'Montserrat:wght@400;600;700;800;900',
  'Playfair Display SC': 'Playfair+Display+SC:wght@400;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700;800',
  'Cormorant Garamond': 'Cormorant+Garamond:wght@300;400;500;600;700',
  'Raleway': 'Raleway:wght@400;600;700;800',
  'Lato': 'Lato:wght@400;700;900',
  'Roboto': 'Roboto:wght@400;500;700;900',
  'Lora': 'Lora:wght@400;500;600;700',
  'EB Garamond': 'EB+Garamond:wght@400;500;600;700;800',
  'Belleza': 'Belleza',
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
  const adj = getLuminance(bgHex) < 0.5 ? 12 : -15;
  return '#' + [r, g, b].map(c => clamp(c + adj).toString(16).padStart(2, '0')).join('');
}

const SOCIAL_ICONS = [
  { label: 'Facebook',  bg: '#1877F2', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>` },
  { label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>` },
  { label: 'TikTok',   bg: '#010101', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z"/></svg>` },
  { label: 'LinkedIn',  bg: '#0A66C2', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>` },
  { label: 'YouTube',   bg: '#FF0000', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#FF0000"/></svg>` },
  { label: 'Snapchat',  bg: '#FFFC00', svg: `<svg viewBox="0 0 24 24" fill="#000" width="14" height="14"><path d="M12.206 1c-.972 0-3.414.293-4.681 2.818-.446.88-.334 2.395-.278 3.186l-.005.003c-.084.06-.41.25-1.007.25-.44 0-.89-.126-1.34-.374l-.002-.001c-.206-.107-.4-.16-.577-.16-.545 0-.9.408-.9.81 0 .513.44.837.977 1.056l.012.005c.362.147 1.01.41 1.204.857.048.111.056.222.025.327-.309 1.059-1.468 2.697-3.377 3.063-.198.038-.347.212-.347.413 0 .086.026.17.077.243.35.504 1.43.872 3.3 1.118.086.387.15.822.204 1.056.065.282.273.43.546.43.16 0 .32-.048.523-.103.306-.083.73-.196 1.37-.196.59 0 1.002.163 1.502.374.613.258 1.308.55 2.497.55 1.185 0 1.88-.292 2.492-.55.502-.211.913-.374 1.503-.374.64 0 1.062.113 1.368.196.204.055.365.103.525.103.29 0 .486-.157.546-.43.054-.234.118-.67.204-1.056 1.87-.246 2.95-.614 3.3-1.118a.43.43 0 0 0 .077-.243c0-.201-.149-.375-.347-.413-1.91-.366-3.068-2.004-3.377-3.063-.031-.105-.023-.216.025-.327.194-.448.842-.71 1.204-.857l.012-.005c.537-.22.977-.543.977-1.056 0-.402-.355-.81-.9-.81-.177 0-.371.053-.577.16l-.002.001c-.45.248-.9.374-1.34.374-.597 0-.923-.19-1.007-.25l-.005-.003c.056-.791.168-2.306-.278-3.186C15.62 1.293 13.178 1 12.206 1z"/></svg>` },
  { label: 'Telegram',  bg: '#2AABEE', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>` },
  { label: 'X',         bg: '#000000', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
];

const CONTACT_BTNS = [
  { label: 'Appeler',  bg: '#00CFFF', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29z"/></svg>` },
  { label: 'WhatsApp', bg: '#25D366', svg: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.944 0A11.944 11.944 0 0 0 0 11.944c0 2.1.548 4.072 1.507 5.783L0 24l6.439-1.688A11.944 11.944 0 1 0 11.944 0z"/></svg>` },
  { label: 'Email',    bg: '#EA4335', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>` },
  { label: 'Site web', bg: '#4285F4', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
  { label: 'Localisation', bg: '#EA4335', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` },
];

export default function MiniCardPreview({ form, profile, theme = {}, showLink = true }: Props) {
  const bg        = theme.bg_color        || '#0D0D1A';
  const primary   = theme.primary_color   || '#00CFFF';
  const secondary = theme.secondary_color || '#D4A843';
  const textColor = theme.text_color      || '#FFFFFF';
  const font      = theme.font_heading    || 'Inter';
  const card      = getCardColor(bg);
  const textOnPrimary   = getContrastText(primary);
  const textOnSecondary = getContrastText(secondary);

  useEffect(() => {
    if (font === 'Inter') return;
    const fontParam = GOOGLE_FONTS[font];
    if (!fontParam) return;
    const id = `gfont-preview-${font.replace(/\s+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  const cardUrl = profile.slug ? `/c/${profile.slug}` : '#';
  const fontFamily = `'${font}', sans-serif`;

  return (
    <div style={{ fontFamily: fontFamily }}>
      <div style={{ background: card, borderRadius: 20, border: `1px solid rgba(128,128,128,0.15)`, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>

        {/* Cover */}
        <div style={{ position: 'relative', height: 90 }}>
          {profile.cover_video_url ? (
            <video src={profile.cover_video_url} autoPlay muted loop playsInline
              style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
          ) : profile.cover_url ? (
            <img src={profile.cover_url} alt="cover" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 90, background: `linear-gradient(135deg, ${bg}, ${card})` }} />
          )}

          {/* Avatar */}
          <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ padding: 3, borderRadius: '50%', background: primary, boxShadow: `0 4px 12px ${primary}55` }}>
              <div style={{ padding: 2, borderRadius: '50%', background: card }}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={form.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" width="26" height="26">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div style={{ paddingTop: 38, paddingBottom: 12, paddingLeft: 14, paddingRight: 14, textAlign: 'center' }}>
          {profile.logo_url && (
            <div style={{ marginBottom: 8 }}>
              <img src={profile.logo_url} alt="logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: 'contain', display: 'inline-block' }} />
            </div>
          )}
          <h3 style={{ color: textColor, fontWeight: 800, fontSize: '0.92rem', margin: '0 0 2px', fontFamily, lineHeight: 1.2 }}>
            {form.name || <span style={{ color: '#4B5563' }}>Votre nom</span>}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 10px', lineHeight: 1.4 }}>
            {form.title || <span style={{ color: '#374151' }}>Votre poste</span>}
            {form.company && <span style={{ color: primary }}> · {form.company}</span>}
          </p>

          {/* Bouton Enregistrer */}
          <div style={{ width: '100%', background: primary, color: textOnPrimary, fontWeight: 800, borderRadius: 9999, padding: '7px 0', fontSize: '0.68rem', marginBottom: 10 }}>
            Enregistrer le contact
          </div>

          {/* Réseaux sociaux — toujours visibles */}
          <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Réseaux</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
            {SOCIAL_ICONS.map(s => (
              <div key={s.label} style={{ width: 28, height: 28, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}
                dangerouslySetInnerHTML={{ __html: s.svg }} />
            ))}
          </div>

          {/* Boutons contact — toujours visibles */}
          <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contacter</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
            {CONTACT_BTNS.map(b => (
              <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: b.label === 'Appeler' ? primary : b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: b.svg }} />
                <span style={{ fontSize: '0.52rem', color: '#6B7280' }}>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Bouton RDV */}
          <div style={{ width: '100%', background: secondary, color: textOnSecondary, fontWeight: 700, borderRadius: 9999, padding: '7px 0', fontSize: '0.65rem', marginBottom: 10 }}>
            Prendre RDV — Appel gratuit 30 min
          </div>

          {/* URL */}
          <p style={{ fontSize: '0.58rem', color: primary, margin: 0, fontWeight: 600 }}>
            digitalsucces.tech/c/{profile.slug || 'votre-slug'}
          </p>
        </div>
      </div>

      {/* Lien plein écran */}
      {showLink && profile.slug && (
        <a href={cardUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '8px', borderRadius: 10, background: `${primary}12`, border: `1px solid ${primary}30`, color: primary, fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Voir la carte en plein écran
        </a>
      )}
    </div>
  );
}
