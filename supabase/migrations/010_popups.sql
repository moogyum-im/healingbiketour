create table public.popups (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  image_url   text not null,
  link_url    text,
  position    text not null default 'all',
  is_active   boolean not null default true,
  start_date  date,
  end_date    date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.popups enable row level security;

create policy "Public read active popups" on public.popups
  for select using (true);

create policy "Admin full access popups" on public.popups
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
