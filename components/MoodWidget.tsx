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
  }
}

export const MoodWidget: React.FC = () => {
  const [bullishCount, setBullishCount] = useState<bigint>(0n);
  const [bearishCount, setBearishCount] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [manualFid, setManualFid] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { fid: contextFid, isInWarpcast } = useFarcasterContext();

  /** ---------- ✅ Signaler “ready” à Warpcast ---------- **/
  const readyCalled = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inWarpcast = window.self !== window.top;
    if (!inWarpcast) {
      console.log('🧭 Not in Warpcast iframe → skip ready()');
      return;
    }

    const tryReady = () => {
      if (readyCalled.current) return;

      const sdk = (window as any).sdk;
      if (sdk?.actions?.ready) {
        sdk.actions.ready();
        sdk.actions.setTitle?.('ETH Mood Meter');
        sdk.actions.updateStatusBar?.({ color: '#667eea' });
        readyCalled.current = true;
        console.log('✅ Warpcast ready() called successfully');
      } else {
        console.log('⏳ Warpcast SDK not ready yet...');
      }
    };

    // Essaye plusieurs fois
    tryReady();
    const retries = [100, 300, 1000, 2000];
    const timers = retries.map((d) => setTimeout(tryReady, d));

    window.addEventListener('load', tryReady);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', tryReady);
    };
  }, []);

  /** ---------- Compteurs on-chain ---------- **/
  const updateCounts = async () => {
    try {
      const data = await fetchTodayCounts();
      setBullishCount(data.bullish);
      setBearishCount(data.bearish);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  };

  useEffect(() => {
    updateCounts();
    const interval = setInterval(updateCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  /** ---------- Déjà voté aujourd’hui ? ---------- **/
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVote = typeof window !== 'undefined' ? localStorage.getItem('lastVoteDate') : null;
    setHasVoted(lastVote === today);
  }, []);

  /** ---------- Vote ---------- **/
  const handleVote = async (mood: 0 | 1) => {
    const fid = contextFid || parseInt(manualFid, 10);
    if (!fid || Number.isNaN(fid)) {
      showToast('Veuillez entrer un FID Farcaster valide', 'error');
      return;
    }

    setLoading(true);
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Veuillez installer MetaMask (ou un wallet Web3 compatible)');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10);
      if (Number(network.chainId) !== expectedChainId) {
        throw new Error(`Veuillez passer sur le réseau Base (Chain ID : ${expectedChainId})`);
      }

      const tx = await submitVote(fid, mood, signer);
      showToast('Transaction envoyée ! Attente de confirmation...', 'success');
      await tx.wait();

      const today = new Date().toDateString();
      localStorage.setItem('lastVoteDate', today);
      setHasVoted(true);

      showToast(`Vote ${mood === 1 ? 'Bullish' : 'Bearish'} enregistré ! 🎉`, 'success');
      updateCounts();
    } catch (err: any) {
      console.error('Vote error:', err);
      showToast(err?.message || 'Échec de la transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  /** ---------- UI ---------- **/
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const totalVotes = Number(bullishCount) + Number(bearishCount);
  const bullishPercent = calculatePercentage(Number(bullishCount), totalVotes);
  const bearishPercent = calculatePercentage(Number(bearishCount), totalVotes);

  return (
    <div className="mood-widget">
      <div className="card">
        <h1 className="title">🐂 ETH Mood Meter 🐻</h1>

        {!isInWarpcast && (
          <div className="banner">
            ℹ️ Utilisable comme mini-app Farcaster. Les votes fonctionnent sur Base.
          </div>
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
          <button
            onClick={() => handleVote(1)}
            disabled={loading || hasVoted}
            className="btn btn-bullish"
          >
            {loading ? '⏳' : '🚀'} Bullish
          </button>

          <button
            onClick={() => handleVote(0)}
            disabled={loading || hasVoted}
            className="btn btn-bearish"
          >
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
            <div className="progress-bullish" style={{ width: `${bullishPercent}%` }} />
            <div className="progress-bearish" style={{ width: `${bearishPercent}%` }} />
          </div>

          <div className="percentages">
            <span className="bullish-text">🚀 {bullishPercent}%</span>
            <span className="bearish-text">📉 {bearishPercent}%</span>
          </div>
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      </div>
    </div>
  );
};
