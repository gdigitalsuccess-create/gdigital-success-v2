import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Guide Carte NFC Intelligente — G+Digital Success',
  description: "Tout savoir sur votre carte NFC intelligente : configuration, fonctionnalités, agent IA, membres d'équipe et partage.",
};

const PLANS = [
  { feature: 'Profil complet (photo, infos, réseaux)', starter: true, pro: true, business: true, team: true },
  { feature: 'QR code + lien de partage', starter: true, pro: true, business: true, team: true },
  { feature: 'Documents (brochures, PDF)', starter: true, pro: true, business: true, team: true },
  { feature: 'Portfolio (réalisations photos)', starter: true, pro: true, business: true, team: true },
  { feature: 'Vidéos & liens personnalisés', starter: true, pro: true, business: true, team: true },
  { feature: 'Bouton RDV en ligne', starter: true, pro: true, business: true, team: true },
  { feature: 'Thème couleurs personnalisé', starter: true, pro: true, business: true, team: true },
  { feature: 'Agent IA (chatbot)', starter: false, pro: '200 msgs/mois', business: '500 msgs/mois', team: '500 msgs/mois' },
  { feature: 'Notifications push visiteurs', starter: false, pro: true, business: true, team: true },
  { feature: 'Collecte de leads', starter: false, pro: true, business: true, team: true },
  { feature: "Membres d'équipe", starter: false, pro: '2 membres', business: '5 membres', team: '10 membres' },
];

export default function CarteNFCGuidePage() {
  return (
    <main style={{ background: '#F4F6FA', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1A1A2E' }}>

      {/* Hero */}
      <div style={{ background: '#1B3464', color: 'white', padding: '40px 24px 40px', textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/guide" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none', padding: '4px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
            ← Centre de ressources
          </Link>
        </div>
        <img src="/assets/logo.png" alt="G+Digital Success" style={{ height: 56, marginBottom: 20, objectFit: 'contain' }} />
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
          Guide d&apos;utilisation<br />Carte NFC Intelligente
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: 520, margin: '0 auto 24px' }}>
          Tout ce qu&apos;il faut savoir pour configurer, personnaliser et partager votre carte professionnelle digitale.
        </p>
        <a href="/assets/guide-carte-nfc.pdf" download style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4A843', color: '#1B3464', padding: '12px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          Télécharger en PDF
        </a>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>

        {/* NAV SECTIONS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {["C'est quoi ?", 'Plans', 'Remplir sa carte', 'Agent IA', 'Membres', 'Partager', 'Support'].map((label, i) => (
            <a key={i} href={`#section-${i + 1}`} style={{ background: 'white', border: '2px solid #1B3464', color: '#1B3464', padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
              {i + 1}. {label}
            </a>
          ))}
        </div>

        {/* SECTION 1 */}
        <Section id="section-1" num={1} title="Qu'est-ce que la carte NFC intelligente ?">
          <p style={{ marginBottom: 16, lineHeight: 1.7 }}>
            Votre carte NFC intelligente est une <strong>carte de visite digitale évolutive</strong>. Contrairement à une carte papier, elle est toujours à jour, ne se perd jamais et vous permet d&apos;être contacté en un seul tap.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '📲', title: 'Partage instantané', desc: 'Un tap NFC, un scan QR ou un lien partagé suffit pour que vos contacts accèdent à toutes vos informations.' },
              { icon: '✏️', title: 'Toujours à jour', desc: 'Changez de poste, numéro ou adresse ? Mettez à jour votre carte en 30 secondes depuis votre tableau de bord.' },
              { icon: '📊', title: 'Statistiques', desc: 'Suivez combien de personnes ont consulté votre carte, depuis quel appareil et à quelle fréquence.' },
              { icon: '🤖', title: 'Agent IA intégré', desc: 'Un assistant IA répond à vos visiteurs 24h/24 — questions, tarifs, prise de RDV (Pro et plus).' },
              { icon: '📁', title: 'Documents & portfolio', desc: 'Partagez vos brochures, présentations et réalisations directement depuis votre carte.' },
              { icon: '👥', title: 'Cartes membres', desc: 'Créez des cartes pour toute votre équipe, toutes reliées à votre profil entreprise.' },
            ].map((a, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E8ECF4', borderRadius: 10, padding: '16px', borderTop: '3px solid #D4A843' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, color: '#1B3464', marginBottom: 6, fontSize: '0.9rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.55 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* SECTION 2 */}
        <Section id="section-2" num={2} title="Vos fonctionnalités selon votre plan">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 16 }}>
            {([
              { name: 'Starter', color: '#6B7280', textColor: 'white', bg: '#F9FAFB', vals: PLANS.map(p => p.starter) },
              { name: 'Pro', color: '#D4A843', textColor: '#1B3464', bg: '#FFFBEB', vals: PLANS.map(p => p.pro) },
              { name: 'Business', color: '#1B3464', textColor: 'white', bg: '#EFF6FF', vals: PLANS.map(p => p.business) },
              { name: 'Business Équipe', color: '#0D9488', textColor: 'white', bg: '#F0FDF4', vals: PLANS.map(p => p.team) },
            ] as { name: string; color: string; textColor: string; bg: string; vals: (boolean | string)[] }[]).map((plan) => (
              <div key={plan.name} style={{ border: `2px solid ${plan.color}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: plan.color, color: plan.textColor, padding: '10px 14px', fontWeight: 800, textAlign: 'center', fontSize: '0.88rem' }}>
                  {plan.name}
                </div>
                <div style={{ background: plan.bg, padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
                  {PLANS.map((feature, fi) => {
                    const val = plan.vals[fi];
                    return (
                      <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem', borderBottom: fi < PLANS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', padding: '7px 0' }}>
                        <span style={{ flexShrink: 0, fontWeight: 800, fontSize: '0.9rem', color: val === false ? '#D1D5DB' : '#16A34A', lineHeight: 1.2 }}>
                          {val === false ? '—' : '✔'}
                        </span>
                        <div style={{ lineHeight: 1.4 }}>
                          <span style={{ color: '#374151', fontWeight: val !== false ? 600 : 400, opacity: val === false ? 0.45 : 1 }}>{feature.feature}</span>
                          {typeof val === 'string' && (
                            <span style={{ color: plan.color, fontWeight: 700, display: 'block', fontSize: '0.72rem', marginTop: 1 }}>{val}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Tip>Pour évoluer vers un plan supérieur, contactez-nous à contact@digitalsucces.tech — la transition est immédiate.</Tip>
        </Section>

        {/* SECTION 3 */}
        <Section id="section-3" num={3} title="Remplir votre carte pas à pas">
          <InfoBox>Connectez-vous sur <strong>digitalsucces.tech/dashboard</strong> avec votre email et mot de passe.</InfoBox>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { n: 1, title: 'Photo de couverture (hero)', desc: 'Grande photo ou vidéo affichée en haut de votre carte. Utilisez une photo professionnelle. Format recommandé : paysage, minimum 1200×800 px.' },
              { n: 2, title: 'Photo de profil', desc: "Votre portrait ou logo d'entreprise. Elle apparaît en médaillon. Format carré recommandé, minimum 400×400 px." },
              { n: 3, title: 'Informations personnelles', desc: 'Nom, poste, entreprise, téléphone, email, site web et localisation.' },
              { n: 4, title: 'Réseaux sociaux', desc: 'Instagram, LinkedIn, Facebook, TikTok, YouTube, WhatsApp, Snapchat, Telegram, X. Ajoutez uniquement ceux que vous utilisez activement.' },
              { n: 5, title: 'Documents', desc: 'Uploadez vos brochures, catalogues, présentations PDF. Ils seront téléchargeables directement depuis votre carte.' },
              { n: 6, title: 'Portfolio (Réalisations)', desc: 'Ajoutez vos photos de projets réalisés. Elles s\'affichent en grille et sont cliquables en plein écran.' },
              { n: 7, title: 'Vidéos', desc: 'Ajoutez des vidéos YouTube, TikTok, Instagram ou des vidéos uploadées directement.' },
              { n: 8, title: 'Liens personnalisés', desc: 'Boutique en ligne, portfolio externe, application mobile, tout lien utile.' },
              { n: 9, title: 'Bouton RDV', desc: 'Collez le lien de votre calendrier (Calendly, Cal.com...). Un bouton "Prendre RDV" apparaîtra sur votre carte.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'white', border: '1px solid #E8ECF4', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ background: '#D4A843', color: '#1B3464', fontWeight: 800, fontSize: '0.8rem', minWidth: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                <div><span style={{ fontWeight: 700, color: '#1B3464' }}>{s.title}</span> — <span style={{ color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.55 }}>{s.desc}</span></div>
              </div>
            ))}
          </div>
          <Tip style={{ marginTop: 12 }}>Après chaque modification, votre carte se met à jour immédiatement. Vos visiteurs voient toujours la version la plus récente.</Tip>
        </Section>

        {/* SECTION 4 */}
        <Section id="section-4" num={4} title="Configurer l'Agent IA pour une performance optimale">
          <PlanBadge color="#0D9488">Pro+</PlanBadge>
          <p style={{ marginBottom: 12, lineHeight: 1.7 }}>L&apos;Agent IA est un assistant intégré à votre carte qui répond aux questions de vos visiteurs 24h/24. Il est formé sur vos informations et peut qualifier des prospects même en votre absence.</p>
          <InfoBox>Accès : Tableau de bord → onglet &quot;Agent IA&quot; → Instructions personnalisées</InfoBox>
          <p style={{ fontWeight: 700, color: '#1B3464', marginBottom: 10 }}>Que mettre dans les instructions personnalisées ?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '✏️', title: 'Votre activité', desc: 'Décrivez ce que vous faites, vos spécialités, votre zone géographique. Ex : "Je suis consultant en marketing digital basé à Montréal, je travaille avec les PME."' },
              { icon: '💰', title: 'Vos tarifs', desc: 'Si vous souhaitez les partager. Ex : "Mes prestations démarrent à 500$/mois." Sinon : "Ne pas donner de tarif, inviter à prendre RDV."' },
              { icon: '🕐', title: 'Vos horaires', desc: 'Disponibilités et délai de réponse habituel. Ex : "Je rappelle sous 24h en jours ouvrables."' },
              { icon: '🚫', title: 'Ce que vous ne faites pas', desc: 'Limitez les sujets hors de votre domaine. Ex : "Ne répondre qu\'aux questions liées au marketing, décliner les autres sujets poliment."' },
              { icon: '📞', title: "Appel à l'action", desc: 'Ex : "Toujours proposer de prendre un RDV via le bouton disponible sur la carte."' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, background: 'white', border: '1px solid #E8ECF4', borderLeft: '4px solid #D4A843', borderRadius: '0 8px 8px 0', padding: '10px 14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                <div><strong style={{ color: '#1B3464' }}>{item.title}</strong> — <span style={{ color: '#6B7280', fontSize: '0.88rem' }}>{item.desc}</span></div>
              </div>
            ))}
          </div>
          <Tip style={{ marginTop: 12 }}>Plus vos instructions sont précises, plus les réponses seront pertinentes. Révisez-les à chaque changement d&apos;offre.</Tip>
        </Section>

        {/* SECTION 5 */}
        <Section id="section-5" num={5} title="Ajouter des membres d'équipe">
          <PlanBadge color="#16A34A">Business Équipe</PlanBadge>
          <p style={{ marginBottom: 12, lineHeight: 1.7 }}>Créez des cartes individuelles pour chaque membre de votre équipe. Chaque carte affiche ses informations personnelles mais hérite du logo, des couleurs et des données entreprise de votre compte principal.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Connectez-vous sur digitalsucces.tech/dashboard avec votre compte principal.',
              'Allez dans l\'onglet "Mon Équipe" dans le menu du tableau de bord.',
              'Cliquez sur "Ajouter un membre" et remplissez le nom, poste et email du membre.',
              'Le membre reçoit un email avec ses identifiants et complète sa carte personnelle.',
              'Chaque membre dispose de son propre QR code et lien — ex : digitalsucces.tech/c/prenom-nom',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'white', border: '1px solid #E8ECF4', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ background: '#D4A843', color: '#1B3464', fontWeight: 800, fontSize: '0.8rem', minWidth: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.55 }}>{s}</div>
              </div>
            ))}
          </div>
          <InfoBox style={{ marginTop: 12 }}>Les membres ne peuvent pas modifier le logo, les couleurs ni les documents de l&apos;entreprise. Seul le compte principal en a le contrôle.</InfoBox>
        </Section>

        {/* SECTION 6 */}
        <Section id="section-6" num={6} title="Partager votre carte">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🔗', title: 'Lien direct', desc: "Partagez l'adresse digitalsucces.tech/c/votre-slug par SMS, email, WhatsApp ou réseaux sociaux." },
              { icon: '📷', title: 'QR Code', desc: 'Accessible en bas de votre carte. Téléchargez-le et imprimez-le sur vos supports (roll-up, vitrine, menu, emballage...).' },
              { icon: '📡', title: 'Puce NFC', desc: "Si vous avez commandé la carte physique NFC, un simple tap de la puce sur un smartphone ouvre votre carte automatiquement, sans application." },
              { icon: '📱', title: "Installer sur l'écran d'accueil", desc: 'Ouvrez votre carte dans le navigateur et choisissez "Ajouter à l\'écran d\'accueil" pour un accès rapide comme une application.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, background: 'white', border: '1px solid #E8ECF4', borderLeft: '4px solid #D4A843', borderRadius: '0 8px 8px 0', padding: '12px 14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <div><strong style={{ color: '#1B3464' }}>{item.title}</strong> — <span style={{ color: '#6B7280', fontSize: '0.88rem' }}>{item.desc}</span></div>
              </div>
            ))}
          </div>
          <Tip style={{ marginTop: 12 }}>Ajoutez le lien de votre carte dans votre signature email — c&apos;est la façon la plus simple de le partager à chaque échange professionnel.</Tip>
        </Section>

        {/* SECTION 7 */}
        <Section id="section-7" num={7} title="Support & assistance">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ background: 'white', border: '1px solid #E8ECF4', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>📧</div>
              <div style={{ fontWeight: 700, color: '#1B3464', marginBottom: 6 }}>Par email</div>
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>contact@digitalsucces.tech<br />Réponse sous 24h en jours ouvrables.</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E8ECF4', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>🌐</div>
              <div style={{ fontWeight: 700, color: '#1B3464', marginBottom: 6 }}>Guide en ligne</div>
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>digitalsucces.tech/guide/carte-nfc<br />Toujours à jour, accessible depuis votre téléphone.</div>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <div style={{ borderTop: '2px solid #1B3464', marginTop: 20, paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '0.8rem', color: '#6B7280' }}>
          <strong style={{ color: '#1B3464' }}>G+Digital Success — digitalsucces.tech</strong>
          <span>Guide Carte NFC Intelligente · v1.0 · 2026</span>
          <span>contact@digitalsucces.tech</span>
        </div>
      </div>
    </main>
  );
}

function Section({ id, num, title, children }: { id: string; num: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 40, scrollMarginTop: 20 }}>
      <div style={{ background: '#1B3464', color: 'white', padding: '10px 18px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: '#D4A843', color: '#1B3464', fontWeight: 800, fontSize: '0.85rem', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</span>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>
      </div>
      <div style={{ background: 'white', border: '1px solid #E8ECF4', borderRadius: '0 0 8px 8px', padding: '20px' }}>
        {children}
      </div>
    </section>
  );
}

function Tip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#FEF9EC', border: '1px solid #D4A843', borderRadius: 6, padding: '10px 14px', fontSize: '0.85rem', color: '#7A5500', lineHeight: 1.55, ...style }}>
      <strong>Conseil — </strong>{children}
    </div>
  );
}

function InfoBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 14px', fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.55, marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function PlanBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ display: 'inline-block', background: `${color}22`, color, padding: '3px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, marginBottom: 12 }}>
      {children}
    </span>
  );
}
