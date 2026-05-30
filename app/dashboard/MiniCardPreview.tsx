'use client';

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
};

type Props = {
  form: FormData;
  profile: ProfileData;
};

export default function MiniCardPreview({ form, profile }: Props) {
  const cardUrl = `/c/${profile.slug}`;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Mini carte */}
      <div style={{ background: '#13131F', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>

        {/* Cover */}
        <div style={{ position: 'relative', height: 90 }}>
          {profile.cover_video_url ? (
            <video
              src={profile.cover_video_url}
              autoPlay muted loop playsInline
              style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
            />
          ) : profile.cover_url ? (
            <img src={profile.cover_url} alt="cover" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 90, background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }} />
          )}

          {/* Avatar */}
          <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ padding: 3, borderRadius: '50%', background: '#00CFFF', boxShadow: '0 4px 12px rgba(0,207,255,0.35)' }}>
              <div style={{ padding: 2, borderRadius: '50%', background: '#13131F' }}>
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={form.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" width="26" height="26">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div style={{ paddingTop: 38, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', margin: '0 0 3px', lineHeight: 1.2 }}>
            {form.name || <span style={{ color: '#374151' }}>Votre nom</span>}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.72rem', margin: '0 0 14px', lineHeight: 1.4 }}>
            {form.title || <span style={{ color: '#374151' }}>Votre poste</span>}
            {form.company && <span style={{ color: '#00CFFF' }}> · {form.company}</span>}
          </p>

          {/* Bouton Enregistrer */}
          <div style={{ width: '100%', background: '#00CFFF', color: '#0D0D1A', fontWeight: 800, borderRadius: 9999, padding: '8px 0', fontSize: '0.72rem', marginBottom: 14 }}>
            Enregistrer le contact
          </div>

          {/* Icônes contacts */}
          {(form.phone || form.email || form.website || form.location) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              {form.phone && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#00CFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="15" height="15">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
              )}
              {form.phone && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </div>
              )}
              {form.email && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EA4335', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="15" height="15">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              )}
              {form.website && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="15" height="15">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
              )}
              {form.location && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EA4335', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="15" height="15">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* URL */}
          <p style={{ fontSize: '0.62rem', color: '#4B5563', margin: 0 }}>
            digitalsucces.tech/c/{profile.slug}
          </p>
        </div>
      </div>

      {/* Lien plein écran */}
      <a
        href={cardUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: '10px', borderRadius: 10, background: 'rgba(0,207,255,0.06)', border: '1px solid rgba(0,207,255,0.18)', color: '#00CFFF', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Voir ma carte en plein écran
      </a>

      {/* Info */}
      <p style={{ fontSize: '0.68rem', color: '#374151', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
        L&apos;aperçu se met à jour en temps réel.<br />
        Cliquez Enregistrer pour que vos visiteurs voient les changements.
      </p>
    </div>
  );
}
