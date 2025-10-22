'use client';

import { useEffect, useRef } from 'react';

/**
 * WarpcastReady
 * - Tente d'appeler sdk.actions.ready() dès que dispo (pendant ~10s).
 * - Si le SDK n’est pas injecté (cas fréquent dans le Preview Tool),
 *   clique automatiquement sur “Hide splash screen for now”.
 */
export default function WarpcastReady() {
  const readyCalled = useRef(false);
  const hideClicked = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const start = Date.now();
    const MAX_MS = 10_000;     // on essaie ~10s
    const STEP_MS = 300;       // intervalle de retry

    const tryReady = (from: string) => {
      if (readyCalled.current) return;

      const sdk: any = (window as any)?.sdk;
      if (sdk?.actions?.ready) {
        try {
          sdk.actions.ready();
          sdk.actions.setTitle?.('ETH Mood Meter');
          sdk.actions.updateStatusBar?.({ color: '#667eea' });
          readyCalled.current = true;
          // eslint-disable-next-line no-console
          console.log('✅ sdk.actions.ready() via', from);
          return true;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('ready() threw:', e);
        }
      }
      return false;
    };

    /** Cache la splash du Preview Tool si le SDK n’est pas dispo */
    const autoHideSplash = () => {
      if (hideClicked.current) return;
      const btns = Array.from(document.querySelectorAll('button,a'));
      const hide = btns.find(b =>
        b.textContent?.toLowerCase().includes('hide splash')
      ) as HTMLButtonElement | HTMLAnchorElement | undefined;

      if (hide) {
        hideClicked.current = true;
        // eslint-disable-next-line no-console
        console.log('🔕 Auto-click “Hide splash screen for now”');
        hide.click();
      }
    };

    const tick = () => {
      if (!readyCalled.current) {
        const ok = tryReady('tick');
        if (!ok) autoHideSplash();
      }
      if (!readyCalled.current && Date.now() - start < MAX_MS) {
        setTimeout(tick, STEP_MS);
      } else if (!readyCalled.current) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ SDK non détecté après 10s (mode preview probable).');
      }
    };

    // premiers essais
    tryReady('immediate') || autoHideSplash();

    // écouteurs utiles
    const onLoad = () => tryReady('load') || autoHideSplash();
    const onVis = () => tryReady('visibilitychange') || autoHideSplash();
    const onFocus = () => tryReady('focus') || autoHideSplash();
    const onMsg = () => tryReady('message') || autoHideSplash();

    window.addEventListener('load', onLoad);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('message', onMsg);

    // boucle de retry
    const t0 = setTimeout(tick, STEP_MS);

    return () => {
      clearTimeout(t0);
      window.removeEventListener('load', onLoad);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('message', onMsg);
    };
  }, []);

  return null;
}
