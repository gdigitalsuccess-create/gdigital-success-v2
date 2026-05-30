'use client';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export default function MentionsLegales() {
  const { lang } = useLang();
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: 32 }}>
        {lang === 'fr' ? 'Mentions Légales' : 'Legal Notice'}
      </h1>
      <section style={{ marginBottom: 32 }}>
        <h2>{lang === 'fr' ? 'Éditeur du site' : 'Website Publisher'}</h2>
        <p>{config.name}</p>
        <p>Email : <a href={`mailto:${config.email}`}>{config.email}</a></p>
        <p>Tel : {config.phone}</p>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h2>{lang === 'fr' ? 'Hébergement' : 'Hosting'}</h2>
        <p>Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104</p>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h2>{lang === 'fr' ? 'Propriété intellectuelle' : 'Intellectual Property'}</h2>
        <p>
          {lang === 'fr'
            ? `L'ensemble du contenu de ce site est la propriété exclusive de ${config.name}. Toute reproduction est interdite sans autorisation préalable.`
            : `All content on this site is the exclusive property of ${config.name}. Any reproduction is prohibited without prior authorization.`}
        </p>
      </section>
      <section>
        <h2>{lang === 'fr' ? 'Données personnelles' : 'Personal Data'}</h2>
        <p>
          {lang === 'fr'
            ? 'Les informations collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes. Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données.'
            : 'Information collected via the contact form is used solely to respond to your requests. In accordance with GDPR, you have the right to access, correct, and delete your data.'}
        </p>
      </section>
    </main>
  );
}
