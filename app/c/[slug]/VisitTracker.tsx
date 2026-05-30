'use client';
import { useEffect } from 'react';

export default function VisitTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    const isMobile = /iphone|ipad|ipod|android|mobile/i.test(navigator.userAgent);
    fetch('/api/carte/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, is_mobile: isMobile }),
    }).catch(() => {});

    // Enregistre le Service Worker pour activer le cache hors-ligne
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [profileId]);

  return null;
}
