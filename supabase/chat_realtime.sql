-- 채팅 세션
create table if not exists public.chat_sessions (
  id          uuid default gen_random_uuid() primary key,
  name        text,
  phone       text,
  source_page text default '/',
  status      text default 'waiting' check (status in ('waiting', 'active', 'closed')),
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

-- 채팅 메시지
create table if not exists public.chat_messages (
  id         uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  content    text not null,
  sender     text not null check (sender in ('user', 'admin')),
  created_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "세션 생성" on public.chat_sessions for insert with check (true);
create policy "세션 조회" on public.chat_sessions for select using (true);
create policy "관리자 세션 관리" on public.chat_sessions for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "메시지 생성" on public.chat_messages for insert with check (true);
create policy "메시지 조회" on public.chat_messages for select using (true);

alter publication supabase_realtime add table public.chat_sessions;
alter publication supabase_realtime add table public.chat_messages;
