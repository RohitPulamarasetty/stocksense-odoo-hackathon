create sequence receipt_reference_seq;

create table receipts (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('WH/IN/' || lpad(nextval('receipt_reference_seq')::text, 4, '0')),
  partner_id uuid references partners(id),
  destination_location_id uuid not null references locations(id),
  scheduled_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'ready', 'done', 'canceled')),
  responsible_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  validated_at timestamptz
);

create table receipt_lines (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  product_id uuid not null references products(id),
  qty numeric(14,3) not null check (qty > 0),
  unit_cost numeric(12,2) not null default 0
);

create index receipt_lines_receipt_id_idx on receipt_lines(receipt_id);

alter table receipts enable row level security;
alter table receipt_lines enable row level security;

create policy "authenticated read receipts" on receipts for select to authenticated using (true);
create policy "authenticated write receipts" on receipts for insert to authenticated with check (true);
create policy "authenticated update receipts" on receipts for update to authenticated using (true) with check (true);

create policy "authenticated read receipt_lines" on receipt_lines for select to authenticated using (true);
create policy "authenticated write receipt_lines" on receipt_lines for all to authenticated using (true) with check (true);

-- Validates a receipt atomically: applies every line to the stock engine
-- and flips status to done in a single transaction. A receipt that is
-- already done or canceled cannot be re-validated (no double-counting).
create function validate_receipt(p_receipt_id uuid, p_user_id uuid)
returns receipts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_receipt receipts;
  v_line receipt_lines;
begin
  select * into v_receipt from receipts where id = p_receipt_id for update;

  if v_receipt is null then
    raise exception 'Receipt not found' using errcode = 'P0002';
  end if;

  if v_receipt.status = 'done' then
    raise exception 'Receipt is already validated' using errcode = 'P0001';
  end if;

  if v_receipt.status = 'canceled' then
    raise exception 'Cannot validate a canceled receipt' using errcode = 'P0001';
  end if;

  for v_line in select * from receipt_lines where receipt_id = p_receipt_id loop
    perform apply_stock_movement(
      v_line.product_id,
      v_receipt.destination_location_id,
      v_line.qty,
      'receipt',
      'receipt',
      v_receipt.id,
      null,
      v_line.unit_cost,
      null,
      p_user_id
    );
  end loop;

  update receipts set status = 'done', validated_at = now() where id = p_receipt_id
  returning * into v_receipt;

  return v_receipt;
end;
$$;

revoke execute on function validate_receipt from public;
revoke execute on function validate_receipt from anon;
grant execute on function validate_receipt to authenticated;
