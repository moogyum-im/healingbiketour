-- 렌탈 날짜 × 기종별 가용 수량 관리
create table if not exists rental_availability (
  date            date    not null,
  bike_id         text    not null,
  available_count int     not null default 0 check (available_count >= 0),
  is_available    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (date, bike_id)
);

alter table rental_availability enable row level security;

-- 누구나 읽기 (위젯 달력 표시용)
create policy "Public read rental_availability"
  on rental_availability for select using (true);

-- 관리자만 쓰기
create policy "Admin manage rental_availability"
  on rental_availability for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
