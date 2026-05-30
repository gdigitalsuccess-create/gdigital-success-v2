'use client';
import { useEffect, useRef } from 'react';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export default function StatsBar() {
  const { lang } = useLang();
  const observed = useRef(false);

  useEffect(() => {
    if (observed.current) return;
    observed.current = true;
    const els = document.querySelectorAll<HTMLElement>('.stat-number[data-target]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = +(el.dataset.target || 0);
        const duration = 1500;
        const step = Math.ceil(duration / target);
        let current = 0;
        const timer = setInterval(() => {
          current++;
          el.textContent = String(current);
          if (current >= target) { el.textContent = String(target); clearInterval(timer); }
        }, step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => observer.observe(el));
  }, []);

  return (
    <section className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          {config.stats.map((s, i) => (
            <div className="stat-item reveal" key={i}>
              <div className="stat-value">
                <span className="stat-number" data-target={s.target}>0</span>
                {s.suffix && <span className="stat-suffix">{s.suffix}</span>}
              </div>
              <p className="stat-label">{lang === 'fr' ? s.labelFr : s.labelEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
