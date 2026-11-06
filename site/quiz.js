(function(){
 const {store,esc,toast}=EX,R=EX_REFLECT;
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
   return `<li class="${k===cur?'on':''}${done===n?' done':''}"><span>${s.zh} ${s.en}</span><span>${s.range[0]}–${s.range[1]}</span><i style="width:${k===cur?done/n*100:0}%"></i></li>`}).join('');
 };
 const answered=q=>{const a=st.answers[q.id];return q.optional?a!=null:q.type==='text'?!!(a&&a.trim()):Array.isArray(a)?a.length>0:a!=null};

 function setup(){
  const hasDraft=Object.keys(st.answers).length>0;
  stage.innerHTML=`${hasDraft?`<div class="resume"><span>你有一份没写完的测评（${Object.keys(st.answers).length}/${total}）。<span class="en">You have one in progress.</span></span><span><button class="text-link" type="button" id="resume">继续 Resume</button> · <button class="text-link" type="button" id="restart">重新开始 Restart</button></span></div>`:''}
  <p class="kicker">开始之前 · Before we start</p>
  <h2>这次，你想写下哪一段感情？</h2>
  <p class="en-q">Which relationship do you want to reflect on?</p>
  <form id="setup" novalidate>
   <div class="fld"><label class="field-label" for="nick">怎么称呼 TA · A nickname for them</label><input class="line-input" id="nick" maxlength="16" autocomplete="off" placeholder="一个只有你知道的称呼 · e.g. J" value="${esc(st.name)}"></div>
   <div class="fld"><span class="field-label" id="rel-l">这段关系是 · This relationship is</span>
    <div class="opts" role="radiogroup" aria-labelledby="rel-l">${Object.entries(R.STATUS).map(([k,[zh,en]])=>`<button type="button" class="opt" role="radio" data-status="${k}" aria-checked="${st.status===k}"><b>${zh}</b><span>${en}</span></button>`).join('')}</div></div>
   <div class="fld"><label class="field-label" for="dur">${st.status==='over'?'在一起多久 · How long were you together':'在一起多久 · How long'}</label><input class="line-input" id="dur" maxlength="30" placeholder="比如：两年，其中异地一年" value="${esc(st.duration)}"></div>
   <p class="err" id="err" role="alert"></p>
   <div class="nav-row"><span></span><button class="btn solid" type="submit">开始 20 题 Start</button></div>
  </form>`;
  $('#nick').addEventListener('input',e=>{st.name=e.target.value;setYouAnd()});
  stage.querySelectorAll('[data-status]').forEach(b=>b.addEventListener('click',()=>{st.status=b.dataset.status;stage.querySelectorAll('[data-status]').forEach(x=>x.setAttribute('aria-checked',x===b))}));
  $('#setup').addEventListener('submit',e=>{e.preventDefault();st.name=$('#nick').value.trim();st.duration=$('#dur').value.trim();
   if(!st.name){$('#err').textContent='给 TA 一个称呼吧，只有你看得到 · Give them a nickname';$('#nick').focus();return}
   st.step=hasDraft?firstOpen():0;save();go()});
  $('#resume')?.addEventListener('click',()=>{st.step=firstOpen();save();go()});
  $('#restart')?.addEventListener('click',()=>{st={name:'',status:'together',duration:'',answers:{},step:-1};save();setYouAnd();setup();drawSections()});
 }
 const firstOpen=()=>{const i=R.Q.findIndex(q=>!answered(q));return i<0?total-1:i};

 function question(){
  const i=st.step,q=R.Q[i],sec=R.SECTIONS[secOf(i)],a=st.answers[q.id],N=esc(st.name||'TA');
  const fill=s=>s.replace(/TA/g,N);
  let body;
  if(q.type==='text')body=`<div class="fld"><label class="sr-only" for="ans">${q.zh}</label><textarea class="line-input" id="ans" rows="2" maxlength="200" style="resize:vertical" placeholder="${esc(q.ph)}">${esc(a||'')}</textarea></div>`;
  else body=`<div class="opts" role="${q.multi?'group':'radiogroup'}">${q.opts.map((o,k)=>{const on=q.multi?(a||[]).includes(k):a===k;return `<button type="button" class="opt" data-k="${k}" ${q.multi?`aria-pressed="${on}"`:`role="radio" aria-checked="${on}"`}><b>${fill(o.zh)}</b><span>${o.en}</span></button>`}).join('')}</div>${q.multi?'<p class="hint">可以多选 · Pick all that apply</p>':''}`;
  stage.innerHTML=`<div class="progress"><i style="width:${i/total*100}%"></i></div>
   <p class="kicker">${sec.zh} ${sec.en} · <span class="qnum">${i+1} / ${total}</span></p>
   <h2>${fill(q.zh)}</h2><p class="en-q">${q.en.replace(/\bthem\b/g,N==='TA'?'them':N)}</p>
   ${body}<p class="err" id="err" role="alert"></p>
   <div class="nav-row"><button class="back" type="button" id="back">← ${i===0?'修改称呼 Edit':'上一题 Back'}</button><button class="btn solid" type="button" id="next">${i===total-1?'生成总结 Write my summary':q.optional&&!a?'跳过 Skip':'下一题 Next'}</button></div>`;
  stage.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const k=+b.dataset.k;
   if(q.multi){const s=new Set(st.answers[q.id]||[]);s.has(k)?s.delete(k):s.add(k);st.answers[q.id]=[...s].sort();b.setAttribute('aria-pressed',s.has(k))}
   else{st.answers[q.id]=k;stage.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked',x===b));save();drawSections();setTimeout(next,220);return}
   save();drawSections()}));
  const ta=$('#ans');if(ta){ta.focus();ta.addEventListener('input',()=>{st.answers[q.id]=ta.value;save();drawSections();if(q.optional)$('#next').textContent=i===total-1?'生成总结 Write my summary':ta.value?'下一题 Next':'跳过 Skip'});
   ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();next()}})}
  $('#back').addEventListener('click',()=>{st.step=i-1;save();go()});
  $('#next').addEventListener('click',next);
  function next(){if(!q.optional&&!answered(q)){$('#err').textContent=q.type==='text'?'写一句就好 · Just a line is enough':'选一个最接近的 · Pick the closest one';return}
   if(q.optional&&!st.answers[q.id])st.answers[q.id]='';
   if(i===total-1)return finish();st.step=i+1;save();go()}
 }

 function finish(){
  const s=R.summarize(st);
  const rec={id:'r'+Date.now(),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),input:{name:st.name,status:st.status,duration:st.duration,answers:st.answers},summary:s};
  store.set('reflect-current',rec);
  store.set('quiz-draft',null);
  stage.innerHTML=`<div class="writing"><span class="script" aria-hidden="true">Writing…</span><p class="kicker">正在为你和 ${esc(st.name)} 写总结 · Writing your summary</p></div>`;
  setTimeout(()=>location.href='review.html',1400);
 }

 function go(){drawSections();setYouAnd();st.step<0?setup():question();window.scrollTo({top:0,behavior:'smooth'})}
 go();
})();
