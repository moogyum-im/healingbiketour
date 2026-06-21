-- status 컬럼에 'pending_transfer' 추가 (계좌 입금 대기)
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint
  where conrelid = 'rental_bookings'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%status%'
  limit 1;

  if v_constraint is not null then
    execute format('alter table rental_bookings drop constraint %I', v_constraint);
  end if;
end $$;

alter table rental_bookings
  add constraint rental_bookings_status_check
  check (status in ('pending', 'pending_transfer', 'confirmed', 'completed', 'cancelled'));
