'use client';

import { useState, useEffect } from 'react';

interface FarcasterContext {
  fid?: number;
  isInWarpcast: boolean;
}

/**
 * Hook to detect Farcaster miniapp context and extract user FID
 * In production, this would integrate with the Farcaster SDK
 */
export const useFarcasterContext = (): FarcasterContext => {
  const [context, setContext] = useState<FarcasterContext>({
    isInWarpcast: false,
  });

  useEffect(() => {
    // Check if running inside iframe (Warpcast miniapp)
    const isInWarpcast = typeof window !== 'undefined' && 
      window.self !== window.top;

    if (isInWarpcast) {
      // In production: Extract FID from Farcaster SDK
      // For now, stub implementation
      // Example: window.parent.postMessage({ type: 'getFid' }, '*');
      setContext({ isInWarpcast: true });
    } else {
      setContext({ isInWarpcast: false });
    }
  }, []);

  return context;
};
