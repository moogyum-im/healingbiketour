-- ============================================================
-- 바이크투어 Supabase 스키마
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- ============================================================

-- ── 프로필 테이블 (auth.users 확장) ──────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  name        text,
  avatar_url  text,
  phone       text,
  nationality text,
  provider    text default 'email',
  role        text default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "본인 프로필 조회" on public.profiles for select using (auth.uid() = id);
create policy "본인 프로필 수정" on public.profiles for update using (auth.uid() = id);
create policy "관리자 전체 프로필 조회" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "관리자 전체 프로필 수정" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 투어 테이블 ────────────────────────────────────────────
create table if not exists public.tours (
  id                  uuid default gen_random_uuid() primary key,
  title               text not null,
  title_en            text,
  slug                text unique not null,
  description         text not null,
  short_description   text not null,
  category            text not null check (category in ('city','coastal','mountain','cultural','night','family')),
  difficulty          text not null check (difficulty in ('easy','moderate','hard')),
  duration_hours      numeric not null,
  distance_km         numeric not null,
  max_participants    integer not null default 10,
  price_krw           integer not null,
  price_usd           numeric,
  thumbnail_url       text,
  images              text[] default '{}',
  meeting_point       text not null,
  meeting_point_lat   numeric,
  meeting_point_lng   numeric,
  includes            text[] default '{}',
  excludes            text[] default '{}',
  requirements        text[] default '{}',
  highlights          text[] default '{}',
  rating              numeric default 0,
  review_count        integer default 0,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.tours enable row level security;

create policy "활성 투어 전체 조회" on public.tours for select using (is_active = true);
create policy "관리자 투어 전체 관리" on public.tours for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 투어 일정 테이블 ────────────────────────────────────────
create table if not exists public.tour_dates (
  id               uuid default gen_random_uuid() primary key,
  tour_id          uuid references public.tours(id) on delete cascade not null,
  date             date not null,
  start_time       time not null,
  end_time         time not null,
  available_slots  integer not null,
  booked_slots     integer default 0,
  is_available     boolean default true,
  created_at       timestamptz default now()
);
alter table public.tour_dates enable row level security;

create policy "투어 일정 전체 조회" on public.tour_dates for select using (true);
create policy "관리자 투어 일정 관리" on public.tour_dates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 예약 테이블 ────────────────────────────────────────────
create table if not exists public.bookings (
  id                 uuid default gen_random_uuid() primary key,
  booking_number     text unique not null,
  user_id            uuid references auth.users(id) not null,
  tour_id            uuid references public.tours(id) not null,
  tour_date_id       uuid references public.tour_dates(id),
  status             text default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  participants       integer not null default 1,
  total_amount_krw   integer not null,
  total_amount_usd   numeric,
  currency           text default 'KRW',
  contact_name       text not null,
  contact_email      text not null,
  contact_phone      text not null,
  special_requests   text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.bookings enable row level security;

create policy "본인 예약 조회" on public.bookings for select using (auth.uid() = user_id);
create policy "본인 예약 생성" on public.bookings for insert with check (auth.uid() = user_id);
create policy "본인 예약 수정" on public.bookings for update using (auth.uid() = user_id);
create policy "관리자 예약 전체 관리" on public.bookings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 결제 테이블 ────────────────────────────────────────────
create table if not exists public.payments (
  id                  uuid default gen_random_uuid() primary key,
  booking_id          uuid references public.bookings(id) not null,
  payment_method      text not null,
  portone_payment_id  text unique,
  paypal_order_id     text unique,
  amount_krw          integer not null,
  amount_original     numeric,
  currency            text default 'KRW',
  status              text default 'pending' check (status in ('pending','paid','failed','refunded','partial_refunded')),
  paid_at             timestamptz,
  failed_reason       text,
  receipt_url         text,
  created_at          timestamptz default now()
);
alter table public.payments enable row level security;

create policy "본인 결제 조회" on public.payments for select using (
  exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
);
create policy "본인 결제 생성" on public.payments for insert with check (
  exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
);
create policy "관리자 결제 전체 관리" on public.payments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 리뷰 테이블 ────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default gen_random_uuid() primary key,
  tour_id     uuid references public.tours(id) not null,
  user_id     uuid references auth.users(id) not null,
  booking_id  uuid references public.bookings(id) not null,
  rating      integer not null check (rating between 1 and 5),
  content     text not null,
  images      text[] default '{}',
  created_at  timestamptz default now()
);
alter table public.reviews enable row level security;

create policy "리뷰 전체 조회" on public.reviews for select using (true);
create policy "본인 리뷰 생성" on public.reviews for insert with check (auth.uid() = user_id);
create policy "관리자 리뷰 관리" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 신규 유저 자동 프로필 생성 트리거 ───────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  )
  on conflict (id) do update set
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 예약번호 생성 함수 ──────────────────────────────────────
create or replace function public.generate_booking_number()
returns text language plpgsql as $$
declare
  today text := to_char(now(), 'YYYYMMDD');
  seq   integer;
begin
  select coalesce(count(*), 0) + 1 into seq
  from public.bookings
  where created_at::date = current_date;
  return 'BK-' || today || '-' || lpad(seq::text, 4, '0');
end;
$$;

-- ── 예약 확정 시 tour_dates booked_slots 증가 트리거 ─────────
create or replace function public.handle_booking_confirmed()
returns trigger language plpgsql as $$
begin
  if new.status = 'confirmed' and (old.status is null or old.status != 'confirmed') then
    update public.tour_dates
    set booked_slots = booked_slots + new.participants
    where id = new.tour_date_id;
  end if;
  if new.status = 'cancelled' and old.status = 'confirmed' then
    update public.tour_dates
    set booked_slots = greatest(booked_slots - new.participants, 0)
    where id = new.tour_date_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_booking_status_change on public.bookings;
create trigger on_booking_status_change
  after update on public.bookings
  for each row execute procedure public.handle_booking_confirmed();

-- ── 첫 번째 관리자 계정 설정 방법 ──────────────────────────
-- 회원가입 후 아래 SQL을 실행하여 관리자 권한 부여:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
