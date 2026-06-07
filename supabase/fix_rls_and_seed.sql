-- ============================================================
-- RLS 정책 일괄 수정 + 투어 시드 데이터
-- Supabase SQL Editor에 전체 붙여넣고 실행하세요
-- ============================================================

-- ── 1. is_admin() SECURITY DEFINER 함수 (재귀 방지) ─────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(role, 'user') FROM public.profiles WHERE id = auth.uid();
$$;

-- ── 2. profiles RLS 수정 ────────────────────────────────────
DROP POLICY IF EXISTS "관리자 전체 프로필 조회" ON public.profiles;
DROP POLICY IF EXISTS "관리자 전체 프로필 수정" ON public.profiles;
CREATE POLICY "관리자 전체 프로필 조회" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "관리자 전체 프로필 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ── 3. tours RLS 수정 ───────────────────────────────────────
DROP POLICY IF EXISTS "활성 투어 전체 조회" ON public.tours;
DROP POLICY IF EXISTS "관리자 투어 전체 관리" ON public.tours;
CREATE POLICY "투어 조회" ON public.tours
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "관리자 투어 전체 관리" ON public.tours
  FOR ALL USING (public.is_admin());

-- ── 4. tour_dates RLS 수정 ──────────────────────────────────
DROP POLICY IF EXISTS "관리자 투어 일정 관리" ON public.tour_dates;
CREATE POLICY "관리자 투어 일정 관리" ON public.tour_dates
  FOR ALL USING (public.is_admin());

-- ── 5. bookings RLS 수정 ────────────────────────────────────
DROP POLICY IF EXISTS "관리자 예약 전체 관리" ON public.bookings;
CREATE POLICY "관리자 예약 전체 관리" ON public.bookings
  FOR ALL USING (public.is_admin());

-- ── 6. payments RLS 수정 ────────────────────────────────────
DROP POLICY IF EXISTS "관리자 결제 전체 관리" ON public.payments;
CREATE POLICY "관리자 결제 전체 관리" ON public.payments
  FOR ALL USING (public.is_admin());

-- ── 7. reviews RLS 수정 ─────────────────────────────────────
DROP POLICY IF EXISTS "관리자 리뷰 관리" ON public.reviews;
CREATE POLICY "관리자 리뷰 관리" ON public.reviews
  FOR ALL USING (public.is_admin());

-- ── 8. credits RLS 수정 ─────────────────────────────────────
DROP POLICY IF EXISTS "관리자 크레딧 전체 관리" ON public.credits;
CREATE POLICY "관리자 크레딧 전체 관리" ON public.credits
  FOR ALL USING (public.is_admin());

-- ── 9. tour_overrides RLS 수정 ──────────────────────────────
DROP POLICY IF EXISTS "tour_overrides_admin_write" ON public.tour_overrides;
CREATE POLICY "tour_overrides_admin_write" ON public.tour_overrides
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 10. faqs / notices / guide_applications RLS 수정 ────────
DROP POLICY IF EXISTS "faqs_admin_all" ON public.faqs;
CREATE POLICY "faqs_admin_all" ON public.faqs
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "notices_admin_all" ON public.notices;
CREATE POLICY "notices_admin_all" ON public.notices
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "guide_app_admin_all" ON public.guide_applications;
CREATE POLICY "guide_app_admin_all" ON public.guide_applications
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "관리자 문의 전체 관리" ON public.chat_inquiries;
CREATE POLICY "관리자 문의 전체 관리" ON public.chat_inquiries
  FOR ALL USING (public.is_admin());

-- ── 11. tours 테이블에 options 컬럼 추가 ────────────────────
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS options jsonb;

-- ── 12. 목 투어 시드 데이터 삽입 ────────────────────────────
INSERT INTO public.tours (
  title, title_en, slug, description, short_description,
  category, difficulty, duration_hours, distance_km,
  max_participants, price_krw, price_usd,
  thumbnail_url, images,
  meeting_point, meeting_point_lat, meeting_point_lng,
  includes, excludes, requirements, highlights, options,
  rating, review_count, is_active, created_at, updated_at
) VALUES

-- 한강 바이크투어
(
  '한강 바이크투어', 'Han River Bike Tour', 'hangang-healing-tour',
  '자전거 전문가들이 직접 달려보며 설계한 한강 힐링 코스. 당산역에서 출발해 샛강 생태공원을 지나, 반포대교 분수 포인트에서 감동을 느끼고, 한강라면으로 에너지 보충 후 여의도까지 달리는 프리미엄 순환 투어입니다.',
  '당산역 출발 · 샛강·반포·여의도 순환 · 3~4시간 · 자전거 3종 선택',
  'city', 'easy', 3.5, 21.2, 50, 50000, 38,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80'],
  '당산역 2번 출구 (Dangsan Station, Exit 2)', 37.5340, 126.9012,
  ARRAY['자전거 1대 (로드 / MTB / 전기자전거 중 선택)','헬멧 제공','폰거치대 제공','블랙박스 장착 + 투어 영상 제공','펌프 제공','위치추적 장치','도난 방지 알람','한강라면 (반포대교 포인트)'],
  ARRAY['전문 가이드 (선택 추가, +₩100,000 / 최대 10인)','여행자 보험 (선택 추가, ₩10,000 이하)'],
  ARRAY['기본적인 자전거 탑승이 가능한 분','만 12세 이상 (미성년자는 보호자 동반)','음주 상태 탑승 불가'],
  ARRAY['당산역 출발 → 샛강 생태공원','한강대교 → 반포대교 분수 뷰포인트','한강라면 포인트 (중간 휴식)','노량대교 → 여의도 한강공원','블랙박스로 녹화된 나만의 투어 영상 제공'],
  NULL,
  0, 0, true, '2026-05-01T00:00:00Z', '2026-05-30T00:00:00Z'
),

-- 한강 아라뱃길 바이크투어
(
  '한강 아라뱃길 바이크투어', 'Han River Ara Waterway Bike Tour', 'ara-waterway-tour',
  '당산역에서 출발해 서울식물원, 경인아라뱃길을 따라 아라마루 전망대, 정서진(서해)까지 달리는 장거리 코스.',
  '당산역 출발 · 서울식물원·아라뱃길·정서진(서해) · 왕복/편도 선택',
  'city', 'moderate', 7, 69, 50, 70000, 53,
  '/stop-ara-waterfall.png',
  ARRAY['/stop-ara-dangsan.png','/stop-ara-botanic.png','/stop-ara-port.png','/stop-ara-tower.png','/stop-ara-waterfall.png','/stop-ara-bikeway.png','/stop-ara-jeongseojin.png'],
  '당산역 2번 출구 (Dangsan Station, Exit 2)', 37.5340, 126.9012,
  ARRAY['자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)','헬멧 제공','폰거치대 제공','블랙박스 장착 + 투어 영상 제공','여행자 보험'],
  ARRAY['편도 이용 시 자전거 회수 용달비 (₩80,000, 1회 고정)','전문 가이드 (선택 추가, +₩100,000 / 최대 10인)','개인 식음료'],
  ARRAY['기본적인 자전거 탑승이 가능한 분','만 12세 이상 (미성년자는 보호자 동반)','음주 상태 탑승 불가'],
  ARRAY['당산역 출발 → 서울식물원 (8km)','서울식물원 → 아라항 (+6.5km)','아라마루 전망대 → 정서진 서해 낙조 포인트','왕복 69km / 편도 34.5km 선택 가능'],
  '[{"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 정서진 → 당산역 복귀 · 69km","price_modifier_krw":0,"duration_hours":7},{"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 정서진 도착 · 34.5km · 용달비 ₩80,000 별도","price_modifier_krw":0,"flat_fee_krw":80000,"duration_hours":5}]'::jsonb,
  0, 0, true, '2026-06-05T00:00:00Z', '2026-06-05T00:00:00Z'
),

-- 행주산성 바이크투어
(
  '행주산성 바이크투어', 'Haengju Fortress Bike Tour', 'haengju-fortress-tour',
  '당산역에서 출발해 난지 하늘공원의 꽃밭과 메타세쿼이아 숲을 지나 행주산성까지 달리고, 아라항·서울식물원·선유도공원을 거쳐 한강라면으로 마무리하는 32km 순환 코스.',
  '당산역 출발 · 난지하늘공원·행주산성·선유도 순환 · 32km · 한강라면 포함',
  'cultural', 'moderate', 6.5, 32, 50, 50000, 38,
  '/stop-haengju-fortress.png',
  ARRAY['/stop-ara-dangsan.png','/stop-haengju-nanjido.png','/stop-haengju-fortress.png','/stop-haengju-seonyudo.png','/stop-ramen.jpg'],
  '당산역 2번 출구 (Dangsan Station, Exit 2)', 37.5340, 126.9012,
  ARRAY['자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)','헬멧 제공','폰거치대 제공','블랙박스 장착 + 투어 영상 제공','여행자 보험','한강라면 (선유도 포인트)'],
  ARRAY['전문 가이드 (선택 추가, +₩100,000 / 최대 10인)','개인 식음료'],
  ARRAY['기본적인 자전거 탑승이 가능한 분','만 12세 이상 (미성년자는 보호자 동반)','음주 상태 탑승 불가'],
  ARRAY['당산역 출발 → 난지 하늘공원 (+5km)','난지 하늘공원 → 행주산성 (+6.5km)','행주산성 → 서울식물원 → 선유도공원','한강라면 포함 (투어 가격에 포함!)','선유도공원 → 당산역 귀환 · 32km 완주'],
  NULL,
  0, 0, true, '2026-06-05T00:00:00Z', '2026-06-05T00:00:00Z'
),

-- 임진각 바이크투어
(
  '임진각 바이크투어', 'Imjingak Bike Tour', 'imjingak-tour',
  '당산역에서 출발해 난지 하늘공원, 행주산성, 파주 출판단지, 통일전망대, 헤이리 예술마을을 지나 임진각까지 달리는 편도 75km 장거리 코스.',
  '당산역 출발 · 행주산성·출판단지·통일전망대·헤이리·임진각 · 왕복/편도 선택',
  'cultural', 'hard', 12, 150, 50, 50000, 38,
  '/stop-imjingak.png',
  ARRAY['/stop-ara-dangsan.png','/stop-haengju-nanjido.png','/stop-haengju-fortress.png','/stop-imjingak-chulpandanji.png','/stop-imjingak-tongiltower.png','/stop-imjingak-heyri.png','/stop-imjingak.png'],
  '당산역 2번 출구 (Dangsan Station, Exit 2)', 37.5340, 126.9012,
  ARRAY['자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)','헬멧 제공','폰거치대 제공','블랙박스 장착 + 투어 영상 제공','여행자 보험'],
  ARRAY['편도 이용 시 자전거 회수 용달비 (₩100,000, 1회 고정)','전문 가이드 (선택 추가, +₩100,000 / 최대 10인)','개인 식음료'],
  ARRAY['기본적인 자전거 탑승이 가능한 분','장거리(75km~) 라이딩 경험 권장','만 12세 이상 (미성년자는 보호자 동반)','음주 상태 탑승 불가'],
  ARRAY['당산역 출발 → 난지 하늘공원 (+5km)','난지 하늘공원 → 행주산성 (+7.7km)','행주산성 → 파주 출판단지 (+20km)','출판단지 → 통일전망대 (+12km)','통일전망대 → 헤이리 예술마을 (+1km)','헤이리 예술마을 → 임진각 (+25km)','왕복 150km / 편도 75km 선택 가능'],
  '[{"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 임진각 → 당산역 복귀 · 150km · 소요시간 10시간~15시간","price_modifier_krw":0,"duration_hours":12},{"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 임진각 도착 · 75km · 소요시간 8시간~10시간 · 용달비 ₩100,000 별도","price_modifier_krw":0,"flat_fee_krw":100000,"duration_hours":9}]'::jsonb,
  0, 0, true, '2026-06-07T00:00:00Z', '2026-06-07T00:00:00Z'
),

-- 남해안 해안 라이딩 (비활성)
(
  '남해안 해안 라이딩', 'South Coast Cycling Tour', 'south-coast-tour',
  '탁 트인 남해 바다를 따라 달리는 해안 투어. 곧 오픈됩니다.',
  '시원한 남해 해안선을 달리는 프리미엄 라이딩',
  'coastal', 'moderate', 5, 30, 20, 79000, 60,
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80'],
  '추후 공개', NULL, NULL,
  ARRAY['자전거','헬멧','가이드'], ARRAY['개인 식음료'],
  ARRAY['기본 자전거 탑승 가능자'],
  ARRAY['남해 해안 절경','일몰 포인트'],
  NULL,
  0, 0, false, '2026-05-01T00:00:00Z', '2026-05-30T00:00:00Z'
),

-- 제주 환상 자전거길 (비활성)
(
  '제주 환상 자전거길', 'Jeju Island Cycling Tour', 'jeju-cycling-tour',
  '제주 올레길과 해안도로를 달리는 프리미엄 투어. 곧 오픈됩니다.',
  '제주 해안도로와 오름을 달리는 힐링 라이딩',
  'coastal', 'easy', 6, 40, 15, 129000, 98,
  'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=1200&q=80'],
  '추후 공개', NULL, NULL,
  ARRAY['자전거','헬멧','가이드'], ARRAY['항공/숙박'],
  ARRAY['기본 자전거 탑승 가능자'],
  ARRAY['성산일출봉','해안도로','오름'],
  NULL,
  0, 0, false, '2026-05-01T00:00:00Z', '2026-05-30T00:00:00Z'
)

ON CONFLICT (slug) DO NOTHING;

-- ── 13. credit_balances 뷰 재생성 ───────────────────────────
CREATE OR REPLACE VIEW public.credit_balances AS
  SELECT
    user_id,
    COALESCE(
      SUM(CASE WHEN amount > 0 AND (expires_at IS NULL OR expires_at > now()) THEN amount ELSE 0 END)
      - SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END),
    0) AS balance
  FROM public.credits
  GROUP BY user_id;
