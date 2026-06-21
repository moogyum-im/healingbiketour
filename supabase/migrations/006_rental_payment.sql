-- rental_bookings에 결제 관련 컬럼 추가
alter table rental_bookings
  add column if not exists payment_method      text,
  add column if not exists portone_payment_id  text,
  add column if not exists payment_currency    text not null default 'KRW',
  add column if not exists paid_amount         int;   -- KRW 또는 USD cents
