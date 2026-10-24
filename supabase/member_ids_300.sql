-- ALTUZ · 300 IDs / 300 números predeterminados.
-- Ejecutar UNA vez en Supabase > SQL Editor, DESPUÉS de waitlist_ids.sql y member_ids.sql.
-- Qué hace:
--   1) Amplía el pool a 300 (los 100 IDs ya repartidos no cambian; se añaden los números 101-300).
--   2) Deja el nº 1 para Nils (nils.podadera@gmail.com) y el nº 2 para Álvaro (a.castejon31@gmail.com).
--   3) Las altas nuevas reciben un número libre al azar entre 3 y 300 (con su ID fijo).
--   4) Rangos: 1-2 Founder · 3-100 Origin · 101-300 Circle.
--   5) Funciones públicas para la comunidad del Atelier: community_pulse() y atelier_lookup() ampliada.

begin;

alter table public.member_ids drop constraint if exists member_ids_number_check;
alter table public.member_ids add constraint member_ids_number_check check (number between 1 and 300);
alter table public.waitlist drop constraint if exists waitlist_number_check;

insert into public.member_ids(number, dni) values
  (101, '22265324J'),
  (102, '45609518N'),
  (103, '74881351K'),
  (104, '21466622D'),
  (105, '16589429N'),
  (106, '41270751B'),
  (107, '89299740D'),
  (108, '59734748E'),
  (109, '01193424T'),
  (110, '82428531G'),
  (111, '24605673C'),
  (112, '26198485J'),
  (113, '47254637X'),
  (114, '60251565Y'),
  (115, '29203326L'),
  (116, '20652846L'),
  (117, '18148235Q'),
  (118, '63697489R'),
  (119, '96479141Y'),
  (120, '69459753Y'),
  (121, '89851429C'),
  (122, '14751290X'),
  (123, '87479682X'),
  (124, '48458735N'),
  (125, '22130500S'),
  (126, '69184501H'),
  (127, '29432043R'),
  (128, '20975212V'),
  (129, '04597639P'),
  (130, '08653638A'),
  (131, '97031922M'),
  (132, '18916106D'),
  (133, '78060653X'),
  (134, '72094412S'),
  (135, '71274676E'),
  (136, '40290539J'),
  (137, '04631097R'),
  (138, '15252942D'),
  (139, '17023492L'),
  (140, '60116477C'),
  (141, '34328739C'),
  (142, '06754028D'),
  (143, '79421443M'),
  (144, '87909549F'),
  (145, '55198747N'),
  (146, '06154802W'),
  (147, '83325062H'),
  (148, '79664210F'),
  (149, '42381708E'),
  (150, '99698524X'),
  (151, '77219208C'),
  (152, '23763954D'),
  (153, '15763277C'),
  (154, '65157153Q'),
  (155, '60277820H'),
  (156, '16545746Y'),
  (157, '63110125B'),
  (158, '15987026W'),
  (159, '46568418L'),
  (160, '30980099L'),
  (161, '14288266E'),
  (162, '16179211E'),
  (163, '56147012X'),
  (164, '75396774Z'),
  (165, '65235007S'),
  (166, '05263732K'),
  (167, '87062591R'),
  (168, '47857337H'),
  (169, '89649539R'),
  (170, '06856298K'),
  (171, '16903882D'),
  (172, '51108886B'),
  (173, '90372775W'),
  (174, '58819134S'),
  (175, '74536233H'),
  (176, '09826847M'),
  (177, '44073711F'),
  (178, '20312915M'),
  (179, '62469125K'),
  (180, '96790147Y'),
  (181, '34844850B'),
  (182, '46073635N'),
  (183, '95058257Q'),
  (184, '80116749K'),
  (185, '68548540F'),
  (186, '61753994Y'),
  (187, '75822559T'),
  (188, '06640430P'),
  (189, '15669360N'),
  (190, '43936032Y'),
  (191, '66255583N'),
  (192, '00283767Q'),
  (193, '80775260L'),
  (194, '12881157F'),
  (195, '81821843X'),
  (196, '23233495E'),
  (197, '58772453R'),
  (198, '79559167M'),
  (199, '48529422C'),
  (200, '00715653P'),
  (201, '53237951N'),
  (202, '10157226N'),
  (203, '74797067D'),
  (204, '88066813C'),
  (205, '65209660Z'),
  (206, '39798813G'),
  (207, '08871250N'),
  (208, '74102563J'),
  (209, '80917660A'),
  (210, '09944694T'),
  (211, '44981702G'),
  (212, '28359586B'),
  (213, '85256324Q'),
  (214, '81842380P'),
  (215, '73909938J'),
  (216, '37028634Z'),
  (217, '52768115C'),
  (218, '45144167C'),
  (219, '09960963P'),
  (220, '70814951K'),
  (221, '84101419X'),
  (222, '31072523Y'),
  (223, '50305818B'),
  (224, '67513502S'),
  (225, '26755313B'),
  (226, '88882242F'),
  (227, '34125504J'),
  (228, '13077782M'),
  (229, '57788602K'),
  (230, '60067650E'),
  (231, '60332139B'),
  (232, '51857650X'),
  (233, '97577062E'),
  (234, '17455067E'),
  (235, '93587186W'),
  (236, '77628862K'),
  (237, '44329138L'),
  (238, '56229397D'),
  (239, '05364121S'),
  (240, '35348602V'),
  (241, '96435794Z'),
  (242, '31250498F'),
  (243, '80341357B'),
  (244, '97396218G'),
  (245, '39873181J'),
  (246, '88450028D'),
  (247, '31899400X'),
  (248, '35101770K'),
  (249, '92431421X'),
  (250, '56999976L'),
  (251, '39461831H'),
  (252, '35447318V'),
  (253, '34005804M'),
  (254, '62844917Q'),
  (255, '24506538S'),
  (256, '68609299T'),
  (257, '37522279X'),
  (258, '71134784Q'),
  (259, '57839521H'),
  (260, '29308756V'),
  (261, '84528008H'),
  (262, '11022728R'),
  (263, '58123810G'),
  (264, '87386374J'),
  (265, '95820981Z'),
  (266, '55359503K'),
  (267, '57167838G'),
  (268, '91992195S'),
  (269, '25843495M'),
  (270, '10921318K'),
  (271, '18583658A'),
  (272, '53895313B'),
  (273, '07244863R'),
  (274, '38490842C'),
  (275, '95213087X'),
  (276, '67799925L'),
  (277, '38272992A'),
  (278, '93620439C'),
  (279, '25459114T'),
  (280, '45340982R'),
  (281, '58328710C'),
  (282, '16790151J'),
  (283, '86777789P'),
  (284, '97429842W'),
  (285, '58408074B'),
  (286, '83817471C'),
  (287, '82566277A'),
  (288, '17959316L'),
  (289, '83055539D'),
  (290, '88730429V'),
  (291, '12558219N'),
  (292, '08776596A'),
  (293, '22851387J'),
  (294, '24452160D'),
  (295, '21281942L'),
  (296, '80741251G'),
  (297, '33135114A'),
  (298, '64488428Q'),
  (299, '97151631E'),
  (300, '96364706L')
on conflict (number) do nothing;

-- Nils = 1, Álvaro = 2 (si aún no están en la lista se crean; si están, se recolocan sin tocar sus datos).
do $$
declare r record; n int;
begin
  -- liberar 1 y 2 si los tiene otra persona
  for r in select id from public.waitlist where number in (1,2)
            and lower(email) not in ('nils.podadera@gmail.com','a.castejon31@gmail.com') loop
    select m.number into n from public.member_ids m
     where m.number > 2 and m.number not in (select number from public.waitlist) order by random() limit 1;
    update public.waitlist set number = n, dni = (select dni from public.member_ids where number = n) where id = r.id;
  end loop;
end $$;

insert into public.waitlist(dni, number, email, source)
select m.dni, m.number, v.email, 'founder'
from (values (1,'nils.podadera@gmail.com'),(2,'a.castejon31@gmail.com')) v(num,email)
join public.member_ids m on m.number = v.num
where not exists (select 1 from public.waitlist w where lower(w.email) = v.email)
  and not exists (select 1 from public.waitlist w where w.number = v.num);

update public.waitlist w set number = 1000 + w.number where lower(w.email) in ('nils.podadera@gmail.com','a.castejon31@gmail.com') and w.number > 2;
update public.waitlist w set number = 1000 + w.number where lower(w.email) in ('nils.podadera@gmail.com','a.castejon31@gmail.com') and w.number in (1,2);
update public.waitlist w set number = 1, dni = (select dni from public.member_ids where number = 1) where lower(w.email) = 'nils.podadera@gmail.com';
update public.waitlist w set number = 2, dni = (select dni from public.member_ids where number = 2) where lower(w.email) = 'a.castejon31@gmail.com';

alter table public.waitlist add constraint waitlist_number_check check (number between 1 and 300);

-- Altas nuevas: número libre al azar entre 3 y 300 con su ID del pool.
create or replace function public.join_waitlist(
  p_email text, p_alias text default null, p_city text default null, p_when text default null,
  p_referrer text default null, p_pieces text[] default '{}', p_source text default 'landing'
) returns table(number int, dni text)
language plpgsql security definer set search_path = public as $fn$
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
end $fn$;
revoke all on function public.join_waitlist(text,text,text,text,text,text[],text) from public;
grant execute on function public.join_waitlist(text,text,text,text,text,text[],text) to anon, authenticated;

-- Rango por número.
create or replace function public.member_rank(p_number int) returns text
language sql immutable as $$
  select case when p_number <= 2 then 'Founder' when p_number <= 100 then 'Origin' else 'Circle' end;
$$;

-- Consulta del Atelier por ID: número, rango, alias, invitados y puesto en la cola de acceso.
-- Invitados = personas que se apuntaron con el enlace de esa persona (referrer = 'ref:003').
-- Puesto: Founders primero; después más invitados primero y, a igualdad, número menor primero.
drop function if exists public.atelier_lookup(text);
create function public.atelier_lookup(p_dni text)
returns table(number int, rank text, alias text, invites int, queue_pos int, joined int)
language sql stable security definer set search_path = public as $$
  with s as (
    select w.number, w.alias,
           (select count(*) from public.waitlist x where x.referrer = 'ref:' || lpad(w.number::text,3,'0'))::int as invites
    from public.waitlist w
  ), k as (
    select s.*, case when s.number <= 2 then 1000000 else s.invites end as score from s
  )
  select me.number, public.member_rank(me.number), me.alias, me.invites,
         1 + (select count(*) from k o where o.score > me.score or (o.score = me.score and o.number < me.number))::int,
         (select count(*) from k)::int
  from k me
  join public.waitlist w on w.number = me.number
  where w.dni = upper(replace(trim(p_dni),'#',''));
$$;
revoke all on function public.atelier_lookup(text) from public;
grant execute on function public.atelier_lookup(text) to anon, authenticated;

-- El registro público también usa los nuevos rangos.
create or replace function public.registry_lookup(p_dni text)
returns table(rank text, pieces jsonb)
language sql stable security definer set search_path = public as $$
  select public.member_rank(w.number),
         coalesce((select jsonb_agg(jsonb_build_object('model',p.model,'colour',p.colour,'piece_no',p.piece_no) order by p.model,p.colour,p.piece_no)
                   from public.pieces p where p.dni = w.dni), '[]'::jsonb)
  from public.waitlist w where w.dni = upper(replace(trim(p_dni),'#',''));
$$;
revoke all on function public.registry_lookup(text) from public;
grant execute on function public.registry_lookup(text) to anon, authenticated;

-- Pulso público de la comunidad: cuántos dentro y qué números ya tienen dueño. Nunca IDs, correos ni nombres.
create or replace function public.community_pulse() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total', 300,
    'joined', (select count(*) from public.waitlist),
    'taken', coalesce((select json_agg(number order by number) from public.waitlist), '[]'::json)
  );
$$;
revoke all on function public.community_pulse() from public;
grant execute on function public.community_pulse() to anon, authenticated;

commit;

-- Comprobaciones:
--   select count(*) from public.member_ids;                       -- 300
--   select * from public.waitlist_ids order by numero limit 5;     -- 001 Nils, 002 Álvaro
--   select number, dni from public.member_ids order by number;     -- los 300 IDs, para imprimir las tarjetas
