create sequence transfer_reference_seq;

create table transfers (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('WH/INT/' || lpad(nextval('transfer_reference_seq')::text, 4, '0')),
  source_location_id uuid not null references locations(id),
  destination_location_id uuid not null references locations(id),
  scheduled_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'ready', 'done', 'canceled')),
  responsible_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  check (source_location_id <> destination_location_id)
);

create table transfer_lines (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references transfers(id) on delete cascade,
  product_id uuid not null references products(id),
  qty numeric(14,3) not null check (qty > 0)
);

create index transfer_lines_transfer_id_idx on transfer_lines(transfer_id);

alter table transfers enable row level security;
alter table transfer_lines enable row level security;

create policy "authenticated read transfers" on transfers for select to authenticated using (true);
create policy "authenticated write transfers" on transfers for insert to authenticated with check (true);
create policy "authenticated update transfers" on transfers for update to authenticated using (true) with check (true);

create policy "authenticated read transfer_lines" on transfer_lines for select to authenticated using (true);
create policy "authenticated write transfer_lines" on transfer_lines for all to authenticated using (true) with check (true);

-- Validates a transfer atomically: for each line, moves stock out of the
-- source and into the destination as a linked pair, so total inventory
-- across both locations is unchanged. Insufficient stock at the source
-- rolls back the whole transfer, including any lines already applied.
create function validate_transfer(p_transfer_id uuid, p_user_id uuid)
returns transfers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer transfers;
  v_line transfer_lines;
begin
  select * into v_transfer from transfers where id = p_transfer_id for update;

  if v_transfer is null then
    raise exception 'Transfer not found' using errcode = 'P0002';
  end if;

  if v_transfer.status = 'done' then
    raise exception 'Transfer is already validated' using errcode = 'P0001';
  end if;

  if v_transfer.status = 'canceled' then
    raise exception 'Cannot validate a canceled transfer' using errcode = 'P0001';
  end if;

  for v_line in select * from transfer_lines where transfer_id = p_transfer_id loop
    perform apply_stock_movement(
      v_line.product_id,
      v_transfer.source_location_id,
      -v_line.qty,
      'transfer_out',
      'transfer',
      v_transfer.id,
      v_transfer.destination_location_id,
      null,
      null,
      p_user_id
    );
    perform apply_stock_movement(
      v_line.product_id,
      v_transfer.destination_location_id,
      v_line.qty,
      'transfer_in',
      'transfer',
      v_transfer.id,
      v_transfer.source_location_id,
      null,
      null,
      p_user_id
    );
  end loop;

  update transfers set status = 'done', validated_at = now() where id = p_transfer_id
  returning * into v_transfer;

  return v_transfer;
end;
$$;

revoke execute on function validate_transfer from public;
revoke execute on function validate_transfer from anon;
grant execute on function validate_transfer to authenticated;
