'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLang } from '@/lib/LangContext';

/* ─── Icons ─────────────────────────────────────────────────────────────────── */

const IcoChatWeb = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoWhatsApp = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IcoMessenger = () => (
  <svg width="36" height="36" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="msg-g" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0099FF"/>
        <stop offset="100%" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <path fill="url(#msg-g)" d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.628 0 12-4.974 12-11.111S18.628 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
  </svg>
);
const IcoPhone = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IcoEmail = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function AgentIAPage() {
  const { lang } = useLang();
  const isFr = lang === 'fr';

  const [selectedPlan, setSelectedPlan] = useState('business');
  const [form, setForm]   = useState({ name: '', email: '', phone: '', business: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const CHANNELS = [
    { icon: <IcoChatWeb />,   label: isFr ? 'Chat web' : 'Web Chat',           desc: isFr ? 'Un widget sur votre site répond instantanément à vos visiteurs.' : 'A widget on your site instantly responds to your visitors.' },
    { icon: <IcoWhatsApp />,  label: 'WhatsApp',                                desc: isFr ? 'Vos clients WhatsApp reçoivent des réponses 24h/24 automatiquement.' : 'Your WhatsApp clients get automatic 24/7 responses.' },
    { icon: <IcoMessenger />, label: 'Facebook Messenger',                      desc: isFr ? "Répond à tous vos DMs Facebook sans que vous leviez le petit doigt." : "Replies to all your Facebook DMs without lifting a finger." },
    { icon: <IcoPhone />,     label: isFr ? 'Appels vocaux' : 'Voice Calls',   desc: isFr ? 'Un agent vocal prend les appels, répond et pose des RDV.' : 'A voice agent answers calls, responds and books appointments.' },
    { icon: <IcoEmail />,     label: isFr ? 'Email auto' : 'Auto Email',       desc: isFr ? 'Relances, confirmations de RDV et résumés hebdo envoyés automatiquement.' : 'Follow-ups, appointment confirmations and weekly summaries sent automatically.' },
  ];

  const STEPS = [
    { n: '1', title: isFr ? 'On configure votre agent'  : 'We configure your agent',  desc: isFr ? "Vous nous donnez vos infos (services, FAQ, ton). On crée votre agent en moins de 48h." : "You give us your info (services, FAQ, tone). We create your agent in less than 48h." },
    { n: '2', title: isFr ? "On l'intègre partout"      : 'We integrate it everywhere', desc: isFr ? "Deux lignes de code sur votre site. WhatsApp et Messenger connectés en quelques clics." : "Two lines of code on your site. WhatsApp and Messenger connected in a few clicks." },
    { n: '3', title: isFr ? 'Il travaille pour vous'    : 'It works for you',          desc: isFr ? "L'agent répond, capture les leads, prend les RDV et vous envoie un rapport chaque semaine." : "The agent responds, captures leads, books appointments and sends you a weekly report." },
  ];

  const PLANS = [
    {
      id: 'starter', name: 'Starter', price: 99, badge: null, color: '#6C63FF',
      features: isFr
        ? ['Chat web (widget sur votre site)', 'Facebook Messenger', 'Prise de RDV automatique', 'Capture de leads', 'Dashboard client', 'Emails automatiques', 'Support email']
        : ['Web chat (widget on your site)', 'Facebook Messenger', 'Automatic appointment booking', 'Lead capture', 'Client dashboard', 'Automatic emails', 'Email support'],
      cta: isFr ? 'Commencer avec Starter' : 'Get started with Starter',
    },
    {
      id: 'business', name: 'Business', price: 199, badge: isFr ? 'Le plus populaire' : 'Most popular', color: '#D4A843',
      features: isFr
        ? ['Tout Starter, plus :', 'WhatsApp (numéro dédié)', 'RDV multi-canaux', 'Statistiques avancées', 'Instructions personnalisées', 'Rapport hebdomadaire', 'Support prioritaire']
        : ['Everything in Starter, plus:', 'WhatsApp (dedicated number)', 'Multi-channel appointments', 'Advanced statistics', 'Custom instructions', 'Weekly report', 'Priority support'],
      cta: isFr ? 'Choisir Business' : 'Choose Business',
    },
    {
      id: 'premium', name: 'Premium', price: 299, badge: isFr ? 'Tout inclus' : 'All inclusive', color: '#3ECFCF',
      features: isFr
        ? ['Tout Business, plus :', 'Agent vocal (appels entrants)', 'Numéro Twilio dédié', 'Instagram DMs (bêta)', 'Onboarding personnalisé', 'Formation équipe incluse', 'Support WhatsApp direct']
        : ['Everything in Business, plus:', 'Voice agent (incoming calls)', 'Dedicated Twilio number', 'Instagram DMs (beta)', 'Personalized onboarding', 'Team training included', 'Direct WhatsApp support'],
      cta: isFr ? 'Choisir Premium' : 'Choose Premium',
    },
  ];

  const FAQS = [
    {
      q: isFr ? "Combien de temps pour avoir l'agent prêt ?" : "How long until the agent is ready?",
      a: isFr ? "Moins de 48h après réception de vos informations. Vous remplissez un formulaire simple, on s'occupe du reste." : "Less than 48h after receiving your information. You fill out a simple form, we handle the rest.",
    },
    {
      q: isFr ? "Est-ce que l'agent comprend vraiment mes clients ?" : "Does the agent really understand my clients?",
      a: isFr ? "Oui. L'agent est alimenté par Claude (Anthropic), l'un des modèles IA les plus performants. Il connaît vos services, votre FAQ et votre ton." : "Yes. The agent is powered by Claude (Anthropic), one of the most powerful AI models. It knows your services, FAQ and tone.",
    },
    {
      q: isFr ? "Que se passe-t-il si l'agent ne sait pas répondre ?" : "What happens if the agent can't answer?",
      a: isFr ? "Il redirige poliment le client vers vous par email ou téléphone. Vous ne perdez jamais un contact." : "It politely redirects the client to you by email or phone. You never lose a contact.",
    },
    {
      q: isFr ? "Puis-je modifier les réponses de l'agent moi-même ?" : "Can I modify the agent's responses myself?",
      a: isFr ? "Oui. Vous avez un dashboard client où vous pouvez modifier le message d'accueil, les services et les instructions à tout moment." : "Yes. You have a client dashboard where you can modify the welcome message, services and instructions at any time.",
    },
    {
      q: isFr ? "Comment se passe le paiement ?" : "How does payment work?",
      a: isFr ? "Virement, Mobile Money (Orange, MTN, Wave) ou PayPal. Abonnement mensuel, sans engagement. Stripe disponible bientôt." : "Bank transfer, Mobile Money (Orange, MTN, Wave) or PayPal. Monthly subscription, no commitment. Stripe available soon.",
    },
  ];

  function scrollToForm(planId: string) {
    setSelectedPlan(planId);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    try {
      const r = await fetch('/api/commande-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
      if (!r.ok) throw new Error();
      setStatus('ok');
      setForm({ name: '', email: '', phone: '', business: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const planLabel = PLANS.find(p => p.id === selectedPlan)?.name ?? '';

  const stats: [string, string][] = isFr
    ? [['24/7', 'Disponibilité'], ['5', 'Canaux connectés'], ['< 48h', 'Mise en ligne'], ['0', 'Embauche requise']]
    : [['24/7', 'Availability'], ['5', 'Connected channels'], ['< 48h', 'Time to go live'], ['0', 'Hiring required']];

  const formFields = isFr
    ? [
        { id: 'name',     label: 'Prénom et nom *',        type: 'text',  placeholder: 'Jean Dupont' },
        { id: 'email',    label: 'Email professionnel *',   type: 'email', placeholder: 'contact@votreentreprise.com' },
        { id: 'phone',    label: 'WhatsApp / Téléphone *',  type: 'tel',   placeholder: '+33 6 xx xx xx xx' },
        { id: 'business', label: "Type d'entreprise *",     type: 'text',  placeholder: 'ex: salon de coiffure, restaurant, cabinet médical...' },
      ]
    : [
        { id: 'name',     label: 'First and last name *',   type: 'text',  placeholder: 'John Smith' },
        { id: 'email',    label: 'Professional email *',    type: 'email', placeholder: 'contact@yourbusiness.com' },
        { id: 'phone',    label: 'WhatsApp / Phone *',      type: 'tel',   placeholder: '+1 555 xxx xxxx' },
        { id: 'business', label: 'Type of business *',      type: 'text',  placeholder: 'e.g: hair salon, restaurant, medical practice...' },
      ];

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--dark)', color: 'var(--text)', fontFamily: 'var(--font)' }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section style={{ padding: '120px 24px 80px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              {isFr ? "Retour à l'accueil" : 'Back to home'}
            </Link>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 40, padding: '6px 18px', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
              {isFr ? 'Agent IA — Disponible dès maintenant' : 'AI Agent — Available now'}
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24 }}>
            {isFr ? <>Votre Assistant IA<br/><span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>disponible 24h/24</span></> : <>Your AI Assistant<br/><span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>available 24/7</span></>}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
            {isFr
              ? "Répond à vos clients sur WhatsApp, Messenger, téléphone et votre site web — automatiquement, sans interruption, pendant que vous vous concentrez sur votre business."
              : "Responds to your clients on WhatsApp, Messenger, phone and your website — automatically, without interruption, while you focus on your business."}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollToForm('business')} style={{ padding: '14px 32px', background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {isFr ? 'Démarrer maintenant →' : 'Get started →'}
            </button>
            <a href="#comment-ca-marche" style={{ padding: '14px 32px', background: 'var(--card-bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
              {isFr ? 'Voir comment ça marche' : 'See how it works'}
            </a>
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64, padding: '32px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {stats.map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CANAUX ────────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>
            {isFr ? 'Un agent, tous vos canaux' : 'One agent, all your channels'}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 16 }}>
            {isFr ? 'Vos clients vous contactent partout. Votre agent leur répond partout.' : 'Your clients reach you everywhere. Your agent responds everywhere.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {CHANNELS.map(ch => (
              <div key={ch.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>{ch.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{ch.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{ch.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
        <section id="comment-ca-marche" style={{ padding: '80px 24px', background: 'var(--dark-2)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>
              {isFr ? 'Opérationnel en 48h' : 'Live in 48h'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 56, fontSize: 16 }}>
              {isFr ? '3 étapes, zéro technique de votre côté.' : '3 steps, zero technical work on your end.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{ position: 'relative', padding: '36px 28px 28px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ position: 'absolute', top: -20, left: 28, width: 40, height: 40, background: 'var(--gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>{s.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, marginTop: 8 }}>{s.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARIFS ────────────────────────────────────────────────────────── */}
        <section id="tarifs" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>
            {isFr ? 'Tarifs simples, sans surprise' : 'Simple pricing, no surprises'}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 16 }}>
            {isFr ? 'Sans engagement. Abonnement mensuel. Résiliable à tout moment.' : 'No commitment. Monthly subscription. Cancel anytime.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{ position: 'relative', background: 'var(--card-bg)', border: `2px solid ${plan.badge ? plan.color : 'var(--card-border)'}`, borderRadius: 'var(--radius)', padding: '36px 28px', display: 'flex', flexDirection: 'column' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: plan.id === 'business' ? '#1a1a2e' : '#fff', padding: '4px 18px', borderRadius: 40, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: plan.color, marginBottom: 6 }}>{plan.name}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800 }}>${plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}> / {isFr ? 'mois' : 'month'}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, fontSize: 14, color: (f.startsWith('Tout') || f.startsWith('Everything')) ? 'var(--text-muted)' : 'var(--text)', fontStyle: (f.startsWith('Tout') || f.startsWith('Everything')) ? 'italic' : 'normal' }}>
                      <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToForm(plan.id)} style={{ padding: '13px 20px', background: plan.badge ? plan.color : 'transparent', color: plan.badge ? (plan.id === 'business' ? '#1a1a2e' : '#fff') : plan.color, border: `2px solid ${plan.color}`, borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity .2s' }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-muted)', fontSize: 13 }}>
            {isFr ? 'Paiement : Virement · Mobile Money · PayPal · Stripe (bientôt)' : 'Payment: Bank transfer · Mobile Money · PayPal · Stripe (soon)'}
          </p>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: 'var(--dark-2)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 48 }}>
              {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left', gap: 16 }}>
                  {faq.q}
                  <span style={{ color: 'var(--primary)', fontSize: 20, flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 0 18px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── FORMULAIRE COMMANDE ───────────────────────────────────────────── */}
        <section ref={formRef} id="commander" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 10 }}>
              {isFr ? "Démarrer avec l'Agent IA" : 'Get started with the AI Agent'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40, fontSize: 15 }}>
              {isFr ? "Remplissez ce formulaire. On vous contacte sous 24h pour tout configurer." : "Fill out this form. We'll contact you within 24h to set everything up."}
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ flex: 1, minWidth: 120, padding: '10px 8px', border: `2px solid ${selectedPlan === p.id ? p.color : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: selectedPlan === p.id ? `${p.color}18` : 'transparent', color: selectedPlan === p.id ? p.color : 'var(--text-muted)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>
                  {p.name} — ${p.price}/{isFr ? 'mois' : 'mo'}
                </button>
              ))}
            </div>

            {status === 'ok' ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(62,207,207,0.08)', border: '1px solid rgba(62,207,207,0.3)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3 style={{ color: '#3ECFCF', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{isFr ? 'Commande reçue !' : 'Order received!'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {isFr ? "Nous vous contacterons dans les 24h pour configurer votre agent " : "We'll contact you within 24h to configure your "}<strong style={{ color: 'var(--text)' }}>{planLabel}</strong>{isFr ? '.' : ' agent.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {formFields.map(f => (
                  <div key={f.id}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      required
                      placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.id]}
                      onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, outline: 'none' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{isFr ? 'Message (optionnel)' : 'Message (optional)'}</label>
                  <textarea
                    placeholder={isFr ? "Dites-nous ce que vous attendez de l'agent IA, vos canaux préférés, vos horaires..." : "Tell us what you expect from the AI agent, your preferred channels, your hours..."}
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
                {status === 'error' && (
                  <p style={{ color: '#FF6B6B', fontSize: 13, textAlign: 'center' }}>{isFr ? 'Une erreur est survenue. Contactez-nous directement sur WhatsApp.' : 'An error occurred. Contact us directly on WhatsApp.'}</p>
                )}
                <button type="submit" disabled={status === 'loading'} style={{ padding: '15px', background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: status === 'loading' ? .7 : 1 }}>
                  {status === 'loading' ? (isFr ? 'Envoi en cours...' : 'Sending...') : (isFr ? `Commander le plan ${planLabel} →` : `Order ${planLabel} plan →`)}
                </button>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  {isFr ? 'Sans engagement · Réponse sous 24h · Paiement après configuration' : 'No commitment · Response within 24h · Payment after setup'}
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ── FOOTER MINI ───────────────────────────────────────────────────── */}
        <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Image src="/assets/logo.png" alt="G+Digital Success" width={48} height={48} style={{ objectFit: 'contain', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © {new Date().getFullYear()} G+Digital Success · <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>digitalsucces.tech</Link> · <a href="mailto:contact@digitalsucces.tech" style={{ color: 'var(--primary)', textDecoration: 'none' }}>contact@digitalsucces.tech</a>
          </p>
        </footer>

      </main>
    </>
  );
}
