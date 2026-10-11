import * as pdfjsLib from 'pdfjs-dist';
// Import the PDF.js worker as a direct bundled asset URL via Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  // Clone data to avoid detaching the caller's ArrayBuffer when transferred to worker
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@legacy/cmaps/',
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
    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return createPlaceholderCover();

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (error) {
    console.warn('Failed to generate cover thumbnail, using placeholder:', error);
    return createPlaceholderCover();
  }
}

export function createPlaceholderCover(title: string = 'PDF'): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 180, 250);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#1e40af');
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
  } catch {
    return '';
  }
}
