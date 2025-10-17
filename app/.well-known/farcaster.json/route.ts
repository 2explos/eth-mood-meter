import { NextResponse } from "next/server";

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_URL || "https://eth-mood-meter.vercel.app";

  const frame = {
    version: "1",
    name: "ETH Mood Meter",
    iconUrl: `${APP_URL}/icon.png`,
    homeUrl: `${APP_URL}`,
    imageUrl: `${APP_URL}/preview.png`,
    screenshotUrls: [`${APP_URL}/preview.png`],
    tags: ["base", "farcaster", "miniapp", "mood", "ethereum"],
    primaryCategory: "developer-tools",
    buttonTitle: "Open",
    splashImageUrl: `${APP_URL}/splash.png`,
    splashBackgroundColor: "#667eea",
  };

  const manifest: any = { frame };

  // ✅ Ajoute accountAssociation si les 3 variables existent
  const h = process.env.FARCASTER_HEADER;
  const p = process.env.FARCASTER_PAYLOAD;
  const s = process.env.FARCASTER_SIGNATURE;

  if (h && p && s) {
    manifest.accountAssociation = { header: h, payload: p, signature: s };
  } else {
    // Optionnel: aide au debug
    console.warn("Farcaster accountAssociation not set: missing env vars.");
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
