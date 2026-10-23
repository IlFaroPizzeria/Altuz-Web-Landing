/* ALTUZ mockup · canvas artwork for the real placements (px per cm = PX) */
(function(g){
const A=g.ALTUZ; const PX=36;
A.PX=PX;
const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.round(w*PX); c.height=Math.round(h*PX); const x=c.getContext('2d'); return {c,x,W:c.width,H:c.height}; };
const tex=c=>{ const t=new THREE.CanvasTexture(c); t.anisotropy=8; t.encoding=THREE.sRGBEncoding; return t; };
const mask=c=>{ const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t; }; // alphaMap reads green channel
const font=(w,s)=>`${w} ${s}px Jost, 'Helvetica Neue', Arial, sans-serif`;
function spaced(x,txt,cx,cy,track){ // centred text with letter spacing
  const ws=[...txt].map(ch=>x.measureText(ch).width); const tot=ws.reduce((a,b)=>a+b,0)+track*(txt.length-1); let px=cx-tot/2;
  [...txt].forEach((ch,i)=>{ x.fillText(ch,px,cy); px+=ws[i]+track; });
}
/* alphaMap style mask: white where the film is */
A.artMask=function(w,h,draw){ const k=cv(w,h); k.x.fillStyle='#000'; k.x.fillRect(0,0,k.W,k.H); k.x.fillStyle='#fff'; k.x.strokeStyle='#fff'; draw(k); return mask(k.c); };

/* ALTUZ wordmark, vertical, A at the top (reads downwards). length L along the side, thickness T */
A.wordmarkMask=function(T,L){ return A.artMask(T,L,k=>{ const x=k.x; x.save(); x.translate(k.W/2,k.H/2); x.rotate(Math.PI/2); x.textBaseline='alphabetic'; x.textAlign='left';
  const cap=T*PX*.94; x.font=font(500,cap/.7); const m=x.measureText('H'); const capH=m.actualBoundingBoxAscent||cap*.7; const sc=cap/capH; x.font=font(500,(cap/.7)*sc);
  spaced(x,'ALTUZ',0,cap*.5,(L*PX-[...'ALTUZ'].reduce((a,ch)=>a+x.measureText(ch).width,0))/4*.86); x.restore(); }); };
/* the A mark (65 x 57 mm): open triangle with a notch */
A.markMask=function(w,h){ return A.artMask(w,h,k=>{ const x=k.x,W=k.W,H=k.H; const t=W*.17; x.beginPath(); x.moveTo(W*.5,H*.02); x.lineTo(W*.98,H*.98); x.lineTo(W*.98-t*1.05,H*.98); x.lineTo(W*.5,H*.02+t*1.4); x.lineTo(W*.02+t*1.05,H*.98); x.lineTo(W*.02,H*.98); x.closePath(); x.fill(); x.fillRect(W*.30,H*.64,W*.40,t*.62); }); };
A.sloganMask=function(w,h){ return A.artMask(w,h,k=>{ const x=k.x; x.font="800 100px Archivo, 'Arial Narrow', Arial, sans-serif"; const m=x.measureText('RUN ELEVATED.'); const capH=(m.actualBoundingBoxAscent||70); x.font=`800 ${100*(k.H*.9/capH)}px Archivo, 'Arial Narrow', Arial, sans-serif`;
  const tot=x.measureText('RUN ELEVATED.').width; const sc=Math.min(1,(k.W*.97)/tot); x.save(); x.translate(k.W/2,k.H*.5+k.H*.45); x.scale(sc,1); x.textAlign='center'; x.fillText('RUN ELEVATED.',0,0); x.restore(); }); };
/* laser micro-perforation: 1.5 mm holes, 5 mm pitch */
A.perfMask=function(w,h){ return A.artMask(w,h,k=>{ const x=k.x; const pitch=.5*PX, r=.075*PX; let row=0; for(let y=pitch/2;y<k.H;y+=pitch*.866,row++){ for(let xx=pitch/2+(row%2?pitch/2:0);xx<k.W;xx+=pitch){ x.beginPath(); x.arc(xx,y,Math.max(r,1.6),0,7); x.fill(); } } }); };
/* silicone label with foil number (direct on fabric, no patch) */
A.labelTex=function(w,h,num,opt){ opt=opt||{}; const k=cv(w,h); const x=k.x; const r=Math.min(k.W,k.H)*.08;
  const gr=x.createLinearGradient(0,0,k.W,k.H); gr.addColorStop(0,'#8a8d92'); gr.addColorStop(.5,'#74777c'); gr.addColorStop(1,'#8f9297');
  x.fillStyle=gr; x.beginPath(); const P3=3; x.roundRect?x.roundRect(P3,P3,k.W-2*P3,k.H-2*P3,r):x.rect(P3,P3,k.W-2*P3,k.H-2*P3); x.fill();
  x.fillStyle='#1b1c1f'; x.textAlign='center'; x.font=font(500,k.H*.2); spaced(x,'ALTUZ',k.W/2,k.H*.32,k.H*.05);
  x.fillStyle='#e6e8ec'; x.font=`500 ${k.H*.2}px 'IBM Plex Mono', monospace`; x.fillText(num||'001/100',k.W/2,k.H*(opt.small?.78:.78));
  x.strokeStyle='rgba(20,20,22,.55)'; x.lineWidth=k.H*.012; x.beginPath(); x.moveTo(k.W*.18,k.H*.46); x.lineTo(k.W*.82,k.H*.46); x.stroke();
  const t=tex(k.c); return t; };
/* information label (inside): black thermal transfer, 60 x 75 mm */
A.infoTex=function(code,size,comp){ const k=cv(6,7.5); const x=k.x; x.fillStyle='#050506'; x.fillRect(3,3,k.W-6,k.H-6); x.fillStyle='#dcdee2'; x.textAlign='left';
  const L=k.W*.09; let y=k.H*.11; x.font=font(500,k.H*.07); x.fillText('ALTUZ',L,y); x.font=`400 ${k.H*.042}px 'IBM Plex Mono', monospace`; y+=k.H*.085; x.fillText(code,L,y);
  x.font=font(500,k.H*.26); y+=k.H*.25; x.fillText(size,L,y); x.font=font(400,k.H*.045); const lines=comp; y+=k.H*.07; lines.forEach(l=>{ x.fillText(l,L,y); y+=k.H*.062; });
  x.strokeStyle='#9aa0a8'; x.lineWidth=2; [0,1,2,3].forEach(i=>{ x.strokeRect(L+i*k.W*.19,k.H*.86,k.W*.14,k.H*.09); }); return tex(k.c); };
/* back zip + 15 x 14 cm sealed bag outline (short) */
A.zipTex=function(){ const w=16,h=15; const k=cv(w,h); const x=k.x; x.clearRect(0,0,k.W,k.H);
  x.strokeStyle='rgba(8,8,9,1)'; x.lineWidth=.16*PX; x.strokeRect(.5*PX,.4*PX,15*PX,14*PX); // sealed tape outline
  const zy=k.H*.14; x.fillStyle='#08080a'; x.fillRect(2*PX,zy-.55*PX,12*PX,1.1*PX); // zip tape
  x.fillStyle='#34363a'; for(let i=0;i<12*PX/5;i++){ x.fillRect(2*PX+i*5+(i%2?0:2.5),zy-.28*PX,2.4,.56*PX); } // coil teeth
  x.fillStyle='#17181b'; x.fillRect(11.2*PX,zy-.6*PX,1.1*PX,1.2*PX); x.fillStyle='#3b3d42'; x.fillRect(11.35*PX,zy-.45*PX,.8*PX,.9*PX);
  x.fillStyle='#0a0a0b'; x.fillRect(11.55*PX,zy+.5*PX,.5*PX,3.2*PX); // black tape pull
  return tex(k.c); };
A.eyeletTex=function(){ return A.artMask(1.2,1.2,k=>{ const x=k.x; x.beginPath(); x.ellipse(k.W/2,k.H/2,k.W*.42,k.H*.2,0,0,7); x.fill(); }); };
})(window);
