/* ALTUZ mockup · viewer */
(function(g){
const A=g.ALTUZ; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={product:'teeB',size:'M',quality:'draft',night:false,dims:false,ruler:true,wire:false,turn:false};
let renderer,scene,camera,controls,env,envNight,current=null,extras=new THREE.Group(),rulerG=new THREE.Group(),floor,keyLight,headlight,building=false,pending=false;
const PROD={teeB:{label:'Tee · Black',code:'ALT-D001-T01',kind:'tee',white:false,center:[0,-34,0],dist:190,floor:-78},teeW:{label:'Tee · White',code:'ALT-D001-T02',kind:'tee',white:true,center:[0,-34,0],dist:190,floor:-78},short:{label:'Short · Black',code:'ALT-D001-S01',kind:'short',center:[0,-17,0],dist:100,floor:-40}};
const VIEWS={front:[0,.05],back:[180,.05],side:[90,.05],three:[38,.18],three2:[-38,.18]};
const SC=n=>new THREE.Color(n);

function envTexture(){ const c=document.createElement('canvas'); c.width=1024; c.height=512; const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,512); gr.addColorStop(0,'#2a2e36'); gr.addColorStop(.5,'#0d0e11'); gr.addColorStop(1,'#050506'); x.fillStyle=gr; x.fillRect(0,0,1024,512);
  const box=(cx,cy,w,h,v,soft)=>{ const gg=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.75); gg.addColorStop(0,`rgba(255,255,255,${v})`); gg.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gg; x.fillRect(cx-w,cy-h,w*2,h*2); x.fillStyle=`rgba(255,255,255,${v})`; x.fillRect(cx-w/2,cy-h/2,w,h); };
  box(300,110,230,90,1,1); box(760,150,60,210,.85,1); box(40,160,70,230,.55,1); box(980,160,60,230,.5,1); box(520,40,360,26,.9,1); box(520,430,420,30,.18,1);
  const t=new THREE.CanvasTexture(c); t.mapping=THREE.EquirectangularReflectionMapping; t.encoding=THREE.sRGBEncoding; return t; }
function init(){
  const cv=$('#gl'); renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true}); renderer.setPixelRatio(Math.min(2,devicePixelRatio)); renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene(); scene.background=SC(0x0a0a0c); camera=new THREE.PerspectiveCamera(28,1,5,900); controls=new THREE.OrbitControls(camera,cv); controls.enableDamping=true; controls.dampingFactor=.07; controls.minDistance=12; controls.maxDistance=420;
  const pm=new THREE.PMREMGenerator(renderer); env=pm.fromEquirectangular(envTexture()).texture; const nc=document.createElement('canvas'); nc.width=64; nc.height=32; const nx=nc.getContext('2d'); nx.fillStyle='#020203'; nx.fillRect(0,0,64,32); const nt=new THREE.CanvasTexture(nc); nt.mapping=THREE.EquirectangularReflectionMapping; envNight=pm.fromEquirectangular(nt).texture; scene.environment=env;
  keyLight=new THREE.DirectionalLight(0xffffff,1.9); keyLight.position.set(70,90,130); scene.add(keyLight); const rim=new THREE.DirectionalLight(0xb8c6dc,1.6); rim.position.set(-110,50,-70); scene.add(rim); const fill=new THREE.DirectionalLight(0xffffff,.7); fill.position.set(-80,10,100); scene.add(fill); scene.add(new THREE.HemisphereLight(0xdfe6f2,0x14141a,.45));
  headlight=new THREE.SpotLight(0xffffff,0,600,.5,.5,1); camera.add(headlight); headlight.position.set(0,0,0); headlight.target.position.set(0,0,-100); camera.add(headlight.target); scene.add(camera);
  scene.add(extras); scene.add(rulerG);
  floor=new THREE.Mesh(new THREE.CircleGeometry(90,96),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{},vertexShader:'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`varying vec3 vP; void main(){ float r=length(vP.xy); float fade=1.-smoothstep(10.,88.,r); vec2 g=abs(fract(vP.xy)-.5); float l1=1.-smoothstep(0.,.04,min(g.x,g.y)*0.0+ (0.5-max(g.x,g.y))); vec2 g10=abs(fract(vP.xy/10.)-.5); float t10=1.-smoothstep(0.,.012,.5-max(g10.x,g10.y)); vec2 g1=abs(fract(vP.xy)-.5); float t1=1.-smoothstep(0.,.03,.5-max(g1.x,g1.y)); float a=(t10*.28+t1*.06)*fade; a+=.55*(1.-smoothstep(0.,60.,r))*0.0; gl_FragColor=vec4(vec3(.72,.76,.84),a); }`}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);
  addEventListener('resize',resize); resize(); loop();
}
function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; const sh=w>760&&!$('#panel').classList.contains('shut')?170:0; camera.setViewOffset(w,h,sh,0,w,h); camera.updateProjectionMatrix(); }
function renderOnce(){ controls.update(); tick(); renderer.render(scene,camera); }
function loop(){ if(g.__still) return; requestAnimationFrame(loop); if(state.turn&&controls) controls.autoRotate=true; else controls.autoRotate=false; controls.autoRotateSpeed=1.2; controls.update(); tick(); renderer.render(scene,camera); }
let tw=null; function tick(){ rulerG.rotation.y=Math.atan2(camera.position.x-controls.target.x,camera.position.z-controls.target.z); if(!tw) return; const t=Math.min(1,(performance.now()-tw.t0)/tw.dur), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; camera.position.lerpVectors(tw.p0,tw.p1,e); controls.target.lerpVectors(tw.c0,tw.c1,e); if(t>=1) tw=null; }
function goView(name,opt){ const P=PROD[state.product]; const v=VIEWS[name]||VIEWS.front; const az=v[0]*Math.PI/180, el=v[1]; const d=(opt&&opt.d)||P.dist; const tc=(opt&&opt.t)||P.center; const p1=new THREE.Vector3(tc[0]+Math.sin(az)*d*Math.cos(el),tc[1]+d*Math.sin(el),tc[2]+Math.cos(az)*d*Math.cos(el)); const c1=new THREE.Vector3(...tc);
  if(opt&&opt.now){ camera.position.copy(p1); controls.target.copy(c1); controls.update(); return; } tw={t0:performance.now(),dur:1100,p0:camera.position.clone(),p1,c0:controls.target.clone(),c1}; }
function labelSprite(text,scale){ const c=document.createElement('canvas'); const x=c.getContext('2d'); x.font="500 30px 'IBM Plex Mono',monospace"; const w=Math.ceil(x.measureText(text).width)+24; c.width=w; c.height=46; x.font="500 30px 'IBM Plex Mono',monospace"; x.fillStyle='rgba(8,8,10,.82)'; x.fillRect(0,0,w,46); x.strokeStyle='rgba(205,208,214,.6)'; x.lineWidth=2; x.strokeRect(1,1,w-2,44); x.fillStyle='#e8eaee'; x.textBaseline='middle'; x.fillText(text,12,24);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true})); const hh=scale||3.2; s.scale.set(hh*w/46,hh,1); s.renderOrder=20; return s; }
function buildExtras(P,model){ extras.clear(); rulerG.clear(); rulerG.position.set(P.center[0],0,P.center[2]); rulerG.userData.cx=P.center[0];
  const lm=new THREE.LineBasicMaterial({color:0xd6d9df,depthTest:false,transparent:true,opacity:.95});
  if(state.ruler){ const y1=P.kind==='tee'?-82:-42, y0=P.kind==='tee'?4:2, x=P.kind==='tee'?-58:-34; const pts=[]; for(let y=Math.ceil(y1);y<=y0;y++){ const L=y%10===0?3:y%5===0?2:1; pts.push(x,y,0,x+L,y,0); } pts.push(x,y1,0,x,y0,0);
    const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); const ls=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x9fa4ad,transparent:true,opacity:.7})); rulerG.add(ls);
    for(let y=Math.ceil(y1/10)*10;y<=y0;y+=10){ const s=labelSprite(String(-y)+' cm',1.9); s.position.set(x-5,y,0); rulerG.add(s); }
    const hx=[]; const xb=P.kind==='tee'?-30:-24, xe=-xb, yb=y1+3; for(let xx=xb;xx<=xe;xx++){ const L=xx%10===0?3:xx%5===0?2:1; hx.push(xx,yb,0,xx,yb+L,0); } hx.push(xb,yb,0,xe,yb,0);
    const hg=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(hx,3)); rulerG.add(new THREE.LineSegments(hg,new THREE.LineBasicMaterial({color:0x9fa4ad,transparent:true,opacity:.7})));
    for(let xx=Math.ceil(xb/10)*10;xx<=xe;xx+=10){ const s=labelSprite(String(xx),1.9); s.position.set(xx,yb-3,0); rulerG.add(s); } }
  if(state.dims){ model.dims.forEach((d,i)=>{ if(d.type==='line'){ const g1=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...d.a),new THREE.Vector3(...d.b)]); const l=new THREE.Line(g1,lm); l.renderOrder=19; extras.add(l); [d.a,d.b].forEach(p=>{ const e=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p[0]-1.2,p[1],p[2]),new THREE.Vector3(p[0]+1.2,p[1],p[2])]); const el=new THREE.Line(e,lm); el.renderOrder=19; extras.add(el); }); const s=labelSprite(d.label,2.2); const half=d.label.length*.44+2; s.position.set(d.a[0]+(d.side===0?0:-d.side*half),d.side===0?d.a[1]+3.5:(d.a[1]+d.b[1])/2,d.a[2]); extras.add(s); }
    else if(d.type==='ring'){ const pts=[]; for(let k=0;k<=96;k++){ const t=k/96*Math.PI*2; pts.push(new THREE.Vector3(d.a*1.012*Math.sin(t),d.y,d.b*1.012*Math.cos(t))); } const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lm); l.renderOrder=19; extras.add(l); const s=labelSprite(d.label,2.2); s.position.set(d.a+d.label.length*.44+3,d.y,d.b*.2); extras.add(s); } }); }
}
async function build(){ if(building){ pending=true; return; } building=true; $('#busy').classList.add('on'); await new Promise(r=>setTimeout(r,40));
  const P=PROD[state.product]; const h=state.quality==='high'?(P.kind==='tee'?.34:.3):(P.kind==='tee'?.52:.44); const t0=performance.now();
  try{ if(current) { scene.remove(current.group); current.group.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
    current=P.kind==='tee'?A.buildTee(state.size,{white:P.white,h}):A.buildShort(state.size,{h}); scene.add(current.group); floor.position.y=P.floor; applyMode(); buildExtras(P,current); renderInfo(P); current.ms=Math.round(performance.now()-t0); $('#stat').textContent=`${Math.round(current.group.children.reduce((n,m)=>n+(m.geometry?(m.geometry.index?m.geometry.index.count/3:0):0),0)/1000)}k triangles · ${current.ms} ms`; g.__built=(g.__built||0)+1;
  }catch(e){ console.error(e); $('#stat').textContent='build error: '+e.message; }
  building=false; $('#busy').classList.remove('on'); if(pending){ pending=false; build(); } }
function applyMode(){ if(!current) return; scene.environment=state.night?envNight:env; scene.background=SC(state.night?0x020203:0x0a0a0c); headlight.intensity=state.night?2.6:0; keyLight.intensity=state.night?0:1.9; renderer.toneMappingExposure=state.night?1.25:(PROD[state.product].white?.8:1.15); floor.visible=!state.night||true;
  current.group.traverse(o=>{ if(!o.material) return; const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>{ if(m.userData&&m.userData.kind==='fabric'){ m.wireframe=state.wire; m.envMapIntensity=state.night?.02:(m.userData.white?.55:1.4); } if(m.emissive&&m.metalness>.8){ m.emissiveIntensity=state.night?1.35:0; m.envMapIntensity=state.night?.05:1.5; } }); }); }
function renderInfo(P){ const m=current; $('#pTitle').textContent=P.label; $('#pCode').textContent=P.code+' · size '+state.size; $('#spec').innerHTML=m.info.rows.map(r=>`<div class="r"><span>${r[0]}</span><b>${r[1]}</b></div>`).join(''); }
function ui(){
  $$('[data-p]').forEach(b=>b.addEventListener('click',()=>{ state.product=b.dataset.p; mark(); build().then(()=>goView('front')); }));
  $$('[data-s]').forEach(b=>b.addEventListener('click',()=>{ state.size=b.dataset.s; mark(); build(); }));
  $$('[data-v]').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.v)));
  $$('[data-d]').forEach(b=>b.addEventListener('click',()=>{ const P=PROD[state.product]; const D=DETAIL[state.product][b.dataset.d]; if(D) goView(D.v,{d:D.d,t:D.t}); }));
  $$('[data-t]').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.t; state[k]=!state[k]; b.classList.toggle('on',state[k]); if(k==='night'||k==='wire') applyMode(); if(k==='dims'||k==='ruler') buildExtras(PROD[state.product],current); }));
  $('#qHigh').addEventListener('click',()=>{ state.quality=state.quality==='high'?'draft':'high'; $('#qHigh').classList.toggle('on',state.quality==='high'); $('#qHigh').textContent=state.quality==='high'?'High quality · on':'High quality'; build(); });
  $('#exportGlb').addEventListener('click',exportGLB); $('#exportPng').addEventListener('click',()=>{ renderer.render(scene,camera); const a=document.createElement('a'); a.download=`altuz-${state.product}-${state.size}.png`; a.href=$('#gl').toDataURL('image/png'); a.click(); });
  $('#panelBtn').addEventListener('click',()=>{ $('#panel').classList.toggle('shut'); resize(); });
  function mark(){ $$('[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===state.product)); $$('[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===state.size)); $$('[data-pk]').forEach(b=>b.style.display=b.dataset.pk.split(' ').includes(PROD[state.product].kind)?'':'none'); }
  mark(); }
const DETAIL={teeB:{mark:{v:'front',d:34,t:[11.5,-20.5,10]},neck:{v:'three',d:46,t:[0,-4,6]},side:{v:'side',d:52,t:[0,-48,0]},back:{v:'back',d:62,t:[0,-24,-8]},label:{v:'front',d:40,t:[-14,-62,10]},hem:{v:'three2',d:56,t:[0,-68,6]}},
 teeW:{mark:{v:'front',d:34,t:[11.5,-20.5,10]},neck:{v:'three',d:46,t:[0,-4,6]},side:{v:'side',d:52,t:[0,-48,0]},back:{v:'back',d:62,t:[0,-24,-8]},label:{v:'front',d:40,t:[-14,-62,10]},hem:{v:'three2',d:56,t:[0,-68,6]}},
 short:{mark:{v:'three',d:38,t:[16,-24,6]},neck:{v:'front',d:46,t:[0,-4,8]},side:{v:'side',d:42,t:[0,-18,0]},back:{v:'back',d:44,t:[0,-12,-8]},label:{v:'front',d:34,t:[16,-27,10]},hem:{v:'three2',d:46,t:[8,-30,6]}}};
async function exportGLB(){ if(!current||!THREE.GLTFExporter){ alert('GLB exporter not loaded'); return; } const grp=current.group.clone(true); grp.scale.setScalar(.01); grp.updateMatrixWorld(true); const scn=new THREE.Scene(); scn.add(grp);
  new THREE.GLTFExporter().parse(scn,res=>{ const blob=new Blob([res],{type:'model/gltf-binary'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`altuz-${PROD[state.product].code}-${state.size}.glb`; a.click(); },{binary:true}); }
g.ALTUZ_VIEWER={renderOnce,state,goView,build,get camera(){return camera;},get controls(){return controls;},set:(k,v)=>{ state[k]=v; },applyMode,buildExtras:()=>buildExtras(PROD[state.product],current),get current(){return current;}};
addEventListener('DOMContentLoaded',async()=>{ try{ await Promise.all(["500 40px Jost","800 40px Archivo","500 20px 'IBM Plex Mono'"].map(f=>document.fonts.load(f))); }catch(e){} init(); ui(); await build(); goView('front',{now:true}); $('#intro').classList.add('gone'); g.__ready=true; });
})(window);
