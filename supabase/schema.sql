-- ========================================================
-- «كىتابخۇمار» (KitabXumar) - Supabase Database Schema
-- بۇ SQL كودلىرىنى Supabase نىڭ SQL Editor قورالىدا ئىجرا قىلىڭ
-- ========================================================

-- 1. كىتابلار جەدۋىلىنى قۇرۇش (Books Table)
create table if not exists public.books (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  file_url text,
  cover_url text,
  file_size bigint default 0,
  total_pages integer default 1,
  last_read_page integer default 1,
  zoom_level numeric default 1.15,
  bookmarks integer[] default '{}',
  category text default 'ئادەتتىكى',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. بىخەتەرلىك ھوقۇق سىياسىتى (Row Level Security - RLS)
alter table public.books enable row level security;

-- ھەممە ئادەم ئوقۇشقا ياكى ئۆز كىتابلىرىنى باشقۇرۇشقا رۇخسەت قىلىش سىياسىتى
create policy "Books are viewable by everyone or owner"
  on public.books for select
  using (true);

create policy "Users can insert their own books"
  on public.books for insert
  with check (true);

create policy "Users can update their own books"
  on public.books for update
  using (true);

create policy "Users can delete their own books"
  on public.books for delete
  using (true);

-- 3. Storage Buckets (PDF ھۆججەتلەر ۋە مۇقاۋا رەسىملىرى ئۈچۈن)
-- Supabase Dashboard -> Storage دىن تۆۋەندىكى ئىككى باكىتنى (Bucket) قۇرۇڭ (Public دەپ تەڭشەڭ):
-- 1) books-pdf (PDF ھۆججەتلەر ئۈچۈن)
-- 2) books-covers (مۇقاۋا رەسىملىرى ئۈچۈن)

insert into storage.buckets (id, name, public)
values ('books-pdf', 'books-pdf', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('books-covers', 'books-covers', true)
on conflict (id) do nothing;

-- Storage زىيارەت سىياسىتى
create policy "Public Access to Books PDF"
  on storage.objects for select
  using (bucket_id = 'books-pdf');

create policy "Public Upload to Books PDF"
  on storage.objects for insert
  with check (bucket_id = 'books-pdf');
