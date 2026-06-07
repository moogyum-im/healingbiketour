-- 리뷰 디버그 쿼리 (Supabase SQL 에디터에서 실행)

-- 1. tours 테이블에 활성 투어 있는지 확인
SELECT id, slug, title, is_active FROM public.tours ORDER BY created_at;

-- 2. reviews 테이블에 데이터 있는지 확인
SELECT r.id, r.tour_id, r.user_id, r.rating, LEFT(r.content, 30) AS content_preview,
       t.slug AS tour_slug
FROM public.reviews r
LEFT JOIN public.tours t ON t.id = r.tour_id
ORDER BY r.created_at DESC;

-- 3. reviews가 0건이면 seed 다시 실행
-- (seed_reviews.sql 내용 붙여넣기)

-- 4. profiles 테이블 확인 (이름이 null이면 name 컬럼 없는 것)
SELECT id, name FROM public.profiles LIMIT 5;
