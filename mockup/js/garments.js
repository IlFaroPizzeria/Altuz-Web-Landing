/* ALTUZ mockup · garments from tech pack v1.3. Units: centimetres, y up, +z is the front, +x is the WEARER'S LEFT. */
(function(g){
const A=g.ALTUZ; const {clamp,lerp,smoothstep,smin,aFromPerimeter}=A;
const smax=(a,b,k)=>-smin(-a,-b,k);
function hash(i,j,k){ let h=(i*374761393+j*668265263+k*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967295; }
function vnoise(x,y,z){ const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z); const fx=x-i,fy=y-j,fz=z-k; const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const L=(a,b,t)=>a+(b-a)*t; return L(L(L(hash(i,j,k),hash(i+1,j,k),u),L(hash(i,j+1,k),hash(i+1,j+1,k),u),v),L(L(hash(i,j,k+1),hash(i+1,j,k+1),u),L(hash(i,j+1,k+1),hash(i+1,j+1,k+1),u),v),w); }
const ell=(x,z,a,b)=>{ const k0=Math.hypot(x/a,z/b), k1=Math.hypot(x/(a*a),z/(b*b)); return k1<1e-9?-Math.min(a,b):k0*(k0-1)/k1; };

/* ───────────── TEE · ALT-D001-T01 (black) / T02 (white) ───────────── tech pack TP-03/04 */
A.TEE={
 S:{chest:50,waist:48,hem:50,D:68.5,E:70.5,F:44,H:17.5,I:8.2,J:2,N:16.8,L:17.8,M:22.5,gap:2.4,posA:[11.0,17.2]},
 M:{chest:52.5,waist:50.5,hem:52.5,D:70,E:72,F:45,H:18,I:8.5,J:2,N:17.5,L:18.6,M:23,gap:3.3,posA:[11.5,17.7]},
 L:{chest:55,waist:53,hem:55,D:71.5,E:73.5,F:46,H:18.5,I:8.8,J:2,N:18.2,L:19.4,M:23.5,gap:4.2,posA:[12.0,18.2]},
 XL:{chest:57.5,waist:55.5,hem:57.5,D:73,E:75,F:47,H:19,I:9.1,J:2,N:18.9,L:20.2,M:24,gap:5.2,posA:[12.5,18.7]}};
A.SHORT={
 S:{waistRel:34,waistExt:42,hip:53.5,D:32,F:11.5,G:20.5,H:22,leg:29,body:75},
 M:{waistRel:36,waistExt:44,hip:56,D:33,F:12,G:21,H:22.5,leg:30.5,body:80},
 L:{waistRel:38,waistExt:46,hip:58.5,D:34,F:12.5,G:21.5,H:23,leg:32,body:85},
 XL:{waistRel:40,waistExt:48,hip:61,D:35,F:13,G:22,H:23.5,leg:33.5,body:90}};

A.buildTee=function(size,o){
  o=o||{}; const T=A.TEE[size], white=!!o.white, h=o.h||.5, R=.64;
  const YN=-90, YX=6, step=.5; const na=Math.round((YX-YN)/step)+1; const TA=new Float32Array(na), TB=new Float32Array(na);
  for(let i=0;i<na;i++){ const y=YX-i*step; const C=y>-27?2*T.chest:y>-45?lerp(2*T.chest,2*T.waist,smoothstep(-27,-45,y)):lerp(2*T.waist,2*T.hem,smoothstep(-45,-72,y)); const a=aFromPerimeter(C,R); TA[i]=a; TB[i]=a*R; }
  const prof=y=>{ const f=clamp((YX-y)/step,0,na-1.001); const i=Math.floor(f),t=f-i; return [TA[i]*(1-t)+TA[i+1]*t,TB[i]*(1-t)+TB[i+1]*t]; };
  const xs=.9*T.F/2, slope=3.5/(xs-9), th=32*Math.PI/180, cs=Math.cos(th), sn=Math.sin(th);
  const r0=11.3, rB=5.95, rE=5.57, T1=9, SL=o.sleeveLen||21.2;
  const P0=s=>[s*18,-16.5,0], Dv=s=>[s*cs,-sn,0];
  const rr=t=>t<0?r0:t<T1?rB+(r0-rB)*Math.pow(1-t/T1,1.5):lerp(rB,rE,clamp((t-T1)/(SL-T1),0,1));
  const sleeve=(x,y,z,s)=>{ const p=P0(s),d=Dv(s); const qx=x-p[0],qy=y-p[1],qz=z-p[2]; const t=qx*d[0]+qy*d[1]+qz*d[2]; const px=qx-t*d[0],py=qy-t*d[1],pz=qz-t*d[2]; return Math.max(Math.hypot(px,py,pz)-rr(t),-t-3); };
  const ytop=(x,z)=>-slope*Math.max(0,Math.abs(x)-9)-(z>0?.012:.04)*z*z;
  const sdf=(x,y,z)=>{ const [a,b]=prof(y); const wall=ell(x,z,a,b); const torso=smax(wall,(y-ytop(x,z))*.9,2.5); const sl=Math.min(sleeve(x,y,z,1),sleeve(x,y,z,-1)); return smin(torso,sl,3.2); };
  const b0=13, hemY=z=>-(T.D+(T.E-T.D)*smoothstep(0,1,clamp((b0-z)/(2*b0),0,1)));
  const clampFn=p=>{ let m=false; const hy=hemY(p[2]); if(p[1]<hy){ p[1]=hy; m=true; }
    for(const s of [1,-1]){ if(s*p[0]>22){ const q=P0(s),d=Dv(s); const t=(p[0]-q[0])*d[0]+(p[1]-q[1])*d[1]+(p[2]-q[2])*d[2]; if(t>SL){ p[0]-=d[0]*(t-SL); p[1]-=d[1]*(t-SL); p[2]-=d[2]*(t-SL); m=true; } } } return m; };
  const nw=T.H/2; const dropAt=z=>lerp(T.J,T.I,smoothstep(-3,6,z));
  const cut=(x,y,z)=>{ if(y<-14) return -1; const q=Math.min(1,Math.abs(x)/nw), f=Math.max(0,1-q*q); return Math.min(nw-Math.abs(x),z+7*Math.sqrt(f),y+dropAt(z)*Math.pow(f,.7)); };
  const noise=(x,y,z)=>vnoise(x,y,z);
  const displace=(x,y,z,nx,ny,nz)=>{ let d=.46*(noise(x*.09,y*.055,z*.09)-.5)+.12*(noise(x*.31,y*.2,z*.31)-.5); const ax=Math.abs(x);
    if(ax<22){ const gth=smoothstep(-22,-64,y); d+=.2*gth*Math.sin(Math.atan2(z,x)*8+6*noise(x*.1,y*.05,z*.1)); }
    const dx=ax-17,dy=y+25,dist=Math.hypot(dx,dy),phi=Math.atan2(dy,dx); d+=.14*Math.exp(-dist/7)*Math.sin(phi*5+3*noise(x*.2,y*.2,z*.2))*clamp((ax-8)/6,0,1)*Math.abs(nz);
    if(ax>24){ d+=.14*Math.sin((ax-18)*1.9+4*noise(x*.2,y*.2,z*.2))*Math.exp(-(ax-24)/10); }
    return d*smoothstep(1,-5,y); };
  const edgeRadius=(mx,my,mz)=>(my>-14&&Math.abs(mx)<3)?[.5,.2]:[.3,.13];
  const shell=A.buildShell({sdf,min:[-52,-80,-17],max:[52,6,17],h,clamp:clampFn,cut,displace,edgeRadius});
  return A.assembleTee(T,size,white,shell,{prof,hemY,xs,P0,Dv,SL,R});
};

A.assembleTee=function(T,size,white,shell,G){
  const grp=new THREE.Group(); const {prof,hemY}=G;
  const base=white?0xd6d6d2:0x08080a;
  const fab=A.fabric({color:base,rough:white?.9:.88,sheen:white?0xaaaaa8:0x3a3a42,amp:white?.003:.0045}); fab.userData.kind='fabric'; fab.userData.white=white;
  const body=new THREE.Mesh(shell.geometry,fab); body.name='tee-body'; grp.add(body);
  if(shell.tubes){ const tm=new THREE.Mesh(shell.tubes,fab); tm.name='tee-edges'; grp.add(tm); }
  const probe=A.probe(shell.geometry); const decals=[]; const mats={};
  const add=(name,geo,mat)=>{ if(!geo) return; const m=new THREE.Mesh(geo,mat); m.name=name; grp.add(m); decals.push(m); return m; };
  const silver=A.silver(A.markMask(6.5,5.7)); const silverW=A.silver(A.wordmarkMask(6.4,35)); mats.silver=[silver,silverW];
  const arcAt=(face)=>(x,y,z)=>{ const [a,b]=prof(y); return A.arc(a,b,Math.atan2(face*x/a,face*z/b)); };
  const ptAt=(s,y,face)=>{ const [a,b]=prof(y); let lo=0,hi=Math.PI/2; const sg=Math.sign(s)||1; for(let i=0;i<40;i++){ const mid=(lo+hi)/2; if(A.arc(a,b,mid)<Math.abs(s)) lo=mid; else hi=mid; } const f=(lo+hi)/2; const x=face*sg*a*Math.sin(f)*(face===1?1:1), z=face*b*Math.cos(f);
    // viewer-right is +x on the front and -x on the back: positive s goes to viewer's right
    const X=(face===1?1:-1)*sg*a*Math.sin(f); const n=[X/(a*a),0,z/(b*b)]; const l=Math.hypot(...n); return {c:[X,y,z],n:n.map(v=>v/l)}; };
  const hemSide=(T.D+T.E)/2;
  // A over the heart: 65 x 57 mm, centre 11.5 cm from CF, top edge 17.7 from HPS
  { const y=-(T.posA[1]+2.85); const pt=ptAt(T.posA[0],y,1); const hit=probe([pt.c[0],y,60],[0,0,-1]); add('mark-A',A.makeDecal(shell,{c:hit?hit.p.toArray():pt.c,n:hit?hit.n.toArray():pt.n,w:6.5,h:5.7,lift:.05,minDot:.5}),silver); }
  // ALTUZ wordmark on each side, centred on the side line, base 5 cm above the hem, A at the top
  for(const s of [1,-1]){ const yc=-hemSide+5+17.5; const hit=probe([s*60,yc,0],[-s,0,0]); if(hit) add('altuz-'+(s>0?'L':'R'),A.makeDecal(shell,{c:hit.p.toArray(),n:[s,0,0],w:6.4,h:35,lift:.05,minDot:.5,keep:(x)=>s*x>12}),silverW); }
  // back: perforation, slogan, neck label
  const perf=A.print(A.perfMask(26,8.4),white?0x6b6b6b:0x020203,.6); mats.perf=perf;
  { const y=-(13+4.2); const c=ptAt(0,y,-1); add('perforation',A.makeDecal(shell,{c:c.c,n:c.n,w:26,h:8.4,lift:.03,minDot:.3,uf:arcAt(-1)}),perf); }
  const slog=A.print(A.sloganMask(30,2.1),white?0x23262b:0xf1f1ee,.9); mats.slogan=slog;
  { const y=-hemSide+5+1.05; const c=ptAt(0,y,-1); add('slogan',A.makeDecal(shell,{c:c.c,n:c.n,w:30,h:2.1,lift:.04,minDot:.3,uf:arcAt(-1)}),slog); }
  const num=(A.num||'001/100');
  const labN=A.label(A.labelTex(4,3,num)); { const y=-(T.J+.5+1.2+1.5); const c=ptAt(0,y,-1); add('label-N',A.makeDecal(shell,{c:c.c,n:c.n,w:4,h:3,lift:.05,minDot:.5,uf:arcAt(-1)}),labN); }
  const labH=A.label(A.labelTex(4.5,4.5,num)); { const y=-T.D+5+2.25; const c=ptAt(-14,y,1); const hit=probe([c.c[0],y,60],[0,0,-1]); add('label-H',A.makeDecal(shell,{c:hit?hit.p.toArray():c.c,n:hit?hit.n.toArray():c.n,w:4.5,h:4.5,lift:.05,minDot:.5}),labH); }
  // inside information label, centred on the back, 22 mm under the perforation
  const info=A.label(A.infoTex('ALT-D001-'+(white?'T02':'T01'),size,['Recycled polyester 94 %','Elastane 6 %','30 °C · no bleach','Made in [country]']),{metal:.05,rough:.7,inside:true}); mats.info=info;
  { const y=-(13+8.4+2.2+3.75); const c=ptAt(0,y,-1); add('label-I',A.makeDecal(shell,{c:c.c,n:c.n,w:6,h:7.5,lift:.05,minDot:.3,inside:true,uf:arcAt(-1)}),info); }
  // TPU tape: shoulders and shifted side seams (50 mm towards the back)
  const tape=A.tape(); const rib=(name,samples,w)=>{ const geo=A.ribbon(probe,samples,w,.07); if(geo){ const m=new THREE.Mesh(geo,tape); m.name=name; grp.add(m); } };
  for(const s of [1,-1]){ const sm=[]; for(let x=9.6;x<=G.xs+.2;x+=.6) sm.push({o:[s*x,20,-1.2],d:[0,-1,0]}); rib('tape-shoulder',sm,1);
    const sd=[]; for(let y=-26;y>-(T.D+T.E)/2+.6;y-=.8){ const yy=y; sd.push({o:[s*60,yy,-5],d:[-s,0,0]}); } rib('tape-side',sd,1); }
  // tubes: neck binding + hems are in shell.tubes
  grp.userData={decals,mats,tape,fabric:fab,probe,shell,size,G};
  return {group:grp,info:A.teeInfo(T,size,white),dims:A.teeDims(T,G,hemSide)};
};
A.teeInfo=(T,size,white)=>({code:white?'ALT-D001-T02':'ALT-D001-T01',name:'Technical tee “Número”',rows:[['Size',size+' · garment flat'],['Chest · width',T.chest.toFixed(1)+' cm  (circ. '+(2*T.chest).toFixed(1)+')'],['Waist · width',T.waist.toFixed(1)+' cm'],['Hem · width',T.hem.toFixed(1)+' cm'],['Front length (HPS–hem)',T.D.toFixed(1)+' cm'],['Back length',T.E.toFixed(1)+' cm'],['Shoulder',T.F.toFixed(1)+' cm'],['Neck opening',T.H.toFixed(1)+' cm'],['Front / back neck drop',T.I.toFixed(1)+' / '+T.J.toFixed(1)+' cm'],['Sleeve (top edge)',T.M.toFixed(1)+' cm'],['Sleeve opening · width',T.N.toFixed(1)+' cm'],['Fabric','Recycled micro-polyester 94 % / elastane 6 %, 100–110 g/m²'],['Reflective','3M Scotchlite 8712 S · A 65×57 mm · ALTUZ 350×64 mm ×2'],['Construction','Thread-free · 10 mm TPU tape · heat-sealed neck binding']]});
A.teeDims=(T,G,hemSide)=>{ const f=G.prof; const ring=(y,label)=>({type:'ring',y,label,a:f(y)[0],b:f(y)[1]});
  return [{type:'line',a:[-52,0,0],b:[-52,-T.D,0],label:'D · front length '+T.D.toFixed(1),side:-1},{type:'line',a:[52,0,0],b:[52,-T.E,0],label:'E · back length '+T.E.toFixed(1),side:1},
    ring(-27.5,'Chest '+(2*T.chest).toFixed(1)+' around · flat '+T.chest.toFixed(1)),ring(-45,'Waist '+(2*T.waist).toFixed(1)+' · flat '+T.waist.toFixed(1)),ring(-hemSide,'Hem '+(2*T.hem).toFixed(1)+' · flat '+T.hem.toFixed(1)),
    {type:'line',a:[-T.H/2,5,10],b:[T.H/2,5,10],label:'H · neck '+T.H.toFixed(1),side:0}];
};

/* ───────────── SHORT · ALT-D001-S01 ───────────── tech pack TP-05..TP-09 */
A.buildShort=function(size,o){
  o=o||{}; const S=A.SHORT[size], h=o.h||.42;
  const waistC=S.body, hipC=2*S.hip, legC=2*S.leg;
  const rHip=.5, aHip=aFromPerimeter(hipC,rHip);
  const Cy=y=>y>-18?lerp(waistC,hipC,clamp(-y/18,0,1)*.7+.3*smoothstep(0,-18,y)):lerp(hipC,hipC*.985,smoothstep(-18,-24,y));
  const Ry=y=>y>-18?lerp(.66,rHip,smoothstep(0,-18,y)):lerp(rHip,.52,smoothstep(-18,-26,y));
  const prof=y=>{ const r=Ry(y); const a=aFromPerimeter(Cy(y),r); return [a,a*r]; };
  const rLeg=1.2, aL=aFromPerimeter(legC,rLeg), bL=aL*rLeg, xc=aHip-aL-.5;
  const fl=y=>lerp(.9,1,smoothstep(-14,-33,y));
  const yc=z=>S.G+(S.H-S.G)*smoothstep(8,-8,z);
  const sdf=(x,y,z)=>{ const [a,b]=prof(Math.max(y,-28)); let pel=ell(x,z,a,b); pel=smax(pel,-yc(z)-y,2.5);
    const f=fl(y); const lg=Math.min(ell(x-xc,z,aL*f,bL*f),ell(x+xc,z,aL*f,bL*f));
    return smin(pel,smax(lg,y-4,.01),5); };
  const hemY=z=>-(S.D+.6+.6*clamp(-z/10,-1,1));
  const clampFn=p=>{ let m=false; const hy=hemY(p[2]); if(p[1]<hy){ p[1]=hy; m=true; } if(p[1]>0){ p[1]=0; m=true; } return m; };
  const slitTop=()=>hemY(0)+5;
  const cut=(x,y,z)=>Math.min(Math.abs(x)-17,.42-Math.abs(z+4),slitTop()-y);
  const displace=(x,y,z,nx,ny,nz)=>{ let d=.2*(vnoise(x*.13,y*.08,z*.13)-.5); d+=.12*Math.sin(Math.atan2(z,x)*9+5*vnoise(x*.1,y*.1,z*.1))*smoothstep(-6,-30,y);
    const dc=Math.hypot(x/1.5,(y+S.G)/6); d+=.16*Math.exp(-dc*.7)*Math.sin(Math.atan2(y+S.G,x)*6)*(nz>0?1:.6);
    return d*smoothstep(-1,-5,y); };
  const edgeRadius=(mx,my)=>my>-8?[.28,.2]:[.14,.07];
  const shell=A.buildShell({sdf,min:[-27,-40,-17],max:[27,3,17],h,clamp:clampFn,cut,displace,edgeRadius});
  return A.assembleShort(S,size,shell,{prof,hemY,xc,aL,bL,aHip});
};
A.assembleShort=function(S,size,shell,G){
  const grp=new THREE.Group(); const fab=A.fabric({color:0x0a0a0c,rough:.74,sheen:0x484850,px:.06,py:.08,amp:.003,band:true,bandY:-4,env:.95}); fab.userData.kind='fabric';
  const body=new THREE.Mesh(shell.geometry,fab); body.name='short-body'; grp.add(body); if(shell.tubes){ const tm=new THREE.Mesh(shell.tubes,fab); tm.name='short-edges'; grp.add(tm); }
  const probe=A.probe(shell.geometry); const decals=[]; const mats={}; const add=(name,geo,mat)=>{ if(!geo) return; const m=new THREE.Mesh(geo,mat); m.name=name; grp.add(m); decals.push(m); return m; };
  const silverW=A.silver(A.wordmarkMask(3.6,20)); mats.silver=[silverW];
  for(const s of [1,-1]){ const yc=G.hemY(0)+5+10; const hit=probe([s*60,yc,0],[-s,0,0]); if(hit) add('altuz-'+(s>0?'L':'R'),A.makeDecal(shell,{c:hit.p.toArray(),n:[s,0,0],w:3.6,h:20,lift:.05,minDot:.5,keep:(x)=>s*x>12}),silverW); }
  const labS=A.label(A.labelTex(4,4,A.num||'001/100')); { const y=G.hemY(1)+4+2; const hit=probe([16.5,y,60],[0,0,-1]); if(hit) add('label-S',A.makeDecal(shell,{c:hit.p.toArray(),n:hit.n.toArray(),w:4,h:4,lift:.05,minDot:.5}),labS); }
  const zip=A.label(A.zipTex(),{metal:.25,rough:.55}); { const hit=probe([0,-12.5,-60],[0,0,1]); if(hit) add('zip-pocket',A.makeDecal(shell,{c:hit.p.toArray(),n:hit.n.toArray(),w:16,h:15,lift:.06,minDot:.4}),zip); }
  const info=A.label(A.infoTex('ALT-D001-S01',size,['Recycled polyamide 88 %','Elastane 12 %','30 °C · no bleach','Made in [country]']),{metal:.05,rough:.7,inside:true}); { const hit=probe([0,-10,60],[0,0,-1]); if(hit) add('label-I',A.makeDecal(shell,{c:hit.p.toArray(),n:hit.n.toArray(),w:6,h:7.5,lift:.05,minDot:.4,inside:true}),info); }
  const tape=A.tape(); const rib=(name,samples,w,lift)=>{ const geo=A.ribbon(probe,samples,w,lift||.07); if(geo){ const m=new THREE.Mesh(geo,tape); m.name=name; grp.add(m); } };
  const ring=[]; for(let a=0;a<=360;a+=4){ const t=a*Math.PI/180; ring.push({o:[40*Math.cos(t),-4,40*Math.sin(t)],d:[-Math.cos(t),0,-Math.sin(t)]}); } rib('tape-waist',ring,1.2);
  for(const s of [1,-1]){ const sd=[]; for(let y=-4.6;y>G.hemY(0)+5.2;y-=.8) sd.push({o:[s*60,y,-4],d:[-s,0,0]}); rib('tape-side',sd,1);
    const pt=[]; for(let y=G.hemY(0)+5.9;y>G.hemY(0)+4.6;y-=.3) pt.push({o:[s*60,y,-4],d:[-s,0,0]}); rib('patch-slit',pt,1.2,.1); }
  // eyelets + flat cord (8 mm)
  const cordM=new THREE.MeshStandardMaterial({color:A.srgb(0x08080a),roughness:.88,metalness:0,envMapIntensity:.35,side:THREE.DoubleSide});
  const eyl=A.print(A.eyeletTex(),0x000000,.9); [-1.7,1.7].forEach(x=>{ const hit=probe([x,-2.1,60],[0,0,-1]); if(hit) add('eyelet',A.makeDecal(shell,{c:hit.p.toArray(),n:hit.n.toArray(),w:1.2,h:1.2,lift:.04,minDot:.5}),eyl); });
  [[-1.7,-1,23],[1.7,1,19]].forEach(([x0,sg,len])=>{ const pts=[]; for(let i=0;i<=22;i++){ const t=i/22; const x=x0+sg*(.6*Math.sin(t*3.0)*2.4+t*2.2), y=-2.4-len*t; pts.push({o:[x,y,60],d:[0,0,-1]}); } const geo=A.ribbon(probe,pts,.8,.12); if(geo){ const m=new THREE.Mesh(geo,cordM); m.name='cord'; grp.add(m); } });
  grp.userData={decals,mats,tape,fabric:fab,probe,shell,size,G};
  return {group:grp,info:A.shortInfo(S,size),dims:A.shortDims(S,G)};
};
A.shortInfo=(S,size)=>({code:'ALT-D001-S01',name:'Technical short “Número” · 5″',rows:[['Size',size+' · garment flat'],['Waist, relaxed → extended',(2*S.waistRel)+' → '+(2*S.waistExt)+' cm (circ.)'],['Hip, 18 cm below top',S.hip.toFixed(1)+' cm width  (circ. '+(2*S.hip).toFixed(1)+')'],['Side length',S.D.toFixed(1)+' cm'],['Inseam',S.F.toFixed(1)+' cm'],['Front / back rise',S.G.toFixed(1)+' / '+S.H.toFixed(1)+' cm'],['Leg opening · per leg',S.leg.toFixed(1)+' cm width'],['Side opening','5 cm with 12×12 mm TPU patch · seam 4 cm towards the back'],['Fabric','Recycled polyamide 88 % / elastane 12 % tricot, 80–95 g/m²'],['Waist','40 mm micro-perforated mesh sleeve, 38 mm elastic, 8 mm flat cord'],['Pocket','12 cm zip, 40 mm below the waist · 15×14 cm sealed bag'],['Reflective','3M Scotchlite 8712 S · ALTUZ 200×36 mm ×2']]});
A.shortDims=(S,G)=>{ const f=G.prof; return [{type:'ring',y:-2,label:'Waist '+2*S.waistRel+' relaxed → '+2*S.waistExt+' ext.',a:f(-2)[0],b:f(-2)[1]},{type:'ring',y:-18,label:'Hip '+(2*S.hip).toFixed(1)+' around',a:f(-18)[0],b:f(-18)[1]},
  {type:'line',a:[-30,0,0],b:[-30,G.hemY(0),0],label:'D · side length '+S.D.toFixed(1),side:-1},{type:'line',a:[30,-S.G,0],b:[30,-S.G-S.F,0],label:'F · inseam '+S.F.toFixed(1),side:1}]; };
})(window);
