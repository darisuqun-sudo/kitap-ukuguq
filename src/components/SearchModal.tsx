import React, { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import * as pdfjsLib from 'pdfjs-dist';

interface SearchModalProps {
  isOpen: boolean;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  locale: SupportedLocale;
  onNavigateToPage: (page: number) => void;
  onClose: () => void;
}

interface SearchResult {
  pageNumber: number;
  snippet: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  pdfDoc,
  locale,
  onNavigateToPage,
  onClose,
}) => {
  const t = translations[locale];
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !pdfDoc) return;

    setIsSearching(true);
    setResults([]);

    const foundResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();

    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        if (pageText.toLowerCase().includes(lowerQuery)) {
          // Extract a snippet around the match
          const matchIndex = pageText.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(pageText.length, matchIndex + lowerQuery.length + 30);
          const snippet = (start > 0 ? '...' : '') + pageText.substring(start, end) + (end < pageText.length ? '...' : '');

          foundResults.push({
            pageNumber: i,
            snippet,
          });
        }
      }
      setResults(foundResults);
    } catch (err) {
      console.error('Error searching in PDF:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            <span>{t.searchInBook}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            {isSearching ? 'ئىزدەۋاتىدۇ...' : 'ئىزدەش'}
          </button>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isSearching ? (
            <div className="text-center py-8 text-xs text-gray-400">
              كىتابتىن ئىزدەۋاتىدۇ، سەل كۈتۈڭ...
            </div>
          ) : results.length > 0 ? (
            results.map((res, index) => (
              <div
                key={index}
                onClick={() => {
                  onNavigateToPage(res.pageNumber);
                  onClose();
                }}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                  <span>{res.pageNumber}-بەت</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-mono">
                  {res.snippet}
                </p>
              </div>
            ))
          ) : query && !isSearching ? (
            <div className="text-center py-8 text-xs text-gray-400">
              ماس كېلىدىغان تېكىست تېپىلمىدى
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
