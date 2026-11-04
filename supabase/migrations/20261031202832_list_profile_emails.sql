-- Auth emails are available only to authenticated profile administrators.
create or replace function private.list_profile_emails()
returns table (id uuid, email text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'Only administrators can list registration emails.'
      using errcode = '42501';
  end if;

  return query
    select users.id, users.email::text
    from auth.users as users
    inner join public.profiles as profiles on profiles.id = users.id;
end;
$$;

revoke all on function private.list_profile_emails() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.list_profile_emails() to authenticated;

-- Expose an invoker wrapper, keeping privileged access in the private schema.
create or replace function public.list_profile_emails()
returns table (id uuid, email text)
language sql
stable
security invoker
set search_path = ''
as $$
  select id, email from private.list_profile_emails();
$$;

revoke all on function public.list_profile_emails() from public, anon;
grant execute on function public.list_profile_emails() to authenticated;
