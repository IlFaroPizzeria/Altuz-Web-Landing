-- ALTUZ · Atelier: consulta por ID (número, rango y alias). Nunca correo ni datos privados.
-- Ejecutar en Supabase > SQL Editor (sustituye la versión anterior si ya la ejecutaste).
drop function if exists public.atelier_lookup(text);
create function public.atelier_lookup(p_dni text)
returns table(number int, rank text, alias text)
language sql stable security definer set search_path = public as $$
  select w.number, case when w.number <= 2 then 'Founder' else 'Origin' end, w.alias
  from public.waitlist w
  where w.dni = upper(replace(trim(p_dni),'#',''));
$$;
revoke all on function public.atelier_lookup(text) from public;
grant execute on function public.atelier_lookup(text) to anon, authenticated;
