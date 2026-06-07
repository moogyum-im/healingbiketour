create table if not exists public.chat_inquiries (
  id          uuid default gen_random_uuid() primary key,
  name        text,
  phone       text,
  message     text not null,
  source_page text default '/',
  status      text default 'pending' check (status in ('pending', 'replied', 'closed')),
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.chat_inquiries enable row level security;

create policy "문의 등록" on public.chat_inquiries
  for insert with check (true);

create policy "본인 문의 조회" on public.chat_inquiries
  for select using (auth.uid() = user_id);

create policy "관리자 문의 전체 관리" on public.chat_inquiries
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

alter publication supabase_realtime add table public.chat_inquiries;
