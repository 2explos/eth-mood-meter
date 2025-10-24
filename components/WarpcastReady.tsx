'use client';

import { useEffect, useRef } from 'react';

/**
 * Appelle sdk.actions.ready() dès que disponible.
 * Réessaie quelques secondes et envoie des postMessage de secours.
 */
export default function WarpcastReady() {
  const called = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const start = Date.now();

    const tryReady = (tag: string) => {
      if (called.current) return;

      const sdk: any = (window as any)?.sdk;
      if (sdk?.actions?.ready) {
        try {
          sdk.actions.ready();
          sdk.actions.setTitle?.('ETH Mood Meter');
          sdk.actions.updateStatusBar?.({ color: '#667eea' });
          called.current = true;
          console.log('✅ sdk.actions.ready() via', tag);
          return;
        } catch (e) {
          console.warn('ready() threw:', e);
        }
      }

      // “nudges” courants reconnus par Warpcast
      try {
        window.parent?.postMessage?.({ type: 'warpcast:ready' }, '*');
        window.parent?.postMessage?.({ type: 'frame_ready' }, '*');
      } catch {}
    };

    const tick = () => {
      if (called.current) return;
      tryReady('retry');
      if (!called.current && Date.now() - start < 10000) {
        setTimeout(tick, 250);
      } else if (!called.current) {
        console.warn('⚠️ SDK introuvable après 10s (overlay preview peut rester).');
      }
    };

    tryReady('immediate');
    requestAnimationFrame(() => tryReady('raf'));
    window.addEventListener('load', () => tryReady('load'), { once: true });

    const onVis = () => tryReady('visibilitychange');
    const onFocus = () => tryReady('focus');
    const onMsg = () => tryReady('message');

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('message', onMsg);

    setTimeout(tick, 250);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('message', onMsg);
    };
  }, []);

  return null;
}
