import { ethers } from 'ethers';
import { ETH_MOOD_METER_ABI } from './abi';

// Configuration with fallbacks
const RPC_URL = process.env.NEXT_PUBLIC_RPC || 'https://mainnet.base.org';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT || '';

/**
 * Creates a read-only provider for Base network
 */
export const getProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
};

/**
 * Gets contract instance for read operations
 */
export const getContract = (): ethers.Contract => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ETH_MOOD_METER_ABI, provider);
};

/**
 * Fetches today's voting counts from contract
 * @returns Object with day, bullish, and bearish counts
 */
export const fetchTodayCounts = async (): Promise<{
  day: bigint;
  bullish: bigint;
  bearish: bigint;
}> => {
  try {
    const contract = getContract();
    const [day, bullish, bearish] = await contract.today();
    return { day, bullish, bearish };
  } catch (error) {
    console.error('Error fetching today counts:', error);
    throw error;
  }
};

/**
 * Submits a vote transaction
 * @param fid - Farcaster ID
 * @param mood - 0 for bearish, 1 for bullish
 * @param signer - Ethers signer instance
 */
export const submitVote = async (
  fid: number,
  mood: 0 | 1,
  signer: ethers.Signer
): Promise<ethers.ContractTransactionResponse> => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ETH_MOOD_METER_ABI,
      signer
    );
    const tx = await contract.vote(fid, mood);
    return tx;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};
