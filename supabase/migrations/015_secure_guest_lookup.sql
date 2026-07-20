-- ── 비회원 예약 조회 RLS 구멍 긴급 차단 ──────────────────────
-- Supabase SQL Editor에서 지금 바로 실행하세요.
--
-- 011_guest_bookings.sql에서 만든 "user_id is null" select 정책은
-- anon key를 가진 누구나 전체 비회원 예약자의 이름/연락처/이메일을
-- 조회할 수 있게 하는 취약점이었다. 비회원 예약 조회는 이제
-- src/lib/actions/guest.ts의 getGuestBooking() (admin client +
-- 예약번호·연락처 서버 검증)으로 대체하므로 아래 정책을 제거한다.

drop policy if exists "Allow guest rental booking select" on rental_bookings;
drop policy if exists "Allow guest booking select" on public.bookings;
