-- ALTUZ · lista de miembros ya dentro, para el Atelier (Community > Members).
-- Ejecutar una vez en Supabase > SQL Editor. Devuelve número, nombre de tarjeta e ID con el centro oculto.
-- Nunca devuelve emails ni ciudades.
create or replace function public.community_members()
returns jsonb language sql security definer set search_path = public stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'n', w.number,
           'alias', nullif(trim(w.alias), ''),
           'id', left(w.dni, 2) || '••••••' || right(w.dni, 1)
         ) order by w.number), '[]'::jsonb)
  from public.waitlist w
  where w.number is not null;
$$;
revoke all on function public.community_members() from public;
grant execute on function public.community_members() to anon, authenticated;
