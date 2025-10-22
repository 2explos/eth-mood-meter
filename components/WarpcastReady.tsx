'use client';

import { useEffect, useRef } from 'react';

/**
 * Force l’appel à sdk.actions.ready() dès que le SDK est disponible.
 * – réessaie pendant ~10s
 * – écoute load / visibilitychange / focus / message
 * – en dernier recours, tente quelques postMessage que Warpcast comprend parfois
 */
export default function WarpcastReady() {
  const called = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const start = Date.now();

    const tryReady = (source: string) => {
      if (called.current) return;

      const sdk: any = (window as any)?.sdk;
      if (sdk?.actions?.ready) {
        try {
          sdk.actions.ready();
          sdk.actions.setTitle?.('ETH Mood Meter');
          sdk.actions.updateStatusBar?.({ color: '#667eea' });
          // marquer comme fait
          called.current = true;
          console.log('✅ ready() via', source);
          return;
        } catch (e) {
          console.warn('ready() threw:', e);
        }
      }

      // petites “nudges” au parent (observées dans certains exemples)
      try {
        window.parent?.postMessage?.({ type: 'warpcast:ready' }, '*');
        window.parent?.postMessage?.({ type: 'frame_ready' }, '*');
      } catch {}
    };

    // boucle de retries (250ms) pendant 10s
    const tick = () => {
      if (called.current) return;
      tryReady('retry');
      if (!called.current && Date.now() - start < 10000) {
        setTimeout(tick, 250);
      } else if (!called.current) {
        console.warn('⚠️ SDK introuvable après 10s (ready non appelé).');
      }
    };

    // appels immédiat + rAF + load
    tryReady('immediate');
    requestAnimationFrame(() => tryReady('raf'));
    window.addEventListener('load', () => tryReady('load'), { once: true });

    // autres déclencheurs utiles
    const onVis = () => tryReady('visibilitychange');
    const onFocus = () => tryReady('focus');
    const onMsg = () => tryReady('message');

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('message', onMsg);

    // démarrer la boucle
    setTimeout(tick, 250);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('message', onMsg);
    };
  }, []);

  return null;
}
