import { toPng } from 'html-to-image';

const GOOGLE_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

let cachedFontEmbedCss: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function resolveGoogleFontsEmbedCss(): Promise<string | null> {
  if (cachedFontEmbedCss !== null) {
    return cachedFontEmbedCss;
  }

  try {
    const cssResponse = await fetch(GOOGLE_FONTS_CSS_URL, { mode: 'cors' });
    if (!cssResponse.ok) return null;
    const rawCss = await cssResponse.text();

    const urlMatches = Array.from(rawCss.matchAll(/url\((https:\/\/[^)]+)\)/g));
    const uniqueUrls = Array.from(new Set(urlMatches.map((m) => m[1])));

    const replacements = new Map<string, string>();
    await Promise.all(
      uniqueUrls.map(async (fontUrl) => {
        try {
          const res = await fetch(fontUrl, { mode: 'cors' });
          if (!res.ok) return;
          const mime = res.headers.get('content-type') || 'font/woff2';
          const buf = await res.arrayBuffer();
          replacements.set(fontUrl, `data:${mime};base64,${arrayBufferToBase64(buf)}`);
        } catch {
          // Skip individual font variant if unavailable
        }
      })
    );

    let embeddedCss = rawCss;
    for (const [remoteUrl, dataUri] of replacements.entries()) {
      embeddedCss = embeddedCss.split(remoteUrl).join(dataUri);
    }

    cachedFontEmbedCss = embeddedCss;
    return embeddedCss;
  } catch {
    return null;
  }
}

export async function exportPosterToPng(
  node: HTMLElement,
  backgroundColor: string
): Promise<string> {
  const fontEmbedCSS = await resolveGoogleFontsEmbedCss();

  if (fontEmbedCSS) {
    return toPng(node, {
      pixelRatio: 2.5,
      backgroundColor,
      fontEmbedCSS,
    });
  }

  return toPng(node, {
    pixelRatio: 2.5,
    backgroundColor,
    skipFonts: true,
  });
}
