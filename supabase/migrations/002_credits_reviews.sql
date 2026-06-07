-- ============================================================
-- 크레딧 & 리뷰 업그레이드 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- ── 크레딧 거래 내역 테이블 ──────────────────────────────────
create table if not exists public.credits (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  amount       integer not null,                      -- 양수: 적립, 음수: 사용
  type         text not null check (type in (
    'review_reward',   -- 리뷰 작성 보상
    'admin_grant',     -- 관리자 수동 지급
    'purchase_used',   -- 결제 시 사용
    'refund',          -- 환불
    'expired'          -- 만료
  )),
  description  text,
  reference_id uuid,         -- booking_id 또는 review_id
  expires_at   timestamptz,  -- 만료일 (적립 시 1년 후)
  created_at   timestamptz default now()
);

alter table public.credits enable row level security;

create policy "본인 크레딧 조회" on public.credits
  for select using (auth.uid() = user_id);

create policy "관리자 크레딧 전체 관리" on public.credits
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 크레딧 잔액 뷰 ──────────────────────────────────────────
create or replace view public.credit_balances as
  select
    user_id,
    sum(case when amount > 0 and (expires_at is null or expires_at > now()) then amount else 0 end)
      - sum(case when amount < 0 then abs(amount) else 0 end) as balance
  from public.credits
  group by user_id;

-- ── reviews 테이블에 credit_issued 컬럼 추가 ────────────────
alter table public.reviews
  add column if not exists credit_issued boolean default false;

-- ── 리뷰 작성 시 크레딧 자동 지급 트리거 ────────────────────
create or replace function public.handle_review_credit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- 이미 크레딧 지급된 리뷰라면 skip
  if new.credit_issued then
    return new;
  end if;

  -- 크레딧 2,000 지급
  insert into public.credits (user_id, amount, type, description, reference_id, expires_at)
  values (
    new.user_id,
    2000,
    'review_reward',
    '리뷰 작성 감사 크레딧',
    new.id,
    now() + interval '1 year'
  );

  -- credit_issued 플래그 업데이트
  update public.reviews set credit_issued = true where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.handle_review_credit();

-- ── 투어 평점 자동 업데이트 트리거 ──────────────────────────
create or replace function public.update_tour_rating()
returns trigger language plpgsql as $$
begin
  update public.tours
  set
    rating = (select round(avg(rating)::numeric, 1) from public.reviews where tour_id = new.tour_id),
    review_count = (select count(*) from public.reviews where tour_id = new.tour_id)
  where id = new.tour_id;
  return new;
end;
$$;

drop trigger if exists on_review_rating_update on public.reviews;
create trigger on_review_rating_update
  after insert or update on public.reviews
  for each row execute procedure public.update_tour_rating();
