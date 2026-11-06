(function(){
 const {store,esc,toast,L,T,pick}=EX,R=EX_REFLECT;
 const $=s=>document.querySelector(s);
 const stage=$('#stage');
 let st=store.get('quiz-draft',null)||{name:'',status:'together',duration:'',answers:{},step:-1};
 const save=()=>store.set('quiz-draft',st);
 const total=R.Q.length;

 const setYouAnd=()=>{$('#you-and').textContent=`You & ${st.name.trim()||'J'}`};
 const secOf=i=>R.SECTIONS.findIndex(s=>i+1>=s.range[0]&&i+1<=s.range[1]);
 const drawSections=()=>{
  const cur=st.step<0?-1:secOf(st.step);
  $('#sections').innerHTML=R.SECTIONS.map((s,k)=>{
   const n=s.range[1]-s.range[0]+1,done=R.Q.slice(s.range[0]-1,s.range[1]).filter(q=>answered(q)).length;
   return `<li class="${k===cur?'on':''}${done===n?' done':''}"><span>${L(s.zh,s.en)}</span><span>${s.range[0]}–${s.range[1]}</span><i style="width:${k===cur?done/n*100:0}%"></i></li>`}).join('');
 };
 const answered=q=>{const a=st.answers[q.id];return q.optional?a!=null:q.type==='text'?!!(a&&a.trim()):Array.isArray(a)?a.length>0:a!=null};

 function setup(){
  const hasDraft=Object.keys(st.answers).length>0;
  stage.innerHTML=`${hasDraft?`<div class="resume"><span>${L(`你有一份没写完的测评（${Object.keys(st.answers).length}/${total}）。`,`You have one in progress (${Object.keys(st.answers).length}/${total}).`)}</span><span><button class="text-link" type="button" id="resume">${L('继续','Resume')}</button> · <button class="text-link" type="button" id="restart">${L('重新开始','Restart')}</button></span></div>`:''}
  <p class="kicker">${L('开始之前','Before we start')}</p>
  <h2>${L('这次，你想写下哪一段感情？','Which relationship do you want to reflect on?')}</h2>
  <p class="en-q both-only">Which relationship do you want to reflect on?</p>
  <form id="setup" novalidate>
   <div class="fld"><label class="field-label" for="nick">${L('怎么称呼 TA','A nickname for them')}</label><input class="line-input" id="nick" maxlength="16" autocomplete="off" placeholder="${T('一个只有你知道的称呼','e.g. J')}" value="${esc(st.name)}"></div>
   <div class="fld"><span class="field-label" id="rel-l">${L('这段关系是','This relationship is')}</span>
    <div class="opts" role="radiogroup" aria-labelledby="rel-l">${Object.entries(R.STATUS).map(([k,[zh,en]])=>`<button type="button" class="opt" role="radio" data-status="${k}" aria-checked="${st.status===k}"><b>${L(zh,en)}</b><span class="both-only">${en}</span></button>`).join('')}</div></div>
   <div class="fld"><label class="field-label" for="dur">${L('在一起多久','How long')}</label><input class="line-input" id="dur" maxlength="30" placeholder="${T('比如：两年，其中异地一年','e.g. two years, one long-distance')}" value="${esc(st.duration)}"></div>
   <p class="err" id="err" role="alert"></p>
   <div class="nav-row"><span></span><button class="btn solid" type="submit">${L('开始 20 题','Start · 20 questions')}</button></div>
  </form>`;
  $('#nick').addEventListener('input',e=>{st.name=e.target.value;setYouAnd()});
  stage.querySelectorAll('[data-status]').forEach(b=>b.addEventListener('click',()=>{st.status=b.dataset.status;stage.querySelectorAll('[data-status]').forEach(x=>x.setAttribute('aria-checked',x===b))}));
  $('#setup').addEventListener('submit',e=>{e.preventDefault();st.name=$('#nick').value.trim();st.duration=$('#dur').value.trim();
   if(!st.name){$('#err').textContent=T('给 TA 一个称呼吧，只有你看得到','Give them a nickname — only you will see it');$('#nick').focus();return}
   st.step=hasDraft?firstOpen():0;save();go()});
  $('#resume')?.addEventListener('click',()=>{st.step=firstOpen();save();go()});
  $('#restart')?.addEventListener('click',()=>{st={name:'',status:'together',duration:'',answers:{},step:-1};save();setYouAnd();setup();drawSections()});
 }
 const firstOpen=()=>{const i=R.Q.findIndex(q=>!answered(q));return i<0?total-1:i};

 function question(){
  const i=st.step,q=R.Q[i],sec=R.SECTIONS[secOf(i)],a=st.answers[q.id],N=esc(st.name||'TA');
  const fill=s=>s.replace(/TA/g,N);
  const enQ=q.en.replace(/\bthem\b/g,N==='TA'?'them':N);
  let body;
  if(q.type==='text')body=`<div class="fld"><label class="sr-only" for="ans">${pick(q.zh,q.en)}</label><textarea class="line-input" id="ans" rows="2" maxlength="200" style="resize:vertical" placeholder="${esc(T(...q.ph.split(' · ')))}">${esc(a||'')}</textarea></div>`;
  else body=`<div class="opts" role="${q.multi?'group':'radiogroup'}">${q.opts.map((o,k)=>{const on=q.multi?(a||[]).includes(k):a===k;return `<button type="button" class="opt" data-k="${k}" ${q.multi?`aria-pressed="${on}"`:`role="radio" aria-checked="${on}"`}><b>${L(fill(o.zh),o.en)}</b><span class="both-only">${o.en}</span></button>`}).join('')}</div>${q.multi?`<p class="hint">${L('可以多选','Pick all that apply')}</p>`:''}`;
  stage.innerHTML=`<div class="progress"><i style="width:${i/total*100}%"></i></div>
   <p class="kicker">${L(sec.zh,sec.en)} · <span class="qnum">${i+1} / ${total}</span></p>
   <h2>${L(fill(q.zh),enQ)}</h2><p class="en-q both-only">${enQ}</p>
   ${body}<p class="err" id="err" role="alert"></p>
   <div class="nav-row"><button class="back" type="button" id="back">← ${i===0?L('修改称呼','Edit'):L('上一题','Back')}</button><button class="btn solid" type="button" id="next">${i===total-1?L('生成总结','Write my summary'):q.optional&&!a?L('跳过','Skip'):L('下一题','Next')}</button></div>`;
  stage.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const k=+b.dataset.k;
   if(q.multi){const s=new Set(st.answers[q.id]||[]);s.has(k)?s.delete(k):s.add(k);st.answers[q.id]=[...s].sort();b.setAttribute('aria-pressed',s.has(k))}
   else{st.answers[q.id]=k;stage.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked',x===b));save();drawSections();setTimeout(next,220);return}
   save();drawSections()}));
  const ta=$('#ans');if(ta){ta.focus();ta.addEventListener('input',()=>{st.answers[q.id]=ta.value;save();drawSections();if(q.optional)$('#next').innerHTML=i===total-1?L('生成总结','Write my summary'):ta.value?L('下一题','Next'):L('跳过','Skip')});
   ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();next()}})}
  $('#back').addEventListener('click',()=>{st.step=i-1;save();go()});
  $('#next').addEventListener('click',next);
  function next(){if(!q.optional&&!answered(q)){$('#err').textContent=q.type==='text'?T('写一句就好','Just a line is enough'):T('选一个最接近的','Pick the closest one');return}
   if(q.optional&&!st.answers[q.id])st.answers[q.id]='';
   if(i===total-1)return finish();st.step=i+1;save();go()}
 }

 function finish(){
  const s=R.summarize(st);
  const rec={id:'r'+Date.now(),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),input:{name:st.name,status:st.status,duration:st.duration,answers:st.answers},summary:s};
  store.set('reflect-current',rec);
  store.set('quiz-draft',null);
  stage.innerHTML=`<div class="writing"><span class="script" aria-hidden="true">Writing…</span><p class="kicker">${L(`正在为你和 ${esc(st.name)} 写总结`,`Writing your summary with ${esc(st.name)}`)}</p></div>`;
  setTimeout(()=>location.href='review.html',1400);
 }

 function go(){drawSections();setYouAnd();st.step<0?setup():question();window.scrollTo({top:0,behavior:'smooth'})}
 go();
})();
