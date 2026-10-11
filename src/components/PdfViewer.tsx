import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AppTheme, SupportedLocale } from '../types';
import { translations, isRTL } from '../i18n/translations';
import { Loader2, BookOpen, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface PdfViewerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  zoom: number;
  theme: AppTheme;
  locale: SupportedLocale;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPageChange: (page: number) => void;
  onOpenAddBook: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfDoc,
  currentPage,
  zoom,
  theme,
  locale,
  canvasRef,
  onPageChange,
  onOpenAddBook,
}) => {
  const t = translations[locale];
  const rtl = isRTL(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const renderTaskRef = useRef<any>(null);

  // Render current PDF page
  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        setLoading(true);

        // Cancel previous render task if still in flight
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: zoom });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  // Keyboard navigation for page flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDoc) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        if (rtl) {
          if (currentPage > 1) onPageChange(currentPage - 1);
        } else {
          if (currentPage < pdfDoc.numPages) onPageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (rtl) {
          if (currentPage < pdfDoc.numPages) onPageChange(currentPage + 1);
        } else {
          if (currentPage > 1) onPageChange(currentPage - 1);
        }
      } else if (e.key === 'PageDown' || e.key === ' ') {
        if (currentPage < pdfDoc.numPages) onPageChange(currentPage + 1);
      } else if (e.key === 'PageUp') {
        if (currentPage > 1) onPageChange(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfDoc, currentPage, rtl, onPageChange]);

  // CSS theme styling for PDF canvas
  const getCanvasFilter = () => {
    if (theme === 'dark') {
      return 'invert(92%) hue-rotate(180deg) contrast(95%) brightness(95%)';
    }
    if (theme === 'sepia') {
      return 'sepia(35%) brightness(95%) contrast(98%)';
    }
    return 'none';
  };

  const getContainerBg = () => {
    if (theme === 'dark') return 'bg-gray-950';
    if (theme === 'sepia') return 'bg-[#f4ebd0]';
    return 'bg-gray-200/70';
  };

  if (!pdfDoc) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center select-none ${getContainerBg()}`}>
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-500/25">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t.appName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            {t.appSubtitle} - كومپيۇتېر ئۈچۈن مەخسۇس ئوڭدىن سولغا ماسلاشقان ئىلغار كىتاب ئوقۇغۇچ.
          </p>
          <button
            onClick={onOpenAddBook}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{t.openFile}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-auto relative flex justify-center p-6 md:p-10 select-none ${getContainerBg()}`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-4 start-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 z-10 shadow">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>يۈكلىنىۋاتىدۇ...</span>
        </div>
      )}

      {/* Floating Prev/Next hover buttons */}
      <button
        onClick={() => {
          if (currentPage > 1) onPageChange(currentPage - 1);
        }}
        disabled={currentPage <= 1}
        className="fixed start-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:bg-white dark:hover:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 opacity-40 hover:opacity-100 disabled:opacity-0 transition-all z-10"
        title={t.prevPage}
      >
        {rtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <button
        onClick={() => {
          if (currentPage < pdfDoc.numPages) onPageChange(currentPage + 1);
        }}
        disabled={currentPage >= pdfDoc.numPages}
        className="fixed end-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:bg-white dark:hover:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 opacity-40 hover:opacity-100 disabled:opacity-0 transition-all z-10"
        title={t.nextPage}
      >
        {rtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* The Rendered PDF Canvas */}
      <div className="relative shadow-2xl rounded-xs overflow-hidden bg-white max-w-full">
        <canvas
          ref={canvasRef}
          style={{
            filter: getCanvasFilter(),
            display: 'block',
          }}
          className="transition-filter duration-200"
        />
      </div>
    </div>
  );
};
