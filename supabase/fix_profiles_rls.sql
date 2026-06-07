-- profiles 공개 조회 허용 (name만 노출, 다른 민감 정보 제외)
-- 리뷰 작성자 이름 표시에 필요
DROP POLICY IF EXISTS "profiles 공개 이름 조회" ON public.profiles;
CREATE POLICY "profiles 공개 이름 조회" ON public.profiles
  FOR SELECT USING (true);
