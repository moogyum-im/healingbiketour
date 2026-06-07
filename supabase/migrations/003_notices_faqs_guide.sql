-- ── 공지사항 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  content      text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notices_public_read" ON notices
  FOR SELECT USING (is_published = true);

CREATE POLICY "notices_admin_all" ON notices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FAQ ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL,
  category      text NOT NULL DEFAULT '일반',
  display_order int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_public_read" ON faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "faqs_admin_all" ON faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 가이드 지원서 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guide_applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  email          text NOT NULL,
  phone          text NOT NULL,
  english_level  text,
  certifications text,
  experience     text,
  motivation     text,
  status         text NOT NULL DEFAULT 'pending',
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guide_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_app_insert" ON guide_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "guide_app_admin_all" ON guide_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 초기 FAQ 데이터 ─────────────────────────────────────────
INSERT INTO faqs (question, answer, category, display_order) VALUES
  ('자전거를 못 타도 참가할 수 있나요?',
   '기본적인 균형 감각만 있으시면 참가 가능합니다. 저속·평지 위주 코스로 설계되어 있으며, 전문 가이드가 동행해 안전하게 안내해 드립니다. 처음 타시는 분도 걱정 없이 즐기실 수 있습니다.',
   '참가 조건', 0),

  ('나이 또는 체력 제한이 있나요?',
   '만 7세 이상부터 참가 가능합니다(보호자 동반 필수). 건강에 특별한 제한이 없으시면 어르신도 참가 가능하며, 건강 상태가 우려되시는 경우 사전에 문의해 주세요.',
   '참가 조건', 1),

  ('외국인도 참가할 수 있나요?',
   '네, 영어 안내가 가능한 가이드가 함께합니다. 사전 예약 시 "영어 안내 요청"을 선택해 주세요.',
   '참가 조건', 2),

  ('복장과 준비물은 무엇인가요?',
   '편한 운동복과 운동화를 착용해 주세요. 헬멧은 저희가 제공합니다. 물, 선크림, 모자 등 개인 용품을 준비해 주시면 더욱 편하게 즐기실 수 있습니다.',
   '준비물', 3),

  ('점심 또는 식사가 포함되나요?',
   '일부 투어 패키지에는 간식 또는 식사가 포함됩니다. 각 투어 상세 페이지의 "포함 사항"을 확인해 주세요. 대부분의 코스에는 현지 식당 방문 시간이 포함되어 있습니다.',
   '준비물', 4),

  ('투어 소요 시간은 얼마나 되나요?',
   '코스에 따라 3~6시간 정도 소요됩니다. 각 투어 상세 페이지에서 정확한 시간을 확인하실 수 있습니다.',
   '투어 안내', 5),

  ('예약은 어떻게 하나요?',
   '홈페이지에서 원하는 투어를 선택 후 날짜와 인원을 입력하고 카카오페이, 네이버페이, 카드 중 편하신 방법으로 결제하시면 예약이 완료됩니다.',
   '예약·결제', 6),

  ('단체 예약 할인이 있나요?',
   '10인 이상 단체 예약 시 별도 할인이 적용됩니다. 이메일(healingbiketour@gmail.com)로 문의해 주시면 맞춤 견적을 드립니다.',
   '예약·결제', 7),

  ('투어 당일 날씨가 나쁘면 어떻게 되나요?',
   '기상청 기준 악천후(태풍·폭우·폭설 특보) 발령 시 투어가 취소되며 전액 환불됩니다. 가벼운 비나 흐린 날씨의 경우 우비를 착용하고 진행하는 경우도 있으니, 전날 공지를 확인해 주세요.',
   '취소·환불', 8),

  ('취소·환불 정책이 어떻게 되나요?',
   '투어 7일 전까지 100% 환불, 3~6일 전 80%, 2일 전 50%, 1일 전 20%, 당일 취소는 환불 불가입니다. 자세한 내용은 취소 및 환불 정책 페이지를 참고해 주세요.',
   '취소·환불', 9),

  ('자전거 보험이 적용되나요?',
   '투어 중 발생하는 사고에 대비해 여행자 보험이 적용됩니다. 단, 개인 과실로 인한 사고는 보험 적용 범위가 제한될 수 있습니다. 안전 수칙을 꼭 지켜주세요.',
   '안전·보험', 10),

  ('투어 중 찍은 사진이나 영상을 받을 수 있나요?',
   '일부 투어는 블랙박스 영상 또는 가이드 촬영 사진을 제공합니다. 투어 상세 페이지의 "포함 사항"을 확인해 주세요.',
   '투어 안내', 11)
ON CONFLICT DO NOTHING;
