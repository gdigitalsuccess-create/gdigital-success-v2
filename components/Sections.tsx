'use client';
import Image from 'next/image';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

export function TechnoStrip() {
  const { t } = useLang();
  const pills = [...config.technos, ...config.technos];
  return (
    <div className="techno-strip">
      <div className="container"><p className="techno-label">{t('techno_label')}</p></div>
      <div className="techno-track-wrap">
        <div className="techno-track">
          {pills.map((name, i) => <span key={i} className="tech-pill">{name}</span>)}
        </div>
      </div>
    </div>
  );
}

export function About() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <div className="about-visual reveal">
          <div className="ceo-photo-wrap">
            <div className="ceo-photo-glow" />
            <Image src={config.ceoPhoto} alt={config.ceoName} width={260} height={320} className="ceo-photo" />
            <div className="ceo-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>{c.ceoRole}</span>
            </div>
          </div>
          {c.aboutFloaters.map((label, i) => (
            <div key={i} className={`about-floater about-floater-${i + 1}`}><span>{label}</span></div>
          ))}
        </div>
        <div className="about-text reveal">
          <p className="section-label">{t('about_label')}</p>
          <h2 className="section-title" dangerouslySetInnerHTML={{ __html: c.aboutTitle.replace('\n', '<br/>') }} />
          <p className="about-desc">{c.aboutDesc1}</p>
          <p className="about-desc">{c.aboutDesc2}</p>
          <div className="about-tags">
            {c.aboutTags.map((tag, i) => <span key={i}>{tag}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marches() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  const main = config.marches.filter(m => !('world' in m && m.world));
  const world = config.marches.find(m => 'world' in m && m.world);
  return (
    <section className="marches" id="marches">
      <div className="container">
        <div className="marches-layout">
          <div className="marches-left reveal">
            <p className="section-label">{t('marches_label')}</p>
            <h2 className="section-title">{c.marchesTitle}</h2>
            <p className="section-subtitle" style={{ marginBottom: 40 }}>{c.marchesSubtitle}</p>
            <div className="marches-list">
              {main.map((m, i) => (
                <div key={i} className={`marche-row${'featured' in m && m.featured ? ' marche-row-featured' : ''}`}>
                  <span className="marche-row-flag">{m.flag}</span>
                  <div className="marche-row-body">
                    <div className="marche-row-top">
                      <strong>{lang === 'fr' ? m.nameFr : m.nameEn}</strong>
                      {'featured' in m && m.featured && (
                        <span className="marche-badge">{lang === 'fr' ? '⭐ Prioritaire' : '⭐ Priority'}</span>
                      )}
                    </div>
                    <p>{lang === 'fr' ? m.descFr : m.descEn}</p>
                  </div>
                </div>
              ))}
              {world && (
                <div className="marche-row marche-row-world">
                  <span className="marche-row-flag">{world.flag}</span>
                  <div className="marche-row-body">
                    <strong>{lang === 'fr' ? world.nameFr : world.nameEn}</strong>
                    <p><em>{lang === 'fr' ? world.descFr : world.descEn}</em></p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="marches-right reveal">
            <div className="globe-wrap">
              <div className="globe-glow" />
              <div className="globe">🌍</div>
              <div className="globe-orbit">
                {main.map((m, i) => (
                  <span key={i} className="orbit-flag" style={{ '--orbit-i': i } as React.CSSProperties}>{m.flag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('services_label')}</p>
          <h2 className="section-title">{c.servicesTitle}</h2>
          <p className="section-subtitle">{c.servicesSubtitle}</p>
        </div>
        <div className="services-grid">
          {c.services.map((s, i) => (
            <div key={i} className="service-card reveal">
              {s.badge && <span className="service-badge">{s.badge}</span>}
              <div className="service-icon">{i === 0 ? <WebIcon /> : i === 1 ? <RefreshIcon /> : <BotIcon />}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <ul className="service-list">{s.items.map((li, j) => <li key={j}>{li}</li>)}</ul>
              <a href="#contact" className="service-link">{s.link}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionsIA() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="solutions-ia" id="solutions-ia">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('ia_label')}</p>
          <h2 className="section-title">{c.agentsTitle}</h2>
          <p className="section-subtitle">{c.agentsSubtitle}</p>
        </div>
        <div className="ia-grid">
          {c.agents.map((a, i) => (
            <div key={i} className="ia-card reveal">
              {a.badge && <span className="ia-badge">{a.badge}</span>}
              <div className="ia-icon"><BotIcon /></div>
              <h3 className="ia-title">{a.title}</h3>
              <p className="ia-desc">{a.desc}</p>
              <ul className="ia-list">{a.items.map((li, j) => <li key={j}>{li}</li>)}</ul>
              <a href="#contact" className="ia-link">{a.link}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pourquoi() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="pourquoi" id="pourquoi">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('pourquoi_label')}</p>
          <h2 className="section-title">{c.pourquoiTitle}</h2>
          <p className="section-subtitle">{c.pourquoiSubtitle}</p>
        </div>
        <div className="pourquoi-grid">
          {c.pourquoiCards.map((card, i) => (
            <div key={i} className="pourquoi-card reveal">
              <div className="pourquoi-icon" style={{ fontSize: '1.8rem' }}>{card.icon}</div>
              <h3 className="pourquoi-title">{card.title}</h3>
              <p className="pourquoi-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Packs() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="packs" id="packs">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('packs_label')}</p>
          <h2 className="section-title">{c.packsTitle}</h2>
          <p className="section-subtitle">{c.packsSubtitle}</p>
        </div>
        <div className="packs-grid">
          {config.packs.map((p, i) => {
            const badge = (p as { badge?: { fr: string; en: string } }).badge;
            return (
              <div key={i} className={`pack-card reveal${p.highlighted ? ' highlighted' : ''}`}>
                {badge && <span className="pack-badge">{lang === 'fr' ? badge.fr : badge.en}</span>}
                <div>
                  <div className="pack-name">{lang === 'fr' ? p.name.fr : p.name.en}</div>
                  <div className="pack-tagline">{lang === 'fr' ? p.tagline.fr : p.tagline.en}</div>
                </div>
                <div className="pack-price">{p.price}</div>
                <ul className="pack-list">
                  {(lang === 'fr' ? p.features.fr : p.features.en).map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <a href="#contact" className="btn btn-primary btn-full">{t('pack_cta')}</a>
              </div>
            );
          })}
        </div>
        <p className="packs-note">{t('packs_note')}</p>
      </div>
    </section>
  );
}

export function Portfolio() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('portfolio_label')}</p>
          <h2 className="section-title">{c.portfolioTitle}</h2>
          <p className="section-subtitle">{c.portfolioSubtitle}</p>
        </div>
        <div className="bento-grid">
          {config.portfolio.map((p, i) => {
            const url = (p as { url?: string }).url;
            return (
              <div key={i} className={`bento-card bento-${p.slug} reveal`}>
                <div className="bv-screenshot" style={{ backgroundImage: `url(${p.image})` }} />
                <div className="bento-overlay">
                  <span className="bento-type">{p.type}</span>
                  <h3 className="bento-title">{p.title}</h3>
                  <p className="bento-desc">{lang === 'fr' ? p.descFr : p.descEn}</p>
                  {url && <a href={url} target="_blank" rel="noopener" className="bento-link">{t('p_visit_link')}</a>}
                </div>
                <span className={`bento-badge badge-${p.status}`}>
                  {p.status === 'live' ? t('status_live') : t('status_soon')}
                </span>
              </div>
            );
          })}
          <div className="bento-cta-card reveal">
            <div className="portfolio-cta-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            </div>
            <h3>{c.portfolioCta.title}</h3>
            <p>{c.portfolioCta.desc}</p>
            <a href="#contact" className="btn btn-primary">{c.portfolioCta.btn}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CaseStudies() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="case-studies">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('cs_label')}</p>
          <h2 className="section-title">{c.caseStudiesTitle}</h2>
          <p className="section-subtitle">{c.caseStudiesSubtitle}</p>
        </div>
        <div className="cs-grid">
          {c.caseStudies.map((cs, i) => (
            <div key={i} className="cs-card reveal">
              <div
                className="cs-orb"
                style={{
                  background: `radial-gradient(circle at 38% 38%, ${cs.color}35, ${cs.color}10)`,
                  boxShadow: `0 0 0 1px ${cs.color}25, 0 28px 56px ${cs.color}35`,
                  animationDelay: cs.delay,
                }}
              >
                {cs.flag}
              </div>
              <h3 className="cs-name">{cs.name}</h3>
              <span className="cs-type" style={{ color: cs.color }}>{cs.domain}</span>
              <div className="cs-details">
                <div className="cs-detail">
                  <span className="cs-col-label" style={{ color: cs.color }}>{t('cs_defi')}</span>
                  <p>{cs.defi}</p>
                </div>
                <div className="cs-detail">
                  <span className="cs-col-label" style={{ color: cs.color }}>{t('cs_solution')}</span>
                  <p>{cs.solution}</p>
                </div>
                <div className="cs-detail cs-detail-result">
                  <span className="cs-col-label" style={{ color: cs.color }}>{t('cs_resultat')}</span>
                  <p>{cs.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Temoignages() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="temoignages" id="temoignages">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('temo_label')}</p>
          <h2 className="section-title">{c.temoTitle}</h2>
          <p className="section-subtitle">{c.temoSubtitle}</p>
        </div>
        <div className="temo-grid">
          {c.temoClients.map((item, i) => (
            <div key={i} className={`temo-card reveal${item.quote ? ' temo-card-real' : ''}`}>
              <div className={item.quote ? 'temo-stars temo-stars-active' : 'temo-stars'}>★★★★★</div>
              {item.quote ? (
                <p className="temo-quote">&ldquo;{item.quote}&rdquo;</p>
              ) : (
                <div className="temo-pending-wrap"><p className="temo-pending">{t('temo_pending')}</p></div>
              )}
              <div className="temo-footer">
                <div className="temo-client">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="temo-avatar-photo" />
                  ) : (
                    <div className="temo-avatar">{item.initial}</div>
                  )}
                  <div>
                    <strong>{item.personName ?? item.name}</strong>
                    <span>{item.role ?? item.country}</span>
                  </div>
                </div>
                {!item.quote && (
                  <a href={`${config.whatsapp}?text=Bonjour%2C%20je%20souhaite%20laisser%20un%20avis%20sur%20${item.waName}`} target="_blank" rel="noopener" className="temo-req">{t('temo_req')}</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Offre() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="offre" id="offre">
      <div className="container">
        <div className="offre-grid">
          <div className="offre-text reveal">
            <p className="section-label section-label-light">{t('offre_label')}</p>
            <h2 className="section-title section-title-light">{c.offreTitle}</h2>
            <p className="offre-desc">{c.offreDesc}</p>
            <div className="offre-features">
              {c.offreFeatures.map((f, i) => (
                <div key={i} className="offre-feature">
                  <div className="feature-icon" style={{ fontSize: '1.2rem' }}>{f.icon}</div>
                  <div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="pricing-card reveal">
            <div className="pricing-label">{t('pricing_label')}</div>
            <div className="pricing-price">
              <strong>{config.subscription.price}</strong>
              <span>{t('pricing_period')}</span>
            </div>
            <div className="pricing-tagline">{c.pricingTagline}</div>
            <ul className="pricing-list">
              {c.pricingItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <a href="#contact" className="btn btn-primary btn-full">{t('pricing_cta')}</a>
            <p className="pricing-note">{t('pricing_note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="process" id="process">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('process_label')}</p>
          <h2 className="section-title">{c.processTitle}</h2>
        </div>
        <div className="process-steps">
          {c.steps.map((s, i) => (
            <div key={i} className="process-step reveal">
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Engagements() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="engagements" id="engagements">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('eng_label')}</p>
          <h2 className="section-title">{c.engTitle}</h2>
          <p className="section-subtitle">{c.engSubtitle}</p>
        </div>
        <div className="engagements-grid">
          {c.engagements.map((e, i) => (
            <div key={i} className="engagement-item reveal">
              <div className="engagement-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="engagement-body">
                <h3 className="engagement-title">{e.title}</h3>
                <p className="engagement-desc">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">{t('faq_label')}</p>
          <h2 className="section-title">{c.faqTitle}</h2>
          <p className="section-subtitle">{c.faqSubtitle}</p>
        </div>
        <div className="faq-list">
          {c.faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-question">{f.q}</summary>
              <div className="faq-answer"><p>{f.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhatsAppFloat() {
  const { t } = useLang();
  return (
    <a href={config.whatsapp} target="_blank" rel="noopener" className="wa-float" aria-label="WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="wa-tooltip">{t('wa_tooltip')}</span>
    </a>
  );
}

export function Footer() {
  const { lang, t } = useLang();
  const c = config.content[lang];
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#home" className="logo">
          <Image src={config.logo} alt={config.name} width={120} height={40} className="logo-img" />
        </a>
        <p className="footer-tagline">{c.footerTagline}</p>
        <div className="footer-links">
          <a href="#about">{t('nav_about')}</a>
          <a href="#services">{t('nav_services')}</a>
          <a href="#solutions-ia">{t('nav_ia')}</a>
          <a href="#packs">{t('nav_packs')}</a>
          <a href="#portfolio">{t('nav_portfolio')}</a>
          <a href="#contact">{t('nav_contact')}</a>
          <a href="/mentions-legales">{t('footer_legal')}</a>
        </div>
        <div className="footer-socials">
          <a href={config.whatsapp} className="social-link" aria-label="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <a href={`mailto:${config.email}`} className="social-link" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
        <p className="footer-copy">{c.footerCopy}</p>
      </div>
    </footer>
  );
}

const SpIcoChatWeb = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SpIcoWhatsApp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const SpIcoPhone = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const SpIcoMessenger = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="sp-msg-g" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0099FF"/>
        <stop offset="100%" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <path fill="url(#sp-msg-g)" d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.628 0 12-4.974 12-11.111S18.628 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
  </svg>
);
const SpIcoEmail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export function AgentIASpotlight() {
  const { lang } = useLang();
  const isFr = lang === 'fr';
  const channels = [
    { icon: <SpIcoChatWeb />,   label: 'Chat Web' },
    { icon: <SpIcoWhatsApp />,  label: 'WhatsApp' },
    { icon: <SpIcoPhone />,     label: isFr ? 'Téléphone' : 'Phone' },
    { icon: <SpIcoMessenger />, label: 'Messenger' },
    { icon: <SpIcoEmail />,     label: 'Email' },
  ];
  return (
    <section className="agent-ia-spotlight" id="agent-ia-section">
      <div className="container">
        <div className="spotlight-inner reveal">
          <span className="spotlight-badge">{isFr ? 'NOUVEAU SERVICE' : 'NEW SERVICE'}</span>
          <h2 className="spotlight-title">
            {isFr
              ? <>Automatisez votre relation client avec un <span className="gradient-text">Agent IA</span></>
              : <>Automate your customer relationships with an <span className="gradient-text">AI Agent</span></>
            }
          </h2>
          <p className="spotlight-desc">
            {isFr
              ? 'Un assistant intelligent disponible 24h/24, 7j/7 sur tous vos canaux de communication — sans jamais manquer une opportunité.'
              : 'An intelligent assistant available 24/7 on all your communication channels — never miss an opportunity again.'}
          </p>
          <div className="spotlight-channels">
            {channels.map((ch, i) => (
              <span key={i} className="spotlight-channel">
                {ch.icon} {ch.label}
              </span>
            ))}
          </div>
          <a href="/agent-ia" className="btn btn-gold spotlight-cta">
            {isFr ? 'Découvrir nos offres →' : 'See our plans →'}
          </a>
        </div>
      </div>
    </section>
  );
}

export function CarteNFCSpotlight() {
  const { lang } = useLang();
  const isFr = lang === 'fr';
  const features = [
    { icon: '📲', label: isFr ? 'Partage en 1 tap' : '1-tap sharing' },
    { icon: '⚡', label: isFr ? 'Mise à jour en temps réel' : 'Real-time updates' },
    { icon: '📵', label: isFr ? 'Sans application' : 'No app needed' },
    { icon: '◼', label: isFr ? 'QR Code intégré' : 'Built-in QR Code' },
  ];
  return (
    <section className="carte-nfc-spotlight">
      <div className="container">
        <div className="carte-nfc-inner reveal" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center', textAlign: 'left' }}>
          {/* Texte */}
          <div>
            <span className="carte-nfc-badge">{isFr ? 'CARTE DE VISITE INTELLIGENTE' : 'SMART BUSINESS CARD'}</span>
            <h2 className="spotlight-title" style={{ textAlign: 'left' }}>
              {isFr
                ? <>Remplacez votre carte de visite par une <span className="gradient-text">Carte NFC</span></>
                : <>Replace your business card with a <span className="gradient-text">NFC Card</span></>
              }
            </h2>
            <p className="spotlight-desc" style={{ margin: '0 0 28px', textAlign: 'left' }}>
              {isFr
                ? 'Un tap suffit pour partager votre profil complet — contacts, réseaux, portfolio — sans jamais imprimer une carte à nouveau.'
                : 'One tap shares your full profile — contacts, socials, portfolio — no more printing cards ever again.'}
            </p>
            <div className="spotlight-channels" style={{ justifyContent: 'flex-start' }}>
              {features.map((f, i) => (
                <span key={i} className="carte-nfc-feature">{f.icon} {f.label}</span>
              ))}
            </div>
            <a href="/carte-nfc" className="btn btn-primary spotlight-cta" style={{ marginTop: 8, display: 'inline-block' }}>
              {isFr ? 'Découvrir la Carte NFC →' : 'Discover the NFC Card →'}
            </a>
          </div>

          {/* Mini card CSS */}
          <div style={{ position: 'relative', width: 280, height: 176, flexShrink: 0 }}>
            {/* Lueur */}
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            {/* Carte */}
            <div style={{ width: 280, height: 176, borderRadius: 16, background: 'linear-gradient(135deg,#1A1A2E 0%,#0f0f1a 100%)', border: '1px solid rgba(108,99,255,0.4)', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(108,99,255,0.12)', position: 'relative', overflow: 'hidden', transform: 'rotate(-3deg)' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,rgba(108,99,255,1) 0px,rgba(108,99,255,1) 1px,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,rgba(108,99,255,1) 0px,rgba(108,99,255,1) 1px,transparent 1px,transparent 36px)' }} />
              <div style={{ position: 'absolute', top: 16, left: 18, fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G+Digital Success</div>
              <div style={{ position: 'absolute', top: 13, right: 16, width: 30, height: 22, borderRadius: 3, background: 'linear-gradient(135deg,rgba(212,168,67,0.85),rgba(212,168,67,0.45))', border: '1px solid rgba(212,168,67,0.5)' }} />
              <div style={{ position: 'absolute', bottom: 38, left: 18 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#E8E8F0', fontFamily: 'var(--font-display)' }}>Jean Dupont</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(62,207,207,0.8)', marginTop: 2 }}>Directeur Commercial</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#6C63FF,#3ECFCF)' }} />
            </div>
            {/* Ombre portée */}
            <div style={{ position: 'absolute', bottom: -12, left: '10%', right: '10%', height: 20, borderRadius: '50%', background: 'rgba(108,99,255,0.18)', filter: 'blur(12px)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Icons
const WebIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const RefreshIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const BotIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M16 15h.01"/></svg>;
