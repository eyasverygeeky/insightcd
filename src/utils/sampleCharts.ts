import type { UploadedAssessmentImage } from '../types/profile';

function renderChartToUploadedImage(
  filename: string,
  drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): UploadedAssessmentImage {
  const width = 820;
  const height = 520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  drawFn(ctx, width, height);

  const dataUrl = canvas.toDataURL('image/png');
  const base64Data = dataUrl.split(',')[1] ?? '';
  const byteSize = Math.round((base64Data.length * 3) / 4);

  return {
    name: filename,
    mimeType: 'image/png',
    base64Data,
    previewUrl: dataUrl,
    sizeLabel: `${Math.max(1, Math.round(byteSize / 1024))} KB`,
  };
}

export function createSampleRiasecImage(): UploadedAssessmentImage {
  return renderChartToUploadedImage('sample-riasec-results.png', (ctx, width, height) => {
    ctx.strokeStyle = '#D8D3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.fillStyle = '#142B22';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('RIASEC Career Interest Assessment Report', 44, 68);

    ctx.fillStyle = '#4A5D55';
    ctx.font = '15px sans-serif';
    ctx.fillText('Student Holland Interest Inventory (Scale: 0 – 100%)', 44, 96);

    const rows = [
      { label: 'Realistic (R)', score: 42, color: '#6E7F77' },
      { label: 'Investigative (I)', score: 88, color: '#186049' },
      { label: 'Artistic (A)', score: 79, color: '#D98327' },
      { label: 'Social (S)', score: 66, color: '#4A943E' },
      { label: 'Enterprising (E)', score: 54, color: '#8C621B' },
      { label: 'Conventional (C)', score: 48, color: '#5A7066' },
    ];

    const startY = 148;
    const rowGap = 56;
    const barLeft = 240;
    const maxBarWidth = 450;

    rows.forEach((row, i) => {
      const y = startY + i * rowGap;
      ctx.fillStyle = '#142B22';
      ctx.font = '600 17px sans-serif';
      ctx.fillText(row.label, 44, y + 18);

      ctx.fillStyle = '#F3F1DF';
      ctx.fillRect(barLeft, y, maxBarWidth, 24);

      ctx.fillStyle = row.color;
      ctx.fillRect(barLeft, y, (row.score / 100) * maxBarWidth, 24);

      ctx.fillStyle = '#142B22';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(`${row.score}%`, barLeft + maxBarWidth + 18, y + 18);
    });

    ctx.fillStyle = '#4A5D55';
    ctx.font = '14px sans-serif';
    ctx.fillText('Summary Code: IAS (Investigative · Artistic · Social)', 44, height - 38);
  });
}

export function createSampleBigFiveImage(): UploadedAssessmentImage {
  return renderChartToUploadedImage('sample-big5-results.png', (ctx, width, height) => {
    ctx.strokeStyle = '#D8D3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.fillStyle = '#142B22';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Big Five (OCEAN) Personality Inventory', 44, 68);

    ctx.fillStyle = '#4A5D55';
    ctx.font = '15px sans-serif';
    ctx.fillText('Student Percentile Score Profile (0 – 100 Percentile)', 44, 96);

    const rows = [
      { label: 'Openness to Experience', score: 86, tier: 'High', color: '#186049' },
      { label: 'Conscientiousness', score: 74, tier: 'High', color: '#4A943E' },
      { label: 'Extraversion', score: 49, tier: 'Moderate', color: '#D98327' },
      { label: 'Agreeableness', score: 71, tier: 'High', color: '#2F6E57' },
      { label: 'Neuroticism', score: 32, tier: 'Low', color: '#6E7F77' },
    ];

    const startY = 152;
    const rowGap = 64;
    const barLeft = 290;
    const maxBarWidth = 390;

    rows.forEach((row, i) => {
      const y = startY + i * rowGap;
      ctx.fillStyle = '#142B22';
      ctx.font = '600 17px sans-serif';
      ctx.fillText(row.label, 44, y + 18);

      ctx.fillStyle = '#F3F1DF';
      ctx.fillRect(barLeft, y, maxBarWidth, 24);

      ctx.fillStyle = row.color;
      ctx.fillRect(barLeft, y, (row.score / 100) * maxBarWidth, 24);

      ctx.fillStyle = '#142B22';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`${row.score} (${row.tier})`, barLeft + maxBarWidth + 16, y + 18);
    });

    ctx.fillStyle = '#4A5D55';
    ctx.font = '14px sans-serif';
    ctx.fillText('Student Assessment Form: IPIP-NEO-120', 44, height - 38);
  });
}
