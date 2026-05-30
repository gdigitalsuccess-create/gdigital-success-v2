'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UrgencyBar from '@/components/UrgencyBar';
import Navbar from '@/components/Navbar';
import { Footer, WhatsAppFloat } from '@/components/Sections';
import { useLang } from '@/lib/LangContext';

/* ═════════════════════════════════════════════════════════ */
export default function CarteNFCPage() {
  const { lang } = useLang();
  const isFr = lang === 'fr';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [winWidth, setWinWidth] = useState(375);
  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMob = winWidth < 640;
  const isTab = winWidth >= 640 && winWidth < 1024;

  /* ── Données bilingues ─────────────────────────────────── */
  const PLANS = [
    {
      name: 'Starter', price: '12',
      desc: isFr ? 'Parfait pour démarrer' : 'Perfect to get started',
      features: isFr
        ? [
            'Page profil publique active',
            'Infos modifiables à tout moment',
            'Boutons WhatsApp / Tél / Email',
            'QR code inclus',
            'Liens réseaux sociaux',
            'Liens personnalisés (max 10)',
            'Photo de couverture',
            '1 vidéo (lien externe)',
            '6 photos portfolio',
          ]
        : [
            'Active public profile page',
            'Info editable anytime',
            'WhatsApp / Phone / Email buttons',
            'QR code included',
            'Social media links',
            'Custom links (max 10)',
            'Cover photo',
            '1 video (external link)',
            '6 portfolio photos',
          ],
      cta: isFr ? 'Commencer' : 'Get started',
      highlight: false,
    },
    {
      name: 'Pro', price: '29',
      desc: isFr ? 'Le plus populaire' : 'Most popular',
      features: isFr
        ? [
            'Tout Starter +',
            'Vidéo de couverture (MP4, 20 Mo max)',
            'Stats de visite (total, 30j, 7j, mobile/desktop)',
            'Notifications push abonnés',
            'Documents PDF (brochure, catalogue, menu)',
            'Bouton prise de RDV (Calendly / Cal.com)',
            '2 vidéos · 12 photos portfolio',
            'VCard téléchargeable',
            '2 membres équipe inclus',
            'Agent IA — 200 msgs/mois (+$5 = +200 msgs temporaires*)',
          ]
        : [
            'Everything in Starter +',
            'Cover video (MP4, 20 MB max)',
            'Visit stats (total, 30d, 7d, mobile/desktop)',
            'Push notifications to subscribers',
            'PDF documents (brochure, catalogue, menu)',
            'Booking button (Calendly / Cal.com)',
            '2 videos · 12 portfolio photos',
            'Downloadable VCard',
            '2 team members included',
            'AI Agent — 200 msgs/month (+$5 = +200 temporary msgs*)',
          ],
      cta: isFr ? 'Choisir Pro' : 'Choose Pro',
      highlight: true,
    },
    {
      name: 'Business', price: '59',
      desc: isFr ? 'Pour les entrepreneurs ambitieux' : 'For ambitious entrepreneurs',
      features: isFr
        ? [
            'Tout Pro +',
            'Signature email pro (configuration gratuite)',
            'Vidéos illimitées + upload MP4 direct',
            'Photos portfolio illimitées',
            'Liens personnalisés illimités',
            '5 membres équipe inclus',
            'Support prioritaire',
            'Agent IA — 500 msgs/mois (+$5 = +200 msgs temporaires*)',
          ]
        : [
            'Everything in Pro +',
            'Pro email signature (free setup)',
            'Unlimited videos + direct MP4 upload',
            'Unlimited portfolio photos',
            'Unlimited custom links',
            '5 team members included',
            'Priority support',
            'AI Agent — 500 msgs/month (+$5 = +200 temporary msgs*)',
          ],
      cta: isFr ? 'Choisir Business' : 'Choose Business',
      highlight: false,
    },
    {
      name: isFr ? 'Business Équipe' : 'Business Team', price: '99',
      desc: isFr ? 'PME, agences & équipes commerciales' : 'SMBs, agencies & sales teams',
      features: isFr
        ? [
            'Tout Business +',
            'Jusqu\'à 10 cartes membres',
            'Gestion équipe centralisée (1 dashboard)',
            'Activation / désactivation à la volée',
            'Agent IA — 500 msgs/mois par carte (+$5 = +200 msgs temporaires*)',
            '→ 11 cartes à $99 vs $649 en individuel',
          ]
        : [
            'Everything in Business +',
            'Up to 10 member cards',
            'Centralized team management (1 dashboard)',
            'On-the-fly activation / deactivation',
            'AI Agent — 500 msgs/month per card (+$5 = +200 temporary msgs*)',
            '→ 11 cards at $99 vs $649 individually',
          ],
      cta: isFr ? 'Choisir Équipe' : 'Choose Team',
      highlight: false,
    },
  ];

  const STEPS = [
    {
      num: '01',
      title: isFr ? 'Commandez votre carte physique' : 'Order your physical card',
      desc: isFr ? "Recevez votre carte NFC élégante. Une seule fois, aucun abonnement sur la carte elle-même." : "Receive your elegant NFC card. One-time purchase, no subscription on the card itself.",
      img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80',
    },
    {
      num: '02',
      title: isFr ? 'Créez votre profil digital' : 'Create your digital profile',
      desc: isFr ? 'En quelques minutes, renseignez vos infos, photos, liens et documents. Modifiable à tout moment.' : 'In a few minutes, fill in your info, photos, links and documents. Editable anytime.',
      img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80',
    },
    {
      num: '03',
      title: isFr ? 'Partagez en 1 tap' : 'Share in 1 tap',
      desc: isFr ? "Approchez votre carte d'un smartphone — votre profil s'ouvre instantanément. Sans app à télécharger." : "Hold your card near a smartphone — your profile opens instantly. No app to download.",
      img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=700&q=80',
    },
  ];

  const FEATURES = [
    { icon: '⬡', title: 'NFC + QR Code', desc: isFr ? "Compatible tous smartphones. Un tap ou un scan, le profil s'ouvre en moins d'une seconde." : "Compatible with all smartphones. One tap or scan, profile opens in under a second." },
    { icon: '◈', title: isFr ? 'Profil toujours à jour' : 'Always up-to-date profile', desc: isFr ? "Changez de poste, de numéro ou d'entreprise — votre carte physique ne change pas." : "Change your role, number or company — your physical card stays the same." },
    { icon: '◎', title: isFr ? 'Boutons de contact directs' : 'Direct contact buttons', desc: isFr ? 'WhatsApp, appel, email, site web — vos contacts atteignent le bon canal en un clic.' : 'WhatsApp, call, email, website — your contacts reach the right channel in one click.' },
    { icon: '▣', title: isFr ? 'Réseaux sociaux unifiés' : 'Unified social networks', desc: isFr ? 'Instagram, LinkedIn, TikTok, YouTube — tous vos profils regroupés en un seul endroit.' : 'Instagram, LinkedIn, TikTok, YouTube — all your profiles in one place.' },
    { icon: '◑', title: 'Vcard & Documents', desc: isFr ? 'Vos contacts enregistrent vos coordonnées directement dans leur téléphone.' : 'Your contacts save your details directly to their phone.' },
    { icon: '◐', title: isFr ? 'Statistiques de visite' : 'Visit statistics', desc: isFr ? "Suivez combien de fois votre carte a été vue et d'où viennent vos visiteurs. (Plan Pro+)" : "Track how many times your card was viewed and where your visitors come from. (Pro+ plan)" },
  ];

  const PRODUCTS = [
    {
      id: 'carte',
      name: isFr ? 'Carte NFC' : 'NFC Card',
      tagline: isFr ? 'La classique élégante' : 'The elegant classic',
      price: '$20',
      desc: isFr ? 'Format carte de crédit. Matière premium, couleur personnalisable. NFC + QR Code intégré.' : 'Credit card format. Premium material, customizable color. NFC + QR Code included.',
      features: isFr
        ? ['Format crédit card standard', 'NFC + QR Code', 'Couleur au choix', 'Livraison internationale']
        : ['Standard credit card format', 'NFC + QR Code', 'Color of your choice', 'International delivery'],
      popular: false,
      whatsapp: isFr ? 'Bonjour, je souhaite commander une Carte NFC G%2BDigital' : 'Hello, I would like to order an NFC Card G%2BDigital',
    },
    {
      id: 'badge',
      name: isFr ? 'Badge Téléphone' : 'Phone Badge',
      tagline: isFr ? 'Toujours dans votre poche' : 'Always in your pocket',
      price: '$12',
      desc: isFr ? "Sticker NFC ultra-fin. Se colle au dos de votre téléphone. Même profil, toujours disponible." : "Ultra-thin NFC sticker. Sticks to the back of your phone. Same profile, always available.",
      features: isFr
        ? ['Ultra-fin (0.8 mm)', 'Compatible tous téléphones', 'Adhésif repositionnable', 'NFC + QR Code']
        : ['Ultra-thin (0.8 mm)', 'Compatible with all phones', 'Repositionable adhesive', 'NFC + QR Code'],
      popular: false,
      whatsapp: isFr ? 'Bonjour, je souhaite commander un Badge T%C3%A9l%C3%A9phone NFC G%2BDigital' : 'Hello, I would like to order an NFC Phone Badge G%2BDigital',
    },
    {
      id: 'bundle',
      name: 'Bundle',
      tagline: isFr ? 'Le pack complet — le plus populaire' : 'The complete pack — most popular',
      price: '$28',
      oldPrice: '$32',
      desc: isFr ? 'Carte NFC pour les réunions + badge téléphone pour le quotidien. Un seul profil digital partagé.' : 'NFC Card for meetings + phone badge for daily use. One shared digital profile.',
      features: isFr
        ? ['1 Carte NFC + 1 Badge', 'Même profil digital', 'Économie de $4', 'Livraison express']
        : ['1 NFC Card + 1 Badge', 'Same digital profile', 'Save $4', 'Express delivery'],
      popular: true,
      whatsapp: isFr ? 'Bonjour, je souhaite commander le Bundle Carte%2BBadge NFC G%2BDigital' : 'Hello, I would like to order the NFC Card%2BBadge Bundle G%2BDigital',
    },
    {
      id: 'bracelet',
      name: isFr ? 'Bracelet NFC' : 'NFC Band',
      tagline: isFr ? 'Le futur du networking' : 'The future of networking',
      price: '$35',
      desc: isFr ? "Bracelet élégant avec puce NFC intégrée. Portez votre identité digitale au quotidien, même sans téléphone." : "Elegant band with built-in NFC chip. Wear your digital identity every day, even without your phone.",
      features: isFr
        ? ['Design minimaliste', 'Waterproof', 'Compatible iOS & Android', 'Bracelet interchangeable']
        : ['Minimalist design', 'Waterproof', 'Compatible iOS & Android', 'Interchangeable band'],
      popular: false,
      whatsapp: isFr ? 'Bonjour, je souhaite commander un Bracelet NFC G%2BDigital' : 'Hello, I would like to order an NFC Band G%2BDigital',
    },
  ];

  const FAQS = [
    {
      q: isFr ? 'Est-ce que Android et iPhone sont compatibles ?' : 'Are Android and iPhone compatible?',
      a: isFr ? 'Oui. Le NFC fonctionne nativement sur Android depuis 2012, et sur iPhone depuis iOS 14. Le QR code est un backup universel.' : 'Yes. NFC works natively on Android since 2012, and on iPhone since iOS 14. The QR code is a universal backup.',
    },
    {
      q: isFr ? "Que se passe-t-il si je change de numéro ou d'entreprise ?" : "What if I change my number or company?",
      a: isFr ? "Vous modifiez votre profil depuis votre dashboard — la carte physique reste la même. Pas de réimpression." : "You update your profile from your dashboard — the physical card stays the same. No reprinting.",
    },
    {
      q: isFr ? 'Combien coûte la carte physique ?' : 'How much does the physical card cost?',
      a: isFr ? "La carte physique est un achat unique entre $15 et $25. L'abonnement mensuel couvre votre profil digital et les mises à jour." : "The physical card is a one-time purchase between $15 and $25. The monthly subscription covers your digital profile and updates.",
    },
    {
      q: isFr ? 'Puis-je annuler à tout moment ?' : 'Can I cancel at any time?',
      a: isFr ? "Oui, sans engagement. Si vous annulez, votre profil est désactivé mais la carte physique reste en votre possession." : "Yes, no commitment. If you cancel, your profile is deactivated but you keep the physical card.",
    },
    {
      q: isFr ? 'Faut-il une connexion internet pour partager sa carte ?' : 'Do you need internet to share your card?',
      a: isFr
        ? "La puce NFC et le QR code fonctionnent sans internet — ils transmettent simplement un lien. La personne qui reçoit votre carte a besoin d'internet pour ouvrir votre profil lors de la première visite. Ensuite, deux choses : (1) le bouton \"Enregistrer le contact\" télécharge vos coordonnées directement sur son téléphone — plus besoin d'internet pour vous appeler ou vous écrire. (2) Le profil est mis en cache (PWA) pour les visites suivantes hors-ligne. En pratique, un réseau 2G ou WhatsApp suffit pour la première ouverture."
        : "The NFC chip and QR code work without internet — they simply transmit a link. The person receiving your card needs internet to open your profile on the first visit. After that: (1) the \"Save contact\" button downloads your info directly to their phone — no internet needed to call or message you. (2) The profile is cached (PWA) for future offline visits. In practice, a 2G network or WhatsApp is enough for the first open.",
    },
  ];

  /* ── IntersectionObserver ─────────────────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 300);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <UrgencyBar />
      <Navbar />
      <main>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="hero" style={{ background: 'var(--dark)' }}>
          <div className="hero-bg" />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="container" style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: isMob ? 32 : 60, alignItems: 'center', width: '100%' }}>
            {/* Texte */}
            <div className="hero-content reveal" style={{ maxWidth: '100%' }}>
              <div className="hero-badge">
                <span className="dot" />
                {isFr ? 'Carte de visite intelligente NFC' : 'Smart NFC Business Card'}
              </div>
              <h1 className="hero-title">
                {isFr ? <>Une carte qui{' '}<span className="gradient-text">reste à jour.</span><br />Pour toujours.</> : <>A card that{' '}<span className="gradient-text">stays current.</span><br />Forever.</>}
              </h1>
              <p className="hero-subtitle">
                {isFr
                  ? "Approchez votre carte NFC d'un smartphone — votre profil digital s'ouvre instantanément. Changez vos infos quand vous voulez, sans réimprimer."
                  : "Hold your NFC card near a smartphone — your digital profile opens instantly. Update your info anytime, without reprinting."}
              </p>
              <div className="hero-actions">
                <a href="#commander" className="btn btn-primary">{isFr ? 'Commander ma carte →' : 'Order my card →'}</a>
                <Link href="/c/paulnyama" className="btn btn-outline">{isFr ? 'Voir la démo' : 'See the demo'}</Link>
              </div>
              <div className="hero-stats">
                {(isFr
                  ? [['1 tap', 'pour partager'], ['0 app', 'à télécharger'], ['∞', 'mises à jour']]
                  : [['1 tap', 'to share'], ['0 app', 'to download'], ['∞', 'updates']]
                ).map(([val, label]) => (
                  <div className="stat" key={val}>
                    <span className="stat-number">{val}</span>
                    <span className="stat-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup carte + téléphone */}
            <div className="reveal" style={{ display: isMob ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 340 }}>
              <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ width: 300, height: 188, borderRadius: 18, background: 'linear-gradient(135deg, #1A1A2E 0%, #0f0f1a 100%)', border: '1px solid rgba(108,99,255,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1), 0 0 40px rgba(108,99,255,0.1)', position: 'relative', transform: 'rotate(-5deg)', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'repeating-linear-gradient(0deg,rgba(108,99,255,1) 0px,rgba(108,99,255,1) 1px,transparent 1px,transparent 38px),repeating-linear-gradient(90deg,rgba(108,99,255,1) 0px,rgba(108,99,255,1) 1px,transparent 1px,transparent 38px)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.05) 0%,transparent 100%)', borderRadius: '18px 18px 0 0' }} />
                <div style={{ position: 'absolute', top: 18, left: 20, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G+Digital Success</div>
                <div style={{ position: 'absolute', top: 14, right: 18, width: 34, height: 26, borderRadius: 4, background: 'linear-gradient(135deg,rgba(212,168,67,0.8),rgba(212,168,67,0.4))', border: '1px solid rgba(212,168,67,0.5)' }} />
                <div style={{ position: 'absolute', bottom: 44, left: 20 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#E8E8F0', fontFamily: 'var(--font-display)' }}>Paul Nyama</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(62,207,207,0.8)', marginTop: 2, fontWeight: 500 }}>CEO & {isFr ? 'Fondateur' : 'Founder'}</div>
                </div>
                <div style={{ position: 'absolute', bottom: 14, right: 18, opacity: 0.5 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="1.5">
                    <path d="M8.5 8.5C9.5 7.5 11 7 12 7s2.5.5 3.5 1.5"/>
                    <path d="M6 6C7.5 4.5 9.7 3.5 12 3.5s4.5 1 6 2.5"/>
                    <circle cx="12" cy="12" r="1.2" fill="#6C63FF"/>
                    <path d="M12 13.2l2.5 4.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)' }} />
              </div>

              {/* Téléphone */}
              <div style={{ position: 'absolute', right: 10, top: '55%', transform: 'translateY(-50%) rotate(4deg)', width: 130, height: 240, borderRadius: 22, background: '#0a0a0a', border: '2.5px solid #1a1a1a', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, background: '#F0F4FA', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px 10px' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#3ECFCF)', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 10px rgba(108,99,255,0.3)' }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>P</span>
                  </div>
                  <div style={{ fontSize: '0.52rem', fontWeight: 800, color: '#1A1A2E', marginBottom: 1 }}>Paul Nyama</div>
                  <div style={{ fontSize: '0.42rem', color: '#666', marginBottom: 8 }}>CEO · G+Digital</div>
                  {(isFr ? ['WhatsApp', 'Appel', 'Email'] : ['WhatsApp', 'Call', 'Email']).map(btn => (
                    <div key={btn} style={{ width: '100%', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', borderRadius: 5, padding: '4px 6px', marginBottom: 4, fontSize: '0.42rem', color: '#fff', fontWeight: 700, textAlign: 'center' }}>{btn}</div>
                  ))}
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    {['in', 'ig', 'yt'].map(s => (
                      <div key={s} style={{ width: 18, height: 18, borderRadius: 4, background: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.33rem', color: '#fff', fontWeight: 800 }}>{s}</div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 18, background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: 36, height: 3, borderRadius: 2, background: '#222' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-scroll"><span /></div>
        </section>

        {/* ── COMMENT ÇA MARCHE ─────────────────────────────── */}
        <section style={{ background: 'var(--dark-2)', padding: '100px 0', borderTop: '1px solid var(--card-border)' }}>
          <div className="container">
            <div className="section-header center reveal">
              <span className="section-label">{isFr ? 'Simple & rapide' : 'Simple & fast'}</span>
              <h2 className="section-title section-title-light">{isFr ? 'Opérationnel en 5 minutes' : 'Up and running in 5 minutes'}</h2>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>{isFr ? 'Trois étapes. Aucune compétence technique requise.' : 'Three steps. No technical skills required.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
              {STEPS.map((step, i) => (
                <div key={i} className="reveal" style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(10,10,15,0.5) 100%)' }} />
                    <div style={{ position: 'absolute', top: 14, left: 14, width: 40, height: 40, borderRadius: 10, background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ padding: '24px 24px 28px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section style={{ background: 'var(--dark)', padding: '100px 0' }}>
          <div className="container">
            <div className="section-header center reveal">
              <span className="section-label">{isFr ? 'Fonctionnalités' : 'Features'}</span>
              <h2 className="section-title section-title-light">{isFr ? "Tout ce qu'il vous faut" : 'Everything you need'}</h2>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>{isFr ? 'Une page profil qui remplace carte, brochure et CV.' : 'A profile page that replaces your card, brochure and CV.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : isTab ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="reveal" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '28px 24px', transition: 'border-color 0.25s, transform 0.25s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUITS ──────────────────────────────────────── */}
        <section style={{ background: 'var(--dark-2)', padding: '100px 0', borderTop: '1px solid var(--card-border)' }}>
          <div className="container">
            <div className="section-header center reveal">
              <span className="section-label">{isFr ? 'Nos produits' : 'Our products'}</span>
              <h2 className="section-title section-title-light">{isFr ? 'Choisissez votre format' : 'Choose your format'}</h2>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>
                {isFr ? "Tous les produits partagent le même profil digital — changez d'objet, gardez votre identité." : "All products share the same digital profile — change the object, keep your identity."}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : isTab ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20, alignItems: 'start' }}>
              {PRODUCTS.map((product) => (
                <div key={product.id} className="reveal" style={{ background: product.popular ? 'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(62,207,207,0.06))' : 'var(--dark-3)', border: product.popular ? '1px solid rgba(108,99,255,0.45)' : '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '28px 22px', position: 'relative', boxShadow: product.popular ? '0 20px 60px rgba(108,99,255,0.12)' : 'none' }}>
                  {product.popular && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', color: '#fff', padding: '4px 16px', borderRadius: 50, fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                      {isFr ? 'LE PLUS POPULAIRE' : 'MOST POPULAR'}
                    </div>
                  )}
                  {/* Mockup CSS */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120, marginBottom: 20 }}>
                    {product.id === 'carte' && (
                      <div style={{ width: 130, height: 82, borderRadius: 8, background: 'linear-gradient(135deg,#1A1A2E,#0f0f1a)', border: '1px solid rgba(108,99,255,0.4)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(180deg,rgba(255,255,255,0.04),transparent)' }} />
                        <div style={{ position: 'absolute', top: 8, left: 9, fontSize: '0.35rem', fontWeight: 800, letterSpacing: '0.1em', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G+DIGITAL</div>
                        <div style={{ position: 'absolute', top: 6, right: 8, width: 18, height: 13, borderRadius: 2, background: 'linear-gradient(135deg,rgba(212,168,67,0.8),rgba(212,168,67,0.4))' }} />
                        <div style={{ position: 'absolute', bottom: 16, left: 9, fontSize: '0.45rem', fontWeight: 800, color: '#E8E8F0' }}>Jean Dupont</div>
                        <div style={{ position: 'absolute', bottom: 8, left: 9, fontSize: '0.35rem', color: 'rgba(62,207,207,0.8)' }}>CEO</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)' }} />
                      </div>
                    )}
                    {product.id === 'badge' && (
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 60, height: 100, borderRadius: 10, background: '#111', border: '1.5px solid #222', position: 'relative', overflow: 'visible' }}>
                          <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, borderRadius: 1, background: '#333' }} />
                          <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 20, height: 3, borderRadius: 2, background: '#222' }} />
                          <div style={{ position: 'absolute', inset: '14px 4px 12px', background: '#1a1a2e', borderRadius: 4 }} />
                          <div style={{ position: 'absolute', bottom: 14, right: -14, width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6C63FF,#3ECFCF)', boxShadow: '0 4px 14px rgba(108,99,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M8.5 8.5C9.5 7.5 11 7 12 7s2.5.5 3.5 1.5"/><path d="M6 6C7.5 4.5 9.7 3.5 12 3.5s4.5 1 6 2.5"/><circle cx="12" cy="12" r="1.2" fill="#fff"/></svg>
                          </div>
                        </div>
                      </div>
                    )}
                    {product.id === 'bundle' && (
                      <div style={{ position: 'relative', width: 120, height: 100 }}>
                        <div style={{ position: 'absolute', left: 0, top: 18, width: 100, height: 63, borderRadius: 6, background: 'linear-gradient(135deg,#1A1A2E,#0f0f1a)', border: '1px solid rgba(108,99,255,0.35)', transform: 'rotate(-6deg)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', borderRadius: '0 0 6px 6px' }} />
                        </div>
                        <div style={{ position: 'absolute', right: 0, top: 8, width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#6C63FF,#3ECFCF)', boxShadow: '0 6px 20px rgba(108,99,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M8.5 8.5C9.5 7.5 11 7 12 7s2.5.5 3.5 1.5"/><path d="M6 6C7.5 4.5 9.7 3.5 12 3.5s4.5 1 6 2.5"/><circle cx="12" cy="12" r="1.2" fill="#fff"/></svg>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, left: 12, fontSize: '0.42rem', fontWeight: 800, color: 'rgba(62,207,207,0.7)', letterSpacing: '0.08em' }}>CARD + BADGE</div>
                      </div>
                    )}
                    {product.id === 'bracelet' && (
                      <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 90, height: 56, borderRadius: 28, border: '7px solid transparent', backgroundClip: 'padding-box', position: 'relative' }}>
                          <div style={{ position: 'absolute', inset: -7, borderRadius: 32, background: 'linear-gradient(135deg,#6C63FF,#3ECFCF)', padding: 7 }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: 26, background: '#0f0f1a' }} />
                          </div>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 22, height: 14, borderRadius: 3, background: 'linear-gradient(135deg,rgba(212,168,67,0.8),rgba(212,168,67,0.4))', border: '1px solid rgba(212,168,67,0.6)', zIndex: 1 }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'var(--font-display)', background: product.popular ? 'linear-gradient(90deg,#6C63FF,#3ECFCF)' : 'none', WebkitBackgroundClip: product.popular ? 'text' : 'unset', WebkitTextFillColor: product.popular ? 'transparent' : 'var(--text)', color: product.popular ? 'transparent' : 'var(--text)' }}>{product.price}</span>
                    {'oldPrice' in product && product.oldPrice && <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)', textDecoration: 'line-through' }}>{product.oldPrice}</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{isFr ? 'achat unique' : 'one-time'}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{product.tagline}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                    {product.features.map((feat, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <a href={`https://wa.me/971582680034?text=${product.whatsapp}`} target="_blank" rel="noreferrer" className={`btn btn-${product.popular ? 'primary' : 'outline'} btn-full`} style={{ fontSize: '0.82rem' }}>
                    {isFr ? 'Commander →' : 'Order →'}
                  </a>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: 28 }}>
              {isFr ? 'Tous les produits donnent accès au même profil digital — abonnement mensuel requis · Livraison mondiale' : 'All products give access to the same digital profile — monthly subscription required · Worldwide delivery'}
            </p>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────── */}
        <section style={{ background: 'var(--dark-2)', padding: '100px 0', borderTop: '1px solid var(--card-border)' }}>
          <div className="container">
            <div className="section-header center reveal">
              <span className="section-label">{isFr ? 'Tarifs transparents' : 'Transparent pricing'}</span>
              <h2 className="section-title section-title-light">{isFr ? 'Sans surprise, sans engagement' : 'No surprises, no commitment'}</h2>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>
                + {isFr ? 'Carte physique NFC' : 'Physical NFC card'} : <strong style={{ color: 'var(--text)' }}>$15–25</strong> ({isFr ? 'achat unique' : 'one-time purchase'})
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : isTab ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMob ? 16 : 20, alignItems: 'start' }}>
              {PLANS.map((plan, i) => (
                <div key={i} className="reveal" style={{ background: plan.highlight ? 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(62,207,207,0.08))' : 'var(--dark-3)', border: plan.highlight ? '1px solid rgba(108,99,255,0.5)' : '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: isMob ? '28px 20px' : '36px 24px', boxShadow: plan.highlight ? '0 20px 60px rgba(108,99,255,0.15)' : 'none', position: 'relative', transform: plan.highlight && !isMob ? 'scale(1.04)' : 'none' }}>
                  {plan.highlight && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', color: '#fff', padding: '5px 18px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {isFr ? 'LE PLUS POPULAIRE' : 'MOST POPULAR'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: plan.highlight ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'var(--font-display)' }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', background: plan.highlight ? 'linear-gradient(90deg,#6C63FF,#3ECFCF)' : 'none', WebkitBackgroundClip: plan.highlight ? 'text' : 'unset', WebkitTextFillColor: plan.highlight ? 'transparent' : 'var(--text)', color: plan.highlight ? 'transparent' : 'var(--text)' }}>${plan.price}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/{isFr ? 'mois' : 'month'}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 28 }}>{plan.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                    {plan.features.map((feat, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#commander" className={`btn btn-${plan.highlight ? 'primary' : 'outline'} btn-full`}>{plan.cta}</a>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {isFr
                ? '* Les messages supplémentaires (+$5 = +200 msgs) sont valables jusqu\'au renouvellement de votre abonnement. Le solde non utilisé ne se reporte pas.'
                : '* Extra messages (+$5 = +200 msgs) are valid until your subscription renewal. Unused balance does not carry over.'}
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section style={{ background: 'var(--dark)', padding: '100px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="section-header center reveal">
              <span className="section-label">FAQ</span>
              <h2 className="section-title section-title-light">{isFr ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className="reveal" style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: openFaq === i ? 'rgba(108,99,255,0.08)' : 'var(--dark-2)', transition: 'background 0.2s', borderLeft: openFaq === i ? '2px solid #6C63FF' : '2px solid transparent' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: openFaq === i ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'var(--font)' }}>{faq.q}</span>
                    <span style={{ background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: openFaq === i ? 'transparent' : 'unset', color: openFaq === i ? 'transparent' : 'var(--text-muted)', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, marginLeft: 16 }}>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </div>
                  {openFaq === i && (
                    <div style={{ padding: '16px 24px', background: 'var(--dark-3)', borderTop: '1px solid var(--card-border)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────────────── */}
        <section id="commander" style={{ background: 'var(--dark-2)', padding: '100px 0', borderTop: '1px solid var(--card-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container reveal" style={{ textAlign: 'center', position: 'relative' }}>
            <span className="section-label section-label-light">{isFr ? 'Prêt à vous démarquer ?' : 'Ready to stand out?'}</span>
            <h2 className="section-title section-title-light" style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: '16px auto 20px' }}>
              {isFr ? <>Votre carte NFC,{' '}<span className="gradient-text">dès aujourd&#39;hui.</span></> : <>Your NFC card,{' '}<span className="gradient-text">starting today.</span></>}
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
              {isFr ? <>Commandez votre carte physique et créez votre profil en 5 minutes.<br />Résiliation à tout moment.</> : <>Order your physical card and create your profile in 5 minutes.<br />Cancel anytime.</>}
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`mailto:contact@digitalsucces.tech?subject=${isFr ? 'Commande Carte NFC' : 'NFC Card Order'}`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                {isFr ? 'Commander par email →' : 'Order by email →'}
              </a>
              <a href={`https://wa.me/971582680034?text=${isFr ? 'Bonjour, je souhaite commander une Carte NFC G+Digital' : 'Hello, I would like to order an NFC Card G+Digital'}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                WhatsApp
              </a>
            </div>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: 24 }}>
              {isFr ? 'Carte physique à partir de $15 · Livraison internationale · Réponse sous 24h' : 'Physical card from $15 · International delivery · Response within 24h'}
            </p>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
