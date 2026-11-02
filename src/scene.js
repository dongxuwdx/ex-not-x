import {createHands} from './hands.js';
import {createRiver} from './river3d.js';
// The world owns two animated layers: the breathing hands on the menu screen and the
// live river. Each runs only while its screen is visible.
export function createWorld(host,{onShore,onDragState}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hands=createHands();
 const river=createRiver(host,{onShore,onDragState});
 let current='menu',clock=0,previous=performance.now(),displayHands=0,paused=reduced;
 function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-previous)/1000,.05);previous=now;
  if(!paused&&!document.hidden)clock+=dt;
  const target=current==='menu'?1:0;
  if(target===0&&displayHands<.002)return;
  displayHands+=(target-displayHands)*(reduced?1:.065);
  hands.update({menuAmount:displayHands,clock});
 }
 requestAnimationFrame(animate);
 return {
  river,
  setScreen(s){current=s;river.setActive(s==='river');},
  pause(v){paused=v;river.pause(v);return paused;},
  setLefty(v){hands.setLefty(v);},setHandGesture(v){hands.setGesture(v);}
 };
}
