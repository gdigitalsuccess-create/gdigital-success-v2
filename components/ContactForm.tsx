'use client';
import { useState, FormEvent } from 'react';
import { useLang } from '@/lib/LangContext';
import config from '@/client.config';

declare global {
  interface Window { Calendly?: { initPopupWidget: (opts: { url: string }) => void }; }
}

export default function ContactForm() {
  const { t, lang } = useLang();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(false);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      budget: (form.elements.namedItem('budget') as HTMLSelectElement).value,
      delai: (form.elements.namedItem('delai') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      lang,
    };
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  const openCalendly = () => {
    if (window.Calendly) window.Calendly.initPopupWidget({ url: config.calendly });
  };

  return (
    <section className="contact" id="contact">
      <div className="container contact-grid">
        <div className="contact-info reveal">
          <p className="section-label">{t('contact_label')}</p>
          <h2 className="section-title">{config.content[lang].contactTitle}</h2>
          <p className="contact-desc">{config.content[lang].contactDesc}</p>
          <div className="contact-channels">
            <a href={`mailto:${config.email}`} className="contact-channel">
              <div className="channel-icon"><MailIcon /></div>
              <div><strong>{t('ch1_title')}</strong><span>{config.email}</span></div>
            </a>
            <a href={`mailto:${config.emailPerso}`} className="contact-channel">
              <div className="channel-icon"><MailIcon /></div>
              <div><strong>{t('ch2_title')}</strong><span>{config.emailPerso}</span></div>
            </a>
            <a href={`tel:${config.phone}`} className="contact-channel">
              <div className="channel-icon channel-icon-blue"><PhoneIcon /></div>
              <div><strong>{t('ch3_title')}</strong><span>+971 58 268 0034</span></div>
            </a>
            <a href={config.whatsapp} className="contact-channel" target="_blank" rel="noopener">
              <div className="channel-icon channel-icon-green"><WaIcon /></div>
              <div><strong>{t('ch4_title')}</strong><span>+971 58 268 0034</span></div>
            </a>
          </div>
          <div className="calendly-cta">
            <div className="calendly-divider"><span>{t('calendly_or')}</span></div>
            <button className="btn btn-primary calendly-btn" onClick={openCalendly} type="button">
              <CalIcon /><span>{t('calendly_btn')}</span>
            </button>
            <p className="calendly-note">{t('calendly_note')}</p>
          </div>
        </div>

        <div className="contact-form-wrap reveal">
          {success ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
              <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>{t('form_success')}</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('form_name_label')}</label>
                  <input type="text" id="name" name="name" placeholder={t('form_name_ph')} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('form_email_label')}</label>
                  <input type="email" id="email" name="email" placeholder={t('form_email_ph')} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">{t('form_subject_label')}</label>
                <select id="subject" name="subject">
                  <option value="">{t('form_subject_ph')}</option>
                  {(['form_o1','form_o2','form_o3','form_o4','form_o5','form_o6','form_o7','form_o8','form_o9','form_o10','form_o11'] as const).map(k => (
                    <option key={k} value={t(k)}>{t(k)}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">{t('form_budget_label')}</label>
                  <select id="budget" name="budget">
                    <option value="">{t('form_budget_ph')}</option>
                    {(['form_b1','form_b2','form_b3','form_b4','form_b5'] as const).map(k => (
                      <option key={k} value={t(k)}>{t(k)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="delai">{t('form_delai_label')}</label>
                  <select id="delai" name="delai">
                    <option value="">{t('form_delai_ph')}</option>
                    {(['form_d1','form_d2','form_d3','form_d4'] as const).map(k => (
                      <option key={k} value={t(k)}>{t(k)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">{t('form_msg_label')}</label>
                <textarea id="message" name="message" placeholder={t('form_msg_ph')} rows={4} />
              </div>
              {error && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', textAlign: 'center' }}>{t('form_error')}</p>}
              <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
                <span>{sending ? t('sending') : t('form_submit')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
