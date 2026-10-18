import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get('score') || '98.5%';
  const label = searchParams.get('label') || 'PromptShift';
  const status = searchParams.get('status') || `${score} Parity`;

  const cleanLabel = label.replace(/[<>&"']/g, '');
  const cleanStatus = status.replace(/[<>&"']/g, '');

  // Estimated text widths for crisp layout (approx 7px per char)
  const labelWidth = Math.max(50, cleanLabel.length * 7 + 16);
  const statusWidth = Math.max(60, cleanStatus.length * 7.5 + 16);
  const totalWidth = labelWidth + statusWidth;

  const labelTextX = labelWidth / 2;
  const statusTextX = labelWidth + statusWidth / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${cleanLabel}: ${cleanStatus}">
  <title>${cleanLabel}: ${cleanStatus}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#0f172a"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="#059669"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 14) * 10}">${cleanLabel}</text>
    <text x="${labelTextX * 10}" y="140" fill="#38bdf8" transform="scale(.1)" textLength="${(labelWidth - 14) * 10}" font-weight="bold">${cleanLabel}</text>
    <text aria-hidden="true" x="${statusTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(statusWidth - 14) * 10}">${cleanStatus}</text>
    <text x="${statusTextX * 10}" y="140" fill="#fff" transform="scale(.1)" textLength="${(statusWidth - 14) * 10}" font-weight="bold">${cleanStatus}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
