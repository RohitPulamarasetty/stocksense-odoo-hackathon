create sequence adjustment_reference_seq;

create table adjustments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('WH/ADJ/' || lpad(nextval('adjustment_reference_seq')::text, 4, '0')),
  location_id uuid not null references locations(id),
  status text not null default 'draft' check (status in ('draft', 'done', 'canceled')),
  reason text,
  responsible_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  validated_at timestamptz
);

create table adjustment_lines (
  id uuid primary key default gen_random_uuid(),
  adjustment_id uuid not null references adjustments(id) on delete cascade,
  product_id uuid not null references products(id),
  counted_qty numeric(14,3) not null check (counted_qty >= 0)
);

create index adjustment_lines_adjustment_id_idx on adjustment_lines(adjustment_id);

alter table adjustments enable row level security;
alter table adjustment_lines enable row level security;

create policy "authenticated read adjustments" on adjustments for select to authenticated using (true);
create policy "authenticated write adjustments" on adjustments for insert to authenticated with check (true);
create policy "authenticated update adjustments" on adjustments for update to authenticated using (true) with check (true);

create policy "authenticated read adjustment_lines" on adjustment_lines for select to authenticated using (true);
create policy "authenticated write adjustment_lines" on adjustment_lines for all to authenticated using (true) with check (true);

-- Validates a physical count atomically: for each line, diffs the counted
-- quantity against the live on-hand balance and posts only the difference
-- through the stock engine (a line matching the system count posts nothing).
create function validate_adjustment(p_adjustment_id uuid, p_user_id uuid)
returns adjustments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_adjustment adjustments;
  v_line adjustment_lines;
  v_current numeric;
  v_diff numeric;
begin
  select * into v_adjustment from adjustments where id = p_adjustment_id for update;

  if v_adjustment is null then
    raise exception 'Adjustment not found' using errcode = 'P0002';
  end if;

  if v_adjustment.status = 'done' then
    raise exception 'Adjustment is already validated' using errcode = 'P0001';
  end if;

  if v_adjustment.status = 'canceled' then
    raise exception 'Cannot validate a canceled adjustment' using errcode = 'P0001';
  end if;

  for v_line in select * from adjustment_lines where adjustment_id = p_adjustment_id loop
    select coalesce(on_hand, 0) into v_current
    from stock_balances
    where product_id = v_line.product_id and location_id = v_adjustment.location_id;

    v_diff := v_line.counted_qty - coalesce(v_current, 0);

    if v_diff <> 0 then
      perform apply_stock_movement(
        v_line.product_id,
        v_adjustment.location_id,
        v_diff,
        'adjustment',
        'adjustment',
        v_adjustment.id,
        null,
        null,
        v_adjustment.reason,
        p_user_id
      );
    end if;
  end loop;

  update adjustments set status = 'done', validated_at = now() where id = p_adjustment_id
  returning * into v_adjustment;

  return v_adjustment;
end;
$$;

revoke execute on function validate_adjustment from public;
revoke execute on function validate_adjustment from anon;
grant execute on function validate_adjustment to authenticated;
