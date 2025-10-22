'use client';

import { useEffect, useRef } from 'react';

/**
 * WarpcastReady
 * - tente sdk.actions.ready() en boucle (~12s)
 * - envoie des postMessage de compatibilité
 * - auto-clique "Hide splash screen for now" si présent
 * - logge en console pour debug
 */
export default function WarpcastReady() {
  const done = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const start = Date.now();

    const log = (...args: any[]) => {
      // aide au debug dans la console du Preview Tool
      try { console.log('[WarpcastReady]', ...args); } catch {}
    };

    const callReadyIfPossible = (source: string) => {
      if (done.current) return;
      const sdk: any = (window as any)?.sdk;
      if (sdk?.actions?.ready) {
        try {
          sdk.actions.ready();
          sdk.actions.setTitle?.('ETH Mood Meter');
          sdk.actions.updateStatusBar?.({ color: '#667eea' });
          done.current = true;
          log(`✅ ready() OK via ${source}`);
          return true;
        } catch (e) {
          log(`ready() threw via ${source}`, e);
        }
      }
      return false;
    };

    const nudgeParent = () => {
      try {
        window.parent?.postMessage?.({ type: 'warpcast:ready' }, '*');
        window.parent?.postMessage?.({ type: 'frame_ready' }, '*');
        window.parent?.postMessage?.({ target: 'warpcast', action: 'ready' }, '*');
      } catch {}
    };

    // 🔨 auto-clique "Hide splash screen for now"
    const autoHideSplash = () => {
      if (done.current) return;
      try {
        const all = Array.from(document.querySelectorAll<HTMLElement>('*'));
        const btn = all.find((el) => {
          const t = el.innerText?.trim()?.toLowerCase?.() || '';
          return t.includes('hide splash') || t.includes('masquer l’écran de démarrage');
        }) as HTMLButtonElement | undefined;

        if (btn) {
          btn.click();
          log('🔕 Auto-click sur "Hide splash…"');
        }
      } catch {}
    };

    // 1) Appels immédiats + rAF + load
    callReadyIfPossible('immediate');
    requestAnimationFrame(() => callReadyIfPossible('raf'));
    window.addEventListener('load', () => callReadyIfPossible('load'), { once: true });

    // 2) boucle de retries (toutes les 300ms) pendant 12s
    const tick = () => {
      if (done.current) return;
      const ok = callReadyIfPossible('retry');
      autoHideSplash();
      nudgeParent();

      if (!ok && Date.now() - start < 12000) {
        setTimeout(tick, 300);
      } else if (!done.current) {
        log('⚠️ SDK non détecté après ~12s. La splash peut rester en Preview Tool, mais en Warpcast réel ça passe souvent.');
      }
    };
    const timer = setTimeout(tick, 300);

    // 3) petits triggers utiles
    const onVis = () => callReadyIfPossible('visibilitychange');
    const onFocus = () => callReadyIfPossible('focus');
    const onMsg = () => callReadyIfPossible('message');

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('message', onMsg);

    // 4) re-scan de la splash régulièrement (si elle revient)
    const splashInterval = setInterval(autoHideSplash, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(splashInterval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('message', onMsg);
    };
  }, []);

  return null;
}
