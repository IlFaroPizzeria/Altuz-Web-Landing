/* ALTUZ mockup · mesh toolkit
 * Garments are built from a signed-distance field (units: centimetres, 1 unit = 1 cm, real scale),
 * meshed with naive surface nets, cut open (hem, cuffs, neck, side slit), then given
 * drape wrinkles, ambient occlusion, hem tubes and projected decals (prints, labels). */
(function(g){
const A=g.ALTUZ=g.ALTUZ||{};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
A.clamp=clamp; A.lerp=(a,b,t)=>a+(b-a)*t;
A.smoothstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.smin=(a,b,k)=>{ const h=clamp(.5+.5*(b-a)/k,0,1); return b+(a-b)*h-k*h*(1-h); };
/* perimeter of an ellipse with axis ratio r=b/a is P=a*c(r); return a for a given perimeter */
A.aFromPerimeter=(P,r)=>P/(Math.PI*(3*(1+r)-Math.sqrt((3+r)*(1+3*r))));

A.surfaceNets=function(sdf,min,max,h){
  const nx=Math.ceil((max[0]-min[0])/h)+2, ny=Math.ceil((max[1]-min[1])/h)+2, nz=Math.ceil((max[2]-min[2])/h)+2;
  const val=new Float32Array(nx*ny*nz); let p=0;
  for(let k=0;k<nz;k++){ const z=min[2]+k*h; for(let j=0;j<ny;j++){ const y=min[1]+j*h; for(let i=0;i<nx;i++) val[p++]=sdf(min[0]+i*h,y,z); } }
  const cx=nx-1, cy=ny-1, cz=nz-1; const cell=new Int32Array(cx*cy*cz).fill(-1); const pos=[]; const corner=new Float32Array(8);
  const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  for(let k=0;k<cz;k++) for(let j=0;j<cy;j++) for(let i=0;i<cx;i++){
    let mask=0;
    for(let c=0;c<8;c++){ const v=val[(i+(c&1))+nx*((j+((c>>1)&1))+ny*(k+(c>>2)))]; corner[c]=v; if(v<0) mask|=1<<c; }
    if(mask===0||mask===255) continue;
    let sx=0,sy=0,sz=0,n=0;
    for(let e=0;e<12;e++){ const a=E[e][0], b=E[e][1]; if(((mask>>a)&1)!==((mask>>b)&1)){ const t=corner[a]/(corner[a]-corner[b]); const ax=a&1,ay=(a>>1)&1,az=a>>2,bx=b&1,by=(b>>1)&1,bz=b>>2; sx+=ax+(bx-ax)*t; sy+=ay+(by-ay)*t; sz+=az+(bz-az)*t; n++; } }
    pos.push(min[0]+(i+sx/n)*h,min[1]+(j+sy/n)*h,min[2]+(k+sz/n)*h); cell[i+cx*(j+cy*k)]=pos.length/3-1;
  }
  const idx=[]; const C=(i,j,k)=>cell[i+cx*(j+cy*k)];
  const quad=(a,b,c,d)=>{ if(a<0||b<0||c<0||d<0) return; idx.push(a,b,c,a,c,d); };
  for(let k=0;k<nz;k++) for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const v0=val[i+nx*(j+ny*k)]<0;
    if(i<nx-1&&j>=1&&k>=1&&j<=cy&&k<=cz&&i<cx){ if(v0!==(val[(i+1)+nx*(j+ny*k)]<0)) quad(C(i,j-1,k-1),C(i,j,k-1),C(i,j,k),C(i,j-1,k)); }
    if(j<ny-1&&i>=1&&k>=1&&i<=cx&&k<=cz&&j<cy){ if(v0!==(val[i+nx*((j+1)+ny*k)]<0)) quad(C(i-1,j,k-1),C(i,j,k-1),C(i,j,k),C(i-1,j,k)); }
    if(k<nz-1&&i>=1&&j>=1&&i<=cx&&j<=cy&&k<cz){ if(v0!==(val[i+nx*(j+ny*(k+1))]<0)) quad(C(i-1,j-1,k),C(i,j-1,k),C(i,j,k),C(i-1,j,k)); }
  }
  return {pos:new Float32Array(pos),idx:new Uint32Array(idx)};
};

/* Turn an SDF into a finished, open garment shell.
 * spec: {sdf,min,max,h, clamp(p)->bool (moves p onto the cut curve, true if moved), remove(cx,cy,cz,fx,fy,fz), displace(x,y,z,nx,ny,nz), edgeRadius(mx,my,mz,len)} */
A.buildShell=function(spec){
  const {sdf}=spec; const mesh=A.surfaceNets(sdf,spec.min,spec.max,spec.h); const pos=mesh.pos, idx=mesh.idx;
  const nv=pos.length/3, e=spec.h*.6; const vn=new Float32Array(nv*3);
  for(let v=0;v<nv;v++){ const x=pos[3*v],y=pos[3*v+1],z=pos[3*v+2]; const dx=sdf(x+e,y,z)-sdf(x-e,y,z), dy=sdf(x,y+e,z)-sdf(x,y-e,z), dz=sdf(x,y,z+e)-sdf(x,y,z-e); const l=Math.hypot(dx,dy,dz)||1; vn[3*v]=dx/l; vn[3*v+1]=dy/l; vn[3*v+2]=dz/l; }
  // orient outward using the original positions, then clamp vertices onto the cut curves
  const nt=idx.length/3; const flip=new Uint8Array(nt), fn=new Float32Array(nt*3), cen=new Float32Array(nt*3);
  for(let t=0;t<nt;t++){ const a=idx[3*t],b=idx[3*t+1],c=idx[3*t+2];
    const ax=pos[3*a],ay=pos[3*a+1],az=pos[3*a+2], bx=pos[3*b],by=pos[3*b+1],bz=pos[3*b+2], cx=pos[3*c],cy=pos[3*c+1],cz=pos[3*c+2];
    let fx=(by-ay)*(cz-az)-(bz-az)*(cy-ay), fy=(bz-az)*(cx-ax)-(bx-ax)*(cz-az), fz=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
    if(fx*(vn[3*a]+vn[3*b]+vn[3*c])+fy*(vn[3*a+1]+vn[3*b+1]+vn[3*c+1])+fz*(vn[3*a+2]+vn[3*b+2]+vn[3*c+2])<0){ flip[t]=1; fx=-fx; fy=-fy; fz=-fz; }
    const l=Math.hypot(fx,fy,fz)||1; fn[3*t]=fx/l; fn[3*t+1]=fy/l; fn[3*t+2]=fz/l; cen[3*t]=(ax+bx+cx)/3; cen[3*t+1]=(ay+by+cy)/3; cen[3*t+2]=(az+bz+cz)/3; }
  const moved=new Uint8Array(nv); const tmp=[0,0,0];
  if(spec.clamp) for(let v=0;v<nv;v++){ tmp[0]=pos[3*v]; tmp[1]=pos[3*v+1]; tmp[2]=pos[3*v+2]; if(spec.clamp(tmp)){ moved[v]=1; pos[3*v]=tmp[0]; pos[3*v+1]=tmp[1]; pos[3*v+2]=tmp[2]; } }
  // clip the mesh against the cut function (positive = removed), splitting triangles exactly on the curve
  const PA=Array.from(pos), NA=Array.from(vn); const fv=[]; const keep=[];
  if(spec.cut){ for(let v=0;v<nv;v++) fv[v]=spec.cut(pos[3*v],pos[3*v+1],pos[3*v+2]); }
  const ek=new Map(); const mid=(u,v)=>{ const key=u<v?u*4194304+v:v*4194304+u; let i=ek.get(key); if(i!==undefined) return i; const t=fv[u]/(fv[u]-fv[v]); i=PA.length/3; PA.push(PA[3*u]+(PA[3*v]-PA[3*u])*t,PA[3*u+1]+(PA[3*v+1]-PA[3*u+1])*t,PA[3*u+2]+(PA[3*v+2]-PA[3*u+2])*t); NA.push(NA[3*u]+(NA[3*v]-NA[3*u])*t,NA[3*u+1]+(NA[3*v+1]-NA[3*u+1])*t,NA[3*u+2]+(NA[3*v+2]-NA[3*u+2])*t); fv[i]=0; ek.set(key,i); return i; };
  for(let t=0;t<nt;t++){ let a=idx[3*t],b=idx[3*t+1],c=idx[3*t+2]; if(moved[a]&&moved[b]&&moved[c]) continue;
    if(spec.remove&&spec.remove(cen[3*t],cen[3*t+1],cen[3*t+2],fn[3*t],fn[3*t+1],fn[3*t+2])) continue;
    if(flip[t]){ const s=b; b=c; c=s; }
    if(!spec.cut){ keep.push(a,b,c); continue; }
    const V=[a,b,c]; const K=V.map(v=>fv[v]<0); const n=K[0]+K[1]+K[2]; if(n===0) continue; if(n===3){ keep.push(a,b,c); continue; }
    const poly=[]; for(let i=0;i<3;i++){ const u=V[i],w=V[(i+1)%3]; if(K[i]) poly.push(u); if(K[i]!==K[(i+1)%3]) poly.push(mid(u,w)); }
    for(let i=1;i<poly.length-1;i++) keep.push(poly[0],poly[i],poly[i+1]); }
  // compact
  const map=new Int32Array(PA.length/3).fill(-1); const P=[],N=[]; const I=new Uint32Array(keep.length);
  for(let i=0;i<keep.length;i++){ const v=keep[i]; if(map[v]<0){ map[v]=P.length/3; P.push(PA[3*v],PA[3*v+1],PA[3*v+2]); const l=Math.hypot(NA[3*v],NA[3*v+1],NA[3*v+2])||1; N.push(NA[3*v]/l,NA[3*v+1]/l,NA[3*v+2]/l); } I[i]=map[v]; }
  const n2=P.length/3; const pos2=new Float32Array(P), vn2=new Float32Array(N);
  // adjacency + boundary
  const nb=Array.from({length:n2},()=>new Set()); const ecount=new Map(); const ekey=(a,b)=>a<b?a*4194304+b:b*4194304+a; const edir=new Map();
  for(let t=0;t<I.length;t+=3) for(let k=0;k<3;k++){ const a=I[t+k],b=I[t+(k+1)%3]; nb[a].add(b); nb[b].add(a); const key=ekey(a,b); ecount.set(key,(ecount.get(key)||0)+1); edir.set(key,[a,b]); }
  const bnd=new Uint8Array(n2); const bnext=new Map(); ecount.forEach((c,key)=>{ if(c===1){ const [a,b]=edir.get(key); bnd[a]=bnd[b]=1; if(!bnext.has(a)) bnext.set(a,[]); bnext.get(a).push(b); } });
  const nbl=nb.map(s=>[...s]);
  const lap=(lam,only)=>{ const out=new Float32Array(pos2); for(let v=0;v<n2;v++){ if(bnd[v]) continue; const L=nbl[v]; if(!L.length) continue; let sx=0,sy=0,sz=0; for(const w of L){ sx+=pos2[3*w]; sy+=pos2[3*w+1]; sz+=pos2[3*w+2]; } sx/=L.length; sy/=L.length; sz/=L.length; out[3*v]+=lam*(sx-pos2[3*v]); out[3*v+1]+=lam*(sy-pos2[3*v+1]); out[3*v+2]+=lam*(sz-pos2[3*v+2]); } pos2.set(out); };
  const sm=spec.smooth??3; for(let i=0;i<sm;i++){ lap(.5); lap(-.53); }
  // boundary loops (also used for hem / binding tubes); smooth them along themselves
  const used=new Set(); const loops=[];
  bnext.forEach((_,start)=>{ if(used.has(start)) return; const loop=[]; let cur=start, guard=0; while(cur!==undefined&&!used.has(cur)&&guard++<40000){ used.add(cur); loop.push(cur); const n=bnext.get(cur); cur=n?n.find(v=>!used.has(v)):undefined; } if(loop.length>8) loops.push(loop); });
  const ls=spec.loopSmooth??36;
  loops.forEach(loop=>{ const L=loop.length; for(let it=0;it<ls;it++){ const buf=new Float32Array(L*3); for(let i=0;i<L;i++){ const a=loop[(i-1+L)%L],b=loop[i],c=loop[(i+1)%L]; for(let k=0;k<3;k++) buf[3*i+k]=pos2[3*b+k]*.5+.25*(pos2[3*a+k]+pos2[3*c+k]); } for(let i=0;i<L;i++) for(let k=0;k<3;k++) pos2[3*loop[i]+k]=buf[3*i+k]; } });
  // ambient occlusion from the field (concave areas: armpit, crotch, folds)
  const col=new Float32Array(n2*3);
  for(let v=0;v<n2;v++){ const x=pos2[3*v],y=pos2[3*v+1],z=pos2[3*v+2],nx=vn2[3*v],ny=vn2[3*v+1],nz=vn2[3*v+2]; let occ=0; [[1.2,.45],[3,.35],[6.5,.3]].forEach(([d,w])=>{ const s=sdf(x+nx*d,y+ny*d,z+nz*d); occ+=clamp((d-s)/d,0,1)*w; }); const ao=clamp(1-occ*.85,.3,1); col[3*v]=col[3*v+1]=col[3*v+2]=ao; }
  // drape wrinkles along the normal
  if(spec.displace){ for(let v=0;v<n2;v++){ const d=spec.displace(pos2[3*v],pos2[3*v+1],pos2[3*v+2],vn2[3*v],vn2[3*v+1],vn2[3*v+2]); pos2[3*v]+=vn2[3*v]*d; pos2[3*v+1]+=vn2[3*v+1]*d; pos2[3*v+2]+=vn2[3*v+2]*d; } }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos2,3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setIndex(new THREE.BufferAttribute(I,1)); geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
  const normals=geo.attributes.normal.array;
  const tubes=A.boundaryTubes(pos2,normals,loops,spec.edgeRadius||(()=>.2));
  return {geometry:geo,tubes,pos:pos2,normals,idx:I,loops};
};

A.boundaryTubes=function(pos,nrm,loops,radiusAt){
  const P=[],I=[],seg=8;
  loops.forEach(loop=>{
    let mx=0,my=0,mz=0; loop.forEach(v=>{ mx+=pos[3*v]; my+=pos[3*v+1]; mz+=pos[3*v+2]; }); const L=loop.length; mx/=L; my/=L; mz/=L;
    let r=radiusAt(mx,my,mz,L); if(!r) return; if(typeof r==='number') r=[r,r]; const base=P.length/3;
    for(let i=0;i<L;i++){
      const v=loop[i], pv=loop[(i-1+L)%L], nv=loop[(i+1)%L];
      const tx=pos[3*nv]-pos[3*pv], ty=pos[3*nv+1]-pos[3*pv+1], tz=pos[3*nv+2]-pos[3*pv+2]; const tl=Math.hypot(tx,ty,tz)||1;
      let nx=nrm[3*v],ny=nrm[3*v+1],nz=nrm[3*v+2];
      let bx=ty/tl*nz-tz/tl*ny, by=tz/tl*nx-tx/tl*nz, bz=tx/tl*ny-ty/tl*nx; const bl=Math.hypot(bx,by,bz)||1; bx/=bl; by/=bl; bz/=bl;
      for(let s=0;s<seg;s++){ const a=s/seg*Math.PI*2, c=Math.cos(a)*r[1], sn=Math.sin(a)*r[0]; P.push(pos[3*v]+c*nx+sn*bx,pos[3*v+1]+c*ny+sn*by,pos[3*v+2]+c*nz+sn*bz); }
    }
    for(let i=0;i<L;i++) for(let s=0;s<seg;s++){ const a=base+i*seg+s, b=base+i*seg+(s+1)%seg, c=base+((i+1)%L)*seg+s, d=base+((i+1)%L)*seg+(s+1)%seg; I.push(a,c,b,b,c,d); }
  });
  if(!P.length) return null;
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(P.length).fill(.8),3)); geo.setIndex(I); geo.computeVertexNormals(); return geo;
};

/* ray probe against the finished mesh (used to lay seams, cords and tapes exactly on the cloth) */
A.probe=function(geo){
  const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})); const rc=new THREE.Raycaster(); const nrm=geo.attributes.normal, pos=geo.attributes.position; const tri=new THREE.Triangle(), bc=new THREE.Vector3();
  const va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3();
  return (o,d,far)=>{ rc.set(new THREE.Vector3(...o),new THREE.Vector3(...d).normalize()); rc.far=far||400; const h=rc.intersectObject(mesh,false); if(!h.length) return null; const f=h[0].face; va.fromBufferAttribute(pos,f.a); vb.fromBufferAttribute(pos,f.b); vc.fromBufferAttribute(pos,f.c); THREE.Triangle.getBarycoord(h[0].point,va,vb,vc,bc);
    const n=new THREE.Vector3(); n.x=nrm.getX(f.a)*bc.x+nrm.getX(f.b)*bc.y+nrm.getX(f.c)*bc.z; n.y=nrm.getY(f.a)*bc.x+nrm.getY(f.b)*bc.y+nrm.getY(f.c)*bc.z; n.z=nrm.getZ(f.a)*bc.x+nrm.getZ(f.b)*bc.y+nrm.getZ(f.c)*bc.z; n.normalize(); return {p:h[0].point.clone(),n}; };
};
/* ribbon lying on the cloth: samples = [{o:[x,y,z],d:[x,y,z]}...] rays; width, lift in cm */
A.ribbon=function(probe,samples,width,lift,maxGap){
  const hits=samples.map(s=>probe(s.o,s.d)).filter(Boolean); if(hits.length<2) return null; const P=[],I=[],UV=[]; const up=new THREE.Vector3();
  hits.forEach((h,i)=>{ const a=hits[Math.max(0,i-1)].p, b=hits[Math.min(hits.length-1,i+1)].p; const t=b.clone().sub(a).normalize(); const bin=t.clone().cross(h.n).normalize();
    for(const sg of [-1,1]){ const q=h.p.clone().addScaledVector(bin,sg*width/2).addScaledVector(h.n,lift); P.push(q.x,q.y,q.z); UV.push(sg<0?0:1,i/(hits.length-1)); } });
  for(let i=0;i<hits.length-1;i++){ if(hits[i].p.distanceTo(hits[i+1].p)>(maxGap||3)) continue; const a=2*i,b=2*i+1,c=2*i+2,d=2*i+3; I.push(a,c,b,b,c,d); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); geo.setIndex(I); geo.computeVertexNormals(); return geo;
};
A.tubePath=function(pts,r,seg){ // round cord through 3D points
  seg=seg||8; const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))); return new THREE.TubeGeometry(curve,Math.max(20,pts.length*6),r,seg,false); };

/* Decal: copy the shell triangles under a projected rectangle, lift them and give them UVs.
 * o: {c:[x,y,z], n:[x,y,z] outward direction at the centre, up, w,h (cm), lift, inside, minDot, uf(p)->cm (arc length), margin} */
A.makeDecal=function(shell,o){
  const {pos,normals,idx}=shell; const n=o.n, up=o.up||[0,1,0];
  let r=[up[1]*n[2]-up[2]*n[1], up[2]*n[0]-up[0]*n[2], up[0]*n[1]-up[1]*n[0]]; const rl=Math.hypot(...r); r=r.map(v=>v/rl);
  const u=[n[1]*r[2]-n[2]*r[1], n[2]*r[0]-n[0]*r[2], n[0]*r[1]-n[1]*r[0]];
  if(o.inside) r=r.map(v=>-v);
  const m=o.margin??.15; const lift=(o.lift??.05)*(o.inside?-1:1); const minDot=o.minDot??.45;
  const uc=o.uf?o.uf(o.c[0],o.c[1],o.c[2]):0;
  const S=v=>{ const x=pos[3*v],y=pos[3*v+1],z=pos[3*v+2]; return (o.uf?(o.uf(x,y,z)-uc)*(o.inside?-1:1):((x-o.c[0])*r[0]+(y-o.c[1])*r[1]+(z-o.c[2])*r[2]))/o.w+.5; };
  const T=v=>((pos[3*v]-o.c[0])*u[0]+(pos[3*v+1]-o.c[1])*u[1]+(pos[3*v+2]-o.c[2])*u[2])/o.h+.5;
  const vm=new Map(); const P=[],UV=[],NN=[],I=[];
  const get=v=>{ let i=vm.get(v); if(i===undefined){ i=P.length/3; vm.set(v,i); P.push(pos[3*v]+normals[3*v]*lift,pos[3*v+1]+normals[3*v+1]*lift,pos[3*v+2]+normals[3*v+2]*lift); UV.push(S(v),T(v)); const s=o.inside?-1:1; NN.push(normals[3*v]*s,normals[3*v+1]*s,normals[3*v+2]*s); } return i; };
  for(let t=0;t<idx.length;t+=3){
    const a=idx[t],b=idx[t+1],c=idx[t+2];
    const nd=((normals[3*a]+normals[3*b]+normals[3*c])*n[0]+(normals[3*a+1]+normals[3*b+1]+normals[3*c+1])*n[1]+(normals[3*a+2]+normals[3*b+2]+normals[3*c+2])*n[2])/3;
    if(nd<minDot) continue;
    if(o.keep){ const cx=(pos[3*a]+pos[3*b]+pos[3*c])/3, cy=(pos[3*a+1]+pos[3*b+1]+pos[3*c+1])/3, cz=(pos[3*a+2]+pos[3*b+2]+pos[3*c+2])/3; if(!o.keep(cx,cy,cz)) continue; }
    const sa=S(a),sb=S(b),sc=S(c),ta=T(a),tb=T(b),tc=T(c);
    if(Math.max(sa,sb,sc)<-m||Math.min(sa,sb,sc)>1+m||Math.max(ta,tb,tc)<-m||Math.min(ta,tb,tc)>1+m) continue;
    if(o.inside) I.push(get(a),get(c),get(b)); else I.push(get(a),get(b),get(c));
  }
  if(!I.length) return null;
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(NN,3)); geo.setIndex(I);
  return geo;
};
/* arc length of the ellipse x=a sin f, z=b cos f from f=0 to f */
A.arc=function(a,b,f){ const n=24; let s=0; const sgn=f<0?-1:1; f=Math.abs(f); const hh=f/n; for(let i=0;i<=n;i++){ const t=i*hh; const g=Math.hypot(a*Math.cos(t),b*Math.sin(t)); s+=g*(i===0||i===n?1:i%2?4:2); } return sgn*s*hh/3; };
})(window);
