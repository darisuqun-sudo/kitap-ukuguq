import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Try to use bundled worker or standard cdnjs worker matching version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker configuration fallback:', e);
  }
}

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    data: data instanceof Uint8Array ? data : new Uint8Array(data),
    cMapUrl: 'https://unpkg.com/pdfjs-dist@legacy/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export async function generateCoverThumbnail(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<string> {
  try {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    // Target thumbnail width: 180px
    const targetWidth = 180;
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (error) {
    console.error('Failed to generate cover thumbnail:', error);
    // Return a default SVG placeholder
    return createPlaceholderCover();
  }
}

export function createPlaceholderCover(title: string = 'PDF'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 180, 250);
  grad.addColorStop(0, '#3b82f6');
  grad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 180, 250);

  // Book spine accent
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, 0, 15, 250);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Noto Sans Arabic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📖 كىتاب', 95, 120);

  return canvas.toDataURL('image/png');
}
