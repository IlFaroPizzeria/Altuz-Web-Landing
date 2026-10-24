/* Altuz landing: light, card, sheets, number picker, admission form and the entrance. */
(()=>{
'use strict';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
/* Invitation link: ?ref=007 is kept in memory and sent with the request as "ref:007" (the member who invited gets credit). */
const REF=(function(){ try{ const m=/^\d{3}$/.exec(new URLSearchParams(location.search).get('ref')||''); return m&&+m[0]>=1&&+m[0]<=300?m[0]:''; }catch(e){ return ''; } })();
const markRef=function(){ if(!REF) return; const f=document.getElementById('ref'); if(f){ f.value='Invited by No. '+REF; f.readOnly=true; } };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markRef); else markRef();
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const easeOut=t=>1-Math.pow(1-t,3);
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const pad=n=>String(n).padStart(3,'0');
const html=document.documentElement;

/* ---------- garment fragments (tech-pack geometry; only crops are shown) ---------- */
const FONT='font-family="Jost,Futura,\'Century Gothic\',sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central"';
const TEE_OUT='M275 61 L174 102 Q133 140 120 212 L202 231 Q208 320 200 422 Q330 442 459 422 Q451 320 457 231 L540 212 Q527 140 485 100 L379 61 Q327 72 275 61 Z';
const SIDEWORD=(x,y)=>'<text transform="translate('+x+' '+y+') rotate(90)" font-size="42" textLength="123" lengthAdjust="spacingAndGlyphs" '+FONT+'>ALTUZ</text>';
function fragSVG(id,vb,label){
  const R='<rect x="96" y="44" width="468" height="404" fill="url(#';
  return '<svg class="frag" viewBox="'+vb+'" role="img" aria-label="'+label+'" data-refl><defs>'+
   '<radialGradient id="g'+id+'" gradientUnits="userSpaceOnUse" cx="400" cy="200" r="120"><stop class="s0" offset="0"/><stop class="s1" offset=".3"/><stop class="s2" offset=".65"/><stop class="s3" offset="1"/></radialGradient>'+
   '<radialGradient id="h'+id+'" gradientUnits="userSpaceOnUse" cx="400" cy="200" r="120"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#555"/><stop offset=".75" stop-color="#000"/></radialGradient>'+
   '<mask id="m'+id+'" maskUnits="userSpaceOnUse" x="96" y="44" width="468" height="404">'+R+'g'+id+')"/></mask>'+
   '<mask id="mh'+id+'" maskUnits="userSpaceOnUse" x="96" y="44" width="468" height="404">'+R+'h'+id+')"/></mask>'+
   '<filter id="b'+id+'" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="2.6"/></filter>'+
   '<clipPath id="c'+id+'"><path d="'+TEE_OUT+'"/></clipPath>'+
   '<g id="p'+id+'"><use href="#logo" x="392" y="194" width="38" height="32"/>'+SIDEWORD(204.5,318)+SIDEWORD(454.5,318)+'</g></defs>'+
   '<path class="fab" d="'+TEE_OUT+'"/>'+
   '<path class="ins" d="M275 61 Q327 72 379 61 Q327 163 275 61 Z"/>'+
   '<path class="ln" d="M259 67 Q327 189 395 67 M191 152 Q200 186 202 229 M469 150 Q459 186 457 229"/>'+
   '<path class="ln dash" d="M201 412 Q330 432 458 412 M124 202 L201 220 M536 202 L458 220"/>'+
   '<rect class="lab" x="227" y="393" width="38" height="24" rx="1.5"/>'+
   '<text class="labt" x="246" y="402" font-size="6.6" text-anchor="middle" letter-spacing=".7">ALTUZ</text>'+
   '<text class="labt" x="246" y="408" font-size="2.7" text-anchor="middle" letter-spacing=".4" style="font-weight:500">RUN ELEVATED</text>'+
   '<text class="labt" x="246" y="413" font-size="3.1" text-anchor="middle" style="font-weight:500">001 / 100</text>'+
   '<g clip-path="url(#c'+id+')"><g class="pr" mask="url(#m'+id+')"><use href="#p'+id+'"/></g>'+
   '<g class="pr" mask="url(#mh'+id+')" filter="url(#b'+id+')" opacity=".9" style="fill:#fff"><use href="#p'+id+'"/></g></g></svg>';
}
$('#fragA').innerHTML=fragSVG('A','340 96 128 160','Fragment of the chest with the A');
$('#fragB').innerHTML=fragSVG('B','168 236 88 110','Fragment of the side seam with part of the name');
$('#fragC').innerHTML=fragSVG('C','210 380 72 90','Fragment of the hem with the numbered label');

/* ---------- light and card ---------- */
const L={x:innerWidth*.7,y:innerHeight*.3,tx:innerWidth*.7,ty:innerHeight*.3,r:230,tr:230,last:-1e5,override:null};
const T={rx:0,ry:0};
const halo=$('#halo'), card=$('#card'), tilt=$('#tilt');
let px=innerWidth*.5, py=innerHeight*.5, pointerLast=-1e5;
addEventListener('pointermove',e=>{ L.tx=e.clientX; L.ty=e.clientY; L.last=performance.now(); px=e.clientX; py=e.clientY; pointerLast=L.last; if(e.pointerType==='mouse') halo.classList.add('on'); },{passive:true});
addEventListener('pointerdown',e=>{ L.tx=e.clientX; L.ty=e.clientY; L.last=performance.now(); },{passive:true});
html.addEventListener('mouseleave',()=>{ L.last=-1e5; pointerLast=-1e5; halo.classList.remove('on'); });
const svgs=$$('svg[data-refl]').map(svg=>({svg,grads:$$('radialGradient',svg)}));
function paintLight(now){
  const r=card.getBoundingClientRect();
  if(r.width){
    let lx=(L.x-r.left)/r.width*100, ly=(L.y-r.top)/r.height*100;
    card.style.setProperty('--lx',clamp(lx,-40,140).toFixed(1)+'%'); card.style.setProperty('--ly',clamp(ly,-40,140).toFixed(1)+'%');
    if(!RM){
      let nx,ny;
      if(now-pointerLast<4200){ nx=clamp((px-(r.left+r.width/2))/(innerWidth*.5),-1,1); ny=clamp((py-(r.top+r.height/2))/(innerHeight*.5),-1,1); }
      else { nx=.55*Math.sin(now/3900); ny=.4*Math.sin(now/5300+1); }
      T.ry+=(nx*13-T.ry)*.05; T.rx+=(-ny*9-T.rx)*.05;
      tilt.style.setProperty('--rx',T.rx.toFixed(2)+'deg'); tilt.style.setProperty('--ry',T.ry.toFixed(2)+'deg');
    }
  }
  if($('#light').classList.contains('open')){
    for(const o of svgs){
      const m=o.svg.getScreenCTM(); if(!m) continue;
      const pt=o.svg.createSVGPoint(); pt.x=L.x; pt.y=L.y; const p=pt.matrixTransform(m.inverse());
      const rr=((L.r*.7)/m.a).toFixed(1);
      o.grads.forEach(g=>{ g.setAttribute('cx',p.x.toFixed(1)); g.setAttribute('cy',p.y.toFixed(1)); g.setAttribute('fx',p.x.toFixed(1)); g.setAttribute('fy',p.y.toFixed(1)); g.setAttribute('r',rr); });
    }
  }
  halo.style.transform='translate3d('+L.x.toFixed(1)+'px,'+L.y.toFixed(1)+'px,0)';
}

/* ---------- the runner, drawn in silver thread on the back of the card ---------- */
let runnerStart=0, flipped=false;
const cv=$('#runner'), ctx=cv.getContext('2d');
let W=0,H=0,S=1,dpr=1;
function size(){ const r={width:cv.clientWidth,height:cv.clientHeight}; dpr=Math.min(devicePixelRatio||1,2); W=r.width; H=r.height; cv.width=Math.max(1,Math.round(W*dpr)); cv.height=Math.max(1,Math.round(H*dpr)); ctx.setTransform(dpr,0,0,dpr,0,0); S=Math.min(H/296,W/250); }
const LEN={thigh:62,shank:60,torso:88,ua:40,fa:38,foot:15};
function pose(p){
  const lean=.2;
  const sh={x:Math.sin(lean)*LEN.torso,y:-Math.cos(lean)*LEN.torso};
  const neck={x:sh.x+Math.sin(lean+.05)*10,y:sh.y-Math.cos(lean+.05)*10};
  const head={x:neck.x+Math.sin(lean+.12)*17,y:neck.y-Math.cos(lean+.12)*17};
  const leg=q=>{
    const th=.62*Math.sin(q)+.05;
    const k=.25+1.4*Math.pow(.5+.5*Math.cos(q+.4),2);
    const knee={x:Math.sin(th)*LEN.thigh,y:Math.cos(th)*LEN.thigh};
    const sa=th-k;
    const ank={x:knee.x+Math.sin(sa)*LEN.shank,y:knee.y+Math.cos(sa)*LEN.shank};
    const psi=.25+.5*Math.sin(q-.5);
    const toe={x:ank.x+Math.cos(psi)*LEN.foot,y:ank.y+Math.sin(psi)*LEN.foot};
    return [toe,ank,knee,{x:0,y:0}];
  };
  const arm=q=>{
    const a=.78*Math.sin(q);
    const el={x:sh.x+Math.sin(a)*LEN.ua,y:sh.y+Math.cos(a)*LEN.ua};
    const f=a+1.5+.2*Math.sin(q);
    const hand={x:el.x+Math.sin(f)*LEN.fa,y:el.y+Math.cos(f)*LEN.fa};
    return [sh,el,hand];
  };
  return {sh,neck,head,legA:leg(p),legB:leg(p+Math.PI),armA:arm(p+Math.PI),armB:arm(p)};
}
function catmull(pts,n){
  const out=[]; const P=[pts[0],...pts,pts[pts.length-1]];
  for(let i=1;i<P.length-2;i++){
    const p0=P[i-1],p1=P[i],p2=P[i+1],p3=P[i+2];
    for(let j=0;j<n;j++){ const t=j/n,t2=t*t,t3=t2*t;
      out.push({x:.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
                y:.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)}); }
  }
  out.push(P[P.length-2]); return out;
}
const STR=[{a:.55,w:.8,f:2.2,ph:0},{a:.5,w:.7,f:2.9,ph:1.9},{a:.42,w:.9,f:1.7,ph:3.7},{a:.36,w:.65,f:3.4,ph:5.1},{a:.46,w:1,f:2.5,ph:2.6}];
function strands(base,t,frac,alpha,amp){
  const n=Math.max(2,Math.floor(base.length*frac)); if(frac<=0) return;
  for(let si=0;si<STR.length;si++){
    const s=STR[si]; ctx.beginPath(); ctx.lineWidth=s.w; ctx.strokeStyle='rgba(226,231,237,'+Math.min(1,alpha*s.a*1.5).toFixed(3)+')';
    for(let i=0;i<n;i++){
      const b=base[i], c=base[Math.min(i+1,base.length-1)], d=base[Math.max(i-1,0)];
      let dx=c.x-d.x, dy=c.y-d.y; const l=Math.hypot(dx,dy)||1; const nx=-dy/l, ny=dx/l;
      const u=i/(base.length-1); const env=Math.sin(Math.PI*u)*.85+.15;
      const o=amp*env*Math.sin(u*6.283*s.f*2+t*.0007*(1+si*.15)+s.ph);
      const x=b.x+nx*o, y=b.y+ny*o; i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
}
const trail=[]; let phase=.8, speed=0, lastT=0;
function drawRunner(now){
  const dt=Math.min(.05,(now-(lastT||now))/1000); lastT=now;
  ctx.clearRect(0,0,W,H);
  if(!RM && !runnerStart) return;
  const el=RM?99:(now-runnerStart)/1000;
  const dp=RM?1:easeIO(clamp(el/2.8,0,1));
  const ramp=RM?0:easeOut(clamp((el-2.4)/2.2,0,1)); speed=ramp*5.1;
  phase+=dt*speed;
  const gy=H*.9, hx=W*.5, hipY=gy-(112*S);
  const bob=Math.abs(Math.sin(phase))*-5*S*ramp;
  const o=pose(phase); const X=p=>hx+p.x*S, Y=p=>hipY+bob+p.y*S;
  const wp=p=>({x:X(p),y:Y(p)});
  const gOff=(el*speed*18)%16;
  ctx.save(); ctx.strokeStyle='rgba(226,231,237,.28)'; ctx.lineWidth=1.2; ctx.setLineDash([2,14]); ctx.lineDashOffset=gOff;
  ctx.beginPath(); ctx.moveTo(0,gy+4); ctx.lineTo(W*dp,gy+4); ctx.stroke(); ctx.restore();
  ctx.strokeStyle='rgba(226,231,237,.1)'; ctx.beginPath(); ctx.moveTo(0,gy+4); ctx.lineTo(W*dp,gy+4); ctx.stroke();
  if(speed>.05){
    const vx=(150*S)*ramp;
    for(const q of trail){ q.x-=vx*dt; }
    const hh=wp({x:-4,y:0}), sh2=wp(o.neck);
    trail.push({x:hh.x,a:hh.y,b:sh2.y});
    while(trail.length&&trail[0].x<-20) trail.shift();
    const n=trail.length;
    [['a',.4,0],['b',.3,1.4]].forEach(([k,al,ph])=>{
      ctx.lineWidth=.9; let px=0,py=0;
      for(let i=0;i<n;i++){
        const q=trail[i], age=1-(i/n);
        const x=q.x, y=q[k]+Math.sin(i*.09+el*1.1+ph)*3.2*S;
        if(i){ ctx.strokeStyle='rgba(226,231,237,'+(al*(1-age)*(1-age)).toFixed(3)+')'; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(x,y); ctx.stroke(); }
        px=x; py=y;
      }
    });
  }
  const segs=[
    {pts:o.legB.map(wp),al:.4},{pts:o.armB.map(wp),al:.4},
    {pts:[o.legA[3],o.sh,o.neck].map(wp),al:.9},
    {pts:o.legA.map(wp),al:.95},{pts:o.armA.map(wp),al:.95}
  ];
  const total=segs.length+1;
  segs.forEach((s,i)=>{ const f=clamp(dp*total-i,0,1); if(f<=0) return; strands(catmull(s.pts,26),now,f,s.al,2.4*S); });
  const hf=clamp(dp*total-segs.length,0,1);
  if(hf>0){ const c=wp(o.head), r=12.5*S, pts=[]; for(let i=0;i<=30;i++){ const a=i/30*6.283; pts.push({x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r}); } strands(pts,now,hf,.9,1.6*S); }
  const cr=cv.getBoundingClientRect(); const lx=L.x-cr.left, ly=L.y-cr.top;
  if(lx>-200&&lx<W+200&&ly>-200&&ly<H+200){
    ctx.save(); ctx.globalCompositeOperation='source-atop';
    const g=ctx.createRadialGradient(lx,ly,0,lx,ly,L.r*.9); g.addColorStop(0,'rgba(255,255,255,.8)'); g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.restore();
  }
}
size(); addEventListener('resize',()=>{ size(); });

function frame(now){
  let tx=L.tx,ty=L.ty;
  if(L.override){ const p=L.override(now); tx=p[0]; ty=p[1]; }
  else if(now-L.last>4200){ tx=innerWidth*(.55+.3*Math.sin(now/4300)); ty=innerHeight*(.38+.24*Math.sin(now/5900+1.3)); }
  const k=L.override?.12:.05;
  L.x+=(tx-L.x)*k; L.y+=(ty-L.y)*k; L.r+=(L.tr-L.r)*.05;
  paintLight(now);
  if(flipped) drawRunner(now);
  requestAnimationFrame(frame);
}
if(RM){ paintLight(0); }
else requestAnimationFrame(frame);

card.addEventListener('click',()=>{
  flipped=card.getAttribute('aria-pressed')!=='true';
  card.setAttribute('aria-pressed',flipped?'true':'false');
  if(flipped){ size(); runnerStart=performance.now(); trail.length=0; if(RM) drawRunner(performance.now()); }
});

/* ---------- card bindings ---------- */
const cSig=$('#cSig');
$('#alias').addEventListener('input',e=>{ const v=e.target.value.trim()||'Your name'; cSig.textContent=v; });

/* ---------- sheets ---------- */
let current=null, lastTrigger=null;
const dockBtns=$$('.dock button');
$('.dock [data-open="light"]').addEventListener('click',e=>e.currentTarget.classList.add('seen'));
function openSheet(id,opts={}){
  const el=document.getElementById(id);
  if(!el||!el.classList.contains('sheet')) return;
  if(current===el){ if(opts.focus){ const f=$(opts.focus,el); if(f) f.focus(); } return; }
  if(current) closeSheet(false);
  lastTrigger=opts.trigger||document.activeElement;
  el.removeAttribute('inert'); el.classList.add('open'); current=el;
  document.body.classList.add('sheet-open');
  dockBtns.forEach(b=>b.setAttribute('aria-expanded',b.dataset.open===id?'true':'false'));
  const body=$('.sheet-body',el); if(body) body.scrollTop=0;
  setTimeout(()=>{ const f=opts.focus?$(opts.focus,el):$('h2',el); if(f) f.focus({preventScroll:true}); },80);
  if(RM) paintLight(0);
}
function closeSheet(restore=true){
  if(!current) return;
  current.classList.remove('open'); current.setAttribute('inert',''); current=null;
  document.body.classList.remove('sheet-open');
  dockBtns.forEach(b=>b.setAttribute('aria-expanded','false'));
  if(restore&&lastTrigger&&lastTrigger.focus&&document.contains(lastTrigger)) lastTrigger.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]');
  if(o){
    const id=o.dataset.open;
    if(o.closest('.dock')&&current&&current.id===id){ closeSheet(); return; }
    openSheet(id,{trigger:o,focus:id==='admission'?'#email':id==='door'?'#doorId':null}); return;
  }
  if(e.target.closest('[data-close]')) closeSheet();
});
$('#scrim').addEventListener('click',()=>closeSheet());
$('#home').addEventListener('click',e=>{ e.preventDefault(); closeSheet(); });
addEventListener('keydown',e=>{ if(e.key==='Escape'&&current&&!html.classList.contains('intro-on')) closeSheet(); });

/* ---------- teaser counter: units run out, faster and faster (a simulation, not real stock) ---------- */
(function(){
  const lightSheet=$('#light'), out=$('#reelN'); if(!lightSheet||!out) return;
  const START=20, LOOP=15000, RUN=13200; let raf=0, t0=0;
  const paint=n=>{ out.textContent=String(n).padStart(2,'0'); };
  const tick=now=>{
    const t=(now-t0)%LOOP, p=Math.min(1,t/RUN);
    paint(Math.max(0,Math.round(START*(1-Math.pow(p,1.55)))));
    raf=requestAnimationFrame(tick);
  };
  const sync=()=>{
    const on=lightSheet.classList.contains('open');
    cancelAnimationFrame(raf); raf=0;
    if(!on||RM){ paint(START); return; }
    t0=performance.now(); raf=requestAnimationFrame(tick);
  };
  new MutationObserver(sync).observe(lightSheet,{attributes:true,attributeFilter:['class']});
  paint(START);
})();

/* ---------- headlight ---------- */
$('#faro').addEventListener('click',()=>{
  const row=$('#tiles'); const t0=performance.now(), dur=4200; L.tr=300;
  L.override=now=>{
    const r=row.getBoundingClientRect(), p=clamp((now-t0)/dur,0,1), e=easeIO(p);
    if(p>=1){ L.override=null; L.tr=230; L.last=now; }
    return [r.left-r.width*.15+r.width*1.3*e, r.top+r.height*(.85-.45*Math.sin(Math.PI*e))];
  };
  if(RM){ const r=row.getBoundingClientRect(); L.x=r.left+r.width*.5; L.y=r.top+r.height*.4; paintLight(0); }
});

/* ---------- random ID (assigned by Supabase; the page only previews) ---------- */
const odo=$('#odo'), numCta=$('#numCta'), cId=$('#cId'), dniF=$('#dni');
let cur=1, myId='00000000T', drawn=false;
const LET='TRWAGMYFPDXBNJZSQVHLCKE';
function mkId(){ const n=Math.floor(Math.random()*1e8); return String(n).padStart(8,'0')+LET[n%23]; }
function rollText(els,final){
  const set=t=>els.forEach(e=>{ if(e) e.textContent=t; });
  if(RM){ set(final); return; }
  const t0=performance.now(), d=1300;
  const step=now=>{ const p=clamp((now-t0)/d,0,1); let o=''; for(let i=0;i<final.length;i++){ const ch=final[i]; o+=(p>(i+1)/(final.length+1))?ch:(i===8?LET[Math.floor(Math.random()*23)]:Math.floor(Math.random()*10)); } set(p<1?o:final); if(p<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const rankOf=n=>n<=2?'Founder':'Origin';
function setId(id,n){ myId=id; if(n) cur=n; rollText([cId,odo],id); if(dniF) dniF.value=id; }
function draw(){ if(drawn) return; drawn=true; cur=3; setId(mkId(),3); }
numCta.addEventListener('click',draw);

/* ---------- link to the members' Atelier (ID travels in the #hash, never sent to a server) ---------- */
function atelierLink(id){ const u=String((window.ALTUZ_CONFIG||{}).atelierUrl||'').replace(/#.*$/,''); if(!u||!/^\d{8}[A-Z]$/.test(String(id||''))) return ''; return '<p class="p" style="margin-top:18px"><a class="dark" href="'+u+'#id='+encodeURIComponent(id)+'" rel="noopener">Enter the Atelier</a></p>'; }

/* ---------- registry lookup ---------- */
const rcfg=()=>{ const C=window.ALTUZ_CONFIG||{}; const url=(C.supabaseUrl||'').replace(/\/+$/,''), key=C.supabaseAnonKey||''; const h={'apikey':key,'Content-Type':'application/json'}; if(!/^sb_/.test(key)) h.Authorization='Bearer '+key; return {url,key,h}; };
$('#regForm').addEventListener('submit',async e=>{
  e.preventDefault(); const er=$('#regErr'), out=$('#regOut'); er.textContent=''; out.textContent='';
  const id=$('#regId').value.trim().toUpperCase().replace(/^#/,'');
  if(!/^\d{8}[A-Z]$/.test(id)){ er.textContent='An ID is eight digits and a letter, like 00000000T.'; return; }
  const {url,key,h}=rcfg(); if(!url||!key){ er.textContent='The Registry is not available right now.'; return; }
  try{
    const r=await fetch(url+'/rest/v1/rpc/registry_lookup',{method:'POST',headers:h,body:JSON.stringify({p_dni:id})}); if(!r.ok) throw 0;
    const d=await r.json(); const row=Array.isArray(d)?d[0]:d;
    if(!row||!row.rank){ er.textContent='No member with that ID.'; return; }
    const pcs=row.pieces||[];
    out.innerHTML='<div class="regrow"><b>ID '+id+'</b><span>'+row.rank+'</span></div>'+(pcs.length?pcs.map(p=>'<div class="regrow"><b>'+String(p.model).replace(/[<>&]/g,'')+(p.colour?' · '+String(p.colour).replace(/[<>&]/g,''):'')+'</b><span>No. '+String(p.piece_no).padStart(3,'0')+' / 100</span></div>').join(''):'<div class="regrow"><b>No pieces yet</b><span>Drop 001</span></div>')+atelierLink(id);
  }catch(x){ er.textContent='We couldn’t check the Registry right now.'; }
});


/* ---------- members' door: ID -> Registry check -> Atelier ---------- */
(function(){
  const LET='TRWAGMYFPDXBNJZSQVHLCKE', sheet=$('#door'), form=$('#doorForm'), inp=$('#doorId'), er=$('#doorErr'), out=$('#doorOut'), go=$('#doorGo'); let timer=0;
  const esc=s=>String(s==null?'':s).replace(/[<>&"]/g,'');
  const valid=s=>/^\d{8}[A-Z]$/.test(s)&&LET[parseInt(s.slice(0,8),10)%23]===s[8];
  inp.addEventListener('input',()=>{ er.textContent=''; inp.value=inp.value.toUpperCase().replace(/[^0-9A-Z]/g,''); });
  form.addEventListener('submit',async e=>{
    e.preventDefault(); clearTimeout(timer); er.textContent=''; out.innerHTML=''; sheet.classList.remove('unlocked');
    const id=inp.value.trim().toUpperCase().replace(/^#/,'');
    if(!/^\d{8}[A-Z]$/.test(id)){ er.textContent='An ID is eight digits and a letter, like 00000000T.'; inp.focus(); return; }
    if(!valid(id)){ er.textContent='No member with that ID.'; inp.focus(); return; }
    const {url,key,h}=rcfg(); const base=String((window.ALTUZ_CONFIG||{}).atelierUrl||'').replace(/#.*$/,'');
    if(!url||!key||!base){ er.textContent='The door is closed for now. Try again in a moment.'; return; }
    go.disabled=true; const t0=go.textContent; go.textContent='Checking…';
    try{
      const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000);
      const r=await fetch(url+'/rest/v1/rpc/atelier_lookup',{method:'POST',headers:h,body:JSON.stringify({p_dni:id}),signal:ctl.signal}); clearTimeout(to);
      if(!r.ok) throw 0; const d=await r.json(); const row=Array.isArray(d)?d[0]:d;
      if(!row||row.number==null){ er.textContent='No member with that ID.'; inp.focus(); return; }
      const dest=base+'#id='+encodeURIComponent(id); const name=esc(row.alias);
      sheet.classList.add('unlocked');
      out.innerHTML='<div class="door-hi" role="status"><small>Door open</small><b>'+(name?'Welcome, '+name+'.':'Welcome.')+'</b><span>'+esc(row.rank||'Member')+' · No. '+esc(row.number)+' / 300</span></div><div class="door-bar" aria-hidden="true"><i></i></div><div class="door-act"><a class="dark" href="'+dest+'" rel="noopener">Enter now</a></div>';
      try{ out.scrollIntoView({block:'end',behavior:RM?'auto':'smooth'}); }catch(_){}
      timer=setTimeout(()=>{ location.href=dest; },RM?400:1700);
    }catch(x){ er.textContent='We couldn’t reach the Registry. Try again in a moment.'; }
    finally{ go.disabled=false; go.textContent=t0; }
  });
})();

/* ---------- admission requests ---------- */
const form=$('#adm-form'), err=$('#err'), btn=$('#submit');
async function save(p){
  const C=window.ALTUZ_CONFIG||{}, url=(C.supabaseUrl||'').replace(/\/+$/,''), key=C.supabaseAnonKey||'';
  if(!url||!key) throw new Error('not-configured');
  const h={'apikey':key,'Content-Type':'application/json'}; if(!/^sb_/.test(key)) h.Authorization='Bearer '+key;
  const r=await fetch(url+'/rest/v1/rpc/join_waitlist',{method:'POST',headers:h,body:JSON.stringify(p)});
  if(!r.ok){ let t=''; try{ t=await r.text(); }catch(e){} if(/full/.test(t)) return {full:true}; throw new Error('supabase '+r.status); }
  const d=await r.json(); return Array.isArray(d)?d[0]:d;
}
form.addEventListener('submit',async e=>{
  e.preventDefault(); err.textContent='';
  const email=$('#email').value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ err.textContent='Enter a valid email so we can reply to your request.'; $('#email').focus(); return; }
  if(!$('#consent').checked){ err.textContent='Tick the box so we’re allowed to email you.'; $('#consent').focus(); return; }
  const pieces=$$('input[name=piece]:checked',form).map(i=>i.value);
  const nz=v=>{ v=v.trim(); return v?v:null; };
  const p={p_email:email.toLowerCase(),p_alias:nz($('#alias').value),p_city:nz($('#city').value),p_when:$('#when').value,p_referrer:(REF?('ref:'+REF):nz($('#ref').value)),p_pieces:pieces,p_source:'web'};
  if(p.p_alias) p.p_alias=p.p_alias.slice(0,24); if(p.p_city) p.p_city=p.p_city.slice(0,80); if(p.p_referrer) p.p_referrer=p.p_referrer.slice(0,120);
  const bot=$('#company').value.trim()!=='';
  btn.disabled=true; const label=btn.textContent; btn.textContent='Sending…';
  try{
    if(!bot){
      const row=await save(p);
      if(row&&row.full){ btn.disabled=false; btn.textContent=label; err.textContent='All 300 numbers of Drop 001 have been drawn. Write to projectaltuz@gmail.com to join the reserve list.'; return; }
      if(row&&row.number){ drawn=true; cur=row.number; setId(row.dni.replace(/^#/,''),row.number); }
      if(window.altuzTrack) window.altuzTrack('admission');
    }
    $('#admBody').innerHTML='<div class="done" role="status"><h2 class="x-wide" id="h-admission" tabindex="-1">Request received.</h2><p class="p">We read every request. Before pre-sale opens we’ll write to tell you whether you’re in, and your number will be waiting.</p><p class="num chrome idbig" style="font-size:clamp(34px,5.2vw,64px)">'+myId+'</p><p class="p">That’s your ID. Drawn at random, it’s yours for life. Keep it: it’s how you’ll identify yourself to the society, and how your pieces are linked to you.</p>'+atelierLink(myId)+'</div>';
    const hh=$('#h-admission'); if(hh) hh.focus({preventScroll:true});
  }catch(ex){
    btn.disabled=false; btn.textContent=label;
    err.textContent='We couldn’t send your request right now. Email projectaltuz@gmail.com and we’ll add you by hand.';
  }
});

/* ---------- intro: headlights at night ---------- */
const intro=$('#intro'), iwrap=$('#iwrap'), ibloom=$('#ibloom'), ibar=$('#ibar');
const cones=[$('#cone1'),$('#cone2'),$('#cone3')], spots=[$('#spot1'),$('#spot2'),$('#spot3')];
const TOKENS=['privileges','code','light','number','registry','admission','door'];
const REVEAL=4.3, END=5.8;
let it0=0, iraf=0, started=false, revealed=false;
/* three lights: two headlights from the lower corners and a short glint from above.
   Each is [source x,y], [target from x,y], [target to x,y], start, end, size (fractions of the screen). */
const BEAMS=[
  {s:[-.1,1.15], a:[-.12,.66], b:[.58,.42], t0:.25, t1:3.9, k:1},
  {s:[1.1,1.15], a:[1.14,.28], b:[.34,.6], t0:1.05, t1:4.2, k:.92},
  {s:[.5,-.18], a:[.12,.78], b:[.9,.7], t0:2.35, t1:3.35, k:.55}
];
/* on a phone held upright the word lies across the middle, so the beams sweep along that band */
const BEAMS_P=[
  {s:[-.15,1.08], a:[-.25,.57], b:[.72,.46], t0:.25, t1:3.9, k:1},
  {s:[1.15,1.08], a:[1.25,.43], b:[.3,.56], t0:1.05, t1:4.2, k:.92},
  {s:[.5,-.12], a:[.08,.49], b:[.92,.53], t0:2.35, t1:3.35, k:.6}
];
const env=(t,a,b)=>{ const fi=clamp((t-a)/.75,0,1), fo=clamp((b-t)/.6,0,1); return easeOut(Math.min(fi,fo)); };
function startSite(){
  html.classList.add('site-in');
  if(!started){ started=true;
    const h=(location.hash||'').slice(1); if(TOKENS.includes(h)) setTimeout(()=>openSheet(h),RM?0:900); }
}
function introFrame(now){
  const t=(now-it0)/1000, W=innerWidth, H=innerHeight, M=Math.max(W,H);
  const portrait=H>W, rx=M*(portrait?.125:.165), ry=M*(portrait?.085:.135);
  const masks=[];
  (portrait?BEAMS_P:BEAMS).forEach((B,i)=>{
    const p=easeIO(clamp((t-B.t0)/(B.t1-B.t0),0,1)), a=env(t,B.t0,B.t1)*(t<REVEAL?1:0);
    const x=(B.a[0]+(B.b[0]-B.a[0])*p)*W, y=(B.a[1]+(B.b[1]-B.a[1])*p)*H;
    const sx=B.s[0]*W, sy=B.s[1]*H, d=Math.hypot(x-sx,y-sy), ang=Math.atan2(y-sy,x-sx)*180/Math.PI;
    const sr=B.k;
    cones[i].style.width=d.toFixed(0)+'px'; cones[i].style.transform='translate3d('+sx.toFixed(0)+'px,'+sy.toFixed(0)+'px,0) rotate('+ang.toFixed(2)+'deg)'; cones[i].style.opacity=(a*.95).toFixed(3);
    const sw=rx*2.6*sr, sh=ry*2.6*sr;
    spots[i].style.width=sw.toFixed(0)+'px'; spots[i].style.height=sh.toFixed(0)+'px';
    spots[i].style.transform='translate3d('+(x-sw/2).toFixed(0)+'px,'+(y-sh/2).toFixed(0)+'px,0)'; spots[i].style.opacity=a.toFixed(3);
    if(a>.002) masks.push('radial-gradient(ellipse '+(rx*sr).toFixed(0)+'px '+(ry*sr).toFixed(0)+'px at '+x.toFixed(0)+'px '+y.toFixed(0)+'px,rgba(0,0,0,'+a.toFixed(3)+') 0%,rgba(0,0,0,'+(a*.5).toFixed(3)+') 45%,rgba(0,0,0,0) 100%)');
  });
  const m=masks.length?masks.join(','):'linear-gradient(transparent,transparent)';
  iwrap.style.webkitMaskImage=m; iwrap.style.maskImage=m; ibloom.style.webkitMaskImage=m; ibloom.style.maskImage=m;
  ibar.style.transform='scaleX('+clamp(t/REVEAL,0,1).toFixed(4)+')';
  if(t>=REVEAL){
    if(!revealed){ revealed=true; intro.classList.add('reveal'); startSite(); try{ sessionStorage.setItem('altuz_intro','1'); }catch(e){} }
    const q=easeIO(clamp((t-REVEAL)/(END-REVEAL-.2),0,1)), R=q*M*1.25, cx=W*.46, cy=H*.5;
    const hole='radial-gradient(circle at '+cx.toFixed(0)+'px '+cy.toFixed(0)+'px,transparent '+R.toFixed(0)+'px,#000 '+(R+M*.22).toFixed(0)+'px)';
    intro.style.webkitMaskImage=hole; intro.style.maskImage=hole;
  }
  if(t>=END){ intro.classList.add('gone'); html.classList.remove('intro-on'); intro.style.maskImage=''; intro.style.webkitMaskImage=''; iraf=0; return; }
  iraf=requestAnimationFrame(introFrame);
}
function playIntro(){
  closeSheet(false);
  cancelAnimationFrame(iraf); revealed=false;
  intro.classList.remove('run','reveal','gone'); intro.style.animation='none'; intro.style.maskImage=''; intro.style.webkitMaskImage='';
  html.classList.add('intro-on'); scrollTo(0,0);
  void intro.offsetWidth; intro.classList.add('run');
  it0=performance.now(); iraf=requestAnimationFrame(introFrame);
}
function skipIntro(){ if(revealed) return; it0=performance.now()-REVEAL*1000; }
$('#skip').addEventListener('click',skipIntro);
intro.addEventListener('click',e=>{ if(!e.target.closest('#skip')) skipIntro(); });
addEventListener('keydown',e=>{ if(html.classList.contains('intro-on')&&(e.key==='Enter'||e.key==='Escape'||e.key===' ')){ e.preventDefault(); skipIntro(); } });
$('#replay').addEventListener('click',playIntro);
if(html.classList.contains('intro-on')) playIntro(); else startSite();
})();
