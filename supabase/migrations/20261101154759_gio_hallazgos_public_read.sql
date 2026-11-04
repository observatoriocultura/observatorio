-- Todos los hallazgos son públicos, con o sin sesión iniciada.
alter table public.gio_hallazgos enable row level security;

grant select on table public.gio_hallazgos to anon, authenticated;

create policy gio_hallazgos_public_read
  on public.gio_hallazgos
  for select
  to anon, authenticated
  using (true);
