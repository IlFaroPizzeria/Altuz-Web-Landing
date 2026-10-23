/* ALTUZ mockup · materials. Knit structure is procedural (object space, cm) so it never stretches. */
(function(g){
const A=g.ALTUZ;
A.srgb=h=>new THREE.Color(h).convertSRGBToLinear();
const dummy=(()=>{ const c=document.createElement('canvas'); c.width=c.height=2; const x=c.getContext('2d'); x.fillStyle='#888'; x.fillRect(0,0,2,2); return new THREE.CanvasTexture(c); })();

const KNIT=`
varying vec3 vOP; varying vec3 vNO;
uniform vec2 uPitch; uniform float uAmp; uniform float uBandY; uniform float uBandOn;
float knitPlane(vec2 q, vec2 pitch, float fp){
  vec2 c=q/pitch; float h=.5+.5*sin(6.2831853*c.x); h*=.7+.3*sin(6.2831853*(c.y+.5*h));
  float fade=1.-smoothstep(pitch.x*.3,pitch.x*.85,fp); return (h-.5)*fade;
}
float knitH(vec3 p, vec3 n){
  vec3 w=pow(abs(n),vec3(5.)); w/=(w.x+w.y+w.z+1e-5);
  float fp=length(fwidth(p));
  float h=w.x*knitPlane(p.zy,uPitch,fp)+w.y*knitPlane(p.xz,uPitch.yx,fp)+w.z*knitPlane(p.xy,uPitch,fp);
  /* very low frequency cloth grain so large areas never look CG-flat */
  float grain=(sin(p.x*3.1+p.y*1.7)*sin(p.z*2.3-p.y*2.9)+.5*sin(p.x*7.3-p.z*6.1+p.y*4.0))*(1.-smoothstep(.15,.6,fp));
  return h*uAmp+grain*uAmp*1.6;
}`;

A.fabric=function(o){
  const m=new THREE.MeshPhysicalMaterial({color:A.srgb(o.color),roughness:o.rough??.88,metalness:0,vertexColors:true,side:THREE.DoubleSide,
    sheen:A.srgb(o.sheen??0x55555c),bumpMap:dummy,bumpScale:1,envMapIntensity:o.env??1.4});
  const u={uPitch:{value:new THREE.Vector2(o.px??.085,o.py??.11)},uAmp:{value:o.amp??.004},uBandY:{value:o.bandY??-1e9},uBandOn:{value:o.band?1:0}};
  m.userData.u=u;
  m.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,u);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP; varying vec3 vNO;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position; vNO=normal;');
    let fs=sh.fragmentShader.replace('#include <common>','#include <common>\n'+KNIT);
    fs=fs.replace('#include <bumpmap_pars_fragment>',THREE.ShaderChunk.bumpmap_pars_fragment.replace(/vec2 dHdxy_fwd\(\) \{[\s\S]*?return vec2\( dBx, dBy \);\s*\}/,
      'vec2 dHdxy_fwd(){ float Hll=knitH(vOP,vNO); return vec2(dFdx(Hll),dFdy(Hll)); }'));
    fs=fs.replace('#include <color_fragment>',`#include <color_fragment>
      if(!gl_FrontFacing) diffuseColor.rgb*=.5;
      if(uBandOn>.5 && vOP.y>uBandY){ float ang=atan(vOP.z,vOP.x)*14.; vec2 gq=vec2(ang,vOP.y)/.32; vec2 gf=abs(fract(gq+vec2(.5*floor(gq.y),0.))-.5);
        float hole=1.-smoothstep(.16,.26,length(gf)); diffuseColor.rgb*=mix(1.,.28,hole); diffuseColor.rgb*=1.12; }`);
    sh.fragmentShader=fs;
  };
  m.customProgramCacheKey=()=>'altuz-fabric'+(o.band?'-b':'');
  return m;
};
A.tape=()=>new THREE.MeshPhysicalMaterial({color:A.srgb(0x060607),roughness:.62,metalness:0,clearcoat:0,side:THREE.DoubleSide,envMapIntensity:.4});
A.silver=(tex)=>{ const m=new THREE.MeshStandardMaterial({color:A.srgb(0xd2d5da),metalness:.9,roughness:.30,map:null,alphaMap:tex,transparent:true,depthWrite:false,alphaTest:.01,side:THREE.DoubleSide,
    emissive:A.srgb(0xffffff),emissiveIntensity:0,envMapIntensity:1.5});
  m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance*=pow(clamp(dot(normal,normalize(vViewPosition)),0.,1.),1.5);'); }; m.customProgramCacheKey=()=>'altuz-retro'; return m; };
A.print=(tex,col,rough)=>new THREE.MeshStandardMaterial({color:A.srgb(col),metalness:0,roughness:rough??.82,alphaMap:tex,transparent:true,depthWrite:false,alphaTest:.01,side:THREE.DoubleSide});
A.label=(map,o)=>new THREE.MeshStandardMaterial({map,metalness:o?.metal??.55,roughness:o?.rough??.45,side:THREE.DoubleSide,transparent:true,alphaTest:.5,envMapIntensity:1.2});
})(window);
