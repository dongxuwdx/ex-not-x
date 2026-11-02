import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FOREST} from './embedded.js';

// A low, close-to-the-water river. The forest photograph is the backdrop; the water
// surface, its checkerboard bed and the glass ducks are rendered live.
export const DUCK_COLORS={green:'#43c486',red:'#ef5a68',blue:'#4f93f0',free:'#ffd447',letter:'#ffd447'};
const SPAN=72,Z_FAR=-64; // ducks travel from Z_FAR towards the camera and leave behind it
const HORIZON_IN_PHOTO=.585; // vanishing point of the river, as a fraction from the photo's top

export function waveHeight(x,z,t){
 return .07*Math.sin((x*.35+z*.9)*1.25+t*1.35)
  +.05*Math.sin((-x*.8+z*.45)*1.8+t*1.05)
  +.022*Math.sin((x*.1+z)*3.1+t*2.2+x*.4)
  +.012*Math.sin(x*4.2-t*1.6+z*2.);
}
const WAVE_GLSL=`float waveH(vec2 p,float t){return .07*sin((p.x*.35+p.y*.9)*1.25+t*1.35)+.05*sin((-p.x*.8+p.y*.45)*1.8+t*1.05)+.022*sin((p.x*.1+p.y)*3.1+t*2.2+p.x*.4)+.012*sin(p.x*4.2-t*1.6+p.y*2.);}`;

function duckGeometry(){
 const g={};
 g.body=new T.SphereGeometry(1,40,28);
 g.head=new T.SphereGeometry(.42,32,24);
 g.beak=new T.SphereGeometry(1,24,16);
 g.eye=new T.SphereGeometry(.055,12,10);
 g.tail=new T.ConeGeometry(.28,.55,20);
 g.wing=new T.SphereGeometry(1,24,16);
 return g;
}
function buildDuck(geo,mats,bodyMat){
 const duck=new T.Group();const add=(geom,mat,pos,scale,rot)=>{const m=new T.Mesh(geom,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);duck.add(m);return m;};
 add(geo.body,bodyMat,[0,.42,0],[1,.62,.78]);
 add(geo.tail,bodyMat,[-.86,.66,0],null,[0,0,.95]);
 add(geo.head,bodyMat,[.5,1.08,0]);
 add(geo.wing,bodyMat,[-.05,.55,.62],[.55,.26,.14],[0,.2,-.25]);
 add(geo.wing,bodyMat,[-.05,.55,-.62],[.55,.26,.14],[0,-.2,-.25]);
 add(geo.beak,mats.beak,[.93,1.02,0],[.26,.075,.19]);
 add(geo.beak,mats.beak,[.9,.96,0],[.2,.05,.15]);
 add(geo.eye,mats.eye,[.78,1.2,.2]);add(geo.eye,mats.eye,[.78,1.2,-.2]);
 // a soft contact ring where the duck meets the water
 const ring=new T.Mesh(new T.RingGeometry(.95,1.35,40),mats.ring);ring.rotation.x=-Math.PI/2;ring.position.y=.03;duck.add(ring);
 duck.traverse(o=>{o.castShadow=false;});
 return duck;
}

export function createRiver(host,{onDuck,onShore,onDragState}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 renderer.domElement.className='river-canvas';host.appendChild(renderer.domElement);
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,.05,200);
 const camBase=new T.Vector3(0,1.05,7.2),lookAt=new T.Vector3(0,.55,-18);
 camera.position.copy(camBase);camera.lookAt(lookAt);
 const pm=new T.PMREMGenerator(renderer);const env=pm.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;pm.dispose();
 scene.add(new T.HemisphereLight('#c7b8ff','#f0a3cf',1.25));
 const key=new T.DirectionalLight('#fff0f6',1.8);key.position.set(-3,6,-10);scene.add(key);
 const fill=new T.DirectionalLight('#9fc0ff',.8);fill.position.set(4,3,8);scene.add(fill);

 const bg=new T.TextureLoader().load(FOREST,()=>{layoutBackground();});bg.colorSpace=T.SRGBColorSpace;bg.wrapS=bg.wrapT=T.ClampToEdgeWrapping;bg.matrixAutoUpdate=false;
 scene.background=bg;

 const waterMat=new T.ShaderMaterial({
  uniforms:{uTime:{value:0},uBg:{value:bg},uBgMatrix:{value:new T.Matrix3()},uRes:{value:new T.Vector2(1,1)},uCam:{value:camera.position}},
  vertexShader:`uniform float uTime;varying vec3 vW;varying vec3 vN;${WAVE_GLSL}
  void main(){vec4 w=modelMatrix*vec4(position,1.);float e=.06;float h=waveH(w.xz,uTime);
   float hx=waveH(w.xz+vec2(e,0.),uTime)-waveH(w.xz-vec2(e,0.),uTime);float hz=waveH(w.xz+vec2(0.,e),uTime)-waveH(w.xz-vec2(0.,e),uTime);
   vN=normalize(vec3(-hx/(2.*e),1.,-hz/(2.*e)));w.y+=h;vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform float uTime;uniform sampler2D uBg;uniform mat3 uBgMatrix;uniform vec2 uRes;uniform vec3 uCam;varying vec3 vW;varying vec3 vN;
  vec3 lin(vec3 c){return pow(c,vec3(2.2));}
  float rip(vec2 p,float t){return sin(p.x*7.1+t*2.3+sin(p.y*3.)*1.5)*sin(p.y*6.3-t*2.9)*.5+sin((p.x-p.y)*11.+t*3.7)*.25;}
  void main(){
   vec3 V=normalize(uCam-vW);float dist=length(uCam-vW);
   float e=.04;vec2 p=vW.xz;float fine=1.-smoothstep(6.,26.,dist);
   vec3 n=normalize(vN+vec3(-(rip(p+vec2(e,0.),uTime)-rip(p-vec2(e,0.),uTime))/(2.*e),0.,-(rip(p+vec2(0.,e),uTime)-rip(p-vec2(0.,e),uTime))/(2.*e))*.022*fine);
   // refraction onto the checkerboard bed
   vec3 r=refract(-V,n,1./1.33);float depth=.3;vec2 fp=p+r.xz*(depth/max(.35,-r.y));
   vec2 q=fp/1.05;float k=sin(q.x*3.14159)*sin(q.y*3.14159);float aa=fwidth(k)*1.2+.02;float chk=smoothstep(-aa,aa,k);
   chk=mix(chk,.5,smoothstep(16.,40.,dist));
   vec3 tileA=lin(vec3(.88,.42,.68)),tileB=lin(vec3(.97,.78,.90));vec3 bed=mix(tileA,tileB,chk);
   float ca=sin(fp.x*2.6+uTime*.9)+sin(fp.y*2.2-uTime*1.2)+sin((fp.x+fp.y)*1.9+uTime*.6);ca=pow(abs(ca)/3.,3.);
   bed+=vec3(1.,.92,.98)*ca*.35*fine;
   bed*=mix(vec3(1.),lin(vec3(.80,.74,.98)),clamp(dist/40.,0.,1.)*.6);
   // glassy reflection of the dusk sky and the dark forest walls
   vec3 R=reflect(-V,n);
   vec3 sky=mix(lin(vec3(.30,.36,.66)),lin(vec3(.62,.66,.95)),smoothstep(.02,.4,R.y));
   vec3 forest=lin(vec3(.10,.16,.13));
   vec3 refl=mix(forest,sky,smoothstep(.1,.55,1.-abs(R.x)*1.8+R.y));
   float fres=.03+.97*pow(1.-max(dot(n,V),0.),5.);
   bed=mix(bed,lin(vec3(.62,.55,.9)),.14);vec3 col=mix(bed,refl,clamp(fres*.85,0.,.82));
   col*=.9+.18*smoothstep(.96,1.,vN.y);
   vec3 L=normalize(vec3(-.15,.32,-1.));float spec=pow(max(dot(R,L),0.),220.)*2.+pow(max(dot(R,L),0.),30.)*.14;
   col+=lin(vec3(1.,.93,.97))*spec;
   // a faint prismatic edge, like light caught in glass
   col+=vec3(.05,.0,.08)*pow(1.-abs(n.x),40.)*fine+vec3(.0,.03,.05)*smoothstep(.985,1.,n.y)*fine;
   // melt into the photographed river near the horizon
   vec2 suv=gl_FragCoord.xy/uRes;vec3 bguv=uBgMatrix*vec3(suv,1.);vec3 bgc=texture2D(uBg,bguv.xy).rgb;
   col=mix(col,bgc,smoothstep(14.,46.,dist));
   gl_FragColor=vec4(col,1.);
   #include <colorspace_fragment>
  }`
 });
 const water=new T.Mesh(new T.PlaneGeometry(90,SPAN+40,220,320),waterMat);water.rotation.x=-Math.PI/2;water.position.set(0,0,Z_FAR/2-6);scene.add(water);

 // A drop of glass for each duck colour; the bills stay warm orange glass.
 const glass=(color,extra={})=>new T.MeshPhysicalMaterial({color,roughness:.06,metalness:0,transmission:.62,thickness:1.1,ior:1.42,clearcoat:1,clearcoatRoughness:.04,iridescence:.35,iridescenceIOR:1.3,envMapIntensity:1.3,attenuationColor:new T.Color(color),attenuationDistance:1.6,specularIntensity:1,...extra});
 const mats={beak:glass('#ff9a3c',{transmission:.35}),eye:new T.MeshPhysicalMaterial({color:'#101018',roughness:.15,clearcoat:1}),ring:new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.18,depthWrite:false})};
 const bodyMats={};for(const [k,c] of Object.entries(DUCK_COLORS))bodyMats[k]=glass(c);
 const geo=duckGeometry();
 const ducks=[];const duckRoot=new T.Group();scene.add(duckRoot);

 let flow=0,offset=0,targetOffset=0,clock=0,active=false,paused=reduced,last=performance.now();
 function heat(post){return Math.min(1,((post.likes||0)+(post.replies?.length||0)*6)/90);}
 function setPosts(posts){
  // ducks that are still in the feed keep floating where they are
  const keep=new Map(ducks.map(d=>[d.post.id,d]));const sameFeed=posts.some(p=>keep.has(p.id));
  ducks.forEach(d=>{if(!sameFeed||!posts.some(p=>p.id===d.post.id))duckRoot.remove(d.obj);});ducks.length=0;
  const n=Math.max(posts.length,1);
  posts.forEach((post,i)=>{
   if(sameFeed&&keep.has(post.id)){ducks.push(keep.get(post.id));return;}
   const r=(s)=>{const v=Math.sin((post.id+1)*s)*43758.5453;return v-Math.floor(v);};
   const key=post.type==='prompt'?post.stance:post.type;
   const obj=buildDuck(geo,mats,bodyMats[key]||bodyMats.free);
   const size=.42+heat(post)*.5;obj.scale.setScalar(size);
   duckRoot.add(obj);
   ducks.push({post,obj,size,phase:(i/n)*SPAN+(r(3.1)-.5)*SPAN/n*.6,lane:(r(7.7)-.5)*7.2,sway:.6+r(5.3)*1.2,swayRate:.12+r(2.9)*.2,spin:(r(9.2)-.5)*.7,yaw0:r(1.7)*Math.PI*2,bob:r(4.4)*6});
  });
 }
 function zFor(d){return Z_FAR+(((d.phase+flow+offset)%SPAN)+SPAN)%SPAN;}
 const ray=new T.Raycaster(),ndc=new T.Vector2(),tmp=new T.Vector3();
 let dragging=null;
 function place(d,t){
  if(d===dragging?.duck)return;
  const z=zFor(d);const x=d.lane+Math.sin(t*d.swayRate+d.bob)*d.sway+Math.sin(z*.08)*1.2;
  const y=waveHeight(x,z,t);
  const gx=(waveHeight(x+.2,z,t)-waveHeight(x-.2,z,t))/.4,gz=(waveHeight(x,z+.2,t)-waveHeight(x,z-.2,t))/.4;
  d.obj.position.set(x,y-.04*d.size,z);
  d.obj.rotation.set(gz*.9,d.yaw0+t*d.spin+Math.sin(t*.7+d.bob)*.25,-gx*.9,'YXZ');
  d.obj.visible=z<camera.position.z+2;
 }
 // The photographed horizon is pinned to the rendered horizon on every resize.
 function layoutBackground(){
  const W=innerWidth,H=innerHeight;
  const far=new T.Vector3(0,0,-1e4).project(camera);const vh=(far.y+1)/2;
  const img=bg.image;const a=img?img.width/img.height:1.777,A=W/H;
  const hs=Math.max(A/a,(1-vh)/(1-HORIZON_IN_PHOTO)*1.02,1);const ws=hs*a/A;
  const m=new T.Matrix3().setUvTransform(-(.5-ws/2)/ws,-(vh-(1-HORIZON_IN_PHOTO)*hs)/hs,1/ws,1/hs,0,0,0);
  bg.matrix.copy(m);waterMat.uniforms.uBgMatrix.value.copy(m);
  const s=renderer.getDrawingBufferSize(new T.Vector2());waterMat.uniforms.uRes.value.copy(s);
 }
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);layoutBackground();}
 addEventListener('resize',resize);resize();

 const labels=[];let labelHost=null,onFrame=null;
 function render(now){
  if(!active)return;requestAnimationFrame(render);
  const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
  if(!paused){clock+=dt;flow+=dt*.95;}
  offset+=(targetOffset-offset)*(reduced?1:.08);
  waterMat.uniforms.uTime.value=clock;
  camera.position.set(camBase.x+Math.sin(clock*.31)*.06,camBase.y+waveHeight(0,camBase.z-1.5,clock)*.35,camBase.z);
  camera.lookAt(lookAt.x,lookAt.y+Math.sin(clock*.45)*.03,lookAt.z);camera.rotateZ(Math.sin(clock*.5)*.006);
  for(const d of ducks)place(d,clock);
  renderer.render(scene,camera);
  onFrame?.(projectLabels());
 }
 function projectLabels(){
  const out=[];const W=innerWidth,H=innerHeight;
  for(const d of ducks){
   const z=d.obj.position.z;if(!d.obj.visible||z<-30||z>camera.position.z-2.2)continue;
   tmp.copy(d.obj.position);tmp.y+=1.55*d.size;tmp.project(camera);
   const x=(tmp.x+1)/2*W,y=(1-tmp.y)/2*H;if(tmp.z>1||x<-60||x>W+60||y<60||y>H)continue;
   out.push({post:d.post,x,y,z,near:(z+30)/(camera.position.z+28)});
  }
  return out.sort((a,b)=>b.z-a.z);
 }
 function pick(cx,cy){
  const rect=renderer.domElement.getBoundingClientRect();ndc.set((cx-rect.left)/rect.width*2-1,-(cy-rect.top)/rect.height*2+1);ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(ducks.filter(d=>d.obj.visible).map(d=>d.obj),true);
  if(!hits.length)return null;let o=hits[0].object;while(o.parent&&o.parent!==duckRoot)o=o.parent;return ducks.find(d=>d.obj===o)||null;
 }
 // Lift a duck out of the stream and carry it; dropping it on either bank keeps the post.
 const plane=new T.Plane(new T.Vector3(0,1,0),-.9);
 function startDrag(duck,cx,cy){dragging={duck,startX:cx,startY:cy};onDragState?.(true);moveDrag(cx,cy);}
 function moveDrag(cx,cy){
  if(!dragging)return;const rect=renderer.domElement.getBoundingClientRect();ndc.set((cx-rect.left)/rect.width*2-1,-(cy-rect.top)/rect.height*2+1);ray.setFromCamera(ndc,camera);
  const hit=ray.ray.intersectPlane(plane,tmp);if(hit){const z=Math.max(-26,Math.min(4,hit.z));dragging.duck.obj.position.set(hit.x,.55,z);dragging.duck.obj.rotation.set(.15,dragging.duck.obj.rotation.y+.02,Math.sin(clock*8)*.08);}
  return cx<innerWidth*.14||cx>innerWidth*.86;
 }
 function endDrag(cx){
  if(!dragging)return null;const d=dragging.duck;dragging=null;onDragState?.(false);
  if(cx<innerWidth*.14||cx>innerWidth*.86){onShore?.(d.post);return 'shore';}
  // back into the water where it was dropped
  const z=d.obj.position.z;d.lane=d.obj.position.x;d.phase=((z-Z_FAR-flow-offset)%SPAN+SPAN)%SPAN;return 'water';
 }
 return {
  canvas:renderer.domElement,
  setActive(v){if(v===active)return;active=v;renderer.domElement.style.display=v?'block':'none';if(v){last=performance.now();requestAnimationFrame(render);}},
  setPosts,
  step(n){targetOffset+=n*SPAN/Math.max(ducks.length,8);},
  bringNear(id){const d=ducks.find(d=>d.post.id===id);if(d)d.phase=((-7-Z_FAR-flow-offset)%SPAN+SPAN)%SPAN;},
  pick,startDrag,moveDrag,endDrag,isDragging:()=>!!dragging,
  onFrame(fn){onFrame=fn;},
  pause(v){paused=v;},
  dispose(){renderer.dispose();env.dispose();}
 };
}
