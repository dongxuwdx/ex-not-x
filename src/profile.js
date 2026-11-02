// "我的" page: the desert reference from 网页细调 11.1, its UFO floating on its own layer,
// the person's tags turning on a cylinder inside the beam, a stance report and three lists.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const WHISPERS=['可能是个夜猫子','大概率爱喝冰美式','据说会给陌生人回很长的消息','也许正在单曲循环某首歌','听说很会记住别人的小习惯','可能下雨天心情反而更好','大概会把晚安说两遍','据说吵架时会先去散步'];
export const STANCE_NAME={green:'赞同',blue:'or',red:'反对'};

let tagEls=[],lights=[],lightsHost=null,raf=0,startTime=performance.now();
export function setTags(host,lightsEl,tags){
 lightsHost=lightsEl;
 host.innerHTML=tags.map((t,i)=>`<span class="cyl-tag" style="--i:${i}"><b>${esc(t.k)}</b>${esc(t.v)}</span>`).join('');
 tagEls=[...host.children];
 if(!lights.length){lightsHost.innerHTML=Array.from({length:16},()=>'<i></i>').join('');lights=[...lightsHost.children];}
}
export function startMotion(active){
 cancelAnimationFrame(raf);if(!active)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tick=now=>{
  const t=reduced?0:(now-startTime)/1000;
  const pw=document.querySelector('#poster')?.clientWidth||innerWidth,n=tagEls.length,R=pw*.15,span=pw*.24;
  tagEls.forEach((el,i)=>{
   const a=t*.42+i*(Math.PI*2/n)*1.618;const front=Math.cos(a);
   const y=(i/(n-1||1))*span+Math.sin(t*.8+i)*3;
   const flip=front<0?Math.PI:0;
   el.style.transform=`translate3d(${Math.sin(a)*R}px,${y}px,${front*R}px) rotateY(${(a+flip)*.6}rad)`;
   el.style.opacity=(front<0?.5:.65+.35*front).toFixed(2);
   el.style.zIndex=String(Math.round(front*100)+100);
  });
  const lw=lightsHost?.clientWidth||0,lh=lightsHost?.clientHeight||0;
  lights.forEach((el,i)=>{const a=t*1.6+i*(Math.PI*2/lights.length);const z=Math.sin(a);el.style.transform=`translate(${Math.cos(a)*lw*.47}px,${z*lh*.5}px)`;el.style.opacity=z>-.1?(.55+.45*z).toFixed(2):'0';el.style.zIndex=z>0?'3':'1';el.style.background=['#fff7b0','#8ff3ff','#ff9ad5'][i%3];});
  raf=requestAnimationFrame(tick);
 };
 raf=requestAnimationFrame(tick);
}
export function stanceReportHTML(paws){
 const c={green:0,blue:0,red:0};paws.forEach(p=>c[p.stance]++);
 return `<span class="report-title">我的立场报告</span><span class="report-counts">${['green','blue','red'].map(k=>`<span class="rc ${k}"><i></i>${STANCE_NAME[k]} ${c[k]}</span>`).join('')}</span><button type="button" class="report-more" id="report-more">查看鸭 ›</button>`;
}
export function stanceReportDetail(paws,name){
 const c={green:0,blue:0,red:0};paws.forEach(p=>c[p.stance]++);const total=paws.length||1;
 const top=Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];
 const verdict={green:'一只「愿意靠近」的绿鸭：遇到问题，你更常先说“可以试试”。',blue:'一只「先听听再说」的蓝鸭：你习惯把答案留到理解之后。',red:'一只「守住边界」的红鸭：你很清楚什么让自己不舒服。'}[top];
 return `<p class="post-meta">${esc(name)} / 立场报告 / 演示数据</p><h2>你举过 ${paws.length} 次鸭掌</h2>
 <div class="report-bar">${['green','blue','red'].map(k=>`<span class="${k}" style="flex:${c[k]||.0001}"></span>`).join('')}</div>
 <div class="report-ducks">${['green','blue','red'].map(k=>`<div><b class="${k}">${c[k]}</b><span>${STANCE_NAME[k]} · ${Math.round(c[k]/total*100)}%</span></div>`).join('')}</div>
 <p class="report-verdict">${verdict}</p>`;
}
export function pawsHTML(paws){
 return '<div class="paws">'+paws.map(p=>`<article class="paw-row"><span class="paw ${p.stance}" aria-hidden="true">🐾</span><div><p>${esc(p.q)}</p><small>${esc(p.date)} · 你举了「${STANCE_NAME[p.stance]}」 · 当时有 ${p.same}% 的人和你一样</small></div></article>`).join('')+'</div>';
}
