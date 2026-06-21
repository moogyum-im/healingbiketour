-- 렌탈 달력 가용 수량 계산용 함수
-- security definer: RLS 우회하여 모든 예약 조회 (bike_id·날짜·기간만 반환, 개인정보 미포함)
create or replace function public.get_rental_booked_slots(
  p_bike_id  text,
  p_start    date,
  p_end      date
)
returns table (start_date date, duration_days int)
language sql
security definer
stable
set search_path = public
as $$
  select b.start_date, b.duration_days
  from rental_bookings b
  where b.bike_id = p_bike_id
    and b.status in ('pending', 'pending_transfer', 'confirmed')
    and b.start_date >= p_start
    and b.start_date <= p_end;
$$;

grant execute on function public.get_rental_booked_slots to anon, authenticated;
