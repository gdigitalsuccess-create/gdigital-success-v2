'use client';
import { useEffect, useState } from 'react';
import styles from './profile.module.css';

type Translations = {
  btn:       (name: string) => string;
  loading:   string;
  success:   string;
  iosHint:   (name: string) => string;
  iosAction: string;
};

type Props = {
  profileId:    string;
  profileName:  string;
  translations: Translations;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  const output  = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return ('standalone' in window.navigator) && (window.navigator as { standalone?: boolean }).standalone === true;
}

export default function PushSubscribeButton({ profileId, profileName, translations: T }: Props) {
  const [status, setStatus]   = useState<'idle' | 'subscribed' | 'denied' | 'unsupported' | 'ios'>('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) { setStatus('ios'); return; }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setStatus('unsupported'); return; }
    if (Notification.permission === 'denied') setStatus('denied');
  }, []);

  async function handleSubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('denied'); setLoading(false); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await fetch('/api/carte/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, subscription: sub.toJSON(), type: 'visitor' }),
      });
      setStatus('subscribed');
    } catch (e) {
      console.error('[push subscribe]', e);
    }
    setLoading(false);
  }

  if (status === 'ios') {
    return (
      <div className={styles.pushIosHint}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span>
          {T.iosHint(profileName)}{' '}
          <span style={{ opacity: 0.6 }}>{T.iosAction}</span>
        </span>
      </div>
    );
  }

  if (status === 'unsupported' || status === 'denied') return null;

  if (status === 'subscribed') {
    return (
      <div className={styles.pushSuccess}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" width="16" height="16">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {T.success}
      </div>
    );
  }

  return (
    <button className={styles.pushBtn} onClick={handleSubscribe} disabled={loading}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {loading ? T.loading : T.btn(profileName)}
    </button>
  );
}
