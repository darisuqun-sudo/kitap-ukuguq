import React, { useState, useEffect, useRef } from 'react';
import { Book, SupportedLocale, AppTheme } from './types';
import { translations, isRTL } from './i18n/translations';
import {
  getAllBooks,
  saveBook,
  getBookBlob,
  updateBookProgress,
  deleteBook,
  toggleBookmark,
} from './services/db';
import {
  loadPdfDocument,
  generateCoverThumbnail,
  createPlaceholderCover,
} from './services/pdf';
import * as pdfjsLib from 'pdfjs-dist';

import { Header } from './components/Header';
import { BookSidebar } from './components/BookSidebar';
import { PdfViewer } from './components/PdfViewer';
import { ScreenshotModal } from './components/ScreenshotModal';
import { SearchModal } from './components/SearchModal';

export const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.15);

  const [locale, setLocale] = useState<SupportedLocale>(() => {
    return (localStorage.getItem('kitap_locale') as SupportedLocale) || 'ug';
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('kitap_theme') as AppTheme) || 'light';
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync RTL and language to HTML element
  useEffect(() => {
    const rtl = isRTL(locale);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    localStorage.setItem('kitap_locale', locale);
  }, [locale]);

  // Sync theme
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'theme-sepia');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'sepia') {
      document.documentElement.classList.add('theme-sepia');
    }
    localStorage.setItem('kitap_theme', theme);
  }, [theme]);

  // Load books from IndexedDB on startup
  useEffect(() => {
    const initLibrary = async () => {
      try {
        const loadedBooks = await getAllBooks();
        if (loadedBooks.length > 0) {
          setBooks(loadedBooks);
          if (!currentBook) {
            handleSelectBook(loadedBooks[0]);
          }
        } else {
          // First time launch: load sample Uyghur guide book
          try {
            const res = await fetch('./sample_kitap.pdf');
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              const doc = await loadPdfDocument(arrayBuffer);
              const coverThumbnail = await generateCoverThumbnail(doc);
              const initialBook: Book = {
                id: 'book_sample_1',
                title: 'كىتابخۇمار - تەجرىبە كىتابى.pdf',
                fileSize: arrayBuffer.byteLength,
                coverThumbnail,
                totalPages: doc.numPages,
                lastReadPage: 1,
                zoomLevel: 1.15,
                addedAt: Date.now(),
                lastReadAt: Date.now(),
                bookmarks: [2],
              };
              await saveBook(initialBook, arrayBuffer);
              const all = await getAllBooks();
              setBooks(all);
              handleSelectBook(initialBook);
            }
          } catch (sampleErr) {
            console.warn('Sample book could not be loaded:', sampleErr);
          }
        }
      } catch (err) {
        console.error('Failed to load books from database:', err);
      }
    };
    initLibrary();
  }, []);

  // Handle Book Selection and Auto-Resume Reading Position
  const handleSelectBook = async (book: Book) => {
    try {
      setCurrentBook(book);
      const pdfData = await getBookBlob(book.id);

      if (!pdfData) {
        console.error('PDF data not found for book:', book.title);
        return;
      }

      let arrayBuffer: ArrayBuffer;
      if (pdfData instanceof ArrayBuffer) {
        arrayBuffer = pdfData;
      } else if (pdfData instanceof Blob) {
        arrayBuffer = await pdfData.arrayBuffer();
      } else {
        // Base64 string fallback
        const binary = atob(pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      }

      const doc = await loadPdfDocument(arrayBuffer);
      setPdfDoc(doc);

      // Auto-resume from last read page
      const resumePage = Math.min(Math.max(1, book.lastReadPage || 1), doc.numPages);
      setCurrentPage(resumePage);
      setZoom(book.zoomLevel || 1.15);

      // Update last read timestamp
      await updateBookProgress(book.id, resumePage, 0, book.zoomLevel || 1.15);
      const updatedList = await getAllBooks();
      setBooks(updatedList);
    } catch (err) {
      console.error('Failed to open PDF:', err);
      alert('PDF ھۆججىتىنى ئېچىشتا خاتالىق كۆرۈلدى');
    }
  };

  // Handle Page Change and Auto-Save Reading Progress
  const handlePageChange = async (newPage: number) => {
    if (!pdfDoc || !currentBook) return;
    const validPage = Math.min(Math.max(1, newPage), pdfDoc.numPages);
    setCurrentPage(validPage);

    // Save reading progress to database
    await updateBookProgress(currentBook.id, validPage, 0, zoom);

    // Update in-memory state
    setBooks((prev) =>
      prev.map((b) =>
        b.id === currentBook.id
          ? { ...b, lastReadPage: validPage, lastReadAt: Date.now() }
          : b
      )
    );
    setCurrentBook((prev) => (prev ? { ...prev, lastReadPage: validPage } : null));
  };

  // Handle Zoom change
  const handleZoomChange = async (newZoom: number) => {
    setZoom(newZoom);
    if (currentBook) {
      await updateBookProgress(currentBook.id, currentPage, 0, newZoom);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!currentBook) return;
    const updatedBookmarks = await toggleBookmark(currentBook.id, currentPage);
    setCurrentBook((prev) => (prev ? { ...prev, bookmarks: updatedBookmarks } : null));
    setBooks((prev) =>
      prev.map((b) => (b.id === currentBook.id ? { ...b, bookmarks: updatedBookmarks } : b))
    );
  };

  // Delete Book
  const handleDeleteBook = async (bookId: string) => {
    await deleteBook(bookId);
    const updated = await getAllBooks();
    setBooks(updated);
    if (currentBook?.id === bookId) {
      if (updated.length > 0) {
        handleSelectBook(updated[0]);
      } else {
        setCurrentBook(null);
        setPdfDoc(null);
      }
    }
  };

  // Add Book File(s)
  const processPdfFiles = async (files: FileList | File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await loadPdfDocument(arrayBuffer);
        const coverThumbnail = await generateCoverThumbnail(doc);

        const newBook: Book = {
          id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileSize: file.size,
          coverThumbnail,
          totalPages: doc.numPages,
          lastReadPage: 1,
          zoomLevel: 1.15,
          addedAt: Date.now(),
          lastReadAt: Date.now(),
          bookmarks: [],
        };

        await saveBook(newBook, arrayBuffer);
        const all = await getAllBooks();
        setBooks(all);

        // Open newly added book
        handleSelectBook(newBook);
      } catch (err) {
        console.error('Failed to import PDF file:', file.name, err);
        alert(`«${file.name}» نى يۈكلەشتە خاتالىق كۆرۈلدى`);
      }
    }
  };

  // Native Electron Open File or Browser Input Trigger
  const handleOpenAddBook = async () => {
    if ((window as any).electronAPI?.openPdfDialog) {
      try {
        const filesData = await (window as any).electronAPI.openPdfDialog();
        if (filesData && filesData.length > 0) {
          for (const item of filesData) {
            const binary = atob(item.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;
            const doc = await loadPdfDocument(arrayBuffer);
            const coverThumbnail = await generateCoverThumbnail(doc);

            const newBook: Book = {
              id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              title: item.name.replace(/\.[^/.]+$/, ''),
              filePath: item.path,
              fileSize: item.size,
              coverThumbnail,
              totalPages: doc.numPages,
              lastReadPage: 1,
              zoomLevel: 1.15,
              addedAt: Date.now(),
              lastReadAt: Date.now(),
              bookmarks: [],
            };

            await saveBook(newBook, arrayBuffer);
            const all = await getAllBooks();
            setBooks(all);
            handleSelectBook(newBook);
          }
        }
      } catch (err) {
        console.error('Electron open dialog failed:', err);
      }
      return;
    }

    // Web fallback
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processPdfFiles(e.dataTransfer.files);
    }
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const isBookmarked =
    !!currentBook?.bookmarks && currentBook.bookmarks.includes(currentPage);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      {/* Hidden File Input for browser fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processPdfFiles(e.target.files);
        }}
      />

      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/20 backdrop-blur-xs border-4 border-dashed border-blue-500 rounded-2xl m-4 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-900 px-8 py-5 rounded-2xl shadow-2xl text-center">
            <h3 className="font-bold text-base text-blue-600 dark:text-blue-400">
              PDF ھۆججەتنى تاشلاڭ
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              كىتاب دەرھال تىزىملىككە قوشۇلىدۇ ۋە ئېچىلىدۇ
            </p>
          </div>
        </div>
      )}

      {/* Top Application Bar */}
      <Header
        currentBook={currentBook}
        currentPage={currentPage}
        totalPages={pdfDoc?.numPages || 0}
        zoom={zoom}
        theme={theme}
        locale={locale}
        sidebarOpen={sidebarOpen}
        isFullscreen={isFullscreen}
        isBookmarked={isBookmarked}
        onPageChange={handlePageChange}
        onZoomChange={handleZoomChange}
        onThemeChange={setTheme}
        onLocaleChange={setLocale}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleBookmark={handleToggleBookmark}
        onOpenScreenshot={() => setScreenshotOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onAddBookClick={handleOpenAddBook}
      />

      {/* Main Workspace: PDF Reader & Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Reader Canvas Area */}
        <PdfViewer
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          zoom={zoom}
          theme={theme}
          locale={locale}
          canvasRef={pdfCanvasRef}
          onPageChange={handlePageChange}
          onOpenAddBook={handleOpenAddBook}
        />

        {/* Right Sidebar for Book List (in RTL it is naturally on the right) */}
        <BookSidebar
          books={books}
          currentBook={currentBook}
          locale={locale}
          isOpen={sidebarOpen}
          onSelectBook={handleSelectBook}
          onDeleteBook={handleDeleteBook}
          onAddNewBook={handleOpenAddBook}
        />
      </div>

      {/* Interactive Screenshot Tool Modal */}
      <ScreenshotModal
        isOpen={screenshotOpen}
        pdfCanvasRef={pdfCanvasRef}
        locale={locale}
        onClose={() => setScreenshotOpen(false)}
      />

      {/* Search in Book Modal */}
      <SearchModal
        isOpen={searchOpen}
        pdfDoc={pdfDoc}
        locale={locale}
        onNavigateToPage={handlePageChange}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};
