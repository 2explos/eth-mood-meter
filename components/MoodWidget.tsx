'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { useFarcasterContext } from '@/hooks/useFarcasterContext';
import { fetchTodayCounts, submitVote } from '@/lib/contract';
import { calculatePercentage, formatNumber } from '@/lib/utils';

declare global {
  interface Window {
    sdk?: {
      actions?: {
        ready?: () => void;
        setTitle?: (title: string) => void;
        updateStatusBar?: (opts: { color?: string }) => void;
      };
    };
    ethereum?: any;
  }
}

export const MoodWidget: React.FC = () => {
  const [bullishCount, setBullishCount] = useState<bigint>(BigInt(0));
  const [bearishCount, setBearishCount] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [manualFid, setManualFid] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { fid: contextFid, isInWarpcast } = useFarcasterContext();

  // 1) Signaler "ready" à Warpcast
  const readyCalled = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const inWarpcast = window.self !== window.top;
    if (!inWarpcast) return;

    const tryReady = () => {
      if (readyCalled.current) return;
      if (window.sdk?.actions?.ready) {
        window.sdk.actions.ready();
        readyCalled.current = true;
        return;
      }
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'warpcast:ready' }, '*');
          window.parent.postMessage({ type: 'miniapp_ready' }, '*');
          window.parent.postMessage({ type: 'frame:ready' }, '*');
          readyCalled.current = true;
        }
      } catch {}
    };

    tryReady();
    const t1 = setTimeout(tryReady, 120);
    const t2 = setTimeout(tryReady, 600);
    const t3 = setTimeout(tryReady, 1800);

    const onMsg = (ev: MessageEvent) => {
      const t = (ev?.data as any)?.type;
      if (t === 'warpcast:ping' || t === 'miniapp:ping' || t === 'ready?') {
        tryReady();
      }
    };
    window.addEventListener('message', onMsg);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('message', onMsg);
    };
  }, []);

  // 2) Compteurs
  const updateCounts = async () => {
    try {
      const data = await fetchTodayCounts();
      setBullishCount(data.bullish);
      setBearishCount(data.bearish);
    } catch (e) {
      console.error('Failed to fetch counts:', e);
    }
  };
  useEffect(() => {
    updateCounts();
    const interval = setInterval(updateCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  // 3) Déjà voté aujourd’hui ?
  useEffect(() => {
    const today = new Date().toDateString();
    const last = localStorage.getItem('lastVoteDate');
    setHasVoted(last === today);
  }, []);

  // 4) Vote
  const handleVote = async (mood: 0 | 1) => {
    const fid = contextFid || parseInt(manualFid);
    if (!fid || isNaN(fid)) {
      showToast('Veuillez entrer un FID Farcaster valide', 'error');
      return;
    }
    setLoading(true);
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Veuillez installer MetaMask (ou un wallet Web3 compatible)');
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      const expected = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
      if (Number(network.chainId) !== expected) {
        throw new Error(`Veuillez passer sur le réseau Base (Chain ID : ${expected})`);
      }

      const tx = await submitVote(fid, mood, signer);
      showToast('Transaction envoyée ! Attente de confirmation…', 'success');
      await tx.wait();

      const today = new Date().toDateString();
      localStorage.setItem('lastVoteDate', today);
      setHasVoted(true);
      showToast(`Vote ${mood === 1 ? 'Bullish' : 'Bearish'} enregistré ! 🎉`, 'success');
      updateCounts();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Échec de la transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const total = Number(bullishCount) + Number(bearishCount);
  const pBull = calculatePercentage(Number(bullishCount), total);
  const pBear = calculatePercentage(Number(bearishCount), total);

  return (
    <div className="mood-widget">
      <div className="card">
        <h1 className="title">🐂 ETH Mood Meter 🐻</h1>

        {!isInWarpcast && (
          <div className="banner">ℹ️ Utilisable comme mini-app Farcaster. Les votes fonctionnent sur Base.</div>
        )}

        {!contextFid && (
          <div className="fid-input">
            <label>Farcaster ID (FID) :</label>
            <input
              type="number"
              value={manualFid}
              onChange={(e) => setManualFid(e.target.value)}
              placeholder="Entrez votre FID"
              disabled={loading || hasVoted}
            />
          </div>
        )}

        <div className="button-container">
          <button onClick={() => handleVote(1)} disabled={loading || hasVoted} className="btn btn-bullish">
            {loading ? '⏳' : '🚀'} Bullish
          </button>
          <button onClick={() => handleVote(0)} disabled={loading || hasVoted} className="btn btn-bearish">
            {loading ? '⏳' : '📉'} Bearish
          </button>
        </div>

        {hasVoted && <div className="voted-message">✅ Vous avez déjà voté aujourd’hui. Revenez demain !</div>}

        <div className="stats">
          <h3>Sentiment du jour</h3>
          <div className="counts">
            <div className="count-item">
              <span className="count-label">Bullish</span>
              <span className="count-value">{formatNumber(Number(bullishCount))}</span>
            </div>
            <div className="count-item">
              <span className="count-label">Bearish</span>
              <span className="count-value">{formatNumber(Number(bearishCount))}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-bullish" style={{ width: `${pBull}%` }} />
            <div className="progress-bearish" style={{ width: `${pBear}%` }} />
          </div>
          <div className="percentages">
            <span className="bullish-text">🚀 {pBull}%</span>
            <span className="bearish-text">📉 {pBear}%</span>
          </div>
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      </div>
    </div>
  );
};
