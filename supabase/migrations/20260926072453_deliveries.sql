create sequence delivery_reference_seq;

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('WH/OUT/' || lpad(nextval('delivery_reference_seq')::text, 4, '0')),
  partner_id uuid references partners(id),
  source_location_id uuid not null references locations(id),
  scheduled_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'ready', 'done', 'canceled')),
  responsible_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  validated_at timestamptz
);

create table delivery_lines (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  product_id uuid not null references products(id),
  qty numeric(14,3) not null check (qty > 0)
);

create index delivery_lines_delivery_id_idx on delivery_lines(delivery_id);

alter table deliveries enable row level security;
alter table delivery_lines enable row level security;

create policy "authenticated read deliveries" on deliveries for select to authenticated using (true);
create policy "authenticated write deliveries" on deliveries for insert to authenticated with check (true);
create policy "authenticated update deliveries" on deliveries for update to authenticated using (true) with check (true);

create policy "authenticated read delivery_lines" on delivery_lines for select to authenticated using (true);
create policy "authenticated write delivery_lines" on delivery_lines for all to authenticated using (true) with check (true);

-- Validates a delivery atomically. apply_stock_movement's negative-stock
-- guard means an over-delivery raises before anything else in the loop is
-- touched -- the whole call rolls back, so no partial delivery ever posts.
create function validate_delivery(p_delivery_id uuid, p_user_id uuid)
returns deliveries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delivery deliveries;
  v_line delivery_lines;
begin
  select * into v_delivery from deliveries where id = p_delivery_id for update;

  if v_delivery is null then
    raise exception 'Delivery not found' using errcode = 'P0002';
  end if;

  if v_delivery.status = 'done' then
    raise exception 'Delivery is already validated' using errcode = 'P0001';
  end if;

  if v_delivery.status = 'canceled' then
    raise exception 'Cannot validate a canceled delivery' using errcode = 'P0001';
  end if;

  for v_line in select * from delivery_lines where delivery_id = p_delivery_id loop
    perform apply_stock_movement(
      v_line.product_id,
      v_delivery.source_location_id,
      -v_line.qty,
      'delivery',
      'delivery',
      v_delivery.id,
      null,
      null,
      null,
      p_user_id
    );
  end loop;

  update deliveries set status = 'done', validated_at = now() where id = p_delivery_id
  returning * into v_delivery;

  return v_delivery;
end;
$$;

revoke execute on function validate_delivery from public;
revoke execute on function validate_delivery from anon;
grant execute on function validate_delivery to authenticated;
