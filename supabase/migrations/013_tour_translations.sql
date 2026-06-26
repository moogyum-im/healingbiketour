-- tours 테이블에 다국어 번역 컬럼 추가
-- 구조: {"en": {"title": "...", "description": "...", ...}, "ja": {...}, "zh-CN": {...}, "zh-TW": {...}}
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS translations jsonb;
