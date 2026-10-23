-- ALTUZ · waitlist con número aleatorio (1-100) e ID tipo DNI.
-- Ejecutar en Supabase > SQL Editor. Ver las personas con su ID: Table Editor > waitlist_ids.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  dni text not null unique,
  number int not null unique check (number between 1 and 100),
  email text not null unique,
  alias text, city text, when_run text, referrer text,
  pieces text[] default '{}',
  consent boolean not null default true,
  source text,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
create or replace view public.waitlist_ids as
  select dni as id, lpad(number::text,3,'0') as numero, alias, email, city, pieces, created_at
  from public.waitlist order by number;
create or replace function public.join_waitlist(
  p_email text, p_alias text default null, p_city text default null, p_when text default null,
  p_referrer text default null, p_pieces text[] default '{}', p_source text default 'landing'
) returns table(number int, dni text)
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email)); v_num int; v_n int; v_dni text;
  letras constant text := 'TRWAGMYFPDXBNJZSQVHLCKE';
begin
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'invalid_email'; end if;
  perform pg_advisory_xact_lock(1001);
  return query select w.number, w.dni from public.waitlist w where w.email = v_email;
  if found then return; end if;
  select g into v_num from generate_series(1,100) g
   where g not in (select w.number from public.waitlist w) order by random() limit 1;
  if v_num is null then raise exception 'full'; end if;
  loop
    v_n := floor(random()*100000000)::int;
    v_dni := lpad(v_n::text,8,'0') || substr(letras,(v_n % 23)+1,1);
    exit when not exists (select 1 from public.waitlist w where w.dni = v_dni);
  end loop;
  insert into public.waitlist(dni,number,email,alias,city,when_run,referrer,pieces,source)
  values (v_dni,v_num,v_email,nullif(trim(p_alias),''),nullif(trim(p_city),''),p_when,
          nullif(trim(p_referrer),''),coalesce(p_pieces,'{}'),p_source);
  return query select v_num, v_dni;
end $$;
revoke all on function public.join_waitlist(text,text,text,text,text,text[],text) from public;
grant execute on function public.join_waitlist(text,text,text,text,text,text[],text) to anon, authenticated;
