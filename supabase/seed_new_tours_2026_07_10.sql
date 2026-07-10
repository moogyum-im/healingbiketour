-- 2026-07-10 신규 투어 DB 등록 SQL
-- 대상: 양수리, 보라매공원, 청계천, 서울숲, 난지 하늘공원 (5개)
-- Supabase SQL Editor에서 실행 (중복 실행 안전: ON CONFLICT DO UPDATE)

INSERT INTO public.tours (
  title, title_en, slug, description, short_description,
  category, difficulty, duration_hours, distance_km, max_participants,
  price_krw, price_usd, thumbnail_url, images,
  meeting_point, meeting_point_lat, meeting_point_lng,
  includes, excludes, requirements, highlights,
  options, sort_order, is_active,
  created_at, updated_at
) VALUES

-- ① 양수리 바이크투어 (편도 51km, 왕복 102km)
(
  '양수리 바이크투어',
  'Yangsu Bike Tour',
  'yangsu-tour',
  '당산역에서 출발해 한강을 거슬러 올라 잠실·미사리·팔당댐·세미원을 지나 두물머리까지 달리는 편도 51km 장거리 코스. 두 강(북한강·남한강)이 만나는 두물머리의 새벽 절경은 이 투어의 하이라이트입니다. 전기자전거 및 일반 고급 자전거 선택 가능, 왕복(102km)·편도(51km) 옵션 제공.',
  '당산역 출발 · 잠실·미사리·팔당댐·세미원·두물머리 · 편도 51km / 왕복 102km',
  'cultural',
  'hard',
  10,
  102,
  8,
  105000,
  80,
  '/stop-chuncheon-dumulmeori.png',
  ARRAY[
    '/stop-ara-dangsan.png',
    '/stop-yangsu-jamsil-night.png',
    '/stop-yangsu-misari.png',
    '/stop-yangsu-paldang.png',
    '/stop-yangsu-semiwon-bridge.png',
    '/stop-yangsu-dumulmeori-dawn.png'
  ],
  '당산역 4번 출구 (Dangsan Station, Exit 4)',
  37.5340,
  126.9012,
  ARRAY[
    '전문 가이드 1명',
    '자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '운영자 배상책임보험 가입',
    '식사 1식 (점심)',
    '한강라면 (반포대교 포인트)',
    '음료 제공'
  ],
  ARRAY[
    '편도 이용 시 자전거 회수 용달비 (₩80,000, 1회 고정)',
    '개인 간식·추가 식음료'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '8인 이상 출발 (최소 인원 미충족 시 일정 조율)',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자 참가 제한'
  ],
  ARRAY[
    '당산역 출발 → 샛강 생태공원 (+2km) · 도심 속 생태 하천',
    '샛강 → 반포대교 (+7.5km) · 세빛섬·분수 야경 뷰포인트',
    '반포대교 → 잠실 (+9.5km) · 잠실대교 야경 포인트',
    '잠실 → 미사리 조정경기장 (+16km) · 수상레포츠 명소',
    '미사리 → 팔당댐 (+4km) · 팔당호 절경과 산악 뷰',
    '팔당댐 → 두물머리·세미원 (+12km) · 두 강이 만나는 비경·연꽃정원',
    '편도 51km / 왕복 102km 선택 가능',
    '식사 1식 + 한강라면 + 음료 포함'
  ],
  '[
    {"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 두물머리 → 당산역 복귀 · 102km · 소요 10~12시간","price_modifier_krw":0,"duration_hours":11},
    {"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 두물머리 도착 · 51km · 소요 7~8시간 · 자전거 회수 용달비 ₩80,000 별도","price_modifier_krw":0,"flat_fee_krw":80000,"duration_hours":7}
  ]'::jsonb,
  9,
  true,
  '2026-07-10T00:00:00Z',
  '2026-07-10T00:00:00Z'
),

-- ② 보라매공원 바이크투어 (34km 순환)
(
  '보라매공원 바이크투어',
  'Boramae Park Bike Tour',
  'boramae-park-tour',
  '당산역에서 출발해 안양천 합수부를 따라 양천 양궁장에서 특별한 양궁 체험을 즐기고, 장미꽃 가득한 도림천 산책로를 지나 서울 서남권 최대 공원인 보라매공원까지 달리는 감성 순환 코스. 전문 가이드, 식사 1식, 한강라면, 음료, 양궁 체험이 모두 포함된 특별 투어입니다.',
  '당산역 출발 · 안양합수부·양천양궁장·도림천·보라매공원 순환 · 5~7시간 · 양궁체험 포함',
  'city',
  'easy',
  6,
  34,
  8,
  93000,
  70,
  '/stop-boramae-park-night.png',
  ARRAY[
    '/stop-ara-dangsan.png',
    '/stop-boramae-anyang.png',
    '/stop-boramae-archery.png',
    '/stop-boramae-dorimcheon.png',
    '/stop-boramae-park-night.png',
    '/stop-boramae-park.png'
  ],
  '당산역 4번 출구 (Dangsan Station, Exit 4)',
  37.5340,
  126.9012,
  ARRAY[
    '전문 가이드 1명',
    '자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '운영자 배상책임보험 가입',
    '식사 1식 (점심)',
    '한강라면 (한강 포인트)',
    '음료 제공',
    '양천 양궁장 양궁 체험'
  ],
  ARRAY[
    '편도 이용 시 자전거 회수 용달비 (₩80,000, 1회 고정)',
    '개인 간식·추가 식음료'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '8인 이상 출발 (최소 인원 미충족 시 일정 조율)',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자 참가 제한'
  ],
  ARRAY[
    '당산역 출발 → 안양합수부 · 한강 자전거도로 시작점',
    '안양합수부 → 양천 양궁장 · 전문 양궁 체험 (포함!)',
    '양천 양궁장 → 도림천 산책로 · 장미꽃 가득한 도심 하천',
    '도림천 → 보라매공원 · 야경 분수·산책로 힐링',
    '왕복 34km / 편도 17km 선택 가능',
    '양궁 체험 + 식사 1식 + 한강라면 + 음료 포함'
  ],
  '[
    {"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 보라매공원 → 도림천 → 당산역 복귀 · 약 34km · 소요 6~7시간","price_modifier_krw":0,"duration_hours":6},
    {"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 보라매공원 도착 · 약 17km · 소요 5시간 · 자전거 회수 용달비 ₩80,000 별도","price_modifier_krw":0,"flat_fee_krw":80000,"duration_hours":5}
  ]'::jsonb,
  10,
  true,
  '2026-07-10T00:00:00Z',
  '2026-07-10T00:00:00Z'
),

-- ③ 청계천 바이크투어 (40km)
(
  '청계천 바이크투어',
  'Cheonggyecheon Stream Bike Tour',
  'cheonggyecheon-tour',
  '당산역에서 출발해 여의도를 지나 청계광장까지 달리고, 도심을 흐르는 청계천 산책로를 따라 용두공원·살곶이공원까지 탐방하는 40km 도심 역사 코스. 한강과 청계천을 모두 즐길 수 있는 특별한 투어로, 전문 가이드, 식사 1식, 한강라면, 음료가 포함됩니다.',
  '당산역 출발 · 여의도·청계천·용두공원·살곶이공원 · 40km · 가이드·식사 포함',
  'cultural',
  'moderate',
  6,
  40,
  8,
  93000,
  70,
  '/stop-cheonggyecheon-stream.png',
  ARRAY[
    '/stop-ara-dangsan.png',
    '/stop-seoulforest-ferry.png',
    '/stop-cheonggyecheon-stream.png',
    '/stop-cheonggyecheon-yongdu.png',
    '/stop-cheonggyecheon-salgoji.png'
  ],
  '당산역 4번 출구 (Dangsan Station, Exit 4)',
  37.5340,
  126.9012,
  ARRAY[
    '전문 가이드 1명',
    '자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '운영자 배상책임보험 가입',
    '식사 1식 (점심)',
    '한강라면 (한강 포인트)',
    '음료 제공'
  ],
  ARRAY[
    '개인 간식·추가 식음료'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '8인 이상 출발 (최소 인원 미충족 시 일정 조율)',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자 참가 제한'
  ],
  ARRAY[
    '당산역 출발 → 여의도 한강공원 (+3km) · 한강 라이딩 시작',
    '여의도 → 청계광장 (+10km) · 청계천 출발점·역사 산책로',
    '청계광장 → 용두공원 (+7km) · 청계천 산책로 라이딩',
    '용두공원 → 살곶이공원 (+3km) · 중랑천 합류 지점',
    '총 40km (왕복 순환)',
    '식사 1식 + 한강라면 + 음료 포함'
  ],
  '[
    {"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 살곶이공원 → 당산역 복귀 · 약 40km · 소요 5~8시간","price_modifier_krw":0,"duration_hours":6},
    {"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 살곶이공원 도착 · 약 20km · 소요 4~5시간 · 자전거 회수 용달비 ₩80,000 별도","price_modifier_krw":0,"flat_fee_krw":80000,"duration_hours":4}
  ]'::jsonb,
  11,
  true,
  '2026-07-10T00:00:00Z',
  '2026-07-10T00:00:00Z'
),

-- ④ 서울숲 바이크투어 (34km 순환)
(
  '서울숲 바이크투어',
  'Seoul Forest Bike Tour',
  'seoul-forest-tour',
  '당산역에서 출발해 샛강 생태공원, 반포대교를 지나 도심 속 힐링 공간인 서울숲까지 달리고, 여의도 한강공원을 거쳐 당산역으로 돌아오는 왕복 34km 순환 코스. 전문 가이드, 식사 1식, 한강라면, 음료가 모두 포함된 알찬 반일~하루 투어입니다. 전기자전거 및 일반 고급 자전거 중 선택 가능.',
  '당산역 출발 · 샛강·반포대교·서울숲·여의도 순환 · 왕복 34km · 가이드·식사 포함',
  'city',
  'easy',
  6,
  34,
  8,
  93000,
  70,
  '/stop-seoulforest-park.png',
  ARRAY[
    '/stop-ara-dangsan.png',
    '/stop-chuncheon-banpo.png',
    '/stop-seoulforest-park.png',
    '/stop-seoulforest-ferry.png'
  ],
  '당산역 4번 출구 (Dangsan Station, Exit 4)',
  37.5340,
  126.9012,
  ARRAY[
    '전문 가이드 1명',
    '자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '운영자 배상책임보험 가입',
    '식사 1식 (점심)',
    '한강라면 (반포대교 포인트)',
    '음료 제공'
  ],
  ARRAY[
    '편도 이용 시 자전거 회수 용달비 (₩80,000, 1회 고정)',
    '개인 간식·추가 식음료'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '8인 이상 출발 (최소 인원 미충족 시 일정 조율)',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자 참가 제한'
  ],
  ARRAY[
    '당산역 출발 → 샛강 생태공원 (+2km) · 도심 속 생태 하천',
    '샛강 → 반포대교 (+7.5km) · 세빛섬·분수 야경 뷰포인트',
    '반포대교 → 서울숲 (+7.5km) · 사계절 아름다운 도심 숲',
    '서울숲 → 여의도 한강공원 (복귀) · 한강버스 뷰포인트',
    '한강라면 포함 (반포대교 포인트)',
    '왕복 34km / 편도 17km 선택 가능'
  ],
  '[
    {"id":"roundtrip","label":"왕복","label_en":"Round Trip","description":"당산역 출발 → 서울숲 → 여의도 → 당산역 복귀 · 34km · 소요 6~7시간","price_modifier_krw":0,"duration_hours":6},
    {"id":"oneway","label":"편도","label_en":"One Way","description":"당산역 출발 → 서울숲 도착 · 17km · 소요 4~5시간 · 자전거 회수 용달비 ₩80,000 별도","price_modifier_krw":0,"flat_fee_krw":80000,"duration_hours":5}
  ]'::jsonb,
  11,
  true,
  '2026-07-10T00:00:00Z',
  '2026-07-10T00:00:00Z'
),

-- ⑤ 난지 하늘공원 바이크투어 (31km 순환)
(
  '난지 하늘공원 바이크투어',
  'Nanji Sky Park Bike Tour',
  'nanji-sky-park-tour',
  '당산역에서 출발해 여의도·반포대교를 거쳐 망원 한강공원까지 달리고, 코스모스 꽃밭이 펼쳐지는 난지천공원과 메타세쿼이아·라벤더길로 유명한 하늘공원을 탐방한 뒤 선유도 야경을 감상하며 당산역으로 돌아오는 31km 순환 코스. 전문 가이드, 식사 1식, 한강라면, 음료가 모두 포함된 알찬 반일~하루 투어입니다.',
  '당산역 출발 · 여의도·반포대교·망원·난지하늘공원·선유도 순환 · 31km · 가이드·식사 포함',
  'city',
  'easy',
  6,
  31,
  8,
  93000,
  70,
  '/stop-nanji-seonyudo.png',
  ARRAY[
    '/stop-dangsanstation.jpg',
    '/stop-banpobridge.png',
    '/stop-nanji-mangwon.png',
    '/stop-nanji-cosmos.png',
    '/stop-nanji-skypark.png',
    '/stop-nanji-seonyudo.png'
  ],
  '당산역 4번 출구 (Dangsan Station, Exit 4)',
  37.5340,
  126.9012,
  ARRAY[
    '전문 가이드 1명',
    '자전거 1대 (전기자전거 / 일반 고급 자전거 중 선택)',
    '헬멧 제공',
    '폰거치대 제공',
    '블랙박스 장착 + 투어 영상 제공',
    '펌프 제공',
    '운영자 배상책임보험 가입',
    '식사 1식 (점심)',
    '한강라면 (반포대교 포인트)',
    '음료 제공'
  ],
  ARRAY[
    '개인 간식·추가 식음료'
  ],
  ARRAY[
    '기본적인 자전거 탑승이 가능한 분',
    '8인 이상 출발 (최소 인원 미충족 시 일정 조율)',
    '만 12세 이상 (미성년자는 보호자 동반)',
    '음주 상태 탑승 불가',
    '심장 질환, 임산부 등 격렬한 신체활동 제한자 참가 제한'
  ],
  ARRAY[
    '당산역 출발 → 여의도 한강공원 (+2.5km) · 한강 라이딩 시작',
    '여의도 → 반포대교 (+7.5km) · 달빛무지개분수 뷰포인트',
    '반포대교 → 망원 한강공원 (+12km) · 해군 함정 포토스팟',
    '망원 → 난지천 코스모스밭 (+3km) · 봄 유채꽃·가을 코스모스 절경',
    '난지천 → 하늘공원 · 메타세쿼이아·라벤더길 힐링',
    '선유도 야경 경유 후 당산역 귀환 · 31km 순환',
    '식사 1식 + 한강라면 + 음료 포함'
  ],
  '[
    {"id":"roundtrip","label":"순환 코스","label_en":"Loop Route","description":"당산역 출발 → 여의도 → 반포대교 → 망원 → 난지 하늘공원 → 선유도 → 당산역 복귀 · 31km · 소요 5~8시간","price_modifier_krw":0,"duration_hours":6}
  ]'::jsonb,
  12,
  true,
  '2026-07-10T00:00:00Z',
  '2026-07-10T00:00:00Z'
)

ON CONFLICT (slug) DO UPDATE SET
  title             = EXCLUDED.title,
  title_en          = EXCLUDED.title_en,
  description       = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category          = EXCLUDED.category,
  difficulty        = EXCLUDED.difficulty,
  duration_hours    = EXCLUDED.duration_hours,
  distance_km       = EXCLUDED.distance_km,
  max_participants  = EXCLUDED.max_participants,
  price_krw         = EXCLUDED.price_krw,
  price_usd         = EXCLUDED.price_usd,
  thumbnail_url     = EXCLUDED.thumbnail_url,
  images            = EXCLUDED.images,
  meeting_point     = EXCLUDED.meeting_point,
  meeting_point_lat = EXCLUDED.meeting_point_lat,
  meeting_point_lng = EXCLUDED.meeting_point_lng,
  includes          = EXCLUDED.includes,
  excludes          = EXCLUDED.excludes,
  requirements      = EXCLUDED.requirements,
  highlights        = EXCLUDED.highlights,
  options           = EXCLUDED.options,
  sort_order        = EXCLUDED.sort_order,
  is_active         = EXCLUDED.is_active,
  updated_at        = EXCLUDED.updated_at;
