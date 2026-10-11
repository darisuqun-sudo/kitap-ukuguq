import React, { useState, useRef, useEffect } from 'react';
import { Camera, Copy, Download, Check, X, Crop } from 'lucide-react';
import { SupportedLocale } from '../types';
import { translations } from '../i18n/translations';

interface ScreenshotModalProps {
  isOpen: boolean;
  pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  locale: SupportedLocale;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  isOpen,
  pdfCanvasRef,
  locale,
  onClose,
}) => {
  const t = translations[locale];
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      setIsSelecting(false);
      setStartPos(null);
      setCurrentPos(null);
      setCopied(false);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (capturedImage) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsSelecting(true);
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPos) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPos({ x, y });
  };

  // Handle Mouse Up (Perform the crop from the actual PDF Canvas)
  const handleMouseUp = () => {
    if (!isSelecting || !startPos || !currentPos) return;
    setIsSelecting(false);

    const pdfCanvas = pdfCanvasRef.current;
    if (!pdfCanvas) return;

    const overlayRect = overlayRef.current?.getBoundingClientRect();
    const canvasRect = pdfCanvas.getBoundingClientRect();
    if (!overlayRect) return;

    // Selection coordinates on the overlay
    const selX1 = Math.min(startPos.x, currentPos.x);
    const selY1 = Math.min(startPos.y, currentPos.y);
    const selX2 = Math.max(startPos.x, currentPos.x);
    const selY2 = Math.max(startPos.y, currentPos.y);

    const selWidth = selX2 - selX1;
    const selHeight = selY2 - selY1;

    // Minimum selection size check
    if (selWidth < 15 || selHeight < 15) {
      setStartPos(null);
      setCurrentPos(null);
      return;
    }

    // Map screen coordinates to the actual PDF canvas pixel dimensions
    const scaleX = pdfCanvas.width / canvasRect.width;
    const scaleY = pdfCanvas.height / canvasRect.height;

    // Calculate position relative to the canvas
    const canvasRelX = selX1 - (canvasRect.left - overlayRect.left);
    const canvasRelY = selY1 - (canvasRect.top - overlayRect.top);

    const sourceX = Math.max(0, canvasRelX * scaleX);
    const sourceY = Math.max(0, canvasRelY * scaleY);
    const sourceWidth = Math.min(pdfCanvas.width - sourceX, selWidth * scaleX);
    const sourceHeight = Math.min(pdfCanvas.height - sourceY, selHeight * scaleY);

    if (sourceWidth <= 0 || sourceHeight <= 0) return;

    // Create a new canvas to hold the cropped snapshot
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sourceWidth;
    cropCanvas.height = sourceHeight;

    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      pdfCanvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    const dataUrl = cropCanvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!capturedImage) return;

    try {
      // Check if Electron native API is available
      if ((window as any).electronAPI?.copyImageToClipboard) {
        await (window as any).electronAPI.copyImageToClipboard(capturedImage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Web Clipboard API fallback
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Download / Save Image
  const handleSaveImage = async () => {
    if (!capturedImage) return;

    try {
      // Check if Electron native dialog is available
      if ((window as any).electronAPI?.saveScreenshot) {
        const res = await (window as any).electronAPI.saveScreenshot({
          base64Data: capturedImage,
          defaultName: `kitap-snip-${Date.now()}.png`
        });
        if (res.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
        return;
      }

      // Browser download fallback
      const link = document.createElement('a');
      link.download = `kitap-snip-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save image failed:', err);
    }
  };

  // Calculate box geometry
  const boxStyle: React.CSSProperties =
    startPos && currentPos
      ? {
          left: Math.min(startPos.x, currentPos.x),
          top: Math.min(startPos.y, currentPos.y),
          width: Math.abs(currentPos.x - startPos.x),
          height: Math.abs(currentPos.y - startPos.y),
        }
      : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Selection Overlay */}
      {!capturedImage && (
        <div
          ref={overlayRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-crosshair select-none flex flex-col items-center justify-start pt-6"
        >
          {/* Instruction banner */}
          <div className="bg-gray-900/90 text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xl flex items-center gap-3 border border-gray-700/80 animate-bounce">
            <Crop className="w-4 h-4 text-emerald-400" />
            <span>{t.screenshotInstruction}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selection Box */}
          {isSelecting && startPos && currentPos && (
            <div
              style={boxStyle}
              className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none rounded shadow-sm"
            >
              <div className="absolute -top-6 start-0 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
                {Math.round(boxStyle.width as number)} × {Math.round(boxStyle.height as number)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Captured Preview Dialog */}
      {capturedImage && (
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-xl w-full mx-4 overflow-hidden z-10 animate-scale-up">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>{t.screenshot}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Display */}
          <div className="p-4 max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-50 dark:bg-gray-950/50">
            <img
              src={capturedImage}
              alt="Screenshot snip"
              className="max-w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-800"
            />
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-white dark:bg-gray-900">
            <button
              onClick={() => {
                setCapturedImage(null);
                setStartPos(null);
                setCurrentPos(null);
              }}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              قايتا تارتىش
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-500" />
                  <span>{t.copyToClipboard}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveImage}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.savedSuccess}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t.saveImage}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
