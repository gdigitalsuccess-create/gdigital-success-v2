import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Centre de ressources — G+Digital Success',
  description: 'Guides et documentation pour tirer le meilleur de vos services G+Digital Success.',
};

const GUIDES = [
  {
    slug: 'carte-nfc',
    title: 'Carte NFC Intelligente',
    description: "Tout savoir sur la configuration, les fonctionnalités, l'agent IA intégré, les membres d'équipe et le partage de votre carte professionnelle digitale.",
    icon: '📇',
    available: true,
    pdfUrl: '/assets/guide-carte-nfc.pdf',
    tags: ['Démarrage', 'Agent IA', 'Membres', 'QR Code'],
  },
  {
    slug: 'agent-ia',
    title: 'Agent IA Universel',
    description: 'Comment déployer, configurer et optimiser votre assistant IA multicanal (WhatsApp, site web, voix, Messenger).',
    icon: '🤖',
    available: false,
    pdfUrl: null,
    tags: ['IA', 'Chatbot', 'WhatsApp', 'Voix'],
  },
];

export default function GuidesHubPage() {
  return (
    <main style={{ background: '#F4F6FA', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1A1A2E' }}>

      {/* Hero */}
      <div style={{ background: '#1B3464', color: 'white', padding: '48px 24px 44px', textAlign: 'center' }}>
        <img src="/assets/logo.png" alt="G+Digital Success" style={{ height: 56, marginBottom: 20, objectFit: 'contain' }} />
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
          Centre de ressources
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
          Guides et documentation pour tirer le meilleur de vos services G+Digital Success.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>

        {/* Grille des guides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {GUIDES.map(g => (
            <div
              key={g.slug}
              style={{
                background: 'white',
                border: '1px solid #E8ECF4',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                opacity: g.available ? 1 : 0.6,
                boxShadow: g.available ? '0 2px 12px rgba(27,52,100,0.08)' : 'none',
              }}
            >
              {/* En-tête carte */}
              <div style={{ background: '#1B3464', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                  {g.icon}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', lineHeight: 1.3 }}>{g.title}</div>
                  {!g.available && (
                    <span style={{ fontSize: '0.7rem', background: '#D4A843', color: '#1B3464', padding: '2px 10px', borderRadius: 10, fontWeight: 700, marginTop: 6, display: 'inline-block' }}>
                      Bientôt disponible
                    </span>
                  )}
                </div>
              </div>

              {/* Corps */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                  {g.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {g.tags.map(t => (
                    <span key={t} style={{ background: '#EFF6FF', color: '#1B3464', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                {g.available ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
                    <Link
                      href={`/guide/${g.slug}`}
                      style={{ flex: 1, display: 'block', background: '#1B3464', color: 'white', padding: '10px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}
                    >
                      Lire le guide
                    </Link>
                    {g.pdfUrl && (
                      <a
                        href={g.pdfUrl}
                        download
                        title="Télécharger en PDF"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, background: '#FEF9EC', border: '2px solid #D4A843', borderRadius: 8, color: '#7A5500', fontSize: '1rem', textDecoration: 'none', flexShrink: 0, fontWeight: 700 }}
                      >
                        ↓
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 'auto', paddingTop: 4, background: '#F4F6FA', borderRadius: 8, padding: '10px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem', fontWeight: 600 }}>
                    En préparation
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px solid #E8ECF4', marginTop: 60, paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '0.8rem', color: '#9CA3AF' }}>
          <strong style={{ color: '#1B3464' }}>G+Digital Success — digitalsucces.tech</strong>
          <span>contact@digitalsucces.tech</span>
        </div>
      </div>
    </main>
  );
}
