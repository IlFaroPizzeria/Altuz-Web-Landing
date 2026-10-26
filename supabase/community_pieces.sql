-- ALTUZ · qué números (1–100) ya han elegido cada una de las tres prendas.
-- Ejecutar una vez en Supabase > SQL Editor. Solo devuelve números, nunca emails ni nombres.
create or replace function public.community_pieces()
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
    'tee_black', coalesce(jsonb_agg(number order by number) filter (where 'tee-black'  = any(pieces) and number between 1 and 100), '[]'::jsonb),
    'tee_white', coalesce(jsonb_agg(number order by number) filter (where 'tee-white'  = any(pieces) and number between 1 and 100), '[]'::jsonb),
    'short',     coalesce(jsonb_agg(number order by number) filter (where 'race-short' = any(pieces) and number between 1 and 100), '[]'::jsonb)
  ) from public.waitlist;
$$;
revoke all on function public.community_pieces() from public;
grant execute on function public.community_pieces() to anon, authenticated;
