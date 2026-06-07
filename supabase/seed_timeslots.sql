-- 활성 투어마다 오늘부터 14일치 시간 슬롯 생성
-- 각 날짜에 오전(09:00~13:00) / 오후(14:00~18:00) 2개 슬롯, 자전거 10대
DO $$
DECLARE
  v_tour record;
  v_date date;
  v_day_offset int;
BEGIN
  FOR v_tour IN
    SELECT id FROM public.tours WHERE is_active = true
  LOOP
    FOR v_day_offset IN 0..13
    LOOP
      v_date := CURRENT_DATE + v_day_offset;

      -- 오전 슬롯
      INSERT INTO public.tour_dates
        (tour_id, date, start_time, end_time, available_slots, booked_slots, is_available)
      VALUES
        (v_tour.id, v_date, '09:00', '13:00', 10, 0, true)
      ON CONFLICT DO NOTHING;

      -- 오후 슬롯
      INSERT INTO public.tour_dates
        (tour_id, date, start_time, end_time, available_slots, booked_slots, is_available)
      VALUES
        (v_tour.id, v_date, '14:00', '18:00', 10, 0, true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
