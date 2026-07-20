-- ── 비회원(guest) 예약 지원 ──────────────────────────────────
-- Supabase SQL Editor에서 실행하세요.

-- 1. rental_bookings: 비회원 insert 허용 (user_id IS NULL)
drop policy if exists "Allow guest rental bookings" on rental_bookings;
create policy "Allow guest rental bookings"
  on rental_bookings for insert
  with check (user_id is null);

-- 2. rental_bookings: 비회원 예약 조회는 RLS가 아니라 서버 액션(admin client +
--    예약번호/연락처 검증, src/lib/actions/guest.ts)에서 처리한다.
--    "user_id is null"만으로 select를 열면 누구나 anon key로 전체 비회원
--    예약자의 이름/연락처/이메일을 조회할 수 있게 되므로 절대 추가하지 않는다.

-- 3. bookings: user_id nullable로 변경 (투어 비회원 예약)
alter table public.bookings
  alter column user_id drop not null;

-- 4. bookings: 비회원 insert 허용
drop policy if exists "Allow guest bookings" on public.bookings;
create policy "Allow guest bookings"
  on public.bookings for insert
  with check (user_id is null);

-- 5. bookings: 비회원 예약 조회도 위 2번과 동일한 이유로 RLS select 정책을
--    추가하지 않는다. src/lib/actions/guest.ts의 getGuestBooking()을 사용한다.
