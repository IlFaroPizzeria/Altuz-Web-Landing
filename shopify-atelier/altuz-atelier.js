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
  $$('[data-id]').forEach(e=>e.textContent=id);
  $('#rank').textContent=(MEMBER.name?MEMBER.name+' · ':'')+MEMBER.rank+' · No. '+pad(MEMBER.n)+' / '+TOTAL;
  const ps=$('.plate small'); if(ps){ ps.textContent=''; ps.appendChild(document.createElement('i')); ps.appendChild(document.createTextNode(MEMBER.name?MEMBER.name+' · Member ID':'Member ID')); }
  $('#gate').classList.add('out'); $('#app').classList.add('on');
  try{ document.body.classList.add('lock'); }catch(e){}
  build(); intro();
  rpc('community_pulse').then(p=>{ PULSE=p&&typeof p==='object'?p:null; paintPulse(); }).catch(()=>{ paintPulse(); });
}

/* ---------- community page ---------- */
let reveal=null;
function build(){
  let root=$('#comm'); if(root) root.remove();
  root=el('main'); root.id='comm'; $('#app').appendChild(root);
  let bg=$('#cbg'); if(!bg){ bg=el('div'); bg.id='cbg'; bg.setAttribute('aria-hidden','true'); $('#app').insertBefore(bg,$('#app').firstChild); }
  const sec=(cls)=>{ const s=el('section','cs '+(cls||'')); root.appendChild(s); return s; };

  // 0 · you
  let s=sec('s0'); const w=el('div','wrap c');
  w.appendChild(el('span','eyebrow rv',(MEMBER.name?'Welcome back, '+MEMBER.name:'Welcome back')+' · Drop 001'));
  const big=el('div','big chrome rv',myId); big.dataset.id=''; w.appendChild(big);
  const p0=el('p','lede rv','You are inside. Everything that comes from Altuz is written against this ID, and against the number that goes with it.'); w.appendChild(p0);
  const cue=el('div','scrollcue rv'); cue.appendChild(el('span','', 'Scroll')); cue.appendChild(el('i')); w.appendChild(cue);
  s.appendChild(w);

  // 1 · standing
  s=sec(); const w1=el('div','wrap');
  w1.appendChild(el('span','eyebrow rv','01 · You'));
  w1.appendChild(el('h2','wide chrome rv','Your place in the room.'));
  const st=el('div','stats rv');
  const card=(k,v,sub,id)=>{ const c=el('div','stat'); c.appendChild(el('small','',k)); const b=el('b','chrome',v); if(id) b.id=id; c.appendChild(b); const sp=el('span','',sub); if(id) sp.id=id+'S'; c.appendChild(sp); return c; };
  st.appendChild(card('Your number',pad(MEMBER.n),'of '+TOTAL+' · closed to everyone else'));
  st.appendChild(card('Standing',MEMBER.rank,rankLine[MEMBER.rank]||''));
  const hasPos=MEMBER.pos>0;
  st.appendChild(card('Your place in line',hasPos?('#'+MEMBER.pos):'—',hasPos?('Wave '+waveOf(MEMBER.pos)+' · opens '+(waveOf(MEMBER.pos)===1?'first':waveOf(MEMBER.pos)===2?'second':'third')):'We’ll confirm it by this ID','pos'));
  w1.appendChild(st);
  s.appendChild(w1);

  // 2 · registry map
  s=sec(); const w2=el('div','wrap');
  w2.appendChild(el('span','eyebrow rv','02 · The Registry'));
  w2.appendChild(el('h2','wide chrome rv','Three hundred numbers. One owner each.'));
  const cnt=el('div','counter rv'); const cn=el('b','chrome','0'); cn.id='cInside'; cnt.appendChild(cn); cnt.appendChild(el('span','','inside right now')); const cl=el('em','',''); cl.id='cLeft'; cnt.appendChild(cl); w2.appendChild(cnt);
  const reg=el('div','reg rv'); reg.id='reg'; reg.setAttribute('role','img'); reg.setAttribute('aria-label','The registry of 300 numbers. Lit numbers are taken. Yours is marked.');
  for(let i=1;i<=TOTAL;i++){ const d=el('span','d'+(i<=2?' f':i<=100?' o':' c')+(i===MEMBER.n?' me':'')); d.style.setProperty('--i',i); d.title=pad(i); reg.appendChild(d); }
  w2.appendChild(reg);
  const key=el('div','key rv'); [['f','Founders'],['o','Origin · 003–100'],['c','Circle · 101–300'],['me','You']].forEach(a=>{ const k=el('span','k'); k.appendChild(el('i',a[0])); k.appendChild(document.createTextNode(a[1])); key.appendChild(k); }); w2.appendChild(key);
  s.appendChild(w2);

  // 3-5 · manifesto (hints, never the product)
  const man=[
    ['03 · The room','Not everyone gets in.','Altuz is a private society of runners. There is no shelf, no shop window, no checkout for strangers. There is a number, and it is yours.',null],
    ['04 · The craft','Cut for the hours before dawn.','Black. Silent. Finished by hand, where nobody looks. You will know it the moment you put it on, and so will whoever passes you at five in the morning.',['Seen in the dark','Made in small numbers','Your number, inside']],
    ['05 · The number','Made once. Numbered. Never again.','What we make is written against your ID and carries your number. When a number is taken it is closed: no restock, no second chance, no discount.',null]
  ];
  man.forEach(m=>{ const sc=sec('man'); const wm=el('div','wrap c'); wm.appendChild(el('span','eyebrow rv',m[0])); wm.appendChild(el('h2','wide chrome rv',m[1])); wm.appendChild(el('p','lede rv',m[2]));
    if(m[3]){ const ch=el('div','chips rv'); m[3].forEach(t=>ch.appendChild(el('span','',t))); wm.appendChild(ch); }
    sc.appendChild(wm); });

  // 6 · access + invitations
  s=sec(); const w6=el('div','wrap');
  w6.appendChild(el('span','eyebrow rv','06 · Access'));
  w6.appendChild(el('h2','wide chrome rv','The door opens in order.'));
  w6.appendChild(el('p','lede rv','Founders first. After them, whoever has opened the most doors. If you tie, the lower number goes first. Three waves, one hundred places each, and nothing is sold outside them.'));
  const wv=el('div','waves rv'); WAVES.forEach((e,i)=>{ const a=i?WAVES[i-1]+1:1; const d=el('div','wv'+(hasPos&&waveOf(MEMBER.pos)===i+1?' on':'')); d.appendChild(el('small','','Wave '+(i+1))); d.appendChild(el('b','chrome',a+'–'+e)); d.appendChild(el('span','',i===0?'Opens first':i===1?'Opens next':'Opens last')); wv.appendChild(d); }); w6.appendChild(wv);
  const inv=el('div','invite rv');
  inv.appendChild(el('h3','wide','Open a door.'));
  inv.appendChild(el('p','','Every runner who requests an ID through your link moves you up the line. Send it to someone who runs before sunrise.'));
  const link=SITE+'?ref='+pad(MEMBER.n);
  const row=el('div','linkrow'); const inp=el('input'); inp.type='text'; inp.readOnly=true; inp.value=link; inp.setAttribute('aria-label','Your invitation link'); row.appendChild(inp);
  const cp=el('button','btn','Copy link'); cp.type='button'; row.appendChild(cp); inv.appendChild(row);
  const sub=el('div','invstat'); sub.appendChild(el('span','','Doors opened by you')); const ib=el('b','chrome',String(MEMBER.invites)); ib.id='inv'; sub.appendChild(ib); inv.appendChild(sub);
  if(navigator.share){ const sh=el('button','btn ghost','Share'); sh.type='button'; sh.addEventListener('click',()=>{ navigator.share({title:'Altuz',text:'A private society of runners. Request your ID.',url:link}).catch(()=>{}); }); inv.appendChild(sh); }
  cp.addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(link); }catch(e){ inp.select(); try{ document.execCommand('copy'); }catch(x){} } cp.textContent='Copied'; setTimeout(()=>{ cp.textContent='Copy link'; },1800); });
  inp.addEventListener('focus',()=>inp.select());
  w6.appendChild(inv); s.appendChild(w6);

  // 7 · close
  s=sec('end'); const w7=el('div','wrap c');
  const lg=document.createElementNS('http://www.w3.org/2000/svg','svg'); lg.setAttribute('class','logo'); lg.setAttribute('aria-hidden','true'); const u=document.createElementNS('http://www.w3.org/2000/svg','use'); u.setAttribute('href','#logo'); lg.appendChild(u); w7.appendChild(lg);
  w7.appendChild(el('h2','wide chrome rv','Stay close.'));
  w7.appendChild(el('p','lede rv','Dates are shared here first, on this ID, before anywhere else. Keep it with you.'));
  const sw=el('button','btn ghost rv','Switch ID'); sw.type='button'; sw.addEventListener('click',logout); w7.appendChild(sw);
  s.appendChild(w7);

  // reveal on scroll
  if(reveal) reveal.disconnect();
  const items=$$('#comm .rv');
  if(RM||!('IntersectionObserver' in window)){ items.forEach(e=>e.classList.add('in')); }
  else{ reveal=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); reveal.unobserve(e.target); if(e.target.id==='reg') lightMap(); } }); },{threshold:.18,rootMargin:'0px 0px -6% 0px'}); items.forEach((e,i)=>{ e.style.transitionDelay=(i%4)*90+'ms'; reveal.observe(e); }); }
  paintPulse();
}
function taken(){ const t=PULSE&&Array.isArray(PULSE.taken)?PULSE.taken:[]; return t.map(Number).filter(n=>n>=1&&n<=TOTAL); }
let mapLit=false;
function lightMap(){ mapLit=true; const T=new Set(taken()); T.add(1); T.add(2); T.add(MEMBER.n); $$('#reg .d').forEach((d,i)=>{ if(T.has(i+1)) setTimeout(()=>d.classList.add('t'),RM?0:Math.min(2200,i*7)); }); }
function paintPulse(){
  const joined=PULSE&&Number.isFinite(+PULSE.joined)?+PULSE.joined:Math.max(MEMBER.joined,0);
  const c=$('#cInside'), l=$('#cLeft'); if(!c) return;
  if(joined>0){ const t0=performance.now(); const step=n=>{ const p=RM?1:clamp((n-t0)/1400,0,1); c.textContent=String(Math.round(joined*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); if(l) l.textContent=(TOTAL-joined)+' numbers still unclaimed'; } else { c.textContent='—'; if(l) l.textContent=''; }
  if(mapLit){ const T=new Set(taken()); $$('#reg .d').forEach((d,i)=>{ if(T.has(i+1)) d.classList.add('t'); }); }
}
function logout(){
  started=false; introDone=false; document.body.classList.remove('ready','lock'); $('#app').classList.remove('on');
  const it=$('#intro'); it.style.display='none'; it.classList.remove('on','off'); $('#skip').hidden=true;
  const m=$('#comm'); if(m) m.remove(); scrollTo(0,0);
  const g=$('#gate'); g.classList.remove('out'); idIn.value=''; gErr.textContent=''; setTimeout(()=>{ try{idIn.focus({preventScroll:true})}catch(e){} },400);
}
$('#outBtn').addEventListener('click',logout);
addEventListener('scroll',()=>{ const H=Math.max(1,document.documentElement.scrollHeight-innerHeight); const pr=Math.round(clamp(scrollY/H,0,1)*500)/500; const p=$('#progress'); if(p) p.style.transform='scaleX('+pr+')'; const bg=$('#cbg'); if(bg) bg.style.setProperty('--sy',(scrollY/H).toFixed(3)); },{passive:true});

/* ---------- intro ---------- */
function rollId(e,final,ms){
  if(RM){ e.textContent=final; return; }
  const t0=performance.now(); const step=n=>{ const p=clamp((n-t0)/ms,0,1); let o=''; for(let i=0;i<final.length;i++){ o+=(p>(i+1)/(final.length+1))?final[i]:(i===8?LET[Math.floor(Math.random()*23)]:Math.floor(Math.random()*10)); } e.textContent=p<1?o:final; if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step);
}
function finishIntro(){
  if(introDone) return; introDone=true; const it=$('#intro'); it.classList.add('off'); it.classList.remove('on'); $('#skip').hidden=true; document.body.classList.remove('lock'); document.body.classList.add('ready');
  setTimeout(()=>{ it.style.display='none'; },1600); scrollTo(0,0);
  const s0=$('#comm .s0'); if(s0) $$('.rv',s0).forEach(e=>e.classList.add('in'));
}
function intro(){
  started=true; introDone=false; const it=$('#intro'); it.style.display='grid'; it.classList.remove('off'); it.classList.add('on'); $('.line1',it).textContent=''; $('.line2',it).textContent=''; $('#skip').hidden=false;
  $('#skip').onclick=finishIntro;
  const l1=$('.line1',it), l2=$('.line2',it), big=$('.idbig',it); big.style.opacity=0;
  const L2='No. '+pad(MEMBER.n)+' of '+TOTAL+' · The Altuz community';
  if(RM){ l1.textContent=MEMBER.name?('Identity confirmed · '+MEMBER.name):'Identity confirmed'; big.style.opacity=1; big.textContent=myId; l2.textContent=L2; setTimeout(finishIntro,1200); return; }
  setTimeout(()=>{ l1.textContent=MEMBER.name?('Identity confirmed · '+MEMBER.name):'Identity confirmed'; },700);
  setTimeout(()=>{ big.style.transition='opacity 1s'; big.style.opacity=1; rollId(big,myId,1700); },1500);
  setTimeout(()=>{ l2.textContent=L2; },3600);
  setTimeout(finishIntro,6000);
}
addEventListener('keydown',e=>{ if(e.key==='Escape'&&!introDone&&started) finishIntro(); });
})();
