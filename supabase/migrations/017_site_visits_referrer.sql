-- 유입 경로(referrer) 파악용 컬럼 추가
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS referrer text;
