import { Book } from '../types';

const DB_NAME = 'KitabXumarDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const BLOBS_STORE = 'pdf_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const books: Book[] = request.result || [];
      // Sort by lastReadAt descending
      books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
      resolve(books);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveBook(book: Book, pdfData?: Blob | ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE, BLOBS_STORE], 'readwrite');
    const booksStore = tx.objectStore(BOOKS_STORE);
    booksStore.put(book);

    if (pdfData) {
      const blobsStore = tx.objectStore(BLOBS_STORE);
      blobsStore.put({ id: book.id, data: pdfData });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBookBlob(bookId: string): Promise<ArrayBuffer | Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS_STORE, 'readonly');
    const store = tx.objectStore(BLOBS_STORE);
    const request = store.get(bookId);
    request.onsuccess = () => {
      if (request.result && request.result.data) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateBookProgress(
  bookId: string,
  page: number,
  scrollY: number = 0,
  zoom: number = 1.0
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.get(bookId);

    request.onsuccess = () => {
      const book = request.result as Book;
      if (book) {
        book.lastReadPage = page;
        book.lastReadScrollY = scrollY;
        book.zoomLevel = zoom;
        book.lastReadAt = Date.now();
        store.put(book);
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function toggleBookmark(bookId: string, page: number): Promise<number[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.get(bookId);

    request.onsuccess = () => {
      const book = request.result as Book;
      let bookmarks = book.bookmarks || [];
      if (bookmarks.includes(page)) {
        bookmarks = bookmarks.filter((p) => p !== page);
      } else {
        bookmarks = [...bookmarks, page].sort((a, b) => a - b);
      }
      book.bookmarks = bookmarks;
      store.put(book);
      resolve(bookmarks);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBook(bookId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE, BLOBS_STORE], 'readwrite');
    tx.objectStore(BOOKS_STORE).delete(bookId);
    tx.objectStore(BLOBS_STORE).delete(bookId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
