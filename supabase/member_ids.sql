-- ALTUZ · 100 IDs tipo DNI ya generados (uno por número) + nils=1, castejón=2.
-- Ejecutar UNA vez en Supabase > SQL Editor (requiere haber ejecutado antes waitlist_ids.sql).

begin;

-- 1) Pool fijo: a cada número del 1 al 100 le corresponde su ID, para siempre.
create table if not exists public.member_ids (
  number int primary key check (number between 1 and 100),
  dni    text not null unique
);
alter table public.member_ids enable row level security;
revoke all on public.member_ids from anon, authenticated;
insert into public.member_ids(number, dni) values
  (1, '92638791N'),
  (2, '19105029X'),
  (3, '78430024R'),
  (4, '58874388T'),
  (5, '29301698C'),
  (6, '96591684X'),
  (7, '70256616B'),
  (8, '60503858N'),
  (9, '10319393Y'),
  (10, '13562643A'),
  (11, '63773347M'),
  (12, '39714361P'),
  (13, '55727753H'),
  (14, '81562258A'),
  (15, '87267850P'),
  (16, '78161081C'),
  (17, '32985151T'),
  (18, '55406998K'),
  (19, '97655891F'),
  (20, '87142730P'),
  (21, '23777413J'),
  (22, '50820521C'),
  (23, '27054795X'),
  (24, '77030176W'),
  (25, '21739470P'),
  (26, '11116895Y'),
  (27, '24695165L'),
  (28, '32125658V'),
  (29, '52143658J'),
  (30, '43480420R'),
  (31, '87209353T'),
  (32, '95602019N'),
  (33, '96760164S'),
  (34, '37955978K'),
  (35, '95548701P'),
  (36, '18733300F'),
  (37, '21161481D'),
  (38, '17763545R'),
  (39, '51304742E'),
  (40, '37926180P'),
  (41, '49661523S'),
  (42, '62106326R'),
  (43, '43032226P'),
  (44, '23203434E'),
  (45, '67434657Z'),
  (46, '26099140M'),
  (47, '30362726N'),
  (48, '59111868M'),
  (49, '95086420G'),
  (50, '73956737F'),
  (51, '90875467Y'),
  (52, '16819864X'),
  (53, '47721854M'),
  (54, '67086766K'),
  (55, '12016654M'),
  (56, '54709752C'),
  (57, '57981975X'),
  (58, '77670597B'),
  (59, '34295415T'),
  (60, '97013523Y'),
  (61, '87147513F'),
  (62, '37355578J'),
  (63, '92840056G'),
  (64, '16853767B'),
  (65, '17565586A'),
  (66, '87474673S'),
  (67, '70415209L'),
  (68, '68494365C'),
  (69, '19040519S'),
  (70, '97125007D'),
  (71, '30667438C'),
  (72, '61408054D'),
  (73, '17294298T'),
  (74, '33606109G'),
  (75, '10541331V'),
  (76, '93918980K'),
  (77, '66192411K'),
  (78, '67783273L'),
  (79, '92952892W'),
  (80, '35340501N'),
  (81, '40047679X'),
  (82, '56753940Z'),
  (83, '50286280T'),
  (84, '88061368A'),
  (85, '51037313Z'),
  (86, '67398763T'),
  (87, '87590089V'),
  (88, '91114395X'),
  (89, '78583383L'),
  (90, '13333557C'),
  (91, '76457844W'),
  (92, '55627370F'),
  (93, '72036256A'),
  (94, '29061581T'),
  (95, '42503011T'),
  (96, '68259200F'),
  (97, '22905522Y'),
  (98, '34578383E'),
  (99, '45866888N'),
  (100, '61521415A')
on conflict (number) do nothing;

-- 2) Recolocar números: nils = 1, a.castejon31 = 2; el resto conserva el suyo salvo quien tuviera 1 o 2.
alter table public.waitlist drop constraint if exists waitlist_number_check;
update public.waitlist set number = number + 1000;

update public.waitlist set number = 1 where lower(email) = 'nils.podadera@gmail.com';
update public.waitlist set number = 2 where lower(email) = 'a.castejon31@gmail.com';

update public.waitlist set number = number - 1000
 where number > 1000 and number - 1000 > 2;

do $$
declare r record; n int;
begin
  for r in select id from public.waitlist where number > 1000 order by created_at loop
    select g into n from generate_series(3,100) g
     where g not in (select number from public.waitlist) order by random() limit 1;
    if n is null then raise exception 'sin números libres'; end if;
    update public.waitlist set number = n where id = r.id;
  end loop;
end $$;

alter table public.waitlist add constraint waitlist_number_check check (number between 1 and 100);

-- 3) Cada persona recibe el ID de su número.
update public.waitlist w set dni = m.dni from public.member_ids m where m.number = w.number;

-- 4) Altas nuevas: número libre aleatorio (3-100; el 1 y el 2 quedan reservados) con su ID del pool.
create or replace function public.join_waitlist(
  p_email text, p_alias text default null, p_city text default null, p_when text default null,
  p_referrer text default null, p_pieces text[] default '{}', p_source text default 'landing'
) returns table(number int, dni text)
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email)); v_num int; v_dni text;
begin
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'invalid_email'; end if;
  perform pg_advisory_xact_lock(1001);
  return query select w.number, w.dni from public.waitlist w where w.email = v_email;
  if found then return; end if;
  select m.number, m.dni into v_num, v_dni from public.member_ids m
   where m.number > 2 and m.number not in (select w.number from public.waitlist w)
   order by random() limit 1;
  if v_num is null then raise exception 'full'; end if;
  insert into public.waitlist(dni,number,email,alias,city,when_run,referrer,pieces,source)
  values (v_dni,v_num,v_email,nullif(trim(p_alias),''),nullif(trim(p_city),''),p_when,
          nullif(trim(p_referrer),''),coalesce(p_pieces,'{}'),p_source);
  return query select v_num, v_dni;
end $$;
revoke all on function public.join_waitlist(text,text,text,text,text,text[],text) from public;
grant execute on function public.join_waitlist(text,text,text,text,text,text[],text) to anon, authenticated;

commit;

-- Comprobación:  select * from public.waitlist_ids;   select * from public.member_ids order by number;
