-- 방문자 수 집계용 테이블
-- 미들웨어에서 방문자당 하루 1건만 기록 (쿠키 기반 중복 방지)
CREATE TABLE IF NOT EXISTS public.site_visits (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_visits_created_at_idx ON public.site_visits (created_at);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "누구나 방문 기록 추가" ON public.site_visits;
CREATE POLICY "누구나 방문 기록 추가" ON public.site_visits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "관리자 방문 기록 조회" ON public.site_visits;
CREATE POLICY "관리자 방문 기록 조회" ON public.site_visits
  FOR SELECT USING (public.is_admin());
