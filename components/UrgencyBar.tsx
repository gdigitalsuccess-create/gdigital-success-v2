'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export default function UrgencyBar() {
  const { lang, t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('urgency_dismissed') !== '1') {
      setVisible(true);
      document.body.classList.add('bar-visible');
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    document.body.classList.remove('bar-visible');
    localStorage.setItem('urgency_dismissed', '1');
  };

  return (
    <div className={`urgency-bar${visible ? '' : ' hidden'}`} id="urgency-bar">
      <div className="urgency-inner">
        <span className="urgency-dot" />
        <p className="urgency-text">
          <span>{config.content[lang].urgencyMsg}</span>
          <a href="#contact" className="urgency-cta" onClick={dismiss}>{t('urgency_cta')}</a>
        </p>
        <button className="urgency-close" onClick={dismiss} aria-label="Fermer">×</button>
      </div>
    </div>
  );
}
