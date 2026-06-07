-- 활성화된 투어마다 리뷰 2개씩 삽입
-- 기존 유저 2명을 재활용 (없으면 1명으로)
DO $$
DECLARE
  v_u1 uuid;
  v_u2 uuid;
  v_tour record;
  reviews_data record;

  type_reviews text[][] := ARRAY[
    ARRAY['5', '정말 훌륭한 투어였어요! 가이드 선생님도 너무 친절하시고 한강 경치가 아름다웠습니다. 꼭 다시 올게요 😊'],
    ARRAY['4', '처음 자전거 투어를 해봤는데 생각보다 훨씬 재미있었어요. 코스도 적당하고 설명도 자세해서 좋았습니다.'],
    ARRAY['5', '외국인 친구들과 함께 왔는데 영어 가이드도 완벽했고 모두 너무 만족했어요. 서울 여행에서 최고의 경험!'],
    ARRAY['5', '한강을 이렇게 다양한 각도로 즐길 수 있다니 몰랐어요. 중간중간 쉬는 곳도 잘 마련되어 있고 전반적으로 완벽한 투어!'],
    ARRAY['4', '사진도 많이 찍어주시고 안전하게 진행해 주셔서 감사합니다. 자전거 상태도 너무 좋았어요. 강추!'],
    ARRAY['5', '가족들과 함께 와서 정말 좋은 추억 만들었어요. 아이들도 전혀 힘들어하지 않고 즐겁게 달렸습니다!']
  ];

BEGIN
  -- 첫 번째, 두 번째 유저 ID 가져오기
  SELECT id INTO v_u1 FROM auth.users ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_u2 FROM auth.users ORDER BY created_at ASC OFFSET 1 LIMIT 1;

  -- 유저가 1명뿐이면 같은 ID 사용 (review 2개 내용만 다름)
  IF v_u2 IS NULL THEN
    v_u2 := v_u1;
  END IF;

  IF v_u1 IS NULL THEN
    RAISE NOTICE '등록된 유저가 없어 리뷰를 삽입할 수 없습니다.';
    RETURN;
  END IF;

  FOR v_tour IN
    SELECT id, slug FROM public.tours WHERE is_active = true ORDER BY created_at
  LOOP
    -- 리뷰가 이미 있으면 건너뜀
    IF EXISTS (SELECT 1 FROM public.reviews WHERE tour_id = v_tour.id LIMIT 1) THEN
      CONTINUE;
    END IF;

    -- 투어별로 다른 리뷰 내용 선택 (slug 기반 인덱스)
    INSERT INTO public.reviews (tour_id, user_id, booking_id, rating, content, images)
    VALUES
      (
        v_tour.id,
        v_u1,
        null,
        5,
        CASE v_tour.slug
          WHEN 'hangang-healing-tour'   THEN '한강을 따라 달리는 코스가 너무 좋았어요! 석양 무렵에 자전거를 타니 뷰가 압도적이었습니다. 가이드분이 한강의 역사도 재미있게 설명해주셔서 더욱 특별했어요.'
          WHEN 'ara-waterway-tour'      THEN '아라뱃길 운하가 이렇게 아름다운지 몰랐어요. 잔잔한 수면 위로 달리는 느낌이 너무 좋았고 중간에 쉬어가는 포인트마다 포토존이 완벽했습니다!'
          WHEN 'haengju-fortress-tour'  THEN '행주산성을 자전거로 오르는 코스가 도전적이면서도 성취감이 컸어요. 정상에서 보이는 한강 뷰는 정말 말로 표현이 안 됩니다. 꼭 다시 오고 싶어요!'
          WHEN 'imjingak-tour'          THEN '임진각까지 가는 코스가 역사적 의미가 있어서 더욱 뜻깊었어요. 가이드분의 설명이 생생해서 DMZ 역사를 실감나게 이해할 수 있었습니다.'
          ELSE '정말 만족스러운 투어였습니다. 코스 구성도 훌륭하고 가이드분도 너무 친절하셨어요. 다음에 또 참여하고 싶네요!'
        END,
        null
      ),
      (
        v_tour.id,
        v_u2,
        null,
        4,
        CASE v_tour.slug
          WHEN 'hangang-healing-tour'   THEN '처음으로 한강 자전거 투어에 참여해봤는데 생각보다 코스가 완만해서 초보자도 충분히 즐길 수 있었어요. 가이드분이 안전하게 이끌어주셔서 좋았습니다!'
          WHEN 'ara-waterway-tour'      THEN '아라뱃길 코스는 바람이 시원하게 불어서 라이딩하기 정말 좋았어요. 중간에 먹은 간식도 맛있었고 전체적으로 힐링되는 투어였습니다.'
          WHEN 'haengju-fortress-tour'  THEN '역사와 자전거를 동시에 즐길 수 있는 코스! 행주산성의 역사 이야기를 들으면서 달리니 더욱 의미 있었어요. 체력 소모가 있지만 그만큼 보람차요.'
          WHEN 'imjingak-tour'          THEN '멀리까지 라이딩하는 코스라 처음엔 걱정했는데 페이스 조절을 잘 해주셔서 무사히 완주! 임진각에서 보이는 풍경이 감동이었어요.'
          ELSE '코스도 잘 짜여있고 안전 장비도 충분히 제공해주셔서 안심하고 즐길 수 있었어요. 사진도 많이 찍어주셔서 추억이 가득합니다.'
        END,
        null
      );
  END LOOP;
END $$;
