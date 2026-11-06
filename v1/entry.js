// Entry screen: the city reference image from 网页细调 11.1, a tear in its sky that leaks
// code and mosaic, and a real hand pointing at the glass prompt card.
(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas=document.querySelector('#rip'),ctx=canvas.getContext('2d');
const city=document.querySelector('#city-img');
let W=0,H=0,DPR=1,rip=null;
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};}
const lerp=(a,b,t)=>a+(b-a)*t;
// The photo keeps its full height on wide screens (soft-edged, over a blurred copy) and
// fills the screen on tall ones. Returns where it sits so the tear can live in its sky.
function layoutCity(){
 const iw=city.naturalWidth||736,ih=city.naturalHeight||983;
 const s=W/H>iw/ih?H/ih:Math.max(W/iw,H/ih),w=iw*s,h=ih*s;
 const rect={x:(W-w)/2,y:(H-h)/2,w,h};
 Object.assign(city.style,{left:rect.x+'px',top:rect.y+'px',width:w+'px',height:h+'px'});
 document.body.classList.toggle('city-framed',w<W-2);
 return rect;
}
function makeRip(){
 // a jagged lens-shaped tear across the open sky left of the TV tower
 const r=rng(77),img=layoutCity();
 const a={x:Math.max(8,img.x+img.w*.03),y:img.y+img.h*.1},b={x:Math.min(W-8,img.x+img.w*.6),y:img.y+img.h*.2};
 const len=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len,thick=Math.min(img.h*.09,len*.17);
 const top=[],bottom=[];const N=46;
 for(let i=0;i<=N;i++){const t=i/N,cx=lerp(a.x,b.x,t),cy=lerp(a.y,b.y,t),th=Math.pow(Math.sin(Math.PI*t),.75)*thick*(.8+.4*Math.sin(t*9));
  const j1=(r()-.5)*8+(r()<.15?-r()*14:0),j2=(r()-.5)*8+(r()<.15?r()*14:0);
  top.push([cx+nx*(-th*.45+j1),cy+ny*(-th*.45+j1)]);bottom.push([cx+nx*(th*.55+j2),cy+ny*(th*.55+j2)]);}
 const path=new Path2D();path.moveTo(...top[0]);top.forEach(p=>path.lineTo(...p));[...bottom].reverse().forEach(p=>path.lineTo(...p));path.closePath();
 // curled paper lip along the top edge
 const lip=new Path2D();lip.moveTo(...top[0]);top.forEach((p,i)=>lip.lineTo(p[0]-nx*(4+Math.sin(i)*2),p[1]-ny*(4+Math.sin(i)*2)));
 const box={x:Math.min(a.x,b.x)-thick,y:Math.min(a.y,b.y)-thick,w:Math.abs(b.x-a.x)+thick*2,h:Math.abs(b.y-a.y)+thick*2};
 const cols=Math.ceil(box.w/12);
 rip={path,lip,top,bottom,box,drops:Array.from({length:cols},()=>r()*box.h),frags:Array.from({length:22},()=>({t:r(),off:r()*60,s:3+r()*7,sp:.2+r()*.6,c:['#ff5fa8','#45e0ff','#c6ff5c','#ffe45c','#ffffff'][Math.floor(r()*5)]})),a,b,nx,ny};
}
const GLYPHS='01アイウエオカキクケコ<>/{}#=+*EXNOTX鸭漂';
let last=0,tick=0;
function frame(now){
 if(!reduced)requestAnimationFrame(frame);
 if(now-last<33&&!reduced&&last)return;last=now;tick++;
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
 const R=rip;if(!R)return;
 ctx.save();ctx.clip(R.path);
 ctx.fillStyle='#0c0a22';ctx.fillRect(R.box.x,R.box.y,R.box.w,R.box.h);
 // mosaic: square pixels flickering through the tear
 const px=9;const t=now*.001;
 for(let y=R.box.y;y<R.box.y+R.box.h;y+=px)for(let x=R.box.x;x<R.box.x+R.box.w;x+=px){
  const n=Math.sin(x*.091+y*.173+Math.floor(t*6+x*.01)*1.7)*43758.5453;const f=n-Math.floor(n);
  if(f>.8){const hue=(x*.4+y*.9+t*60)%360;ctx.fillStyle=`hsla(${hue},95%,${55+f*20}%,${(f-.8)*3.2})`;ctx.fillRect(x,y,px-1,px-1);}
 }
 // falling code columns
 ctx.font='600 11px ui-monospace,Menlo,monospace';ctx.textBaseline='top';
 R.drops.forEach((d,i)=>{const x=R.box.x+i*12;for(let k=0;k<6;k++){const y=R.box.y+((d-k*13)%R.box.h+R.box.h)%R.box.h;ctx.fillStyle=k===0?'#e9fff4':`rgba(${k%2?'90,255,190':'120,220,255'},${.85-k*.14})`;ctx.fillText(GLYPHS[(i*7+k*3+tick)%GLYPHS.length],x,y);}R.drops[i]=d+(reduced?0:2.2+(i%5)*.5);});
 // scanline sheen
 ctx.fillStyle='rgba(255,255,255,.04)';for(let y=R.box.y+(tick%4);y<R.box.y+R.box.h;y+=4)ctx.fillRect(R.box.x,y,R.box.w,1);
 ctx.restore();
 // torn edges: pale paper lips with a soft shadow
 ctx.save();ctx.shadowColor='rgba(30,10,60,.55)';ctx.shadowBlur=14;ctx.strokeStyle='rgba(250,240,255,.95)';ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.stroke(R.path);ctx.restore();
 ctx.save();ctx.strokeStyle='rgba(205,190,240,.85)';ctx.lineWidth=5;ctx.lineJoin='round';ctx.stroke(R.lip);ctx.restore();
 // pixel fragments leaking out of the tear
 R.frags.forEach(f=>{const p=(f.off+t*f.sp*20)%60/60,base=R.bottom[Math.floor(f.t*(R.bottom.length-1))];const x=base[0]+R.nx*p*70+Math.sin(t+f.off)*6,y=base[1]+R.ny*p*70;ctx.globalAlpha=(1-p)*.9;ctx.fillStyle=f.c;ctx.fillRect(x,y,f.s*(1-p*.5),f.s*(1-p*.5));});
 ctx.globalAlpha=1;
}
function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
 canvas.width=W*DPR;canvas.height=H*DPR;makeRip();placeHand();if(reduced)frame(performance.now());
}

// The hand sits behind the card with its fingertip aimed at the card's lower-right corner.
const hand=document.querySelector('#hand'),stage=document.querySelector('#stage');
function placeHand(){
 const rect=stage.getBoundingClientRect(),w=hand.getBoundingClientRect().width||Math.max(240,Math.min(440,innerWidth*.28));
 const h=w*1.5,tipX=.045*w,tipY=.144*h;
 const narrow=innerWidth<700;
 hand.style.left=(narrow?rect.left+rect.width*.62-tipX:rect.right-rect.width*.06-tipX+18)+'px';
 hand.style.top=(rect.bottom-tipY+20)+'px';
 hand.classList.add('ready');
}
hand.complete?placeHand():hand.addEventListener('load',placeHand);

addEventListener('resize',resize);city.complete?resize():city.addEventListener('load',resize);resize();if(!reduced)requestAnimationFrame(frame);

// Card rotation by drag. The flip guide stays until the user turns the card to its front.
const orbit=document.querySelector('#orbit'),pane=document.querySelector('#membrane'),stances=document.querySelector('#stances'),guide=document.querySelector('#flip-guide');
let yaw=180,pitch=0,drag=null,front=false;
function sync(){const angle=((yaw%360)+360)%360;const nextFront=angle<80||angle>280;pane.style.transform=`rotateX(${pitch}deg) rotateY(${yaw}deg)`;if(nextFront!==front||!pane.dataset.ready){front=nextFront;pane.dataset.ready='true';pane.classList.toggle('is-back',!front);pane.setAttribute('aria-label',front?'今日问题，正面':'今日问题，背面。拖动画面翻转卡片');stances.inert=!front;stances.setAttribute('aria-hidden',String(!front));guide.classList.toggle('show',!front);}}
sync();
setTimeout(()=>{if(!front)guide.classList.add('show');},500);
orbit.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button,a'))return;pane.classList.remove('settling');drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch};orbit.setPointerCapture(event.pointerId);orbit.classList.add('dragging');guide.classList.remove('show');});
orbit.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;yaw=drag.yaw+(event.clientX-drag.x)*.65;pitch=Math.max(-30,Math.min(30,drag.pitch-(event.clientY-drag.y)*.16));sync();});
function stop(event){if(!drag||event.pointerId!==drag.id)return;drag=null;orbit.classList.remove('dragging');
 // settle to the nearest face so the card never rests edge-on
 pane.classList.add('settling');const angle=((yaw%360)+360)%360;yaw=yaw-angle+(angle<90?0:angle<270?180:360);pitch=0;front=null;sync();}
orbit.addEventListener('pointerup',stop);orbit.addEventListener('pointercancel',stop);
// Keyboard: Enter/Space or arrows flip the card.
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)||(e.key===' '&&!e.target.closest('a'))){e.preventDefault();pane.classList.add('settling');yaw+=180*(e.key==='ArrowLeft'?-1:1);pitch=0;front=null;sync();}});
document.querySelectorAll('.stance').forEach(link=>link.addEventListener('click',event=>{if(!front){event.preventDefault();return;}if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced)return;event.preventDefault();document.body.classList.add('is-opening');setTimeout(()=>{location.href=link.href},550);}));
})();
