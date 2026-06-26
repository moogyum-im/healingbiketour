-- tours 테이블에 sort_order 컬럼 추가
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 999;

-- options 컬럼 추가 (없는 경우)
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS options jsonb;

-- 카테고리 제약조건에 national 추가
ALTER TABLE public.tours
  DROP CONSTRAINT IF EXISTS tours_category_check;
ALTER TABLE public.tours
  ADD CONSTRAINT tours_category_check
  CHECK (category IN ('city','coastal','mountain','cultural','night','family','national'));

-- 기존 투어 순서 초기 세팅 (slug 기준)
UPDATE public.tours SET sort_order = CASE slug
  WHEN 'hangang-healing-tour'   THEN 1
  WHEN 'ara-waterway-tour'      THEN 2
  WHEN 'haengju-fortress-tour'  THEN 3
  WHEN 'imjingak-tour'          THEN 4
  WHEN 'peace-nuri-1'           THEN 5
  WHEN 'olympic-park-tour'      THEN 6
  WHEN 'chuncheon-lakeside-tour' THEN 7
  WHEN 'national-cycling-route' THEN 8
  ELSE 999
END;
