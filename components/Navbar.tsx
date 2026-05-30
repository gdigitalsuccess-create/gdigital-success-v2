'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="container nav-inner">
        <a href={isHome ? '#home' : '/'} className="logo">
          <Image src={config.logo} alt={config.name} width={120} height={40} className="logo-img" />
        </a>
        <nav className={`nav-links${open ? ' open' : ''}`} id="nav-links">
          <a href="#about" onClick={close}>{t('nav_about')}</a>
          <a href="#services" onClick={close}>{t('nav_services')}</a>
          <a href="#solutions-ia" onClick={close}>{t('nav_ia')}</a>
          <a href="#packs" onClick={close}>{t('nav_packs')}</a>
          <a href="#portfolio" onClick={close}>{t('nav_portfolio')}</a>
          <a href="/agent-ia" onClick={close} className="nav-agent-ia">Agent IA</a>
          <a href="/carte-nfc" onClick={close} className="nav-carte-nfc">Carte NFC</a>
          <a href="#contact" className="btn-nav" onClick={close}>{t('nav_contact')}</a>
        </nav>
        <button
          className="lang-toggle"
          aria-label="Switch language"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
        <button
          className="burger"
          id="burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span style={open ? { transform: 'rotate(45deg) translate(5px,5px)' } : {}} />
          <span style={open ? { opacity: 0 } : {}} />
          <span style={open ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}} />
        </button>
      </div>
    </header>
  );
}
