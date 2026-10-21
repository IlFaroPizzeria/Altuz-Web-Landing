/* Altuz: the cloakroom ticket (cookie consent) and the legal menu.
   Nothing optional loads until the visitor chooses. The choice is kept for 12 months. */
(()=>{
'use strict';
const C=window.ALTUZ_CONFIG||{};
const KEY='altuz_consent', VERSION=1, MAX_AGE=365*24*3600*1000;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const html=document.documentElement;
const ticket=$('#ticket'), opts=$('#tOpts'), choose=$('#tChoose'), saveBtn=$('#tSave'), cFoot=$('#cFoot'), cInv=$('#cInv');

function read(){ try{ const v=JSON.parse(localStorage.getItem(KEY)||'null'); if(v&&v.v===VERSION&&Date.now()-v.ts<MAX_AGE) return v; }catch(e){} return null; }
function write(c){ const v={v:VERSION,ts:Date.now(),essential:true,footfall:!!c.footfall,invitations:!!c.invitations}; try{ localStorage.setItem(KEY,JSON.stringify(v)); }catch(e){} return v; }

/* ---------- optional scripts, only after consent ---------- */
let loaded={};
function addScript(src){ const s=document.createElement('script'); s.defer=true; s.src=src; document.head.appendChild(s); return s; }
function apply(c){
  if(c.footfall&&C.vercelAnalytics!==false&&!loaded.foot){ loaded.foot=true; window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)}; addScript('/_vercel/insights/script.js'); }
  if(c.invitations&&!loaded.inv){ loaded.inv=true;
    if(C.metaPixelId){ !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); window.fbq('init',C.metaPixelId); window.fbq('track','PageView'); }
    if(C.tiktokPixelId){ !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(C.tiktokPixelId);ttq.page()}(window,document,'ttq'); }
  }
}
/* Lets the admission form report a conversion, only when the visitor allowed invitations. */
window.altuzTrack=function(name){ const c=read(); if(!c||!c.invitations) return; try{ if(window.fbq) window.fbq('track',name==='admission'?'Lead':name); if(window.ttq) window.ttq.track(name==='admission'?'SubmitForm':name); }catch(e){} };

/* ---------- the ticket ---------- */
function showTicket(){
  const no=$('#tNo'); if(no) no.textContent=String(1+Math.floor(Math.random()*100)).padStart(3,'0');
  const c=read(); cFoot.checked=!!(c&&c.footfall); cInv.checked=!!(c&&c.invitations);
  ticket.classList.remove('leave','punched'); ticket.removeAttribute('inert'); ticket.classList.add('show');
}
function hideTicket(){
  ticket.classList.add('punched');
  setTimeout(()=>{ ticket.classList.add('leave'); ticket.classList.remove('show'); },350);
  setTimeout(()=>{ ticket.setAttribute('inert',''); ticket.classList.remove('leave','punched'); },2200);
}
function decide(kind){
  const prev=read();
  const c= kind==='all'?{footfall:true,invitations:true}: kind==='essential'?{footfall:false,invitations:false}:{footfall:cFoot.checked,invitations:cInv.checked};
  const v=write(c);
  hideTicket();
  /* withdrawing something that already ran needs a fresh page to unload it */
  if(prev&&((prev.footfall&&!v.footfall)||(prev.invitations&&!v.invitations))&&(loaded.foot||loaded.inv)){ setTimeout(()=>location.reload(),1400); return; }
  apply(v);
}
$$('[data-consent]').forEach(b=>b.addEventListener('click',()=>decide(b.dataset.consent)));
choose.addEventListener('click',()=>{ const open=opts.hidden; opts.hidden=!open; saveBtn.hidden=!open; choose.setAttribute('aria-expanded',open?'true':'false'); choose.textContent=open?'Close':'Choose'; });

/* the light passes over the ticket too */
addEventListener('pointermove',e=>{ if(!ticket.classList.contains('show')) return; const r=ticket.getBoundingClientRect(); ticket.style.setProperty('--tx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%'); ticket.style.setProperty('--ty',((e.clientY-r.top)/r.height*100).toFixed(1)+'%'); },{passive:true});

/* ---------- legal menu ---------- */
const lb=$('#legalBtn'), pop=$('#legalPop');
function setPop(open){ pop.classList.toggle('open',open); if(open) pop.removeAttribute('inert'); else pop.setAttribute('inert',''); lb.setAttribute('aria-expanded',open?'true':'false'); }
lb.addEventListener('click',e=>{ e.stopPropagation(); setPop(!pop.classList.contains('open')); });
document.addEventListener('click',e=>{ if(pop.classList.contains('open')&&!e.target.closest('#legalPop')) setPop(false); });
addEventListener('keydown',e=>{ if(e.key==='Escape'&&pop.classList.contains('open')){ setPop(false); lb.focus(); } });
$$('[data-cloakroom]').forEach(b=>b.addEventListener('click',()=>{ setPop(false); showTicket(); }));

/* ---------- start ---------- */
const existing=read();
const wantTicket=location.hash==='#cloakroom';
const afterEntrance=fn=>{ const w=()=>{ if(html.classList.contains('intro-on')) return setTimeout(w,400); setTimeout(fn,wantTicket?600:1400); }; w(); };
if(existing){ apply(existing); if(wantTicket) afterEntrance(showTicket); }
else if(navigator.globalPrivacyControl===true){ write({footfall:false,invitations:false}); }
else{
  /* wait until the entrance has opened, then hand over the ticket */
  afterEntrance(showTicket);
}
})();
