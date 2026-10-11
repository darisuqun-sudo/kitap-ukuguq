-- 1. كىتابلار جەدۋىلىنى قۇرۇش
create table if not exists public.books (
  id text primary key,
  user_id uuid,
  title text not null,
  file_url text,
  cover_url text,
  file_size bigint default 0,
  total_pages integer default 1,
  last_read_page integer default 1,
  zoom_level numeric default 1.15,
  bookmarks integer[] default '{}',
  category text default 'ئادەتتىكى',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. بىخەتەرلىك ھوقۇق سىياسىتى (RLS)
alter table public.books enable row level security;

drop policy if exists "Allow all read" on public.books;
create policy "Allow all read" on public.books for select using (true);

drop policy if exists "Allow all insert" on public.books;
create policy "Allow all insert" on public.books for insert with check (true);

drop policy if exists "Allow all update" on public.books;
create policy "Allow all update" on public.books for update using (true);

drop policy if exists "Allow all delete" on public.books;
create policy "Allow all delete" on public.books for delete using (true);

-- 3. PDF ۋە مۇقاۋا رەسىم باكىتلىرىنى قۇرۇش
insert into storage.buckets (id, name, public)
values ('books-pdf', 'books-pdf', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('books-covers', 'books-covers', true)
on conflict (id) do nothing;
