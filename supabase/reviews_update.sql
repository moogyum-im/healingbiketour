-- 1. booking_id nullable
ALTER TABLE public.reviews ALTER COLUMN booking_id DROP NOT NULL;

-- 2. images 컬럼 추가 (없는 경우)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS images text[];

-- 3. 리뷰 RLS 재설정
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "리뷰 공개 조회" ON public.reviews;
CREATE POLICY "리뷰 공개 조회" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "본인 리뷰 생성" ON public.reviews;
CREATE POLICY "본인 리뷰 생성" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "본인 리뷰 수정" ON public.reviews;
CREATE POLICY "본인 리뷰 수정" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "본인 리뷰 삭제" ON public.reviews;
CREATE POLICY "본인 리뷰 삭제" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "관리자 리뷰 삭제" ON public.reviews;
CREATE POLICY "관리자 리뷰 삭제" ON public.reviews
  FOR ALL USING (public.is_admin());

-- 4. reviews Storage 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "리뷰 사진 공개 조회" ON storage.objects;
CREATE POLICY "리뷰 사진 공개 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');

DROP POLICY IF EXISTS "로그인 사용자 리뷰 사진 업로드" ON storage.objects;
CREATE POLICY "로그인 사용자 리뷰 사진 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reviews' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "본인 리뷰 사진 삭제" ON storage.objects;
CREATE POLICY "본인 리뷰 사진 삭제" ON storage.objects
  FOR DELETE USING (bucket_id = 'reviews' AND auth.uid()::text = (storage.foldername(name))[1]);
