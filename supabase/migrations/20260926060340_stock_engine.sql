create table stock_balances (
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  on_hand numeric(14,3) not null default 0 check (on_hand >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, location_id)
);

create table stock_ledger (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  location_id uuid not null references locations(id),
  movement_type text not null check (movement_type in ('opening', 'receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment')),
  qty_delta numeric(14,3) not null,
  qty_before numeric(14,3) not null,
  qty_after numeric(14,3) not null,
  unit_cost_snapshot numeric(12,2),
  reference_type text,
  reference_id uuid,
  related_location_id uuid references locations(id),
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index stock_ledger_product_id_idx on stock_ledger(product_id, created_at desc);
create index stock_ledger_location_id_idx on stock_ledger(location_id, created_at desc);
create index stock_balances_location_id_idx on stock_balances(location_id);

alter table stock_balances enable row level security;
alter table stock_ledger enable row level security;

create policy "authenticated read stock_balances" on stock_balances for select to authenticated using (true);
create policy "authenticated read stock_ledger" on stock_ledger for select to authenticated using (true);

-- Single gateway for every stock mutation: locks the balance row, rejects
-- anything that would go negative, and writes the ledger entry in the same
-- transaction so stock_balances and stock_ledger can never drift apart.
create function apply_stock_movement(
  p_product_id uuid,
  p_location_id uuid,
  p_qty_delta numeric,
  p_movement_type text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_related_location_id uuid default null,
  p_unit_cost numeric default null,
  p_reason text default null,
  p_created_by uuid default null
) returns stock_ledger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before numeric;
  v_after numeric;
  v_ledger stock_ledger;
begin
  insert into stock_balances (product_id, location_id, on_hand)
  values (p_product_id, p_location_id, 0)
  on conflict (product_id, location_id) do nothing;

  select on_hand into v_before
  from stock_balances
  where product_id = p_product_id and location_id = p_location_id
  for update;

  v_after := v_before + p_qty_delta;

  if v_after < 0 then
    raise exception 'Insufficient stock at this location: % available, % requested', v_before, -p_qty_delta
      using errcode = 'P0001';
  end if;

  update stock_balances
  set on_hand = v_after, updated_at = now()
  where product_id = p_product_id and location_id = p_location_id;

  insert into stock_ledger (
    product_id, location_id, movement_type, qty_delta, qty_before, qty_after,
    unit_cost_snapshot, reference_type, reference_id, related_location_id, reason, created_by
  ) values (
    p_product_id, p_location_id, p_movement_type, p_qty_delta, v_before, v_after,
    p_unit_cost, p_reference_type, p_reference_id, p_related_location_id, p_reason, p_created_by
  )
  returning * into v_ledger;

  return v_ledger;
end;
$$;

revoke execute on function apply_stock_movement from public;
revoke execute on function apply_stock_movement from anon;
grant execute on function apply_stock_movement to authenticated;
