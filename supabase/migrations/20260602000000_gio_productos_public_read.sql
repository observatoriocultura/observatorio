alter table public.gio_productos enable row level security;

grant select on table public.gio_productos to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'gio_productos'
      and policyname = 'gio_productos_public_read'
  ) then
    create policy gio_productos_public_read
      on public.gio_productos
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;
