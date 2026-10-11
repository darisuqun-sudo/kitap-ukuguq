import React from 'react';
import {
  BookOpen,
  Camera,
  Search,
  Sun,
  Moon,
  Coffee,
  Globe,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Bookmark,
  Menu,
  PlusCircle,
} from 'lucide-react';
import { SupportedLocale, AppTheme, Book } from '../types';
import { translations, isRTL } from '../i18n/translations';

interface HeaderProps {
  currentBook: Book | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  theme: AppTheme;
  locale: SupportedLocale;
  sidebarOpen: boolean;
  isFullscreen: boolean;
  isBookmarked: boolean;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onThemeChange: (theme: AppTheme) => void;
  onLocaleChange: (locale: SupportedLocale) => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onToggleBookmark: () => void;
  onOpenScreenshot: () => void;
  onOpenSearch: () => void;
  onAddBookClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBook,
  currentPage,
  totalPages,
  zoom,
  theme,
  locale,
  sidebarOpen,
  isFullscreen,
  isBookmarked,
  onPageChange,
  onZoomChange,
  onThemeChange,
  onLocaleChange,
  onToggleSidebar,
  onToggleFullscreen,
  onToggleBookmark,
  onOpenScreenshot,
  onOpenSearch,
  onAddBookClick,
}) => {
  const t = translations[locale];
  const rtl = isRTL(locale);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 flex items-center justify-between z-20 shadow-xs select-none">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
          title={t.myLibrary}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {currentBook ? currentBook.title : t.appSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onAddBookClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addBook}</span>
        </button>
      </div>

      {/* Middle: PDF Controls when book is active */}
      {currentBook && totalPages > 0 ? (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title={t.prevPage}
            >
              {rtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <span className="text-xs font-medium px-1 text-gray-700 dark:text-gray-300">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= totalPages) onPageChange(val);
                }}
                className="w-12 text-center bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 text-xs py-0.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <span className="mx-1 text-gray-400">/</span>
              <span>{totalPages}</span>
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title={t.nextPage}
            >
              {rtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onZoomChange(Math.max(0.5, +(zoom - 0.15).toFixed(2)))}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title={t.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => onZoomChange(Math.min(3.0, +(zoom + 0.15).toFixed(2)))}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title={t.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={isBookmarked ? t.removeBookmark : t.addBookmark}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      ) : <div />}

      {/* Action Buttons: Screenshot, Search, Theme, Language */}
      <div className="flex items-center gap-2">
        {/* Screenshot / Snipping Tool Button */}
        {currentBook && (
          <button
            onClick={onOpenScreenshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-600/30 transition-colors animate-fade-in"
            title={t.screenshot}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">{t.screenshot}</span>
          </button>
        )}

        {/* Search */}
        {currentBook && (
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            title={t.searchInBook}
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Theme Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onThemeChange('light')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            title={t.themeLight}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onThemeChange('sepia')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'sepia'
                ? 'bg-[#f4e4c1] text-[#7a5528] shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            title={t.themeSepia}
          >
            <Coffee className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            title={t.themeDark}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <button
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors"
            title="تىل تاللاش / Dil / Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {locale === 'ug'
                ? 'ئۇيغۇرچە'
                : locale === 'ar'
                ? 'العربية'
                : locale === 'tr'
                ? 'Türkçe'
                : 'English'}
            </span>
          </button>

          {/* Language dropdown */}
          <div className="absolute left-0 rtl:right-0 rtl:left-auto top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 hidden group-hover:block group-focus-within:block z-50">
            <button
              onClick={() => onLocaleChange('ug')}
              className={`w-full text-right px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 ${
                locale === 'ug' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              ئۇيغۇرچە (RTL)
            </button>
            <button
              onClick={() => onLocaleChange('ar')}
              className={`w-full text-right px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 ${
                locale === 'ar' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              onClick={() => onLocaleChange('tr')}
              className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 ${
                locale === 'tr' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              Türkçe (LTR)
            </button>
            <button
              onClick={() => onLocaleChange('en')}
              className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 ${
                locale === 'en' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          title={isFullscreen ? t.exitFullscreen : t.fullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
