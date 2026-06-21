-- 자전거 렌탈 예약 테이블
create table if not exists rental_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  bike_id text not null,
  bike_name text not null,
  bike_brand text not null,
  start_date date not null,
  duration_days int not null check (duration_days >= 1),
  daily_rate_krw int not null,
  total_amount_krw int not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  special_requests text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table rental_bookings enable row level security;

-- 본인 예약 조회
create policy "Users can view own rental bookings"
  on rental_bookings for select
  using (auth.uid() = user_id);

-- 예약 생성
create policy "Users can create rental bookings"
  on rental_bookings for insert
  with check (auth.uid() = user_id);

-- 관리자 전체 관리
create policy "Admins can manage all rental bookings"
  on rental_bookings for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
