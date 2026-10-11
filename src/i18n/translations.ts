import { SupportedLocale } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  myLibrary: string;
  addBook: string;
  openFile: string;
  searchBooks: string;
  noBooksYet: string;
  dragDropHint: string;
  pages: string;
  page: string;
  readProgress: string;
  lastRead: string;
  resumeReading: string;
  deleteBook: string;
  confirmDelete: string;
  screenshot: string;
  screenshotInstruction: string;
  copyToClipboard: string;
  copied: string;
  saveImage: string;
  savedSuccess: string;
  zoomIn: string;
  zoomOut: string;
  fitWidth: string;
  fitPage: string;
  prevPage: string;
  nextPage: string;
  singlePage: string;
  doublePage: string;
  toggleTheme: string;
  themeLight: string;
  themeDark: string;
  themeSepia: string;
  searchInBook: string;
  searchPlaceholder: string;
  bookmarks: string;
  addBookmark: string;
  removeBookmark: string;
  noBookmarks: string;
  fullscreen: string;
  exitFullscreen: string;
  readingSpeed: string;
  close: string;
  totalBooks: string;
}

export const translations: Record<SupportedLocale, Translations> = {
  ug: {
    appName: 'كىتابخۇمار',
    appSubtitle: 'ئەقلىي ئىقتىدارلىق PDF كىتاب ئوقۇغۇچ',
    myLibrary: 'كىتاب تىزىملىكى',
    addBook: 'كىتاب قوشۇش',
    openFile: 'PDF ھۆججەت ئېچىش',
    searchBooks: 'كىتاب ئىزدەش...',
    noBooksYet: 'تېخى كىتاب قوشۇلمىدى',
    dragDropHint: 'PDF ھۆججەتنى بۇ يەرگە سۆرەپ تاشلاڭ ياكى يۇقىرىدىكى تۈگمىنى بېسىڭ',
    pages: 'بەت',
    page: 'بەت',
    readProgress: 'ئوقۇلغىنى',
    lastRead: 'ئاخىرقى قېتىم',
    resumeReading: 'ئوقۇغان يېرىدىن باشلاش',
    deleteBook: 'كىتابنى ئۆچۈرۈش',
    confirmDelete: 'بۇ كىتابنى راستىنلا ئۆچۈرەمسىز؟',
    screenshot: 'رەسىمگە تارتىش',
    screenshotInstruction: 'چاشقىنەك بىلەن سۈرەتكە تارتىدىغان رايوننى سىزىپ تاللاڭ',
    copyToClipboard: 'چاپلاش تاختىسىغا كۆچۈرۈش',
    copied: 'كۆچۈرۈلدى!',
    saveImage: 'رەسىمنى ساقلاش',
    savedSuccess: 'ساقلاندى!',
    zoomIn: 'چوڭايتىش',
    zoomOut: 'كىچىكلىتىش',
    fitWidth: 'كەڭلىككە ماسلاش',
    fitPage: 'بەتكە تولۇق ماسلاش',
    prevPage: 'ئالدىنقى بەت',
    nextPage: 'كېيىنكى بەت',
    singlePage: 'يەككە بەت',
    doublePage: 'قوش بەت',
    toggleTheme: 'كۆرۈنۈش ھالىتى',
    themeLight: 'كۈندۈز',
    themeDark: 'كېچە',
    themeSepia: 'قەغەز رەڭگى',
    searchInBook: 'كىتاب ئىچىدىن ئىزدەش',
    searchPlaceholder: 'ئىزدەيدىغان سۆزنى كىرگۈزۈڭ...',
    bookmarks: 'خەتكۈچلەر',
    addBookmark: 'خەتكۈچ قويۇش',
    removeBookmark: 'خەتكۈچنى ئۆچۈرۈش',
    noBookmarks: 'خەتكۈچ يوق',
    fullscreen: 'پۈتۈن ئېكران',
    exitFullscreen: 'ئېكراننى ئەسلىگە كەلتۈرۈش',
    readingSpeed: 'ئوقۇش پىرسەنتى',
    close: 'تاقاش',
    totalBooks: 'جەمئىي كىتاب',
  },
  ar: {
    appName: 'كتاب خمار',
    appSubtitle: 'قارئ الكتب الذكي بصيغة PDF',
    myLibrary: 'مكتبتي',
    addBook: 'إضافة كتاب',
    openFile: 'فتح ملف PDF',
    searchBooks: 'البحث في الكتب...',
    noBooksYet: 'لا توجد كتب مضافة بعد',
    dragDropHint: 'اسحب ملف PDF هنا أو انقر فوق الزر أعلاه',
    pages: 'صفحة',
    page: 'صفحة',
    readProgress: 'المقروء',
    lastRead: 'آخر قراءة',
    resumeReading: 'متابعة القراءة من حيث توقفت',
    deleteBook: 'حذف الكتاب',
    confirmDelete: 'هل أنت متأكد من حذف هذا الكتاب؟',
    screenshot: 'لقطة شاشة',
    screenshotInstruction: 'حدد المنطقة المراد التقاطها بالماوس',
    copyToClipboard: 'نسخ إلى الحافظة',
    copied: 'تم النسخ!',
    saveImage: 'حفظ الصورة',
    savedSuccess: 'تم الحفظ!',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    fitWidth: 'ملاءمة العرض',
    fitPage: 'ملاءمة الصفحة',
    prevPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    singlePage: 'صفحة واحدة',
    doublePage: 'صفحتان',
    toggleTheme: 'السمة',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    themeSepia: 'ورقي (أصفر)',
    searchInBook: 'البحث في الكتاب',
    searchPlaceholder: 'أدخل الكلمة للبحث...',
    bookmarks: 'الإشارات المرجعية',
    addBookmark: 'إضافة إشارة',
    removeBookmark: 'إزالة الإشارة',
    noBookmarks: 'لا توجد إشارات مرجعية',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'إنهاء ملء الشاشة',
    readingSpeed: 'نسبة القراءة',
    close: 'إغلاق',
    totalBooks: 'إجمالي الكتب',
  },
  tr: {
    appName: 'KitapXumar',
    appSubtitle: 'Akıllı Masaüstü PDF Okuyucu',
    myLibrary: 'Kitaplığım',
    addBook: 'Kitap Ekle',
    openFile: 'PDF Dosyası Aç',
    searchBooks: 'Kitaplarda ara...',
    noBooksYet: 'Henüz kitap eklenmedi',
    dragDropHint: 'PDF dosyasını buraya sürükleyip bırakın veya yukarıdaki butona tıklayın',
    pages: 'sayfa',
    page: 'sayfa',
    readProgress: 'İlerleme',
    lastRead: 'Son Okuma',
    resumeReading: 'Kaldığın Yerden Devam Et',
    deleteBook: 'Kitabı Sil',
    confirmDelete: 'Bu kitabı silmek istediğinizden emin misiniz?',
    screenshot: 'Ekran Alıntısı',
    screenshotInstruction: 'Almak istediğiniz alanı fareyle sürükleyerek seçin',
    copyToClipboard: 'Panoya Kopyala',
    copied: 'Kopyalandı!',
    saveImage: 'Resmi Kaydet',
    savedSuccess: 'Kaydedildi!',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    fitWidth: 'Genişliğe Sığdır',
    fitPage: 'Sayfaya Sığdır',
    prevPage: 'Önceki Sayfa',
    nextPage: 'Sonraki Sayfa',
    singlePage: 'Tek Sayfa',
    doublePage: 'Çift Sayfa',
    toggleTheme: 'Tema',
    themeLight: 'Gündüz',
    themeDark: 'Gece',
    themeSepia: 'Kitap Kağıdı (Sepya)',
    searchInBook: 'Kitapta Ara',
    searchPlaceholder: 'Aranacak kelimeyi girin...',
    bookmarks: 'Yer İmleri',
    addBookmark: 'Yer İmi Ekle',
    removeBookmark: 'Yer İmini Kaldır',
    noBookmarks: 'Yer imi bulunamadı',
    fullscreen: 'Tam Ekran',
    exitFullscreen: 'Tam Ekrandan Çık',
    readingSpeed: 'Okuma Yüzdesi',
    close: 'Kapat',
    totalBooks: 'Toplam Kitap',
  },
  en: {
    appName: 'KitabXumar',
    appSubtitle: 'Smart Desktop PDF Reader',
    myLibrary: 'My Library',
    addBook: 'Add Book',
    openFile: 'Open PDF',
    searchBooks: 'Search books...',
    noBooksYet: 'No books added yet',
    dragDropHint: 'Drag & drop a PDF file here or click the button above',
    pages: 'pages',
    page: 'page',
    readProgress: 'Progress',
    lastRead: 'Last read',
    resumeReading: 'Resume Reading',
    deleteBook: 'Delete Book',
    confirmDelete: 'Are you sure you want to delete this book?',
    screenshot: 'Take Screenshot',
    screenshotInstruction: 'Drag with the mouse to select the capture area',
    copyToClipboard: 'Copy to Clipboard',
    copied: 'Copied!',
    saveImage: 'Save Image',
    savedSuccess: 'Saved!',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    fitWidth: 'Fit Width',
    fitPage: 'Fit Page',
    prevPage: 'Previous Page',
    nextPage: 'Next Page',
    singlePage: 'Single Page',
    doublePage: 'Two Pages',
    toggleTheme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSepia: 'Sepia (Paper)',
    searchInBook: 'Search in Book',
    searchPlaceholder: 'Enter search term...',
    bookmarks: 'Bookmarks',
    addBookmark: 'Add Bookmark',
    removeBookmark: 'Remove Bookmark',
    noBookmarks: 'No bookmarks yet',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    readingSpeed: 'Reading Progress',
    close: 'Close',
    totalBooks: 'Total Books',
  },
};

export const isRTL = (locale: SupportedLocale): boolean => {
  return locale === 'ug' || locale === 'ar';
};
