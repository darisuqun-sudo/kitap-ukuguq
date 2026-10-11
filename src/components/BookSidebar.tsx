import React, { useState } from 'react';
import { Book, SupportedLocale } from '../types';
import { translations, isRTL } from '../i18n/translations';
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Bookmark,
  Search,
  Sparkles,
} from 'lucide-react';

interface BookSidebarProps {
  books: Book[];
  currentBook: Book | null;
  locale: SupportedLocale;
  isOpen: boolean;
  onSelectBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onAddNewBook: () => void;
}

export const BookSidebar: React.FC<BookSidebarProps> = ({
  books,
  currentBook,
  locale,
  isOpen,
  onSelectBook,
  onDeleteBook,
  onAddNewBook,
}) => {
  const t = translations[locale];
  const rtl = isRTL(locale);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === 'ug' ? 'ug-CN' : locale);
  };

  return (
    <aside
      className={`w-80 md:w-88 border-s border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full z-10 transition-all select-none shadow-sm flex-shrink-0`}
    >
      {/* Top Header of Sidebar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t.myLibrary}</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {books.length}
            </span>
          </h2>
        </div>

        <button
          onClick={onAddNewBook}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
          title={t.addBook}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addBook}</span>
        </button>
      </div>

      {/* Search Filter for Books */}
      {books.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={t.searchBooks}
              className="w-full ps-8 pe-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Book List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {books.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-gray-800/60 flex items-center justify-center text-blue-500 mb-4 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t.noBooksYet}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {t.dragDropHint}
            </p>
            <button
              onClick={onAddNewBook}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              + {t.addBook}
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            ھېچقانداق كىتاب تېپىلمىدى
          </div>
        ) : (
          filteredBooks.map((book) => {
            const isSelected = currentBook?.id === book.id;
            const progress = book.totalPages > 0
              ? Math.round((book.lastReadPage / book.totalPages) * 100)
              : 0;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400/80 dark:border-blue-600/80 shadow-xs'
                    : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/80'
                }`}
              >
                {/* Cover Thumbnail */}
                <div className="w-16 h-22 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-xs flex items-center justify-center relative">
                  {book.coverThumbnail ? (
                    <img
                      src={book.coverThumbnail}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  )}
                  {progress === 100 && (
                    <div className="absolute top-1 end-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3
                      className={`text-xs font-bold truncate leading-tight mb-1 ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    {/* Page info */}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1.5">
                      <span>{t.lastRead}:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {book.lastReadPage} / {book.totalPages} {t.pages}
                      </span>
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      <span>{t.readProgress}</span>
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Delete button (shows on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(t.confirmDelete)) {
                      onDeleteBook(book.id);
                    }
                  }}
                  className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 transition-all"
                  title={t.deleteBook}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
        {books.length} {t.totalBooks}
      </div>
    </aside>
  );
};
