import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ETH Mood Meter',
  description: 'Vote on your ETH sentiment - Bullish or Bearish',
  openGraph: {
    title: 'ETH Mood Meter',
    description: 'Daily sentiment tracking for Ethereum on Base',
    images: ['/preview.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
