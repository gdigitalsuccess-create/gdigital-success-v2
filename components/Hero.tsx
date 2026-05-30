'use client';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export default function Hero() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="container hero-content">
        <div className="hero-badge reveal">
          <span className="dot" />
          <span>{c.heroBadge}</span>
        </div>
        <h1 className="hero-title reveal">
          {c.heroTitle.split(c.heroTitleGradient)[0]}
          <span className="gradient-text">{c.heroTitleGradient}</span>
        </h1>
        <p className="hero-slogan reveal">{c.heroSlogan}</p>
        <p className="hero-subtitle reveal">{c.heroSubtitle}</p>
        <div className="hero-actions reveal">
          <a href="#contact" className="btn btn-primary">{t('hero_cta1')}</a>
          <a href="#solutions-ia" className="btn btn-outline">{t('hero_cta2')}</a>
          <a href="/agent-ia" className="btn btn-gold">{lang === 'fr' ? 'Nos Agents IA' : 'Our AI Agents'}</a>
          <a href="/carte-nfc" className="btn btn-nfc">{lang === 'fr' ? 'Carte NFC' : 'NFC Card'}</a>
        </div>
        <div className="hero-stats reveal">
          {c.heroStats.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="stat-divider" />}
              <div className="stat">
                <span className="stat-number">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-scroll"><span /></div>
    </section>
  );
}
