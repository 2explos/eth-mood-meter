import { NextResponse } from "next/server";

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_URL || "https://eth-mood-meter.vercel.app";

  // Manifest "frame" requis pour une mini-app Farcaster
  const frame = {
    version: "1",
    name: "ETH Mood Meter",
    iconUrl: `${APP_URL}/icon.png`,        // ← change en .svg si besoin
    homeUrl: `${APP_URL}`,
    imageUrl: `${APP_URL}/preview.png`,    // ← change en .svg si besoin
    screenshotUrls: [`${APP_URL}/preview.png`],
    tags: ["base", "farcaster", "miniapp", "mood", "ethereum"],
    primaryCategory: "developer-tools",
    buttonTitle: "Open",
    splashImageUrl: `${APP_URL}/splash.png`, // ← change en .svg si besoin
    splashBackgroundColor: "#667eea",
  };

  // On ajoute accountAssociation uniquement si tu as mis les 3 env côté Vercel
  const manifest: any = { frame };
  if (
    process.env.FARCASTER_HEADER &&
    process.env.FARCASTER_PAYLOAD &&
    process.env.FARCASTER_SIGNATURE
  ) {
    manifest.accountAssociation = {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    };
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
