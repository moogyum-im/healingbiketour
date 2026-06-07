-- tours 스토리지 버킷 설정
INSERT INTO storage.buckets (id, name, public)
VALUES ('tours', 'tours', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 공개 조회 허용
DROP POLICY IF EXISTS "tours 사진 공개 조회" ON storage.objects;
CREATE POLICY "tours 사진 공개 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'tours');

-- 관리자만 업로드/삭제 허용
DROP POLICY IF EXISTS "관리자 tours 사진 업로드" ON storage.objects;
CREATE POLICY "관리자 tours 사진 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tours' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "관리자 tours 사진 수정" ON storage.objects;
CREATE POLICY "관리자 tours 사진 수정" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tours' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "관리자 tours 사진 삭제" ON storage.objects;
CREATE POLICY "관리자 tours 사진 삭제" ON storage.objects
  FOR DELETE USING (bucket_id = 'tours' AND auth.role() = 'authenticated');
