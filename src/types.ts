export interface Book {
  id: string;
  title: string;
  fileData?: string; // Base64 data URL
  filePath?: string;
  fileSize: number;
  coverThumbnail: string; // Base64 data URL from page 1
  totalPages: number;
  lastReadPage: number;
  lastReadScrollY?: number;
  zoomLevel: number;
  addedAt: number;
  lastReadAt: number;
  bookmarks?: number[];
  category?: string;
}

export type SupportedLocale = 'ug' | 'ar' | 'tr' | 'en';

export type AppTheme = 'light' | 'dark' | 'sepia';

export interface ScreenshotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
