/* ALTUZ · store-wide background (the landing's). Skips itself on the Atelier, which draws its own. */
(function(){
  try{ let m=document.querySelector('meta[name=theme-color]'); if(!m){ m=document.createElement('meta'); m.name='theme-color'; document.head.appendChild(m); } m.content='#fbfbfc'; }catch(e){}
  if(document.getElementById('az-bg')||document.getElementById('cbg')||document.getElementById('gate')) return;
  const NS='http://www.w3.org/2000/svg';
  const el=(t,c)=>{ const e=document.createElement(t); if(c) e.className=c; return e; };
  const logo=()=>{ const s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 100 84'); s.setAttribute('aria-hidden','true'); const p=document.createElementNS(NS,'path'); p.setAttribute('d','M44 0L53 0Q58 1 60.8 6L99.6 83.9L82.2 83.9L48.6 19.6L21.2 72.6L51 67.9L19.5 84L0.3 84L29.4 23.6L39.2 5.2Q41 1 44 0Z'); s.appendChild(p); return s; };
  const bg=el('div'); bg.id='az-bg'; bg.setAttribute('aria-hidden','true');
  bg.appendChild(el('div','brushed'));
  const t=document.createElementNS(NS,'svg'); t.setAttribute('class','trackbg'); t.setAttribute('viewBox','0 0 1600 1000'); t.setAttribute('preserveAspectRatio','xMidYMid slice');
  t.innerHTML='<defs><linearGradient id="aztf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15171a" stop-opacity="0"/><stop offset=".45" stop-color="#15171a" stop-opacity=".16"/><stop offset="1" stop-color="#15171a" stop-opacity=".02"/></linearGradient><filter id="azgl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs><g transform="rotate(-13 800 520)"><g fill="none" stroke="url(#aztf)" stroke-width="2"><rect x="120" y="110" width="1480" height="780" rx="390"/><rect x="154" y="144" width="1412" height="712" rx="356"/><rect x="188" y="178" width="1344" height="644" rx="322"/><rect x="222" y="212" width="1276" height="576" rx="288"/><rect x="256" y="246" width="1208" height="508" rx="254"/><rect x="290" y="280" width="1140" height="440" rx="220"/><rect x="324" y="314" width="1072" height="372" rx="186"/><rect x="358" y="348" width="1004" height="304" rx="152"/></g><g fill="none" stroke-linecap="round"><rect class="rn" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#fff" stroke-width="22" filter="url(#azgl)"/><rect class="rn" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#fff" stroke-width="5"/><rect class="rn rn-t" pathLength="100" x="188" y="178" width="1344" height="644" rx="322" stroke="#6f757c" stroke-width="3" style="animation-delay:-.45s"/></g></g>';
  bg.appendChild(t); bg.appendChild(el('div','orb o1')); bg.appendChild(el('div','orb o2'));
  [['g1',1],['g2',0],['g3',1],['g4',0]].forEach(a=>{ const g=el('div','gh '+a[0]); if(a[1]) g.appendChild(logo()); else { const s=document.createElement('span'); s.textContent='Run elevated'; g.appendChild(s); } bg.appendChild(g); });
  bg.appendChild(el('div','grain'));
  document.body.insertBefore(bg,document.body.firstChild);
})();
