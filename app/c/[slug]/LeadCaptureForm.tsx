'use client';
import { useState } from 'react';
import styles from './profile.module.css';

type Props = {
  profileId: string;
  ownerName: string;
};

export default function LeadCaptureForm({ profileId, ownerName }: Props) {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Veuillez indiquer votre nom.'); return; }
    if (!phone.trim() && !email.trim()) { setError('Indiquez au moins un téléphone ou un email.'); return; }

    setSending(true);
    setError('');

    const res = await fetch('/api/carte/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id:    profileId,
        visitor_name:  name,
        visitor_phone: phone,
        visitor_email: email,
        message,
      }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      setError('Une erreur est survenue. Réessayez.');
    }
    setSending(false);
  }

  const firstName = ownerName.split(' ')[0];

  if (done) {
    return (
      <div className={styles.leadSuccess}>
        <div className={styles.leadSuccessIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" width="28" height="28">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className={styles.leadSuccessTitle}>Message envoyé !</p>
        <p className={styles.leadSuccessText}>
          {firstName} a été notifié et vous recontactera prochainement.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.leadSection}>
      <div className={styles.leadHeader}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" width="18" height="18">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Laisser vos coordonnées à {firstName}</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.leadForm}>
        <input
          className={styles.leadInput}
          placeholder="Votre nom *"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
        />
        <input
          className={styles.leadInput}
          placeholder="Téléphone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={20}
        />
        <input
          className={styles.leadInput}
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={120}
        />
        <textarea
          className={styles.leadInput}
          placeholder="Message (optionnel)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          maxLength={400}
          style={{ resize: 'none' }}
        />
        {error && <p className={styles.leadError}>{error}</p>}
        <button type="submit" className={styles.leadBtn} disabled={sending}>
          {sending ? 'Envoi...' : `Envoyer mes coordonnées`}
        </button>
      </form>
    </div>
  );
}
