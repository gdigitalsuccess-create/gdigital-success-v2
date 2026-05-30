'use client';
import { useLang } from '@/lib/LangContext';
import Link from 'next/link';

export default function Merci() {
  const { lang } = useLang();
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 24 }}>
      <div style={{ fontSize: '4rem' }}>✅</div>
      <h1 style={{ color: 'var(--primary)', textAlign: 'center' }}>
        {lang === 'fr' ? 'Message envoyé !' : 'Message sent!'}
      </h1>
      <p style={{ color: 'var(--text-light)', textAlign: 'center', maxWidth: 480 }}>
        {lang === 'fr'
          ? 'Merci pour votre message. Nous vous répondrons dans les 24 heures.'
          : 'Thank you for your message. We will get back to you within 24 hours.'}
      </p>
      <Link href="/" className="btn btn-primary">
        {lang === 'fr' ? '← Retour à l\'accueil' : '← Back to home'}
      </Link>
    </main>
  );
}
