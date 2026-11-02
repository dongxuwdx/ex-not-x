// Small sensory details: a synthesized quack and a splash of droplets.
let audio=null;
export function quack(){
 try{
  audio??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();
  const ac=audio,t=ac.currentTime;
  const out=ac.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.32,t+.012);out.gain.setValueAtTime(.3,t+.07);out.gain.exponentialRampToValueAtTime(.001,t+.24);out.connect(ac.destination);
  for(const [type,f0,f1,bp,q,amp] of [['sawtooth',560,360,1150,5,1],['square',560,360,2500,7,.35]]){
   const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+.2);
   const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=bp;f.Q.value=q;
   const g=ac.createGain();g.gain.value=amp;o.connect(f).connect(g).connect(out);o.start(t);o.stop(t+.26);
  }
 }catch{}
}
export function splash(target){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const r=target.getBoundingClientRect(),host=document.createElement('div');
 host.className='splash';host.style.left=(r.left+r.width*.28)+'px';host.style.top=(r.top+r.height*.4)+'px';
 for(let i=0;i<10;i++){const d=document.createElement('i');const a=-Math.PI*(.12+.76*i/9),v=26+Math.random()*26;d.style.setProperty('--dx',Math.cos(a)*v+'px');d.style.setProperty('--dy',Math.sin(a)*v+'px');d.style.animationDelay=Math.random()*60+'ms';host.append(d);}
 const ring=document.createElement('b');host.append(ring);
 const word=document.createElement('em');word.textContent='嘎';host.append(word);
 document.body.append(host);setTimeout(()=>host.remove(),900);
}
export const duckIcon=(fill='#ffd447')=>`<svg class="duck-icon" viewBox="0 0 28 24" aria-hidden="true"><path d="M3 15c0-4 4-5 9-3.5 3-1.2 6-.5 6.5 2 .5 4-4 7-9 6.6C5 19.8 3 18 3 15Z" fill="${fill}" stroke="#7a5a10" stroke-width="1"/><circle cx="17" cy="8" r="4.6" fill="${fill}" stroke="#7a5a10" stroke-width="1"/><path d="M21 8.2q4 .4 1 2.4-1.4-.2-1-2.4Z" fill="#ff8a2a"/><circle cx="18.3" cy="7" r=".9" fill="#1b1b22"/></svg>`;
