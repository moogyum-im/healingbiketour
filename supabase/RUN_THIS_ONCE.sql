-- ================================================================
-- 힐링바이크투어 Supabase 전체 스키마
-- Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣기 → Run
-- ================================================================


-- ════════════════════════════════════════════════════════════════
-- 1. PROFILES (회원 프로필)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  name          text,
  avatar_url    text,
  phone         text,
  nationality   text,
  provider      text default 'email',
  role          text default 'user' check (role in ('user', 'admin')),
  marketing_consent      boolean default false,
  marketing_consent_at   timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "본인 프로필 조회"        on public.profiles for select using (auth.uid() = id);
create policy "본인 프로필 수정"        on public.profiles for update using (auth.uid() = id);
create policy "관리자 전체 프로필 조회" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "관리자 전체 프로필 수정" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ════════════════════════════════════════════════════════════════
-- 2. TOURS (투어 상품)
-- ════════════════════════════════════════════════════════════════
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


-- ════════════════════════════════════════════════════════════════
-- 3. TOUR_DATES (투어 일정)
-- ════════════════════════════════════════════════════════════════
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


-- ════════════════════════════════════════════════════════════════
-- 4. BOOKINGS (예약)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.bookings (
  id                 uuid default gen_random_uuid() primary key,
  booking_number     text unique not null,
  user_id            uuid references auth.users(id) not null,
  tour_id            uuid references public.tours(id) not null,
  tour_date_id       uuid references public.tour_dates(id),
  status             text default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  participants       integer not null default 1,
  bike_type          text default 'city' check (bike_type in ('city','mtb','ebike')),
  guide_included     boolean default false,
  insurance_included boolean default false,
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


-- ════════════════════════════════════════════════════════════════
-- 5. PAYMENTS (결제)
-- ════════════════════════════════════════════════════════════════
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


-- ════════════════════════════════════════════════════════════════
-- 6. REVIEWS (리뷰)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.reviews (
  id             uuid default gen_random_uuid() primary key,
  tour_id        uuid references public.tours(id) not null,
  user_id        uuid references auth.users(id) not null,
  booking_id     uuid references public.bookings(id) not null,
  rating         integer not null check (rating between 1 and 5),
  content        text not null,
  images         text[] default '{}',
  credit_issued  boolean default false,
  created_at     timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "리뷰 전체 조회"  on public.reviews for select using (true);
create policy "본인 리뷰 생성"  on public.reviews for insert with check (auth.uid() = user_id);
create policy "관리자 리뷰 관리" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ════════════════════════════════════════════════════════════════
-- 7. CREDITS (크레딧 적립/사용 내역)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.credits (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  amount       integer not null,  -- 양수: 적립, 음수: 사용
  type         text not null check (type in (
    'review_reward',   -- 리뷰 작성 보상 (2,000C)
    'admin_grant',     -- 관리자 수동 지급
    'purchase_used',   -- 결제 시 사용
    'refund',          -- 환불
    'expired'          -- 만료
  )),
  description  text,
  reference_id uuid,        -- booking_id 또는 review_id
  expires_at   timestamptz, -- 적립 시 1년 후
  created_at   timestamptz default now()
);

alter table public.credits enable row level security;

create policy "본인 크레딧 조회" on public.credits
  for select using (auth.uid() = user_id);

create policy "관리자 크레딧 전체 관리" on public.credits
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 크레딧 잔액 뷰 (만료일 고려)
create or replace view public.credit_balances as
  select
    user_id,
    sum(case
      when amount > 0 and (expires_at is null or expires_at > now()) then amount
      else 0
    end) - sum(case when amount < 0 then abs(amount) else 0 end) as balance
  from public.credits
  group by user_id;


-- ════════════════════════════════════════════════════════════════
-- 8. FUNCTIONS & TRIGGERS
-- ════════════════════════════════════════════════════════════════

-- 신규 유저 자동 프로필 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url, provider, marketing_consent, marketing_consent_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'email'),
    (new.raw_user_meta_data->>'marketing_consent')::boolean,
    case
      when (new.raw_user_meta_data->>'marketing_consent')::boolean = true
      then (new.raw_user_meta_data->>'marketing_consent_at')::timestamptz
      else null
    end
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


-- 예약번호 생성 함수 (BK-YYYYMMDD-0001 형식)
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


-- 예약 확정/취소 시 잔여석 자동 반영
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


-- 리뷰 작성 시 크레딧 2,000 자동 지급
create or replace function public.handle_review_credit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.credit_issued then return new; end if;

  insert into public.credits (user_id, amount, type, description, reference_id, expires_at)
  values (
    new.user_id, 2000, 'review_reward', '리뷰 작성 감사 크레딧',
    new.id, now() + interval '1 year'
  );

  update public.reviews set credit_issued = true where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.handle_review_credit();


-- 리뷰 등록/수정 시 투어 평균 별점 자동 업데이트
create or replace function public.update_tour_rating()
returns trigger language plpgsql as $$
begin
  update public.tours
  set
    rating       = (select round(avg(rating)::numeric, 1) from public.reviews where tour_id = new.tour_id),
    review_count = (select count(*) from public.reviews where tour_id = new.tour_id)
  where id = new.tour_id;
  return new;
end;
$$;

drop trigger if exists on_review_rating_update on public.reviews;
create trigger on_review_rating_update
  after insert or update on public.reviews
  for each row execute procedure public.update_tour_rating();


-- ════════════════════════════════════════════════════════════════
-- 9. 초기 데이터 — 힐링 한강 바이크투어
-- ════════════════════════════════════════════════════════════════
insert into public.tours (
  title, title_en, slug, description, short_description,
  category, difficulty, duration_hours, distance_km, max_participants,
  price_krw, price_usd,
  thumbnail_url, images,
  meeting_point, meeting_point_lat, meeting_point_lng,
  includes, excludes, requirements, highlights,
  is_active
) values (
  '힐링 한강 바이크투어',
  'Healing Han River Bike Tour',
  'hangang-healing-tour',
  '자전거 전문가들이 직접 달려보며 설계한 한강 힐링 코스. 당산역에서 출발해 샛강 생태공원을 지나, 반포대교 분수 포인트에서 감동을 느끼고, 한강라면으로 에너지 보충 후 여의도까지 달리는 21.2km 프리미엄 순환 투어입니다.',
  '당산역 출발 · 샛강·반포·여의도 순환 · 3~4시간 · 21.2km · 자전거 3종 선택',
  'city',
  'easy',
  3.5,
  21.2,
  50,
  50000,
  38,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80'
  ],
  '당산역 2번 출구 (Dangsan Station, Exit 2)',
  37.5340,
  126.9012,
  ARRAY[
    '자전거 1대 (로드 / MTB / 전기자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '위치추적 장치',
    '도난 방지 알람',
    '한강라면 (반포대교 포인트)'
  ],
  ARRAY[
    '전문 가이드 (선택 추가, +₩100,000 / 최대 10인)',
    '여행자 보험 (선택 추가, ₩10,000 이하)',
    '서울의 달 기구 탑승권 (현장 구매 가능)'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자'
  ],
  ARRAY[
    '당산역 출발 → 샛강 생태공원 (5.1km)',
    '한강대교 → 반포대교 분수 뷰포인트 (1.6km + 4.3km)',
    '한강라면 포인트 (중간 휴식)',
    '노량대교 → 여의도 한강공원 (2.5km + 5.0km)',
    '서울의 달 기구 탑승 가능 (현장 개별 구매)',
    '블랙박스로 녹화된 21.2km 전 구간 영상 제공',
    '당산역 복귀 (2.7km)'
  ],
  true
)
on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════
-- 10. 관리자 계정 설정
-- ════════════════════════════════════════════════════════════════
-- 회원가입 완료 후 아래 이메일 주소를 본인 것으로 바꿔서 실행하세요:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin@email.com';
