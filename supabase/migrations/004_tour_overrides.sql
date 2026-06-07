-- 투어 관리자 수정값 저장 (mock 데이터를 덮어씌움)
CREATE TABLE IF NOT EXISTS tour_overrides (
  slug           text PRIMARY KEY,
  thumbnail_url  text,
  title          text,
  description    text,
  highlights     jsonb,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tour_overrides ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "tour_overrides_public_read" ON tour_overrides
  FOR SELECT USING (true);

-- 관리자만 쓰기
CREATE POLICY "tour_overrides_admin_write" ON tour_overrides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Supabase Storage: tours 버킷 (대시보드에서 public 버킷으로 생성 필요)
-- Storage > New bucket > Name: tours > Public: ON
