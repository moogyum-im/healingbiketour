-- tours 카테고리 제약조건에 'national' 추가
-- options 컬럼이 없으면 추가

ALTER TABLE public.tours
  DROP CONSTRAINT IF EXISTS tours_category_check;

ALTER TABLE public.tours
  ADD CONSTRAINT tours_category_check
  CHECK (category IN ('city','coastal','mountain','cultural','night','family','national'));

-- options 컬럼 추가 (없는 경우)
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS options jsonb;
