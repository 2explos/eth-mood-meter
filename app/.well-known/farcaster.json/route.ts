import { NextResponse } from 'next/server';

export async function GET() {
  // Get base URL from environment variable
  const APP_URL = process.env.NEXT_PUBLIC_URL;

  if (!APP_URL) {
    console.error('NEXT_PUBLIC_URL environment variable is not set');
    return NextResponse.json(
      { error: 'Application URL not configured' },
      { status: 500 }
    );
  }

  // Farcaster miniapp manifest
  const manifest = {
    accountAssociation: {
      // These need to be generated using Farcaster account association protocol
      // See README for instructions on generating these values
      header: "REPLACE_WITH_YOUR_HEADER",
      payload: "REPLACE_WITH_YOUR_PAYLOAD",
      signature: "REPLACE_WITH_YOUR_SIGNATURE",
    },
    frame: {
      version: "1",
      name: "ETH Mood Meter",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/preview.png`,
      screenshotUrls: [],
      tags: ["base", "farcaster", "miniapp", "mood", "ethereum"],
      primaryCategory: "developer-tools",
      buttonTitle: "Open",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#667eea",
      webhookUrl: `${APP_URL}/api/webhook`
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
