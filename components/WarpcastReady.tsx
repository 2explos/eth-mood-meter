'use client';

import { useEffect, useRef } from 'react';

/**
 * WarpcastReady — version "marteau"
 * - Essaie sdk.actions.ready() + toutes les variantes de postMessage
 * - Réessaie agressivement pendant 20s
 * - Loggue tout ce qu'il fait dans la console Dev Mode de Warpcast
 * - Ajoute un fallback manuel window.__forceReady()
 */
export default function WarpcastReady() {
  const called = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inIframe = window.self !== window.top;
    const ua = navigator.userAgent || '';
    const inWarpcastUA =
      /warpcast|farcaster|miniapp|mini-app/i.test(ua);

    console.log('[Ready] mount:', { inIframe, inWarpcastUA, ua });

    // expose une commande manuelle dans la console
    (window as any).__forceReady = () => {
      console.log('[Ready] __forceReady() manual call');
      tryAll('manual');
    };

    const tryAll = (source: string) => {
      if (called.current) return;

      const sdk: any = (window as any).sdk;
      const hasSDK = !!(sdk && sdk.actions);
      console.log(`[Ready] tryAll from=${source}, hasSDK=${hasSDK}`);

      // 1) Appel direct du SDK si dispo
      try {
        if (sdk?.actions?.ready) {
          sdk.actions.ready();
          sdk.actions.setTitle?.('ETH Mood Meter');
          sdk.actions.updateStatusBar?.({ color: '#667eea' });
          called.current = true;
          console.log('[Ready] ✅ sdk.actions.ready() OK');
          return;
        }
      } catch (e) {
        console.warn('[Ready] ready() threw', e);
      }

      // 2) Sinon, spam des messages que Warpcast/Preview écoutent parfois
      const msgs = [
        { type: 'warpcast:ready' },
        { type: 'miniapp_ready' },
        { type: 'miniapp:ready' },
        { type: 'frame_ready' },
        { type: 'sdk:ready' },
        { type: 'ready' },
        { type: 'farcaster:ready' },
      ];

      try {
        if (window.parent && window.parent !== window) {
          msgs.forEach((m) => {
            window.parent!.postMessage(m, '*');
          });
          console.log('[Ready] postMessage spam sent → parent', msgs);
        }
      } catch (e) {
        console.warn('[Ready] postMessage error', e);
      }
    };

    const onMessage = (ev: MessageEvent) => {
      try {
        const t = (ev?.data && (ev.data.type || ev.data.action)) || 'unknown';
        console.log('[Ready] message ⚡', t, ev.data);
        // si le parent "ping", on répond
        if (
          t === 'warpcast:ping' ||
          t === 'ready?' ||
          t === 'miniapp:ping' ||
          t === 'farcaster:init' ||
          t === 'miniapp:init'
        ) {
          tryAll('msg:' + t);
        }
      } catch {
        // ignore
      }
    };

    // 1er essai très tôt
    tryAll('mount');

    // écoute des événements utiles
    window.addEventListener('message', onMessage);
    window.addEventListener('load', () => tryAll('load'), { once: true });
    document.addEventListener('visibilitychange', () => tryAll('visibility'));
    window.addEventListener('focus', () => tryAll('focus'));

    // boucle agressive pendant 20s
    const started = Date.now();
    const tick = () => {
      if (called.current) return;
      tryAll('tick');
      if (Date.now() - started < 20000) {
        setTimeout(tick, 400);
      } else {
        console.warn('[Ready] ⚠️ toujours pas prêt après 20s');
      }
    };
    setTimeout(tick, 250);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
