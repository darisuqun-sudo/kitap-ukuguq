import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseBookRecord {
  id: string;
  user_id?: string;
  title: string;
  file_url?: string;
  cover_url?: string;
  file_size: number;
  total_pages: number;
  last_read_page: number;
  zoom_level: number;
  bookmarks?: number[];
  category?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Upload PDF to Supabase Storage bucket 'books-pdf'
 */
export async function uploadPdfToSupabase(file: File | Blob, path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from('books-pdf')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Supabase PDF upload error:', error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('books-pdf')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Sync book metadata to Supabase 'books' table
 */
export async function syncBookToSupabase(book: SupabaseBookRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('books')
    .upsert({
      id: book.id,
      title: book.title,
      file_url: book.file_url,
      cover_url: book.cover_url,
      file_size: book.file_size,
      total_pages: book.total_pages,
      last_read_page: book.last_read_page,
      zoom_level: book.zoom_level,
      bookmarks: book.bookmarks || [],
      category: book.category || 'ئادەتتىكى',
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Supabase book sync error:', error);
    return false;
  }
  return true;
}

/**
 * Update reading progress on Supabase
 */
export async function syncReadingProgressToSupabase(
  bookId: string,
  page: number,
  zoom: number
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('books')
    .update({
      last_read_page: page,
      zoom_level: zoom,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookId);

  if (error) {
    console.warn('Failed to sync reading progress to Supabase:', error);
  }
}
