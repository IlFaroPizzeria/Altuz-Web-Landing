(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t, sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
['gate','app'].forEach(id=>{ const e=document.getElementById(id); if(e&&e.parentNode!==document.body) document.body.appendChild(e); });
const SHOP=window.ALTUZ_SHOP||null; const LET='TRWAGMYFPDXBNJZSQVHLCKE', SAMPLE='00000000T';
const narrow=()=>innerWidth<820;
let myId=SAMPLE, started=false;

/* ---------- data: the three pieces, from tech pack v1.3 ---------- */
const PIECES=[
 {key:'teeB',code:'ALT-D001-T01',name:'The Número Tee',colour:'ALTUZ Black',short:'Tee · Black'},
 {key:'teeW',code:'ALT-D001-T02',name:'The Número Tee',colour:'ALTUZ White',short:'Tee · White'},
 {key:'short',code:'ALT-D001-S01',name:'The Número Short',colour:'ALTUZ Black',short:'Race Short'}
];
const SPEC={
 teeB:[['Code','ALT-D001-T01 · Drop 001'],['Fabric','Recycled micro-polyester jersey 94 % / elastane 6 %, 100–110 g/m². Quick-dry and anti-odour. GRS and OEKO-TEX Standard 100'],['Construction','Thread-free. 10 mm TPU tape heat-sealed at every seam and hem. Laser-cut panels'],['Fit','Athletic, unisex. S · M · L · XL, base M. Weight in M about 100–115 g'],['Reflective','3M Scotchlite 8712 S silver. About 500 cd/lx/m², 30 washes (ISO 6330)'],['Ventilation','Laser micro-perforation 260 × 84 mm on the upper back, about 7 % open area'],['Labels','Neck 40 × 30 mm and hem 45 × 45 mm, printed straight onto the fabric. Your number in silver foil'],['Edition','Closed run of 100. Numbered 001 to 100. Defective units are never sold']],
 teeW:[['Code','ALT-D001-T02 · Drop 001'],['Fabric','Recycled micro-polyester jersey 94 % / elastane 6 %, 100–110 g/m². Opaque white, quick-dry, anti-odour'],['Construction','Identical to the black tee. Thread-free, 10 mm TPU tape, laser-cut panels'],['Fit','Athletic, unisex. S · M · L · XL, base M'],['Reflective','3M Scotchlite 8712 S silver, same placements: A over the heart, ALTUZ on each side'],['Back','RUN ELEVATED. in graphite, 300 × 21 mm, above the hem'],['Labels','Printed straight onto the fabric, number in silver foil'],['Edition','Closed run of 100. Numbered 001 to 100']],
 short:[['Code','ALT-D001-S01 · Drop 001'],['Fabric','4-way stretch tricot, recycled polyamide 88 % / elastane 12 %, 80–95 g/m². Mesh at the waist'],['Waist','40 mm micro-perforated mesh sleeve, 38 mm flat elastic, heat-sealed. 8 mm flat cord, laser-cut eyelets, no metal'],['Pockets','Outside back: 12 cm zip, 40 mm below the waist. Inside: open pocket 140 × 60 mm'],['Sides','Seam shifted 40 mm towards the back. 50 mm opening with a TPU reinforcing patch'],['Reflective','ALTUZ 200 × 36 mm on each side, 3M Scotchlite 8712 S'],['Fit','5″ length. S · M · L · XL, base M. Weight in M about 110–130 g'],['Edition','Closed run of 100. Numbered 001 to 100']]
};
/* beats: shot = camera az/el/dist around a target (garment-local cm), fov, sx/sy = framing offset */
const CH=[
 {g:'teeB',h:60,beats:[{s:{az:-30,el:6,d:21,t:[0,36,0],fov:30,sy:-.1},hero:1}]},
 {g:'teeB',h:100,beats:[
  {s:{az:-30,el:8,d:19,t:[0,36,0],fov:30,sx:.17},k:'I · ALT-D001-T01',t:'The Número Tee.',p:'Altuz began with a question. Why does the best run of the day happen at the hour when nobody can see you? We stopped asking drivers to look harder and wrote the light into the garment instead.',m:[['Black','ALTUZ'],['Edition','100']],side:'l'},
  {s:{az:330,el:10,d:18,t:[0,36,0],fov:30,sx:-.17},k:'The story',t:'Made for the hours nobody sees.',p:'Dawn, before the first bus. Dusk, after the last meeting. Silver in daylight, white under headlights. A tee that disappears into the dark and answers the moment a car turns the corner.',side:'r'},
  {s:{az:356,el:3,d:3.7,t:[9,47,6],fov:30,sx:-.14},k:'The mark · 01',t:'The A over the heart.',p:'Sixty-five millimetres of 3M Scotchlite 8712 S, transferred onto a flat panel before assembly so no film ever touches a seam. Quiet silver by day. Blazing white under a headlight.',m:[['Size','65 × 57 mm'],['Returns','≈ 500 cd/lx/m²'],['Washes','30']],hs:['A'],side:'r'},
  {s:{az:108,el:3,d:4.6,t:[19,24,-3],fov:30,sx:.12},k:'The word · 02',t:'The side belongs to the word.',p:'ALTUZ runs down each side, A at the top, 350 millimetres long. It sits where a passing headlight lands first. The side seam is shifted 50 mm towards the back so the word is never cut by a seam.',m:[['Wordmark','350 × 64 mm'],['Seam shift','50 mm'],['Per tee','2']],hs:['side'],side:'l'},
  {s:{az:178,el:4,d:6.2,t:[0,46,-10],fov:30,sx:-.14},k:'The back · 03',t:'Run elevated.',p:'The slogan sits low on the back, in matt white, where the person behind you reads it. Above it, the upper back is laser micro-perforated: 260 × 84 mm of air exactly where heat builds. The hem is 2 cm longer behind, with a soft curve.',m:[['Slogan','300 × 21 mm'],['Perforation','260 × 84 mm'],['Open area','≈ 7 %']],hs:['perf','slogan'],side:'r'},
  {s:{az:215,el:14,d:3.9,t:[14,65,-2],fov:30,sx:.14},k:'The construction · 04',t:'Not one stitch.',p:'There is no thread in the body of this tee. Panels are cut by laser and joined with 10 mm TPU tape, heat-sealed flat. No ridge on the shoulder, no seam against the skin, nothing to chafe at kilometre forty.',m:[['Joining','TPU tape 10 mm'],['Thread','None']],hs:['seam'],side:'l'},
  {s:{az:180,el:4,d:2.7,t:[0,64.5,-9],fov:30,sx:-.14},k:'The neck label · 05',t:'The number sits at your neck.',p:'A silicone sticker, bonded to the fabric and never sewn. ALTUZ and RUN ELEVATED. are embossed in silver on black, and your number sits underneath. It is the first thing you touch and the last thing you take off. 1 / 100 has to be true.',m:[['Material','Silicone, embossed'],['Edition','1 / 100']],hs:['neck'],side:'r'},
  {s:{az:338,el:-2,d:3.7,t:[-13,8,10],fov:30,sx:-.14},k:'The hem · 06',t:'Silver, straight on the fabric.',p:'The hem label is not a patch: ALTUZ, RUN ELEVATED. and your number, printed in silver straight onto the fabric. The run is closed: the exact quantity is made, and any defective unit is returned to Altuz, never sold. “1/100” has to be true.',m:[['Neck','Silicone sticker'],['Hem','Direct print'],['Run','001 – 100']],hs:['hem'],side:'r'},
  {s:{az:385,el:8,d:19,t:[0,36,0],fov:30,sx:.2},sheet:1}
 ]},
 {g:'teeW',h:100,beats:[
  {s:{az:-20,el:8,d:19,t:[0,36,0],fov:30,sx:.17},k:'II · ALT-D001-T02',t:'The day piece.',p:'The same tee, built for the opposite hour. White for the long light of a morning run, when the city is awake and the reflective is a quiet silver line along each side.',m:[['White','ALTUZ'],['Edition','100']],side:'l'},
  {s:{az:340,el:10,d:18,t:[0,36,0],fov:30,sx:-.17},k:'Same construction',t:'Same engineering. Opposite hour.',p:'Identical pattern, identical thread-free construction, identical reflective placements. Only the light changes. The A over the heart, ALTUZ on each side, your number in foil at the hem.',side:'r'},
  {s:{az:108,el:4,d:4.6,t:[19,24,-3],fov:30,sx:.12},k:'The word',t:'Silver on white.',p:'The wordmark is the same 350 × 64 mm of 3M Scotchlite 8712 S. On white it reads as a precise silver line by day, and it still lights up the moment a car approaches.',m:[['Wordmark','350 × 64 mm'],['Material','3M 8712 S']],hs:['side'],side:'l'},
  {s:{az:178,el:4,d:6.2,t:[0,46,-10],fov:30,sx:-.14},k:'The back',t:'Run elevated, in graphite.',p:'On white the slogan turns graphite for contrast. Same low placement, same 300 × 21 mm, same ventilated upper back.',hs:['perf','slogan'],side:'r'},
  {s:{az:385,el:8,d:19,t:[0,36,0],fov:30,sx:.2},sheet:1}
 ]},
 {g:'short',h:100,beats:[
  {s:{az:-30,el:8,d:10.5,t:[0,-14,0],fov:30,sx:.17},k:'III · ALT-D001-S01',t:'The Número Short.',p:'Five inches of stretch tricot, cut to disappear. It gives the leg room to run and nothing to catch the eye except the word on each side, waiting for the light.',m:[['Length','5″'],['Black','ALTUZ'],['Edition','100']],side:'l'},
  {s:{az:330,el:10,d:9.6,t:[0,-14,0],fov:30,sx:-.17},k:'The fabric',t:'Four ways to move.',p:'Recycled polyamide 88 % and elastane 12 %, a 4-way stretch tricot of only 80–95 g/m². It recovers, it dries in minutes, and in size M the whole short weighs about 110–130 g.',m:[['Fabric','PA 88 / EA 12'],['Weight','80–95 g/m²'],['Stretch','4-way']],side:'r'},
  {s:{az:12,el:12,d:3.6,t:[0,-3,10],fov:30,sx:-.14},k:'The waist · 01',t:'A waist that breathes.',p:'A 40 mm micro-perforated mesh sleeve holds a 38 mm flat elastic, heat-sealed so nothing is sewn. The 8 mm flat cord passes through two laser-cut eyelets. There is no metal anywhere on it.',m:[['Mesh sleeve','40 mm'],['Elastic','38 mm'],['Cord','8 mm flat']],hs:['waist'],side:'r'},
  {s:{az:105,el:4,d:5,t:[20,-14,-3],fov:30,sx:.12},k:'The side · 02',t:'The side opening.',p:'The side seam is shifted 40 mm towards the back, and each side ends in a 50 mm opening reinforced with a TPU patch. No labels beside it: the side belongs to the wordmark.',m:[['Seam shift','40 mm'],['Opening','50 mm'],['Wordmark','200 × 36 mm']],hs:['sidew','open'],side:'l'},
  {s:{az:182,el:8,d:5,t:[0,-8,-12],fov:30,sx:-.14},k:'The pockets · 03',t:'Quiet storage.',p:'Outside, a 12 cm zip pocket sits 40 mm below the waist on a back panel cut in one piece, with no centre seam. Inside, an open pocket of 140 × 60 mm holds a key and a card without bounce.',m:[['Zip','12 cm'],['Inner pocket','140 × 60 mm'],['Back','One piece']],hs:['zip'],side:'r'},
  {s:{az:385,el:8,d:10.5,t:[0,-14,0],fov:30,sx:.2},sheet:1}
 ]},
 {g:'all',h:90,beats:[{s:{az:360,el:5,d:40,t:[0,34,0],fov:30,sy:.13},final:1}]}
];
/* hotspots: garment-local cm */
const HS={
 teeB:{A:{p:[11.5,48],th:35,l:'Reflective A',e:'65 × 57 mm · 3M Scotchlite'},side:{p:[24],th:105,l:'ALTUZ · 350 × 64 mm',e:'One on each side'},perf:{p:[51.3],th:180,l:'Micro-perforation',e:'260 × 84 mm'},slogan:{p:[6.5],th:180,l:'RUN ELEVATED.',e:'300 × 21 mm'},seam:{v:[14,66,-1],l:'TPU tape · 10 mm',e:'Heat-sealed, no thread'},hem:{p:[7.25],th:-44,l:'Hem print · ALTUZ',e:'Run elevated · 1 / 100'},neck:{p:[66.5],th:180,l:'Neck sticker · silicone',e:'Embossed silver · 1 / 100'}},
 short:{waist:{p:[-2],th:-22,l:'Mesh waist · 40 mm',e:'Cord, laser eyelets'},sidew:{p:[-14],th:105,l:'ALTUZ · 200 × 36 mm',e:'3M Scotchlite 8712 S'},open:{v:[23,-31,-4],l:'Side opening · 50 mm',e:'TPU reinforcing patch'},zip:{p:[-9],th:180,l:'Zip pocket · 12 cm',e:'40 mm below the waist'}}
};
HS.teeW=HS.teeB;

/* ---------- gate ---------- */
const idIn=$('#idIn'), gErr=$('#gErr');
const validId=s=>/^\d{8}[A-Z]$/.test(s)&&LET[parseInt(s.slice(0,8),10)%23]===s[8];
let MEMBER={n:1,rank:'Founder',name:''};
const loadCfg=()=>new Promise(res=>{ if(window.ALTUZ_CONFIG) return res(window.ALTUZ_CONFIG); const s=document.createElement('script'); s.src='https://altuz-ten.vercel.app/assets/js/config.js'; s.onload=()=>res(window.ALTUZ_CONFIG||null); s.onerror=()=>res(null); document.head.appendChild(s); });
async function lookup(id){
  if(id===SAMPLE&&!SHOP) return {number:1,rank:'Founder'};
  const C=await loadCfg(); const url=((C&&C.supabaseUrl)||'').replace(/\/+$/,''), key=(C&&C.supabaseAnonKey)||''; if(!url||!key) throw new Error('cfg');
  const h={'apikey':key,'Content-Type':'application/json'}; if(!/^sb_/.test(key)) h.Authorization='Bearer '+key;
  const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000);
  try{ const r=await fetch(url+'/rest/v1/rpc/atelier_lookup',{method:'POST',headers:h,body:JSON.stringify({p_dni:id}),signal:ctl.signal}); if(!r.ok) throw new Error('http '+r.status); const d=await r.json(); const row=Array.isArray(d)?d[0]:d; return row&&row.number?row:null; } finally{ clearTimeout(to); }
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
if($('#useSample')) $('#useSample').addEventListener('click',()=>{ idIn.value=SAMPLE; $('#gateForm').requestSubmit?$('#gateForm').requestSubmit():login(SAMPLE); });
setTimeout(()=>{ try{idIn.focus({preventScroll:true})}catch(e){} },300);
/* arriving from the Altuz landing: the ID comes in the #hash (never sent to any server) and is checked straight away */
(function(){ const m=/[#&?]id=(\d{8}[A-Za-z])/.exec(location.hash||''); if(!m) return; try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} idIn.value=m[1].toUpperCase(); setTimeout(()=>{ const f=$('#gateForm'); if(f.requestSubmit) f.requestSubmit(); },500); })();

/* ---------- app ---------- */
let renderer,scene,camera,garments={},envReady=false,glOK=false;
let hsEls={}, state={ch:0,beat:0,key:''}, cam={az:-30,el:6,d:14,tx:0,ty:0,tz:0,fov:30,sx:0,sy:0}, yawDrag=0, lastDrag=0, flash=0, tAppear={teeB:1,teeW:0,short:0};

/* ---------- Shopify bridge ---------- */
const money=c=>SHOP?new Intl.NumberFormat(SHOP.locale||'en',{style:'currency',currency:SHOP.currency||'EUR',minimumFractionDigits:c%100?2:0}).format(c/100):'';
const variantOf=(k)=>SHOP&&SHOP.products&&SHOP.products[k]?SHOP.products[k].variants[sizes[k]]:null;
function priceTag(k){ const P=SHOP&&SHOP.products&&SHOP.products[k]; if(!P) return ''; const v=P.variants[sizes[k]]||Object.values(P.variants)[0]; return v?'<span class="pr" style="display:block;margin-top:4px;font:500 13px/1 var(--mark);letter-spacing:.12em;color:var(--steel)">'+money(v.price)+'</span>':''; }
function refreshPrices(){ $$('.pc').forEach(c=>{ const k=c.dataset.k; const v=variantOf(k); const pr=$('.pr',c); if(pr&&v) pr.textContent=money(v.price)+(v.available?'':' · sold out'); }); }
async function checkout(list,msg,btn){
  const items=list.map(p=>{ const v=variantOf(p.key); return v&&v.available?{id:v.id,quantity:1,properties:{'Member ID':myId,'Number':MEMBER.n+' / 100','Piece':p.code,'Size':sizes[p.key]}}:null; });
  if(items.some(x=>!x)){ msg.textContent='One of the pieces in that size is sold out. Choose another size.'; return; }
  btn.disabled=true; btn.textContent='One moment…'; msg.textContent='';
  try{
    await fetch((SHOP.root||'/')+'cart/clear.js',{method:'POST',headers:{'Content-Type':'application/json'}});
    const r=await fetch((SHOP.root||'/')+'cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:items})});
    if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j.description||j.message||'Could not add to the cart'); }
    location.href=(SHOP.root||'/')+'checkout';
  }catch(e){ btn.disabled=false; btn.textContent='Continue to checkout'; msg.textContent=String(e.message||e); }
}
const sizes={teeB:'M',teeW:'M',short:'M'}, picked={teeB:false,teeW:false,short:false};

const NUMRE=/\b\d{1,3} ?\/ ?100\b/g;
function stamp(o){ if(typeof o==='string') return o.replace(NUMRE,MEMBER.n+' / 100'); if(Array.isArray(o)){ for(let i=0;i<o.length;i++) o[i]=stamp(o[i]); return o; } if(o&&typeof o==='object'){ for(const k in o) o[k]=stamp(o[k]); } return o; }
function login(id,row){
  myId=id; MEMBER={n:Math.max(1,Math.min(100,parseInt(row&&row.number,10)||1)),rank:(row&&row.rank)||'Origin',name:String((row&&row.alias)||'').replace(/[\u0000-\u001f<>&"'`]/g,'').trim().slice(0,40)};
  $$('[data-id]').forEach(e=>e.textContent=id);
  $('#rank').textContent=(MEMBER.name?MEMBER.name+' · ':'')+MEMBER.rank+' · No. '+MEMBER.n+' / 100';
  const ps=$('.plate small'); if(ps){ ps.textContent=''; ps.appendChild(document.createElement('i')); ps.appendChild(document.createTextNode(MEMBER.name?MEMBER.name+' · Member ID':'Member ID')); }
  const he=$('#hero .eyebrow'); if(he) he.textContent=(MEMBER.name?'Welcome back, '+MEMBER.name:'Welcome back')+' · No. '+MEMBER.n+' / 100';
  stamp(CH); stamp(HS); stamp(SPEC);
  const changed=window.ALTUZ&&ALTUZ.n!==MEMBER.n; if(window.ALTUZ&&ALTUZ.setNumber&&changed) ALTUZ.setNumber(MEMBER.n);
  $('#gate').classList.add('out'); $('#app').classList.add('on');
  try{ document.body.classList.add('lock'); }catch(e){}
  SPS=[]; lastCi=-1; buildStory(); requestAnimationFrame(measure); initGL(); if(glOK&&changed&&builtN&&builtN!==MEMBER.n) rebuildGarments(); intro();
}
let builtN=0;
function rebuildGarments(){ try{ Object.values(garments).forEach(g=>scene.remove(g)); garments=buildGarments(); builtN=MEMBER.n; }catch(e){ console.warn(e); } }

function buildStory(){
  const st=$('#story'); st.innerHTML='';
  CH.forEach((c,i)=>{ const d=document.createElement('div'); d.className='sp'; d.dataset.i=i; d.style.height=(c.h*Math.max(1,c.beats.length*.9+(c.beats.length>1?1:0))*(c.beats.length>1?1:1))+'vh'; if(c.beats.length>1) d.style.height=((c.beats.length*88)+60)+'vh'; else d.style.height=(c.h+40)+'vh'; st.appendChild(d); });
  const dots=$('#dots'); dots.innerHTML='';
  ['Entrance','Tee · Black','Tee · White','Race Short','The outfit'].forEach((n,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',n); b.title=n; b.addEventListener('click',()=>{ const sp=$$('.sp')[i]; scrollTo({top:sp.offsetTop+ (i? 4:0),behavior:RM?'auto':'smooth'}); }); dots.appendChild(b); });
  // hotspots dom
  const hc=$('#hotspots'); hc.innerHTML=''; hsEls={};
  ['teeB','short'].forEach(g=>{ Object.keys(HS[g]).forEach(k=>{ const el=document.createElement('div'); el.className='hs'; el.innerHTML='<i></i><span>'+HS[g][k].l+'<em>'+HS[g][k].e+'</em></span>'; hc.appendChild(el); hsEls[g+':'+k]=el; }); });
  // outfit cards
  const of=$('#outfit'); of.innerHTML='';
  PIECES.forEach(p=>{ const c=document.createElement('div'); c.className='pc'; c.dataset.k=p.key;
    c.innerHTML='<div><small>'+p.code+' · '+p.colour+'</small><h4>'+p.name+'</h4>'+priceTag(p.key)+'</div><div class="sizes" role="group" aria-label="Size for '+p.short+'">'+['S','M','L','XL'].map(s=>'<button type="button" aria-pressed="'+(s==='M')+'" data-s="'+s+'">'+s+'</button>').join('')+'</div><button class="btn ghost add" type="button">Add to my ID</button>';
    of.appendChild(c); });
  of.onclick=e=>{
    const card=e.target.closest('.pc'); if(!card) return; const k=card.dataset.k;
    const sb=e.target.closest('.sizes button'); if(sb){ sizes[k]=sb.dataset.s; refreshPrices(); $$('.sizes button',card).forEach(b=>b.setAttribute('aria-pressed',b===sb?'true':'false')); return; }
    if(e.target.closest('.add')){ picked[k]=!picked[k]; syncBag(); }
  };
}
setTimeout(refreshPrices,0);
function logout(){
  started=false; introDone=false; clearTimeout(capTimer); capKey=''; REV.clear(); enterKey=''; state.ch=0;
  document.body.classList.remove('ready','lock'); $('#app').classList.remove('on');
  const it=$('#intro'); it.style.display='none'; it.classList.remove('on','off'); $('#skip').hidden=true;
  ['hero','cap','sheet','outfit','finalBar'].forEach(id=>$('#'+id).classList.remove('on'));
  $$('.hs').forEach(h=>h.classList.remove('on')); Object.keys(picked).forEach(k=>picked[k]=false); syncBag();
  const m=$('#modal'); if(m) m.remove(); scrollTo(0,0);
  const g=$('#gate'); g.classList.remove('out'); idIn.value=''; gErr.textContent=''; setTimeout(()=>{ try{idIn.focus({preventScroll:true})}catch(e){} },400);
}
$('#outBtn').addEventListener('click',logout);
function syncBag(){
  const n=Object.values(picked).filter(Boolean).length; $('#bagN').textContent=n;
  $$('.pc').forEach(c=>{ const on=picked[c.dataset.k]; c.classList.toggle('sel',on); const b=$('.add',c); b.textContent=on?'Added to my ID':'Add to my ID'; b.classList.toggle('ghost',!on); });
}
function openModal(){
  const list=PIECES.filter(p=>picked[p.key]);
  const live=!!(SHOP&&SHOP.products&&myId!==SAMPLE);
  const total=list.reduce((n,p)=>{ const v=variantOf(p.key); return n+(v?v.price:0); },0);
  const m=document.createElement('div'); m.id='modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','mH');
  const rows=list.map(p=>{ const v=variantOf(p.key); return '<li><b>'+p.name+' · '+p.colour+'</b><span>Size '+sizes[p.key]+(v?' · '+money(v.price):'')+'</span></li>'; }).join('');
  m.innerHTML='<div class="box"><span class="eyebrow">'+(live?'Your order':'Reservation · preview')+'</span><h3 class="wide chrome" id="mH">'+(list.length?(live?'Held for '+(MEMBER.name?MEMBER.name+' · ':'')+myId+'.':'Reserved to '+myId+'.'):'Nothing chosen yet.')+'</h3>'
   +(list.length?'<p>'+(live?'Each piece is numbered in silver foil and written against your ID. Your ID travels with the order.':'Nothing has been charged or sent: this is a preview of the members’ shop (sample ID).')+'</p><ul>'+rows+'</ul>'+(live&&total?'<p style="font:500 15px/1.4 var(--mark);letter-spacing:.1em">Total · '+money(total)+'</p>':''):'<p>Choose a size and add the pieces you want. They are linked to your ID, ready for pre-sale.</p>')
   +'<p id="mMsg" role="alert" style="color:#e9a3a3;min-height:1.4em"></p>'
   +(live&&list.length?'<button class="btn" type="button" id="mGo">Continue to checkout</button> ':'')+'<button class="btn ghost" type="button" id="mClose">'+(list.length?'Close':'Back to the atelier')+'</button></div>';
  document.body.appendChild(m); const c=$('#mClose',m); (live&&list.length?$('#mGo',m):c).focus(); const close=()=>{ m.remove(); document.removeEventListener('keydown',esc); }; const esc=e=>{ if(e.key==='Escape') close(); };
  c.addEventListener('click',close); m.addEventListener('click',e=>{ if(e.target===m) close(); }); document.addEventListener('keydown',esc);
  const go=$('#mGo',m); if(go) go.addEventListener('click',()=>checkout(list,$('#mMsg',m),go));
}
$('#bagBtn').addEventListener('click',openModal); $('#reserveBtn').addEventListener('click',openModal);

/* ---------- three.js ---------- */
function envTex(){
  const c=document.createElement('canvas'); c.width=1024; c.height=512; const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512); g.addColorStop(0,'#1a1d22'); g.addColorStop(.5,'#0a0b0d'); g.addColorStop(1,'#040405'); x.fillStyle=g; x.fillRect(0,0,1024,512);
  const box=(cx,cy,w,h,a)=>{ const gr=x.createLinearGradient(cx-w/2,0,cx+w/2,0); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(.2,'rgba(255,255,255,'+a+')'); gr.addColorStop(.8,'rgba(255,255,255,'+a+')'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(cx-w/2,cy-h/2,w,h); };
  box(180,150,170,230,1); box(560,110,300,70,.9); box(860,190,120,260,.75); box(420,330,60,200,.55); box(980,120,70,150,.6); box(60,300,50,160,.4);
  const t=new THREE.CanvasTexture(c); t.mapping=THREE.EquirectangularReflectionMapping; t.encoding=THREE.sRGBEncoding; return t;
}
function noiseBump(){
  const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); const d=x.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){ const v=128+((Math.sin((i/4%256)*1.9)+Math.sin(Math.floor(i/1024)*1.9))*18)+Math.random()*40; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; }
  x.putImageData(d,0,0); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(26,18); return t;
}
const sec=(S,y)=>{ // piecewise-linear section {rx,rz} at height y (cm); S sorted by y asc
  if(y<=S[0].y) return S[0]; for(let i=1;i<S.length;i++){ if(y<=S[i].y){ const a=S[i-1],b=S[i],t=(y-a.y)/(b.y-a.y); return {rx:lerp(a.rx,b.rx,t),rz:lerp(a.rz,b.rz,t)}; } } return S[S.length-1];
};
function loft(S,M,vmin,vmax,cx){
  const pos=[],uv=[],idx=[]; const N=S.length;
  for(let i=0;i<N;i++){ const s=S[i]; for(let j=0;j<=M;j++){ const th=-Math.PI+2*Math.PI*j/M; pos.push((s.cx!==undefined?s.cx:(cx||0))+s.rx*Math.sin(th),s.y,s.rz*Math.cos(th)); uv.push(.25+th/(2*Math.PI),(s.y-vmin)/(vmax-vmin)); } }
  for(let i=0;i<N-1;i++) for(let j=0;j<M;j++){ const a=i*(M+1)+j,b=a+M+1; idx.push(a,b,a+1,a+1,b,b+1); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const A_PATH='M44 0L53 0Q58 1 60.8 6L99.6 83.9L82.2 83.9L48.6 19.6L21.2 72.6L51 67.9L19.5 84L0.3 84L29.4 23.6L39.2 5.2Q41 1 44 0Z';
/* texture painter. spec: {W,H,S,vmin,vmax,cx,items:(helpers)=>void}; mode: 'c' colour,'m' metal,'r' rough */
function paint(spec,mode,pal){
  const q=narrow()?.67:1, W=Math.round((mode==='c'?3072:mode==='m'?2048:1024)*q), H=Math.round(W/2); const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  const col={c:{bg:pal.bg,sil:pal.sil,wh:pal.wh,lab:'#80868e',hole:pal.hole},m:{bg:'#000',sil:'#fff',wh:'#000',lab:'#7a7a7a',hole:'#000'},r:{bg:'#e2e2e2',sil:'#3c3c3c',wh:'#e2e2e2',lab:'#6c6c6c',hole:'#e2e2e2'}}[mode];
  x.fillStyle=col.bg; x.fillRect(0,0,W,H);
  const Y=y=>(1-(y-spec.vmin)/(spec.vmax-spec.vmin))*H; const pxcm=(spec.vmax-spec.vmin)/H; // cm per px vertical
  const ds=(S,y,th)=>{ const s=sec(S,y); return Math.hypot(s.rx*Math.cos(th),s.rz*Math.sin(th)); };
  const API={
    W,H,col,x,
    Y,
    X:th=>((.25+th/(2*Math.PI))%1+1)%1*W,
    hpx:(S,y,th)=>W/(2*Math.PI)/ds(S,y,th), // px per cm horizontally
    vpx:1/pxcm
  };
  spec.draw(API,mode,pal); const t=new THREE.CanvasTexture(c); t.wrapS=THREE.RepeatWrapping; t.anisotropy=8; t.encoding=mode==='c'?THREE.sRGBEncoding:THREE.LinearEncoding; return t;
}
function fitText(x,txt,w,h,font){ x.font=font||'800 100px Archivo, Arial, sans-serif'; const m=x.measureText(txt).width; x.save(); x.scale(w/m,h/72); x.textAlign='center'; x.textBaseline='alphabetic'; x.fillText(txt,0,36); x.restore(); }
function logoAt(x,cx,cy,w,h){ x.save(); x.translate(cx-w/2,cy-h/2); x.scale(w/100,h/84); x.fill(new Path2D(A_PATH)); x.restore(); }
function dedupe(draw,W,th){ draw(0); if(th!==undefined) draw(W); }

const TEE_S=[{y:0,rx:20.5,rz:12.5},{y:8,rx:20.2,rz:12.2},{y:25,rx:19.2,rz:11.5},{y:40,rx:20,rz:12},{y:52,rx:20.6,rz:12.2},{y:58,rx:19.8,rz:11},{y:63,rx:17,rz:9.6},{y:67,rx:13,rz:8},{y:69.5,rx:9.6,rz:7.2},{y:70.5,rx:9,rz:6.8}];
const SH_PEL=[{y:-17,rx:19.6,rz:11},{y:-15,rx:20.3,rz:12.4},{y:-9,rx:20.4,rz:12.6},{y:-4,rx:19.8,rz:12.2},{y:0,rx:19.2,rz:11.8}];
const SH_LEG=[{y:-29.5,rx:11.2,rz:12.9,cx:9.5},{y:-24,rx:11.0,rz:12.8,cx:9.3},{y:-19,rx:11.4,rz:12.7,cx:8.9},{y:-14.5,rx:12.1,rz:12.5,cx:8.2}];

function teeDraw(S,white){ return (A,mode,pal)=>{ const x=A.x,c=A.col;
  const metalFill=mode==='c'?pal.sil:c.sil;
  // tape lines at hems
  if(mode==='c'){ x.fillStyle=white?'rgba(0,0,0,.07)':'rgba(255,255,255,.05)'; x.fillRect(0,A.Y(1.0),A.W,A.Y(0)-A.Y(1.0)); x.fillRect(0,A.Y(70.5),A.W,A.Y(69.5)-A.Y(70.5)); }
  // perforation
  { x.fillStyle=c.hole; const th0=Math.PI, w=26, sp=.55; for(let yy=47.1;yy<=55.5;yy+=sp){ for(let u=-w/2;u<=w/2;u+=sp){ const th=Math.PI+u/20.4; x.beginPath(); x.arc(A.X(th),A.Y(yy),(mode==='c'?2.4:2)*A.W/2048,0,7); x.fill(); } } }
  // chest A (wearer's left → +x)
  x.fillStyle=metalFill; logoAt(x,A.X(35*Math.PI/180),A.Y(48),6.5*A.hpx(S,48,.61),5.7*A.vpx);
  // side wordmarks, vertical, A at top
  [105,-105].forEach(d=>{ const th=d*Math.PI/180; const draw=ox=>{ x.save(); x.translate(A.X(th)+ox,A.Y(22.5)); x.rotate(Math.PI/2); x.fillStyle=metalFill; fitText(x,'ALTUZ',35*A.vpx,6.4*A.hpx(S,22.5,th)); x.restore(); }; draw(0); if(Math.abs(A.X(th)-0)<260) draw(A.W); if(Math.abs(A.X(th)-A.W)<260) draw(-A.W); });
  // slogan on the back
  x.save(); x.translate(A.X(Math.PI),A.Y(6.5)); x.fillStyle=mode==='c'?(white?'#2a2d31':pal.wh):c.wh; fitText(x,'RUN ELEVATED.',30*A.hpx(S,6.5,Math.PI),2.1*A.vpx,'700 100px Archivo, Arial, sans-serif'); x.restore();
  // labels
  const label=(th,y,wc,hc,txt)=>{ x.save(); x.fillStyle=c.lab; const px=A.X(th),py=A.Y(y),w=wc*A.hpx(S,y,th),h=hc*A.vpx; x.fillRect(px-w/2,py-h/2,w,h); if(mode==='c'){ x.fillStyle='#d9dde2'; x.translate(px,py+h*.28); fitText(x,txt,w*.62,h*.2,'700 100px Archivo, Arial, sans-serif'); x.restore(); x.save(); x.fillStyle='#d9dde2'; logoAt(x,px,py-h*.22,w*.28,h*.22); } x.restore(); };
  const NUMT=(window.ALTUZ&&ALTUZ.num)||'001/100'; label(Math.PI,67,4,3,NUMT); label(-44*Math.PI/180,7.25,4.5,4.5,NUMT);
}; }
function shortPelDraw(S){ return (A,mode,pal)=>{ const x=A.x,c=A.col;
  // waist mesh band
  if(mode==='c'){ x.fillStyle='rgba(255,255,255,.045)'; x.fillRect(0,A.Y(0),A.W,A.Y(-4)-A.Y(0)); x.fillStyle='#030304'; for(let yy=-.5;yy>-3.6;yy-=.45) for(let u=0;u<A.W;u+=9){ x.beginPath(); x.arc(u+(Math.round(yy/.45)%2?4:0),A.Y(yy),1.6,0,7); x.fill(); } x.fillStyle='rgba(255,255,255,.09)'; x.fillRect(0,A.Y(-4.1),A.W,2); }
  // eyelets
  if(mode==='c'){ x.fillStyle='#000'; [-.07,.07].forEach(t=>{ x.beginPath(); x.ellipse(A.X(t),A.Y(-2),5,3.2,0,0,7); x.fill(); }); }
  // wordmarks sides (vertical, A at top, top edge 4 cm below waist)
  [105,-105].forEach(d=>{ const th=d*Math.PI/180; const draw=ox=>{ x.save(); x.translate(A.X(th)+ox,A.Y(-14)); x.rotate(Math.PI/2); x.fillStyle=mode==='c'?pal.sil:c.sil; fitText(x,'ALTUZ',20*A.vpx,3.6*A.hpx(S,-14,th)); x.restore(); }; draw(0); if(A.X(th)<260) draw(A.W); if(A.X(th)>A.W-260) draw(-A.W); });
  // zip
  x.save(); x.strokeStyle=mode==='c'?'#262a30':(mode==='m'?'#000':'#e2e2e2'); x.lineWidth=5; x.beginPath(); x.moveTo(A.X(Math.PI)-6*A.hpx(S,-5.5,Math.PI),A.Y(-5.5)); x.lineTo(A.X(Math.PI)+6*A.hpx(S,-5.5,Math.PI),A.Y(-5.5)); x.stroke(); if(mode==='c'){ x.strokeStyle='#5b616a'; x.lineWidth=1.5; x.setLineDash([2,3]); x.stroke(); x.setLineDash([]); x.fillStyle='#9aa1aa'; x.beginPath(); x.arc(A.X(Math.PI)+6*A.hpx(S,-5.5,Math.PI),A.Y(-5.5),6,0,7); x.fill(); } x.restore();
}; }
function shortLegDraw(S){ return (A,mode,pal)=>{ const x=A.x,c=A.col;
  [105,-105].forEach(d=>{ const th=d*Math.PI/180; const draw=ox=>{ x.save(); x.translate(A.X(th)+ox,A.Y(-14)); x.rotate(Math.PI/2); x.fillStyle=mode==='c'?pal.sil:c.sil; fitText(x,'ALTUZ',20*A.vpx,3.6*A.hpx(S,-14,th)); x.restore(); }; draw(0); if(A.X(th)<260) draw(A.W); if(A.X(th)>A.W-260) draw(-A.W); });
  if(mode==='c'){ x.fillStyle='rgba(255,255,255,.07)'; x.fillRect(0,A.Y(-29),A.W,A.Y(-29.5)-A.Y(-29)); }
}; }

function makeMats(draw,spec,pal,bump,pw){
  const map=paint({...spec,draw},'c',pal), mm=paint({...spec,draw},'m',pal), rr=paint({...spec,draw},'r',pal);
  const m=new THREE.MeshStandardMaterial({map,metalnessMap:mm,roughnessMap:rr,metalness:1,roughness:1,emissive:0xffffff,emissiveMap:mm,emissiveIntensity:0,side:THREE.DoubleSide,color:0xffffff});
  m.userData.pw=pw; return m;
}
function buildGarments(){
  const reg={}; const h=narrow()?.78:((navigator.hardwareConcurrency||4)>=8?.58:.66);
  [['teeB',false],['teeW',true],['short',null]].forEach(([k])=>{ const g=new THREE.Group(); g.scale.setScalar(.1); g.position.y=k==='short'?1.4:-3.5; g.userData={}; g.visible=k==='teeB'; reg[k]=g; scene.add(g); });
  const queue=['teeB','short','teeW']; let i=0;
  const next=()=>{ if(i>=queue.length) return; const k=queue[i++]; setTimeout(()=>{ try{ const sz=sizes[k]; const m=k==='short'?ALTUZ.buildShort(sz,{h}):ALTUZ.buildTee(sz,{white:k==='teeW',h}); const inner=m.group; inner.position.y=k==='short'?0:70; reg[k].add(inner); reg[k].userData.probe=inner.userData.probe; reg[k].userData.oy=inner.position.y; reg[k].userData.ready=true; }catch(e){ console.warn('garment build failed',k,e); } next(); },80); };
  (document.fonts&&document.fonts.load?Promise.all(["500 40px Jost","800 40px Archivo"].map(f=>document.fonts.load(f))).catch(()=>{}):Promise.resolve()).then(next);
  return reg;
}
function hsPoint(G,def){ const U=G.userData; if(!U.ready) return null; U.hsc=U.hsc||{}; const key=JSON.stringify(def.p)+'|'+def.th; if(U.hsc[key]) return U.hsc[key].clone(); const oy=U.oy||0, th=def.th*Math.PI/180; let o,d;
  if(def.p.length>1){ const fr=Math.cos(th)>=0?1:-1; o=[def.p[0],def.p[1]-oy,60*fr]; d=[0,0,-fr]; } else { o=[60*Math.sin(th),def.p[0]-oy,60*Math.cos(th)]; d=[-Math.sin(th),0,-Math.cos(th)]; }
  const hit=U.probe(o,d); if(!hit) return null; const v=new THREE.Vector3(hit.p.x+hit.n.x*.9,hit.p.y+hit.n.y*.9+oy,hit.p.z+hit.n.z*.9); U.hsc[key]=v; return v.clone(); }
function initGL(){
  if(glOK) return;
  try{
    if(!window.THREE) throw 0;
    const cv=$('#gl'); renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!narrow(),alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,narrow()?1.5:2)); renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; renderer.setClearColor(0x060708,1);
    scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x060708,.008);
    camera=new THREE.PerspectiveCamera(30,1,.1,120);
    const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromEquirectangular(envTex()).texture;
    const key=new THREE.SpotLight(0xffffff,2.6,60,.5,.6,1); key.position.set(-7,9,8); scene.add(key); scene.add(key.target);
    const rim=new THREE.SpotLight(0xbcd2ff,3.2,60,.7,.7,1); rim.position.set(8,6,-9); scene.add(rim);
    scene.add(new THREE.AmbientLight(0x20242a,.6));
    // floor pool of light
    const fc=document.createElement('canvas'); fc.width=fc.height=256; const fx=fc.getContext('2d'); const gr=fx.createRadialGradient(128,128,4,128,128,128); gr.addColorStop(0,'rgba(210,222,240,.30)'); gr.addColorStop(.45,'rgba(120,135,160,.10)'); gr.addColorStop(1,'rgba(0,0,0,0)'); fx.fillStyle=gr; fx.fillRect(0,0,256,256);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(fc),transparent:true,depthWrite:false})); floor.rotation.x=-Math.PI/2; floor.position.y=-4.6; scene.add(floor); scene.userData.floor=floor;
    garments=buildGarments(); builtN=MEMBER.n; glOK=true; resize(); addEventListener('resize',resize);
    bindDrag(cv); requestAnimationFrame(loop);
  }catch(e){ $('#nogl').style.display='grid'; console.warn('3D unavailable',e); glOK=false; requestAnimationFrame(loop); }
}
function resize(){ if(!renderer) return; const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
function bindDrag(cv){
  let down=false,lx=0; const onDown=e=>{ down=true; lx=e.clientX; };
  cv.addEventListener('pointerdown',onDown); addEventListener('pointerup',()=>{ down=false; lastDrag=performance.now(); }); addEventListener('pointermove',e=>{ if(!down) return; yawDrag+=(e.clientX-lx)*.01; lx=e.clientX; lastDrag=performance.now(); });
}

/* ---------- scroll → state ---------- */
let sY=0, introDone=false;
let SPS=[], SPT=[], SPH=[], DOCH=1, DOTS=[], lastCi=-1, lastYaw=-1, lastProg=-1;
function measure(){ SPS=$$('.sp'); SPT=SPS.map(s=>s.offsetTop); SPH=SPS.map(s=>s.offsetHeight); DOCH=Math.max(1,document.documentElement.scrollHeight-innerHeight); DOTS=$$('#dots button'); BEATS=[]; CH.forEach((c,ci)=>{ const N=c.beats.length, top=SPT[ci]-innerHeight*.35, span=Math.max(1,SPH[ci]-innerHeight*.35); for(let i=0;i<N;i++) BEATS.push({key:ci+':'+i,y:top+(i/N)*span}); }); }
let BEATS=[]; const REV=new Set(); let enterT=0, enterKey='';
function hsReady(ci,bi){ const c=CH[ci], b=c.beats[bi]; return (b.hs||[]).every(h=>{ const el=hsEls[(c.g==='teeW'?'teeB':c.g)+':'+h]; if(!el) return true; if(getComputedStyle(el).display==='none') return true; return el.style.opacity!=='0'&&el.classList.contains('on'); }); }
function gate(now){
  return; if(!introDone||!BEATS.length||!glOK) return; let fu=-1; for(let i=0;i<BEATS.length;i++){ if(!REV.has(BEATS[i].key)){ fu=i; break; } }
  if(fu<0) return;
  if(enterKey===BEATS[fu].key&&!REV.has(enterKey)){ const [ci,bi]=enterKey.split(':').map(Number); const dt=now-enterT; if(RM?dt>400:(dt>3500||(dt>1500&&hsReady(ci,bi)))) REV.add(enterKey); }
  if(fu>=BEATS.length-1||REV.has(BEATS[fu].key)) return; const lim=BEATS[fu+1].y-3; if(scrollY>lim) scrollTo(0,lim); }
addEventListener('resize',()=>{ measure(); });
function read(){
  if(!SPS.length) measure();
  const y=scrollY; let ci=0; for(let i=0;i<SPT.length;i++){ if(y>=SPT[i]-innerHeight*.35) ci=i; }
  const span=Math.max(1,SPH[ci]-innerHeight*.35); const p=clamp((y-(SPT[ci]-innerHeight*.35))/span,0,.9999);
  return {ci,p};
}
function targetShot(ci,p){
  const c=CH[ci], N=c.beats.length, u=p*N, i=Math.min(N-1,Math.floor(u)), f=u-i; const a=c.beats[i].s, b=c.beats[Math.min(N-1,i+1)].s; const t=i<N-1?sm((f-.5)/.5):0;
  const lerpS=(k,d)=>lerp(a[k]??d,b[k]??d,t); const dd=lerpS('d',12); const m=narrow()?(dd>15?1.35:(dd>8?1.7:2.4)):1;
  const ta=a.t,tb=b.t;
  return {az:lerpS('az',0),el:lerpS('el',6),d:lerpS('d',12)*m,t:[lerp(ta[0],tb[0],t),lerp(ta[1],tb[1],t),lerp(ta[2],tb[2],t)],fov:lerpS('fov',30),sx:narrow()?0:-lerpS('sx',0),sy:narrow()?(c.beats[i].final?.2:-.08):lerpS('sy',0),beat:i};
}
const wpos=(g,v)=>{ const G=garments[g]; return new THREE.Vector3(G.position.x+v[0]*.1,G.position.y+v[1]*.1,G.position.z+v[2]*.1); };
let capKey='',capTimer=0;
function setCaption(ci,bi){
  const key=ci+':'+bi; if(key===capKey) return; capKey=key; enterKey=key; enterT=performance.now(); const c=CH[ci], b=c.beats[bi]; const cap=$('#cap'), sheet=$('#sheet'), hero=$('#hero'), of=$('#outfit'), fb=$('#finalBar');
  cap.classList.remove('on'); sheet.classList.remove('on'); hero.classList.toggle('on',!!b.hero&&introDone); of.classList.toggle('on',!!b.final); fb.classList.toggle('on',!!b.final);
  if(!RM&&ci>0) $('#flare').classList.remove('go'),void $('#flare').offsetWidth,$('#flare').classList.add('go'); flash=1;
  $$('.hs').forEach(h=>h.classList.remove('on'));
  clearTimeout(capTimer);
  capTimer=setTimeout(()=>{
    if(b.sheet){ const g=c.g; const P=PIECES.find(p=>p.key===g); sheet.innerHTML='<span class="code">'+P.code+' · Atelier sheet</span><h3>'+P.name+' · '+P.colour+'</h3><dl>'+SPEC[g].map(r=>'<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>').join('')+'</dl>'; sheet.classList.add('on'); sheet.scrollTop=0; }
    else if(b.k){ cap.classList.toggle('r',b.side==='r'); $('.eyebrow',cap).textContent=b.k; $('h2',cap).textContent=b.t; $('p',cap).textContent=b.p; $('.meta',cap).innerHTML=(b.m||[]).map(m=>'<span>'+m[0]+' <b>'+m[1]+'</b></span>').join(''); cap.classList.add('on'); }
    (b.hs||[]).forEach(h=>{ const el=hsEls[(c.g==='teeW'?'teeB':c.g)+':'+h]; if(el) el.classList.add('on'); });
  },RM?0:320);
}
function showGarments(ci){
  const c=CH[ci]; ['teeB','teeW','short'].forEach(k=>{ tAppear[k]=(c.g===k||c.g==='all')?1:0; });
  const sp=c.g==='all'?9.4:0; if(garments.teeB){ garments.teeB.userData.tx=-sp; garments.teeW.userData.tx=0; garments.short.userData.tx=sp; ['teeB','teeW','short'].forEach(k=>{ if(c.g!=='all') garments[k].userData.tx=0; }); }
}
let last=performance.now(), scrollLocked=true, curYaw=0;
function loop(now){
  requestAnimationFrame(loop); const dt=Math.min(.05,(now-last)/1000); last=now;
  if(!started) return;
  const {ci,p}=read(); const sh=targetShot(ci,p);
  if(state.ch!==ci){ if(glOK) showGarments(ci); state.ch=ci; }
  setCaption(ci,sh.beat); gate(now);
  if(ci!==lastCi){ lastCi=ci; DOTS.forEach((d,i)=>d.classList.toggle('on',i===ci)); }
  if(!glOK) return;
  const k=RM?1:1-Math.exp(-dt*3.4);
  cam.az=lerp(cam.az,sh.az,k); cam.el=lerp(cam.el,sh.el,k); cam.d=lerp(cam.d,sh.d,k); cam.fov=lerp(cam.fov,sh.fov,k); cam.sx=lerp(cam.sx,sh.sx,k); cam.sy=lerp(cam.sy,sh.sy,k);
  const g0=CH[ci].g==='all'?'teeW':CH[ci].g; const T=wpos(g0,sh.t); cam.tx=lerp(cam.tx,T.x,k); cam.ty=lerp(cam.ty,T.y,k); cam.tz=lerp(cam.tz,T.z,k);
  const breathe=RM?0:Math.sin(now/2600)*.12; const az=(cam.az+breathe*6)*Math.PI/180, el=(cam.el+breathe)*Math.PI/180;
  camera.position.set(cam.tx+cam.d*Math.sin(az)*Math.cos(el),cam.ty+cam.d*Math.sin(el),cam.tz+cam.d*Math.cos(az)*Math.cos(el)); camera.lookAt(cam.tx,cam.ty,cam.tz);
  camera.fov=cam.fov; const W=innerWidth,H=innerHeight; if(Math.abs(cam.sx)>.001||Math.abs(cam.sy)>.001) camera.setViewOffset(W,H,cam.sx*W,cam.sy*H,W,H); else camera.clearViewOffset(); camera.updateProjectionMatrix();
  if(now-lastDrag>1800) yawDrag*=Math.exp(-dt*1.6);
  flash=Math.max(0,flash-dt*.9);
  Object.keys(garments).forEach(key=>{ const G=garments[key]; const want=tAppear[key]; G.userData.s=lerp(G.userData.s??(key==='teeB'?1:0),want,RM?1:1-Math.exp(-dt*5)); const s=G.userData.s; G.visible=s>.02; G.scale.setScalar(.1*(.9+.1*s)); const tx=G.userData.tx||0; G.position.x=lerp(G.position.x,tx,1-Math.exp(-dt*3)); G.rotation.y=(CH[ci].g==='all'?Math.sin(now/2600+key.length*1.7)*.42:0)+yawDrag*(CH[ci].g===key?1:0); G.position.y=(key==='short'?1.4:-3.5)+(RM?0:Math.sin(now/1900+key.length)*.05);
    if(G.visible){ if(!G.userData.rm||G.userData.rmN!==G.children.length){ const L=[]; G.traverse(o=>{ if(o.material&&o.material.userData&&o.material.userData.retro) L.push(o.material); }); G.userData.rm=L; G.userData.rmN=G.children.length; } const ei=.06+flash*1.6+(Math.sin(now/1700)*.5+.5)*.12; G.userData.rm.forEach(m=>{ m.emissiveIntensity=ei; }); } });
  // hotspots
  const bi=sh.beat, b=CH[ci].beats[bi];
  Object.entries(hsEls).forEach(([id,el])=>{ if(!el.classList.contains('on')) return; const [g,h]=id.split(':'); const def=HS[g][h]; const G=garments[CH[ci].g==='teeW'?'teeW':g]; if(!G||!G.visible){ el.style.opacity=0; return; }
    let v=def.v?new THREE.Vector3(def.v[0],def.v[1],def.v[2]):hsPoint(G,def); if(!v){ el.style.opacity=0; return; }
    const w=v.clone().multiplyScalar(.1).applyMatrix4(new THREE.Matrix4().makeRotationY(G.rotation.y)).add(G.position); w.project(camera); const px=(w.x*.5+.5)*W, py=(-w.y*.5+.5)*H;
    const vis=w.z<1&&px>20&&px<W-20&&py>60&&py<H-20; el.style.transform='translate('+px+'px,'+py+'px)'; el.style.opacity=vis?'':0; el.classList.toggle('flip',px>W*.6); });
  // hud
  const yaw=((cam.az%360)+360)%360, yr=Math.round(yaw); if(yr!==lastYaw){ lastYaw=yr; $('#yaw').textContent=String(yr).padStart(3,'0')+'°'; $('#needle').style.transform='rotate('+yaw+'deg)'; }
  const pr=Math.round(clamp(scrollY/DOCH,0,1)*500)/500; if(pr!==lastProg){ lastProg=pr; $('#progress').style.transform='scaleX('+pr+')'; }
  renderer.render(scene,camera);
}

/* ---------- intro ---------- */
function rollId(el,final,ms){
  if(RM){ el.textContent=final; return; }
  const t0=performance.now(); const step=n=>{ const p=clamp((n-t0)/ms,0,1); let o=''; for(let i=0;i<final.length;i++){ o+=(p>(i+1)/(final.length+1))?final[i]:(i===8?LET[Math.floor(Math.random()*23)]:Math.floor(Math.random()*10)); } el.textContent=p<1?o:final; if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step);
}
function finishIntro(){
  if(introDone) return; introDone=true; const it=$('#intro'); it.classList.add('off'); it.classList.remove('on'); $('#skip').hidden=true; document.body.classList.remove('lock'); document.body.classList.add('ready');
  const h=$('#hero'); if(CH[state.ch]&&state.ch===0) h.classList.add('on'); setTimeout(()=>{ it.style.display='none'; },1600); scrollTo(0,0);
}
function intro(){
  started=true; const it=$('#intro'); it.style.display='grid'; it.classList.remove('off'); it.classList.add('on'); $('.line1',it).textContent=''; $('.line2',it).textContent=''; $('#skip').hidden=false;
  cam.d=30; cam.az=-90; showGarments(0);
  $('#skip').onclick=finishIntro;
  const l1=$('.line1',it), l2=$('.line2',it), big=$('.idbig',it); big.style.opacity=0;
  if(RM){ l1.textContent=MEMBER.name?('Identity confirmed · '+MEMBER.name):'Identity confirmed'; big.style.opacity=1; big.textContent=myId; l2.textContent='Drop 001 · Members’ Atelier'; setTimeout(finishIntro,1200); return; }
  setTimeout(()=>{ l1.textContent=MEMBER.name?('Identity confirmed · '+MEMBER.name):'Identity confirmed'; },700);
  setTimeout(()=>{ big.style.transition='opacity 1s'; big.style.opacity=1; rollId(big,myId,1700); },1500);
  setTimeout(()=>{ l2.textContent='Drop 001 · Members’ Atelier'; },3600);
  setTimeout(finishIntro,6000);
}
addEventListener('keydown',e=>{ if(e.key==='Escape'&&!introDone&&started) finishIntro(); });
})();

