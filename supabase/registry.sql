-- ALTUZ · Registro: prendas ligadas a cada ID. Ejecutar en Supabase > SQL Editor.
create table if not exists public.pieces (
  id        uuid primary key default gen_random_uuid(),
  dni       text not null references public.waitlist(dni) on update cascade on delete cascade,
  model     text not null,                 -- 'Tee', 'Race Short'
  colour    text,                          -- 'Black', 'White'
  piece_no  int  not null check (piece_no between 1 and 100),
  created_at timestamptz not null default now(),
  unique (model, colour, piece_no)         -- cada prenda numerada es única
);
alter table public.pieces enable row level security;
revoke all on public.pieces from anon, authenticated;

-- Vista para ti en el dashboard: ID + prendas.
create or replace view public.registry_view as
  select w.dni as id, w.alias, w.email, p.model, p.colour, lpad(p.piece_no::text,3,'0') as numero_prenda
  from public.waitlist w left join public.pieces p on p.dni = w.dni
  order by w.number, p.model, p.colour;

-- Consulta pública por ID: solo rango y prendas. Nunca nombre ni correo.
create or replace function public.registry_lookup(p_dni text)
returns table(rank text, pieces jsonb)
language sql stable security definer set search_path = public as $$
  select case when w.number <= 2 then 'Founder' else 'Origin' end,
         coalesce((select jsonb_agg(jsonb_build_object('model',p.model,'colour',p.colour,'piece_no',p.piece_no) order by p.model,p.colour,p.piece_no)
                   from public.pieces p where p.dni = w.dni), '[]'::jsonb)
  from public.waitlist w where w.dni = upper(replace(trim(p_dni),'#',''));
$$;
revoke all on function public.registry_lookup(text) from public;
grant execute on function public.registry_lookup(text) to anon, authenticated;

-- Ejemplo para asignar una prenda:  insert into public.pieces(dni,model,colour,piece_no) values ('12345678Z','Tee','Black',12);
