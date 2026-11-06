(function(){
 const {store,esc,toast}=EX,R=EX_REFLECT;
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const params=new URLSearchParams(location.search);
 const journal=store.get('journal',[]);
 let rec=params.get('id')?journal.find(j=>j.id===params.get('id')):null;
 rec=rec||store.get('reflect-current',null);
 const demo=!rec;
 if(demo)rec={id:'demo',date:R.DEMO.date,summary:R.DEMO};
 let S=rec.summary;
 const N=esc(S.name);
 const notes=store.get('own-reflections',{});
 let mode=store.get('story-mode','zh'),keep='private',variant=0;

 const ALT_REFLECT=[`也许你们缺的不是爱，而是一个约好的“说话时间”。每周留出二十分钟，不解决问题，只说这周最想让对方知道的一件事。`,`Maybe what's missing isn't love but an agreed time to talk. Twenty minutes a week — not to fix anything, just to share the one thing you most want the other to know.`];
 const basis=S.basis||[`${S.status[0]}${S.duration?' · '+esc(S.duration):''} · 基于你的 20 个回答与你写下的话`,'From your 20 answers and your own words'];
 const p2=(pair,cls='')=>`<p class="zh-p ${cls}">${esc(pair[0])}</p><p class="en-p ${cls}">${esc(pair[1])}</p>`;

 function render(){
  const reflection=variant%2?ALT_REFLECT:S.reflection;
  $('#main').innerHTML=`
  <section class="top">
   <p class="kicker">感情总结 · Relationship summary · ${esc(rec.date)}</p>
   <div class="duo">
    <div class="c you"><small>你 You</small><strong>${S.you.zh}</strong><span>${S.you.en}</span></div>
    <div class="c them"><small>${N} · Them</small><strong>${S.them.zh}</strong><span>${S.them.en}</span></div>
    <span class="script" aria-hidden="true">You &amp; ${N}</span>
   </div>
   <h1 class="headline">${esc(S.headline[0])}</h1>
   <p class="head-en">${esc(S.headline[1])}</p>
   <p class="basis">${basis[0]} · ${basis[1]}</p>
   ${demo?`<div class="demo-note"><span>这是一份示例总结 · This is a sample summary</span><a class="text-link" href="quiz.html">写我自己的 Write mine →</a></div>`:''}
  </section>
  <div class="cols">
   <article data-mode="${mode}">
    <div class="bar-head"><h2>你们的故事 · Your story</h2>
     <div class="tabs" role="group" aria-label="语言">${[['zh','中文'],['en','English'],['both','双语 Both']].map(([k,l])=>`<button type="button" data-mode="${k}" aria-pressed="${mode===k}">${l}</button>`).join('')}</div></div>
    <div class="story" data-mode="${mode}">${S.story.map(([zh,en,pair])=>`<section><h3>${zh} · ${en}</h3>${p2(pair)}</section>`).join('')}</div>

    <div class="reflect on-dark">
     <span class="script" aria-hidden="true">Reflection</span>
     <div class="k">写给你的 Reflection · For you</div>
     <div class="body"><span class="zh-p">${esc(reflection[0])}</span><span class="en-p">${esc(reflection[1])}</span></div>
     <hr><div class="qk">可以想一想 · Questions to sit with</div>
     <ol>${S.questions.map(q=>`<li>${esc(q[0])}<span>${esc(q[1])}</span></li>`).join('')}</ol>
    </div>

    <section class="own">
     <div class="bar-head"><h2>写下你自己的 Reflection · Your own reflection</h2></div>
     <p>读完之后，你想对自己、或对 ${N} 说什么？会和总结一起保存。What would you say to yourself, or to ${N}? Saved with the summary.</p>
     <label class="sr-only" for="own">你自己的 Reflection</label>
     <textarea id="own" maxlength="2000" placeholder="写给自己，也可以写给 ${N}… To yourself, or to them…">${esc(notes[rec.id]||S.extra||'')}</textarea>
     <div class="saved" id="saved"></div>
    </section>

    <section>
     <div class="lp-head"><h2>恋爱人格 · Love personalities</h2><span>${N} 的人格基于你的视角 · ${N}'s is from your point of view</span></div>
     <div class="lp">${[['you','你 · You','blue',S.you],['them',`${N} · Them`,'',S.them]].map(([k,l,c,a])=>`<div>
      <span class="chip ${c}">${l}</span><h3>${a.zh}</h3><div class="en-n">${a.en}</div>
      <dl><dt>爱的方式 Love</dt><dd>${a.love[0]} · ${a.love[1]}</dd><dt>冲突时 Conflict</dt><dd>${a.conflict[0]} · ${a.conflict[1]}</dd><dt>需要 Needs</dt><dd>${a.needs[0]} · ${a.needs[1]}</dd></dl></div>`).join('')}</div>
    </section>

    <section class="chem">
     <p class="kicker">你们的化学反应 · How you two meet</p>
     <div class="legend"><span><i class="dot y"></i>你 You</span><span><i class="dot t"></i>${N}</span></div>
     ${S.dims.map(d=>`<div class="dim"><div class="labels"><span>${d.l[0]} ${d.l[1]}</span><b>${d.zh} ${d.en}</b><span>${d.r[0]} ${d.r[1]}</span></div>
      <div class="track" role="img" aria-label="${d.zh}：你 ${d.y}，${N} ${d.t}（0=${d.l[0]}，100=${d.r[0]}）"><i class="y" style="left:50%" data-to="${d.y}"></i><i class="t" style="left:50%" data-to="${d.t}"></i></div>
      <p>${esc(d.note[0])} <span class="en">${esc(d.note[1])}</span></p></div>`).join('')}
    </section>

    <p class="disclaimer">这份总结由 AI 根据你一个人的回答写成，只代表你的视角，不是对 ${N} 的评判，也不构成心理诊断或专业建议。如果你正经历困难，<a href="guidelines.html#help">这里有心理支持资源</a>。<br>Written by AI from your answers alone — your side of the story, not a verdict on ${N}, and not professional advice. If you're struggling, <a href="guidelines.html#help">support is here</a>.</p>
   </article>

   <aside class="side">
    <div class="keep">
     <h2>这份总结放在哪 · Keep or share</h2>
     <div role="radiogroup" aria-label="Keep or share">
      ${[['private','仅自己可见 · 存入日记','Private — save to my journal'],['anon','匿名发布到论坛','Share anonymously'],['named','以我的昵称发布','Share with my name']].map(([k,zh,en])=>`<button type="button" class="o" role="radio" data-keep="${k}" aria-checked="${keep===k}"><b>${zh}</b><span>${en}</span></button>`).join('')}
     </div>
     <button class="btn solid" type="button" id="save">${keep==='private'?'保存到日记 Save to journal':'发布 Publish'}</button>
    </div>
    <ul class="more-acts">
     <li><button type="button" id="regen">重新生成 Regenerate</button></li>
     <li><button type="button" id="img">保存为图片 Save as image · 小红书 / IG</button></li>
     <li><a href="quiz.html" id="another">写另一段感情 Reflect on another</a></li>
    </ul>
   </aside>
  </div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.track i').forEach(i=>i.style.left=i.dataset.to+'%')));
  bind();
 }

 function bind(){
  $$('.tabs [data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;store.set('story-mode',mode);$('.story').dataset.mode=mode;$('article').dataset.mode=mode;$$('.tabs [data-mode]').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
  let t;$('#own').addEventListener('input',e=>{notes[rec.id]=e.target.value;clearTimeout(t);t=setTimeout(()=>{store.set('own-reflections',notes);$('#saved').textContent='已自动保存 · Saved on this device'},400)});
  $$('[data-keep]').forEach(b=>b.addEventListener('click',()=>{keep=b.dataset.keep;$$('[data-keep]').forEach(x=>x.setAttribute('aria-checked',x===b));$('#save').textContent=keep==='private'?'保存到日记 Save to journal':'发布 Publish'}));
  $('#save').addEventListener('click',save);
  $('#regen').addEventListener('click',()=>{variant++;const y=scrollY;render();scrollTo(0,y);toast('已重新生成 Reflection · Regenerated');$('.reflect').classList.add('fade-in')});
  $('#img').addEventListener('click',saveImage);
  $('#another').addEventListener('click',()=>store.set('quiz-draft',null));
 }

 function save(){
  const entry={...rec,id:rec.id==='demo'?'r'+Date.now():rec.id,savedAt:Date.now(),keep,own:$('#own').value};
  if(rec.id==='demo'){notes[entry.id]=entry.own;store.set('own-reflections',notes)}
  const i=journal.findIndex(j=>j.id===entry.id);if(i>=0)journal[i]=entry;else journal.unshift(entry);
  store.set('journal',journal);
  if(keep!=='private'){
   const posts=store.get('posts',[]);
   if(!posts.some(p=>p.fromSummary===entry.id)){
    posts.unshift({id:'s'+Date.now(),fromSummary:entry.id,mine:true,cat:'ld',lang:'zh',author:keep==='anon'?'匿名用户':'我 Me',city:'Here',h:0,hug:0,replies:0,
     title:`我的感情总结：${S.headline[0]}`,body:`${S.you.zh} × ${S.them.zh}。“${S.story[1][2][0].split('。').slice(-2).join('。').trim()}”`,altTitle:`My relationship summary: ${S.headline[1]}`,altBody:`${S.you.en} × ${S.them.en}.`});
    store.set('posts',posts);
   }
   toast(keep==='anon'?'已匿名发布到论坛，也存进了日记 · Shared anonymously':'已发布到论坛，也存进了日记 · Shared');
  }else toast('已存入日记，仅自己可见 · Saved to your journal');
 }

 /* draw a 1080×1350 share card on a canvas — works offline, no libraries */
 function saveImage(){
  const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const sans='"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif',script='"Brush Script MT","Snell Roundhand",cursive';
  g.fillStyle='#fff';g.fillRect(0,0,W,H);
  g.textAlign='center';g.fillStyle='#3e55d7';g.font=`700 22px ${sans}`;g.fillText('感情总结 · RELATIONSHIP SUMMARY · '+String(rec.date).toUpperCase(),W/2,130);
  const r=200,cy=420;
  g.fillStyle='#3e55d7';g.beginPath();g.arc(W/2+110,cy,r,0,7);g.fill();
  g.save();g.beginPath();g.arc(W/2-110,cy,r,0,7);g.clip();g.fillStyle='#2a2a2a';g.fillRect(0,0,W,H);g.strokeStyle='#353535';g.lineWidth=14;for(let x=-H;x<W;x+=34){g.beginPath();g.moveTo(x,0);g.lineTo(x+H,H);g.stroke()}g.restore();
  g.fillStyle='#fff';
  const lab=(x,a,b,cname)=>{g.font=`500 18px ${sans}`;g.fillText(a,x,cy-60);g.font=`800 40px ${sans}`;g.fillText(cname.zh,x,cy+4);g.font=`500 16px ${sans}`;g.fillText(cname.en.toUpperCase(),x,cy+46)};
  lab(W/2-150,'你 YOU','',S.you);lab(W/2+150,`${S.name} · THEM`,'',S.them);
  g.fillStyle='#141414';g.font=`150px ${script}`;g.fillText(`You & ${S.name}`,W/2,cy+250);
  g.font=`800 44px ${sans}`;wrap(g,S.headline[0],W/2,800,880,60);
  g.fillStyle='#6b6b6b';g.font=`500 20px ${sans}`;g.fillText(S.headline[1].toUpperCase(),W/2,920);
  const line=S.story[1][2][0].split('。').filter(Boolean).slice(-1)[0];
  g.fillStyle='#141414';g.font=`500 30px ${sans}`;wrap(g,`“${line}。”`,W/2,1030,820,46);
  g.fillStyle='#1b1b1b';g.fillRect(0,H-140,W,140);
  g.fillStyle='#fff';g.font=`800 30px ${sans}`;g.textAlign='left';g.fillText('EX NOT X',80,H-60);
  g.fillStyle='#6a7cf0';g.textAlign='right';g.font=`64px ${script}`;g.fillText('Good night',W-80,H-50);
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ExnotX-You-and-${S.name}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('图片已保存 · Image saved')},'image/png');
 }
 function wrap(g,text,x,y,max,lh){let line='',lines=[];for(const ch of [...text]){if(g.measureText(line+ch).width>max&&line){lines.push(line);line=ch}else line+=ch}lines.push(line);lines.forEach((l,i)=>g.fillText(l,x,y+i*lh))}

 render();
})();
