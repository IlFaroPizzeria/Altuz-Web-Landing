/* ALTUZ · Members' Atelier — COMMUNITY MODE (no product shown).
   The product experience (3D pieces, outfit, checkout) is kept in altuz-atelier.product.js. */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
['gate','app'].forEach(id=>{ const e=document.getElementById(id); if(e&&e.parentNode!==document.body) document.body.appendChild(e); });
document.body.classList.add('comm');
const SHOP=window.ALTUZ_SHOP||null, LET='TRWAGMYFPDXBNJZSQVHLCKE', SAMPLE='00000000T';
const SITE='https://altuz-ten.vercel.app/';
const TOTAL=300, WAVES=[100,200,300];           // access waves by position in line (edit here)
const pad=n=>String(n).padStart(3,'0');
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; };
let myId=SAMPLE, started=false, introDone=false, MEMBER={n:1,rank:'Founder',name:'',invites:0,pos:0,joined:0}, PULSE=null;

/* ---------- gate ---------- */
const idIn=$('#idIn'), gErr=$('#gErr');
const validId=s=>/^\d{8}[A-Z]$/.test(s)&&LET[parseInt(s.slice(0,8),10)%23]===s[8];
const loadCfg=()=>new Promise(res=>{ if(window.ALTUZ_CONFIG) return res(window.ALTUZ_CONFIG); const s=document.createElement('script'); s.src=SITE+'assets/js/config.js'; s.onload=()=>res(window.ALTUZ_CONFIG||null); s.onerror=()=>res(null); document.head.appendChild(s); });
async function rpc(name,body){
  const C=await loadCfg(); const url=((C&&C.supabaseUrl)||'').replace(/\/+$/,''), key=(C&&C.supabaseAnonKey)||''; if(!url||!key) throw new Error('cfg');
  const h={'apikey':key,'Content-Type':'application/json'}; if(!/^sb_/.test(key)) h.Authorization='Bearer '+key;
  const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000);
  try{ const r=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:h,body:JSON.stringify(body||{}),signal:ctl.signal}); if(!r.ok) throw new Error('http '+r.status); return await r.json(); } finally{ clearTimeout(to); }
}
async function lookup(id){
  if(id===SAMPLE&&!SHOP) return {number:1,rank:'Founder'};
  const d=await rpc('atelier_lookup',{p_dni:id}); const row=Array.isArray(d)?d[0]:d; return row&&row.number?row:null;
}
let busy=false;
$('#gateForm').addEventListener('submit',async e=>{
  e.preventDefault(); if(busy) return; gErr.textContent='';
  const v=idIn.value.trim().toUpperCase().replace(/^#/,'');
  if(!/^\d{8}[A-Z]$/.test(v)){ gErr.textContent='An ID is eight digits and a letter, like 00000000T.'; idIn.focus(); return; }
  if(!validId(v)){ gErr.textContent='That ID doesn’t check out. Look again at your card.'; idIn.focus(); return; }
  const btn=$('#gateForm button[type=submit]'), lab=btn.textContent; busy=true; btn.disabled=true; btn.textContent='Checking…';
  try{ const row=await lookup(v); if(!row){ gErr.textContent='No member with that ID.'; idIn.focus(); } else login(v,row); }
  catch(x){ gErr.textContent='We couldn’t reach the Registry. Try again in a moment.'; }
  busy=false; btn.disabled=false; btn.textContent=lab;
});
if(SHOP){ const u=$('#useSample'); if(u) u.remove(); const fp=$('.fineprint'); if(fp) fp.textContent='Your ID is checked against the Registry. Only members can enter.'; }
if($('#useSample')) $('#useSample').addEventListener('click',()=>{ idIn.value=SAMPLE; $('#gateForm').requestSubmit?$('#gateForm').requestSubmit():login(SAMPLE,{number:1,rank:'Founder'}); });
setTimeout(()=>{ try{idIn.focus({preventScroll:true})}catch(e){} },300);
/* arriving from the Altuz landing: the ID comes in the #hash (never sent to any server) */
(function(){ const m=/[#&?]id=(\d{8}[A-Za-z])/.exec(location.hash||''); if(!m) return; try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} idIn.value=m[1].toUpperCase(); setTimeout(()=>{ const f=$('#gateForm'); if(f.requestSubmit) f.requestSubmit(); },500); })();

/* ---------- member ---------- */
const clean=s=>String(s||'').replace(/[\u0000-\u001f<>&"'`]/g,'').trim().slice(0,40);
const rankLine={Founder:'Here before the numbers existed.',Origin:'One of the first hundred.',Circle:'Inside the circle of three hundred.'};
const waveOf=p=>{ for(let i=0;i<WAVES.length;i++) if(p<=WAVES[i]) return i+1; return WAVES.length; };
function login(id,row){
  myId=id; const n=clamp(parseInt(row&&row.number,10)||1,1,TOTAL);
  MEMBER={n:n,rank:(row&&row.rank)||(n<=2?'Founder':n<=100?'Origin':'Circle'),name:clean(row&&row.alias),invites:parseInt(row&&row.invites,10)||0,pos:parseInt(row&&row.queue_pos,10)||0,joined:parseInt(row&&row.joined,10)||0};
  $('#gate').classList.add('out');
  build();
  rpc('community_pulse').then(p=>{ PULSE=p&&typeof p==='object'?p:null; paintPulse(); }).catch(()=>{ paintPulse(); });
}

/* ---------- community pages (one screen each, no scroll) ---------- */
const NS='http://www.w3.org/2000/svg';
const svgLogo=cls=>{ const lg=document.createElementNS(NS,'svg'); lg.setAttribute('class',cls||'logo'); lg.setAttribute('aria-hidden','true'); const u=document.createElementNS(NS,'use'); u.setAttribute('href','#logo'); lg.appendChild(u); return lg; };
const ARROW=d=>{ const s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('fill','none'); s.setAttribute('stroke','currentColor'); s.setAttribute('stroke-width','1.8'); s.setAttribute('stroke-linecap','round'); s.setAttribute('stroke-linejoin','round'); const p=document.createElementNS(NS,'path'); p.setAttribute('d',d); s.appendChild(p); return s; };
const NAMES=['You','Registry','The room','Your number','Access'];
let PAGES=[], cur=0, lockNav=false, mapLit=false, cardTick=null;

function bgBuild(){
  let bg=$('#cbg'); if(bg) bg.remove();
  bg=el('div'); bg.id='cbg'; bg.setAttribute('aria-hidden','true');
  bg.appendChild(el('div','brushed'));
  const t=document.createElementNS(NS,'svg'); t.setAttribute('class','trackbg'); t.setAttribute('viewBox','0 0 1600 1000'); t.setAttribute('preserveAspectRatio','xMidYMid slice');
  t.innerHTML='<defs><linearGradient id="tfade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15171a" stop-opacity="0"/><stop offset=".45" stop-color="#15171a" stop-opacity=".16"/><stop offset="1" stop-color="#15171a" stop-opacity=".02"/></linearGradient><filter id="tglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs><g transform="rotate(-13 800 520)"><g fill="none" stroke="url(#tfade)" stroke-width="2"><rect x="120" y="110" width="1480" height="780" rx="390"/><rect x="154" y="144" width="1412" height="712" rx="356"/><rect x="188" y="178" width="1344" height="644" rx="322"/><rect x="222" y="212" width="1276" height="576" rx="288"/><rect x="256" y="246" width="1208" height="508" rx="254"/><rect x="290" y="280" width="1140" height="440" rx="220"/><rect x="324" y="314" width="1072" height="372" rx="186"/><rect x="358" y="348" width="1004" height="304" rx="152"/></g><g fill="none" stroke-linecap="round"><rect class="rn rn-g" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#fff" stroke-width="22" filter="url(#tglow)"/><rect class="rn" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#fff" stroke-width="5"/><rect class="rn rn-t" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#6f757c" stroke-width="3" style="animation-delay:-.45s"/></g></g>';
  bg.appendChild(t); bg.appendChild(el('div','orb o1')); bg.appendChild(el('div','orb o2'));
  const gs=el('div','ghosts'); [['g1','L'],['g2','Run elevated'],['g3','L'],['g4','Run elevated']].forEach(a=>{ const g=el('div','gh '+a[0]); if(a[1]==='L') g.appendChild(svgLogo('logo')); else g.appendChild(el('span','',a[1])); gs.appendChild(g); }); bg.appendChild(gs);
  const halo=el('div','halo'); bg.appendChild(halo); bg.appendChild(el('div','grain'));
  if(!RM&&matchMedia('(pointer:fine)').matches){ let hx=innerWidth/2,hy=innerHeight/2,tx=hx,ty=hy; addEventListener('pointermove',e=>{ tx=e.clientX; ty=e.clientY; halo.classList.add('on'); },{passive:true}); const f=()=>{ hx+=(tx-hx)*.07; hy+=(ty-hy)*.07; halo.style.transform='translate3d('+hx.toFixed(1)+'px,'+hy.toFixed(1)+'px,0)'; if(halo.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  const tk=el('div','tick'); tk.setAttribute('aria-hidden','true'); const tr=el('div','track'); for(let k=0;k<2;k++){ const st=el('div','set'); ['Members only','Run elevated','Seen in the dark','Three hundred numbers','Ask to be let in','Alta luz'].forEach(x=>{ st.appendChild(el('span','',x)); st.appendChild(svgLogo('logo')); }); tr.appendChild(st); } tk.appendChild(tr); bg.appendChild(tk);
  $('#app').insertBefore(bg,$('#app').firstChild);
}

function build(){
  ['#comm','.ctop','.cdock','.cpager'].forEach(s=>$$(s).forEach(e=>e.remove()));
  bgBuild();
  const app=$('#app'); app.classList.add('on');
  const hasPos=MEMBER.pos>0, wv=hasPos?waveOf(MEMBER.pos):0;

  /* header, in the landing's way */
  const top=el('header','ctop'); const br=el('div','brand'); br.appendChild(svgLogo('logo')); br.appendChild(el('span','','ALTUZ')); top.appendChild(br);
  const rt=el('div','right'); const who=el('div','who glass'); who.appendChild(el('i')); who.appendChild(document.createTextNode('No. '+pad(MEMBER.n)+' / '+TOTAL+' · '+MEMBER.rank+(MEMBER.name?' · '+MEMBER.name:''))); rt.appendChild(who);
  const ob=el('button','out','Switch ID'); ob.type='button'; ob.addEventListener('click',logout); rt.appendChild(ob); top.appendChild(rt); app.appendChild(top);

  const root=el('main'); root.id='comm'; app.appendChild(root);
  PAGES=[]; const page=(inner)=>{ const p=el('section','pg'); const w=el('div','in'+(inner||'')); p.appendChild(w); root.appendChild(p); PAGES.push(p); return w; };
  const rv=(e,d)=>{ e.classList.add('rv'); e.style.setProperty('--d',(d||0)+'s'); return e; };
  const head=(w,eb,h,lede,tag)=>{ const box=el('div','copy'); box.appendChild(rv(el('span','eyebrow',eb),0)); box.appendChild(rv(el(tag||'h2','wide',h),.08)); if(lede) box.appendChild(rv(el('p','lede',lede),.16)); w.appendChild(box); return box; };

  /* 1 · you */
  let w=page(' two cardfirst'); const cp=head(w,(MEMBER.name?'Welcome home, '+MEMBER.name:'Welcome home')+' · Drop 001',MEMBER.name?'You’re one of us, '+MEMBER.name+'.':'You’re one of us.','This is your place. Your name, your ID and your number are written here, and nobody else has them. Take your time. We saved you a seat.','h1');
  const mini=el('div','mini');
  const m=(k,v,s)=>{ const c=el('div','m glass'); c.appendChild(el('small','',k)); c.appendChild(el('b','chrome',v)); c.appendChild(el('span','',s)); return c; };
  mini.appendChild(m('Your number',pad(MEMBER.n),'of '+TOTAL+' · closed to everyone else'));
  mini.appendChild(m('Standing',MEMBER.rank,rankLine[MEMBER.rank]||''));
  mini.appendChild(m('Your place in line',hasPos?('#'+MEMBER.pos):'—',hasPos?('Wave '+wv+' · opens '+['first','second','third'][wv-1]):'We’ll confirm it by this ID'));
  cp.appendChild(rv(mini,.26));
  const cz=el('div','cardzone'); rv(cz,.12); const card=el('div','card'); card.id='mcard';
  card.appendChild(el('span','band')); card.appendChild(el('span','sheen')); card.appendChild(el('span','prism'));
  const ct=el('span','c-top eng'); ct.appendChild(svgLogo('logo c-logo')); ct.appendChild(el('span','c-word','ALTUZ')); ct.appendChild(el('span','c-no','Drop')); card.appendChild(ct);
  const cb=el('span','c-big'); cb.id='cNum'; cb.textContent=pad(MEMBER.n); const sm=el('small','','/ '+TOTAL); cb.appendChild(sm); card.appendChild(cb);
  const bot=el('span','c-bot eng'); const l=el('span'); l.appendChild(el('small','','ID')); const cid=el('b','',myId); cid.id='cId'; l.appendChild(cid); const r=el('span','r'); r.appendChild(el('small','','Status')); r.appendChild(el('b','',MEMBER.rank)); bot.appendChild(l); bot.appendChild(r); card.appendChild(bot);
  cz.appendChild(card); cz.appendChild(el('p','card-cap','Your card. Personal and non-transferable.')); w.appendChild(cz);
  const tilt=(x,y)=>{ const b=card.getBoundingClientRect(); const px=clamp((x-b.left)/b.width,0,1), py=clamp((y-b.top)/b.height,0,1); card.style.setProperty('--ry',((px-.5)*14).toFixed(2)+'deg'); card.style.setProperty('--rx',((.5-py)*10).toFixed(2)+'deg'); card.style.setProperty('--lx',(px*100).toFixed(1)+'%'); card.style.setProperty('--ly',(py*100).toFixed(1)+'%'); };
  if(!RM){ addEventListener('pointermove',e=>{ if(cur===0) tilt(e.clientX,e.clientY); },{passive:true}); }

  /* 2 · registry */
  w=page(' two'); const rp=head(w,'The Registry','Three hundred of us. One number each.','Every light is someone’s seat at the table. Yours is marked.');
  const cnt=el('div','counter'); const cn=el('b','chrome','0'); cn.id='cInside'; cnt.appendChild(cn); cnt.appendChild(el('span','','inside right now')); const cl=el('em','',''); cl.id='cLeft'; cnt.appendChild(cl); rp.appendChild(rv(cnt,.24));
  const rw=el('div','regwrap glass'); rv(rw,.2);
  const reg=el('div','reg'); reg.id='reg'; reg.setAttribute('role','img'); reg.setAttribute('aria-label','The registry of 300 numbers. Lit numbers are taken. Yours is marked.');
  for(let i=1;i<=TOTAL;i++){ const d=el('span','d'+(i<=2?' f':'')+(i===MEMBER.n?' me':'')); d.title=pad(i); reg.appendChild(d); }
  rw.appendChild(reg);
  const key=el('div','key'); [['f','Founders · 001–002'],['','Origin · 003–100'],['','Circle · 101–300'],['me','You']].forEach(a=>{ const k=el('span','k'); k.appendChild(el('i',a[0])); k.appendChild(document.createTextNode(a[1])); key.appendChild(k); }); rw.appendChild(key);
  w.appendChild(rw);

  /* 3 · the room (hints, never the product) */
  w=page(); head(w,'Our house','Not everyone gets in.','It’s small on purpose, so we can know every one of you by number.');
  const room=el('div','room');
  [['Not everyone gets in.','Altuz is a small, private society of runners. No shelf, no shop window, no checkout for strangers. Just a number, and it’s yours.',null],
   ['Cut for the hours before dawn.','Black. Silent. Finished by hand, where nobody looks. You’ll know it the moment you put it on, and so will whoever runs past you at five in the morning.',['Seen in the dark','Made in small numbers','Your number, inside']],
   ['Made once. Numbered. Never again.','What we make is written to your ID and carries your number. Once a number is taken it’s closed: no restock, no second chance, no discount.',null]
  ].forEach((a,i)=>{ const pn=el('div','pn glass'); rv(pn,.2+i*.1); pn.appendChild(el('h3','',a[0])); pn.appendChild(el('p','',a[1])); if(a[2]){ const ch=el('div','chips'); a[2].forEach(t=>ch.appendChild(el('span','',t))); pn.appendChild(ch); } room.appendChild(pn); });
  w.appendChild(room);

  /* 4 · your number: personal and non-transferable */
  w=page(); head(w,'Your number','Yours alone. For good.','Like your name, your number goes with you. Nobody borrows it and nobody buys it.');
  const rules=el('div','rules');
  [['Personal','Your ID is written to you and to nobody else. It can’t be lent, sold or transferred, and a piece can’t be passed on outside the society.'],
   ['One ID, two pieces','Each ID may hold one tee and one short, no more. Both carry the same member number, yours.'],
   ['Never issued twice','A number is never freed or given to another runner. Only your written renunciation, to projectaltuz@gmail.com, retires it, and it is never reissued.'],
   ['Your place decides when','Your place in line decides when you may reserve, not what you may hold. Waves open in order, and nothing is sold outside them.']
  ].forEach((a,i)=>{ const ru=el('div','ru'); rv(ru,.22+i*.08); ru.appendChild(el('h3','',a[0])); ru.appendChild(el('p','',a[1])); rules.appendChild(ru); });
  w.appendChild(rules);

  /* 5 · access + invitations */
  w=page(' two'); const ap=head(w,'Access','Bring someone you’d run with.','Founders first. After them, whoever has opened the most doors. If you tie, the lower number goes first. Three waves, one hundred places each.');
  const wvs=el('div','waves'); WAVES.forEach((e,i)=>{ const a=i?WAVES[i-1]+1:1; const d=el('div','wv'+(hasPos&&wv===i+1?' on':'')); d.appendChild(el('small','','Wave '+(i+1))); d.appendChild(el('b','',a+'–'+e)); d.appendChild(el('span','',i===0?'Opens first':i===1?'Opens next':'Opens last')); wvs.appendChild(d); }); ap.appendChild(rv(wvs,.24));
  ap.appendChild(rv(el('p','stay','Stay close. Dates are shared here first, on this ID, before anywhere else.'),.3)).style.marginTop='16px';
  const inv=el('div','invite glass'); rv(inv,.2);
  inv.appendChild(el('h3','wide','Open a door for them.'));
  inv.appendChild(el('p','','Every runner who requests an ID through your link moves you up the line. Send it to the friend you’d meet at dawn.'));
  const link=SITE+'?ref='+pad(MEMBER.n);
  const row=el('div','linkrow'); const inp=el('input'); inp.type='text'; inp.readOnly=true; inp.value=link; inp.setAttribute('aria-label','Your invitation link'); row.appendChild(inp);
  const cpb=el('button','btn small','Copy link'); cpb.type='button'; row.appendChild(cpb); inv.appendChild(row);
  const sub=el('div','invstat'); sub.appendChild(el('span','','Doors opened by you')); const ib=el('b','chrome',String(MEMBER.invites)); sub.appendChild(ib); inv.appendChild(sub);
  if(navigator.share){ const sh=el('button','btn ghost small','Share'); sh.type='button'; sh.addEventListener('click',()=>{ navigator.share({title:'Altuz',text:'A private society of runners. Request your ID.',url:link}).catch(()=>{}); }); inv.appendChild(sh); }
  cpb.addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(link); }catch(e){ inp.select(); try{ document.execCommand('copy'); }catch(x){} } cpb.textContent='Copied'; setTimeout(()=>{ cpb.textContent='Copy link'; },1800); });
  inp.addEventListener('focus',()=>inp.select());
  w.appendChild(inv);

  /* dock + arrows */
  const dock=el('nav','cdock glass'); dock.setAttribute('aria-label','Sections');
  NAMES.forEach((n,i)=>{ if(!i) return; const b=el('button','',n); b.type='button'; b.setAttribute('aria-expanded','false'); b.addEventListener('click',()=>toggle(i)); b.dataset.i=i; dock.appendChild(b); }); app.appendChild(dock);
  const scrim=el('div','cscrim'); scrim.id='cscrim'; scrim.addEventListener('click',()=>toggle(-1)); app.appendChild(scrim);
  /* pages 2-5 become the landing's glass sheets */
  PAGES.forEach((p,k)=>{ if(!k) return; const inner=p.firstChild; p.classList.add('sheet','glass'); p.setAttribute('role','dialog'); p.setAttribute('aria-label',NAMES[k]); p.inert=true;
    const tp=el('div','sheet-top'); tp.appendChild(svgLogo('logo')); const x=el('button','x'); x.type='button'; x.setAttribute('aria-label','Close'); x.addEventListener('click',()=>toggle(-1)); tp.appendChild(x);
    const body=el('div','sheet-body'); body.appendChild(inner); p.appendChild(tp); p.appendChild(body); });
  const pg=(cls,d,lab,fn)=>{ const b=el('button','cpager glass '+cls); b.type='button'; b.setAttribute('aria-label',lab); b.appendChild(ARROW(d)); b.addEventListener('click',fn); app.appendChild(b); return b; };
  cur=0; scrollTo(0,0); paintPulse(); intro();
}
function toggle(i){
  const same=i===cur||i<1; PAGES.forEach((p,k)=>{ if(!k) return; const on=!same&&k===i; p.classList.toggle('open',on); p.classList.toggle('on',on); p.inert=!on; });
  cur=same?0:i; document.body.classList.toggle('sheet-open',cur>0);
  $$('.cdock button').forEach(b=>b.setAttribute('aria-expanded',String(+b.dataset.i===cur)));
  if(cur===1&&!mapLit) lightMap();
  if(cur>0){ const h=$('.sheet-body',PAGES[cur]); if(h) h.scrollTop=0; }
}
function taken(){ const t=PULSE&&Array.isArray(PULSE.taken)?PULSE.taken:[]; return t.map(Number).filter(n=>n>=1&&n<=TOTAL); }
function lightMap(){ mapLit=true; const T=new Set(taken()); T.add(1); T.add(2); T.add(MEMBER.n); $$('#reg .d').forEach((d,i)=>{ if(T.has(i+1)) setTimeout(()=>d.classList.add('t'),RM?0:350+Math.min(1800,i*6)); }); }
function paintPulse(){
  const joined=PULSE&&Number.isFinite(+PULSE.joined)?+PULSE.joined:Math.max(MEMBER.joined,0);
  const c=$('#cInside'), l=$('#cLeft'); if(!c) return;
  if(joined>0){ const t0=performance.now(); const step=n=>{ const p=RM?1:clamp((n-t0)/1400,0,1); c.textContent=String(Math.round(joined*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); if(l) l.textContent=(TOTAL-joined)+' numbers still unclaimed'; } else { c.textContent='—'; if(l) l.textContent=''; }
  if(mapLit){ const T=new Set(taken()); $$('#reg .d').forEach((d,i)=>{ if(T.has(i+1)) d.classList.add('t'); }); }
}
function rollId(e,final,ms){
  if(!e) return; if(RM){ e.textContent=final; return; }
  const t0=performance.now(); const step=n=>{ const p=clamp((n-t0)/ms,0,1); let o=''; for(let i=0;i<final.length;i++){ o+=(p>(i+1)/(final.length+1))?final[i]:(i===8?LET[Math.floor(Math.random()*23)]:Math.floor(Math.random()*10)); } e.textContent=p<1?o:final; if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step);
}

/* ---------- opening: slow, light, name + ID ---------- */
let introTimers=[];
function intro(){
  introDone=false; document.body.classList.add('cin'); introTimers.forEach(clearTimeout); introTimers=[];
  const old=$('#cintro'); if(old) old.remove();
  const it=el('div','cintro'); it.id='cintro'; it.setAttribute('aria-live','polite');
  const box=el('div','ci'); box.appendChild(svgLogo('logo ci-logo'));
  const l1=el('div','ci-l1',''); const big=el('div','ci-id chrome',myId); big.style.opacity=0; const l2=el('div','ci-l2','');
  box.appendChild(l1); box.appendChild(big); box.appendChild(l2); it.appendChild(box);
  const bar=el('div','ci-bar'); const bi=el('i'); bar.appendChild(bi); it.appendChild(bar);
  const sk=el('button','btn ghost small ci-skip','Enter'); sk.type='button'; sk.addEventListener('click',finishIntro); it.appendChild(sk);
  $('#app').appendChild(it);
  const L1=MEMBER.name?('Identity confirmed · '+MEMBER.name):'Identity confirmed', L2='No. '+pad(MEMBER.n)+' of '+TOTAL+' · The Altuz community';
  requestAnimationFrame(()=>it.classList.add('run'));
  const T=(f,ms)=>introTimers.push(setTimeout(f,RM?Math.min(ms,300):ms));
  if(!RM){ bi.style.transition='transform 7.6s linear'; requestAnimationFrame(()=>{ bi.style.transform='scaleX(1)'; }); }
  T(()=>{ l1.textContent=L1; l1.classList.add('in'); },900);
  T(()=>{ big.style.transition='opacity 1.6s'; big.style.opacity=1; rollId(big,myId,2200); },2200);
  T(()=>{ l2.textContent=L2; l2.classList.add('in'); },4800);
  T(finishIntro,8000);
}
function finishIntro(){
  if(introDone) return; introDone=true; introTimers.forEach(clearTimeout);
  const it=$('#cintro'); if(it){ it.classList.add('off'); setTimeout(()=>it.remove(),1800); }
  document.body.classList.remove('cin'); scrollTo(0,0);
  setTimeout(()=>{ if(PAGES[0]) PAGES[0].classList.add('on'); rollId($('#cId'),myId,1300); },RM?0:500);
}
addEventListener('keydown',e=>{ if((e.key==='Escape'||e.key==='Enter')&&!introDone&&$('#cintro')) finishIntro(); else if(e.key==='Escape'&&cur>0) toggle(-1); });
function logout(){
  ['#comm','.ctop','.cdock','.cpager','#cbg'].forEach(s=>$$(s).forEach(e=>e.remove()));
  PAGES=[]; cur=0; mapLit=false; introTimers.forEach(clearTimeout); introDone=true; document.body.classList.remove('sheet-open'); document.body.classList.remove('cin'); const ci=$('#cintro'); if(ci) ci.remove(); scrollTo(0,0);
  const g=$('#gate'); g.classList.remove('out'); idIn.value=''; gErr.textContent=''; setTimeout(()=>{ try{idIn.focus({preventScroll:true})}catch(e){} },400);
}
})();
