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
  }, [profileId]);

  return null;
}
