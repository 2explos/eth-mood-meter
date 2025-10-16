/**
 * Shortens an Ethereum address for display
 * @param address - Full Ethereum address
 * @returns Shortened address (0x1234...5678)
 */
export const shortAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Calculates percentage of value out of total
 * @param value - Numerator
 * @param total - Denominator
 * @returns Percentage rounded to nearest integer
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Formats a number with commas for thousands
 * @param num - Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
