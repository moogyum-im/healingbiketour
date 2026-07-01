-- 예약 테이블에 여권번호 및 국적 구분 컬럼 추가
alter table bookings
  add column if not exists nationality text default 'korean' check (nationality in ('korean', 'foreign')),
  add column if not exists passport_number text;
