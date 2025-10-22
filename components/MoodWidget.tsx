'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useFarcasterContext } from '@/hooks/useFarcasterContext';
import { fetchTodayCounts, submitVote } from '@/lib/contract';
import { calculatePercentage, formatNumber } from '@/lib/utils';

// ⚠️ Do NOT declare `ethereum` here (it collides with other libs)
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
  const [bullishCount, setBullishCount] = useState<bigint>(BigInt(0));
  const [bearishCount, setBearishCount] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [manualFid, setManualFid] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { fid: contextFid, isInWarpcast } = useFarcasterContext();
  const readyCalled = useRef(false);

  // 1) Ping Warpcast SDK (safe retries)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const inWarpcast = window.self !== window.top;
    if (!inWarpcast) return;

    const tryReady = () => {
      if (readyCalled.current) return;
      if (window.sdk?.actions?.ready) {
        window.sdk.actions.ready();
        window.sdk.actions.setTitle?.('ETH Mood Meter');
        window.sdk.actions.updateStatusBar?.({ color: '#667eea' });
        readyCalled.current = true;
        console.log('✅ Warpcast SDK ready() called');
      }
    };

    tryReady();
    const interval = setInterval(tryReady, 500);
    const killer = setTimeout(() => clearInterval(interval), 5000);
    window.addEventListener('load', tryReady);
    return () => {
      clearInterval(interval);
      clearTimeout(killer);
      window.removeEventListener('load', tryReady);
    };
  }, []);

  // 2) Read on-chain counts
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
    const id = setInterval(updateCounts, 10000);
    return () => clearInterval(id);
  }, []);

  // 3) Check “already voted today”
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
      const eth = (window as any)?.ethereum;
      if (!eth) throw new Error('Wallet non détecté');

      const provider = new ethers.BrowserProvider(eth);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
      if (Number(network.chainId) !== expectedChainId) {
        throw new Error(`Veuillez passer sur le réseau Base (Chain ID : ${expectedChainId})`);
      }

      const tx = await submitVote(fid, mood, signer);
      showToast('Transaction envoyée ! Attente de confirmation…', 'success');
      await tx.wait();

      const today = new Date().toDateString();
      localStorage.setItem('lastVoteDate', today);
      setHasVoted(true);

      showToast(`Vote ${mood === 1 ? 'Bullish' : 'Bearish'} enregistré 🎉`, 'success');
      updateCounts();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Erreur pendant le vote', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5) UI helpers
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
          <button onClick={() => handleVote(1)} disabled={loading || hasVoted} className="btn btn-bullish">
            {loading ? '⏳' : '🚀'} Bullish
          </button>
          <button onClick={() => handleVote(0)} disabled={loading || hasVoted} className="btn btn-bearish">
            {loading ? '⏳' : '📉'} Bearish
          </button>
        </div>

        {hasVoted && (
          <div className="voted-message">✅ Vous avez déjà voté aujourd’hui. Revenez demain !</div>
        )}

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
