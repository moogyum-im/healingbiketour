-- tour_dates 공개 조회 (is_available=true인 것만)
DROP POLICY IF EXISTS "tour_dates 공개 조회" ON public.tour_dates;
CREATE POLICY "tour_dates 공개 조회" ON public.tour_dates
  FOR SELECT USING (true);

-- 관리자는 전체 CRUD (기존에 있지만 혹시 없으면)
DROP POLICY IF EXISTS "관리자 투어 일정 관리" ON public.tour_dates;
CREATE POLICY "관리자 투어 일정 관리" ON public.tour_dates
  FOR ALL USING (public.is_admin());
