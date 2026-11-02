// Writing desk: recommendation letters, free discussion and the "无从讲起" helpers.
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

const LETTER_TITLES=['写给那个曾认真相爱的人','写给下一个会被 TA 爱的人','一份来自前任的使用说明','关于 TA，我知道的一些事'];
const LETTER_OPENERS=['TA 最可爱的一个小习惯是……','如果你们吵架了，记得……','TA 嘴上不说，但其实很需要……','和 TA 在一起，我学会了……','TA 的说明书第一条：……'];
const FREE_PROMPTS=['从一个具体的瞬间开始，讲讲你的故事……','那天发生了什么？','如果能回到那一刻，你会说什么？','有一件小事，你一直记得……'];
const THEMES={start:{name:'开始',color:'#8fdcae'},daily:{name:'日常',color:'#ffd86b'},crack:{name:'裂缝',color:'#a99cf0'},now:{name:'现在',color:'#ff9cc6'},light:{name:'轻松一下',color:'#ffb37a'},step:{name:'一步一步',color:'#9fd3ff'},thing:{name:'一样东西',color:'#c8e68a'}};
const DECK={start:['你第一次注意到 TA 是因为什么？','你们第一次单独待在一起，在做什么？'],daily:['你们之间有没有只有彼此才懂的玩笑？','TA 发消息有什么习惯？'],crack:['你第一次觉得“我们好像不太一样”是什么时候？','有没有一句话，你当时没说出口？'],now:['现在想起 TA，最先浮现的是哪个画面？','如果在街上偶遇，你会怎么打招呼？'],light:['TA 最离谱的一个小癖好是什么？','TA 做过最让你笑出声的一件事是什么？','如果 TA 是一种零食，会是哪一种？']};
const STEPS=[['时间和地点','这件事大概发生在什么时候、什么地方？'],['一个画面','闭上眼，你能看到什么？光线、声音、天气都可以。'],['TA 做了什么','那一刻 TA 说了什么，或者做了什么？'],['你的感受','你当时心里是什么感觉？现在回头看呢？'],['留下了什么','这件事让你明白了什么，或者改变了什么？']];
const STITCH=['说起来，那件事大概发生在：','我记得的画面是：','那一刻，TA：','我当时的感受是：','后来我发现：'];
const THINGS=[['🎵','一首歌',['哪首歌会让你想起 TA？','第一次一起听是什么时候？']],['📍','一个地方',['有没有一个地方，你现在路过还会绕开，或者会特意去？']],['📦','一件旧物',['你还留着 TA 的什么东西吗？','为什么没扔？']],['🍜','一种味道',['有没有一道菜，你现在一吃就会想到 TA？']],['💬','一句话',['TA 说过的哪句话，你到现在还记得？']]];
const GENTLE='写不下去也没关系，可以先停在这里。';
const BASKET_KEY='exnotx.basket.v1';

export function initWriting({toast,publish}){
 const state={compose:'letter',view:'home',theme:'all',stepIndex:0,stepAnswers:['','','','',''],thing:null,current:null,joined:''};
 const drafts={letter:{title:'',body:''},free:{title:'',body:''}};
 const fields={duration:'',communication:'',money:''};
 let basket=[];try{basket=JSON.parse(localStorage.getItem(BASKET_KEY)||'[]');}catch{}
 const saveBasket=()=>{try{localStorage.setItem(BASKET_KEY,JSON.stringify(basket));}catch{}};
 let titlePh=pick(LETTER_TITLES),bodyPh=pick(LETTER_OPENERS),freePh=FREE_PROMPTS[0],phTimer=0,idleTimer=0,yawnTimer=0;

 function countText(n){
  if(state.compose==='free')return n?`${n} 字`:'还没开始，慢慢来';
  if(n===0)return '信纸还空着，慢慢来';
  if(n<=20)return `已经落笔了 · ${n} 字`;
  if(n<=100)return `开始有点像一封信了 · ${n} 字`;
  if(n<=300)return `小鸭在旁边认真听着 · ${n} 字`;
  if(n<=600)return `这封信已经很有分量了 · ${n} 字`;
  return `看得出来，你真的很了解 TA · ${n} 字`;
 }
 const words=()=>$('#post-body').value.replace(/\s/g,'').length;
 function placeholders(){
  const isLetter=state.compose==='letter';
  $('#post-title').placeholder=isLetter?titlePh:'给这段经历起个标题';
  $('#post-body').placeholder=isLetter?`亲爱的下一位读信人：\n\n${bodyPh}`:freePh;
 }
 function rotatePlaceholders(){
  clearInterval(phTimer);
  phTimer=setInterval(()=>{if(document.body.dataset.screen!=='write')return;
   if(!$('#post-title').value&&document.activeElement!==$('#post-title'))titlePh=LETTER_TITLES[(LETTER_TITLES.indexOf(titlePh)+1)%LETTER_TITLES.length];
   if(!$('#post-body').value){bodyPh=LETTER_OPENERS[(LETTER_OPENERS.indexOf(bodyPh)+1)%LETTER_OPENERS.length];freePh=FREE_PROMPTS[(FREE_PROMPTS.indexOf(freePh)+1)%FREE_PROMPTS.length];}
   placeholders();},4200);
 }
 function store(){if(state.compose!=='nowhere')drafts[state.compose]={title:$('#post-title').value,body:$('#post-body').value};}
 function render(){
  const isLetter=state.compose==='letter',nowhere=state.compose==='nowhere';
  $$('[data-compose]').forEach(b=>b.classList.toggle('selected',b.dataset.compose===state.compose));
  $('#compose-form').hidden=nowhere;$('#nowhere').hidden=!nowhere;
  $('#optional-fields').hidden=state.compose!=='free';
  $('#post-body').classList.toggle('letter-paper',isLetter);$('.paper-wrap').classList.toggle('is-letter',isLetter);
  $('#win-title').textContent=nowhere?'NOWHERE - 先从一件小事说起.exe':isLetter?'LETTER - 只有你和这只鸭知道.txt':'STORY - 一段自由讨论.txt';
  $('#notes-tip').textContent=nowhere?'不用一次写完。捞到的每张卡都会先放进卡片篮。':isLetter?'像介绍一位老朋友那样，写下 TA 的小习惯。':'从一个具体的瞬间开始。写不下去也没关系，可以先停在这里。';
  if(!nowhere){$('#post-title').value=drafts[state.compose].title;$('#post-body').value=drafts[state.compose].body;placeholders();$('#word-count').textContent=countText(words());}
  else renderNowhere();
  $('#idle-hint').hidden=true;
 }
 function setCompose(kind,{view}={}){store();state.compose=kind;if(view)state.view=view;render();}
 $$('[data-compose]').forEach(b=>b.onclick=()=>setCompose(b.dataset.compose,{view:'home'}));
 $$('[data-desk]').forEach(b=>b.onclick=()=>b.dataset.desk==='basket'?setCompose('nowhere',{view:'basket'}):setCompose(b.dataset.desk));

 // Chip groups replace drop-downs: one tap selects, a second tap clears.
 $$('.chip-group[data-field]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=g.dataset.field;fields[k]=fields[k]===b.dataset.v?'':b.dataset.v;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.v===fields[k])));}));
 $$('.chip-group[data-field] button').forEach(b=>b.setAttribute('aria-pressed','false'));

 // The little duck nods while you type and yawns when you stop for a while.
 const buddy=$('#buddy'),bubble=$('#buddy-bubble');
 function nudgeBuddy(){buddy.classList.remove('nod','yawn');void buddy.offsetWidth;buddy.classList.add('nod');bubble.textContent='';clearTimeout(yawnTimer);yawnTimer=setTimeout(yawn,15000);}
 function yawn(){if(document.body.dataset.screen!=='write')return;buddy.classList.remove('nod');buddy.classList.add('yawn');bubble.textContent='哈～欠';setTimeout(()=>{buddy.classList.remove('yawn');bubble.textContent='';},2600);yawnTimer=setTimeout(yawn,20000);}
 function armIdle(){clearTimeout(idleTimer);$('#idle-hint').hidden=true;if(state.compose==='free')idleTimer=setTimeout(()=>{if(document.body.dataset.screen==='write'&&state.compose==='free')$('#idle-hint').hidden=false;},30000);}
 $('#post-body').addEventListener('input',()=>{$('#word-count').textContent=countText(words());store();nudgeBuddy();armIdle();});
 $('#post-body').addEventListener('focus',armIdle);
 $('#post-title').addEventListener('input',()=>{store();nudgeBuddy();});
 $('#idle-hint').onclick=()=>{setCompose('nowhere',{view:'fish'});};
 document.addEventListener('input',e=>{if(e.target.closest('#nowhere'))nudgeBuddy();});

 $('#compose-form').onsubmit=e=>{
  e.preventDefault();const title=$('#post-title').value.trim(),body=$('#post-body').value.trim();
  if(!title||body.length<5){toast('写一个标题，再留下至少 5 个字。');return;}
  const context=state.compose==='free'?[fields.duration,fields.communication,fields.money,e.target.elements.time.value.trim()].filter(Boolean):[];
  const kind=state.compose;
  playSend(title,()=>{
   publish({type:kind,title,body:body+(context.length?'\n\n相处片段：'+context.join('，'):'')});
   drafts[kind]={title:'',body:''};$('#compose-form').reset();Object.keys(fields).forEach(k=>fields[k]='');$$('.chip-group button').forEach(b=>b.setAttribute('aria-pressed','false'));render();
  });
 };

 function playSend(title,done){
  const layer=$('#send-anim');
  if(reduced()){done();return;}
  layer.innerHTML=`<div class="send-paper"><div class="fold f1"></div><div class="fold f2"></div><b>${esc(title)}</b><span></span><span></span><span></span></div>
  <div class="send-duck"><svg viewBox="0 0 160 130"><ellipse cx="76" cy="96" rx="58" ry="30" fill="#ffd447"/><path d="M22 86 Q6 70 18 60 Q26 76 38 78Z" fill="#ffc72c"/><circle cx="108" cy="54" r="27" fill="#ffd447"/><circle cx="117" cy="47" r="3.6" fill="#1b1b22"/><path d="M132 54 Q152 57 134 64 Q129 61 132 54Z" fill="#ff8a2a"/><rect class="bag" x="48" y="56" width="44" height="30" rx="8" fill="#ff6fb5" stroke="#b03a7a" stroke-width="2"/><path d="M56 56 Q70 40 84 56" fill="none" stroke="#b03a7a" stroke-width="3"/><rect x="62" y="64" width="16" height="4" rx="2" fill="#fff" opacity=".8"/></svg><i class="wake"></i></div>`;
  layer.hidden=false;layer.className='send-anim';
  const steps=[[50,'s-in'],[700,'s-fold1'],[1250,'s-fold2'],[1800,'s-pack'],[2500,'s-swim']];
  steps.forEach(([t,c])=>setTimeout(()=>layer.classList.add(c),t));
  setTimeout(()=>{layer.hidden=true;layer.innerHTML='';done();},3500);
 }

 // ---- 无从讲起 ----
 const host=$('#nowhere');
 const basketBtn=()=>`<button type="button" class="basket-btn" data-nv="basket">🧺 我的卡片篮 <b>${basket.length}</b></button>`;
 const back=()=>`<button type="button" class="nv-back" data-nv="home">← 换一种开始方式</button>`;
 function themeDot(t){const th=THEMES[t]||THEMES.step;return `<span class="theme-dot" style="--c:${th.color}">${th.name}</span>`;}
 function addCard(card){basket.push({id:Date.now()+Math.random(),...card});saveBasket();}
 function renderNowhere(){
  const v=state.view;
  if(v==='home'){
   host.innerHTML=`${basket.length?`<div class="resume"><span>上次你捞到了 ${basket.length} 张卡，要继续吗？</span><button type="button" data-nv="basket">继续</button><button type="button" data-nv="clear">清空重来</button></div>`:''}
   <h2 class="nw-title">不知道从哪开始？没关系，先从一件小事说起。</h2>
   <div class="pond-cards">
    <button type="button" class="float-card" data-nv="fish"><span class="fc-emoji">🎣</span><b>捞一张卡</b><small>随机抽一个问题，写一两句就好</small></button>
    <button type="button" class="float-card" data-nv="steps"><span class="fc-emoji">🪜</span><b>一步一步来</b><small>回答 5 个小问题，自动拼成草稿</small></button>
    <button type="button" class="float-card" data-nv="object"><span class="fc-emoji">🧺</span><b>从一样东西开始</b><small>选一首歌、一个地方或一件旧物，由它勾起回忆</small></button>
   </div>${basketBtn()}`;
  }else if(v==='fish'){
   const c=state.current;
   host.innerHTML=`${back()}<h2 class="nw-sub">🎣 捞一张卡</h2>
   <div class="theme-filter" role="group" aria-label="只捞某一种">${[['all','全部','#ffffff'],...Object.entries(DECK).filter(([k])=>k!=='light').map(([k])=>[k,THEMES[k].name,THEMES[k].color])].map(([k,n,col])=>`<button type="button" data-theme="${k}" style="--c:${col}" aria-pressed="${state.theme===k}">${n}</button>`).join('')}</div>
   <div class="fish-pond ${c?'has-card':''}" id="fish-pond">
    <button type="button" class="pond-duck" id="pond-duck" aria-label="让小鸭潜下去捞一张卡"><svg viewBox="0 0 120 100"><ellipse cx="56" cy="70" rx="42" ry="22" fill="#ffd447"/><circle cx="80" cy="38" r="20" fill="#ffd447"/><circle cx="86" cy="33" r="3" fill="#1b1b22"/><path d="M98 38 Q114 40 100 46 Q96 44 98 38Z" fill="#ff8a2a"/></svg></button>
    ${c?`<div class="fished" style="--c:${THEMES[c.theme].color}"><div class="fished-inner">${themeDot(c.theme)}<p>${esc(c.q)}</p></div></div>`:'<p class="pond-hint">点一下小鸭，它会潜下去叼一张卡上来</p>'}
   </div>
   ${c?`<div class="card-answer"><input id="fish-answer" placeholder="写一两句就够了" maxlength="200" value="${esc(c.a||'')}"><div class="row"><button type="button" class="quiet" data-nv="refish">放回水里</button><button type="button" class="pill" data-nv="keep">收进篮子</button></div>${c.theme==='crack'?`<p class="gentle">${GENTLE}</p>`:''}</div>`:''}
   ${basketBtn()}`;
  }else if(v==='steps'){
   const i=state.stepIndex;
   if(i>=STEPS.length){
    const draft=stitch();
    host.innerHTML=`${back()}<h2 class="nw-sub">你的回答已经拼成了一段草稿</h2><p class="nw-note">可以直接修改，也可以带去“自由讨论”继续写。</p><textarea id="step-draft" class="draft-box">${esc(draft)}</textarea><div class="row"><button type="button" class="quiet" data-nv="restart">重新来</button><button type="button" class="quiet" data-nv="steps-basket">放进卡片篮</button><button type="button" class="pill" data-nv="to-free">带去自由讨论</button></div>`;
   }else{
    host.innerHTML=`${back()}<div class="step-ducks" aria-label="第 ${i+1} 题，共 5 题">${STEPS.map((_,k)=>`<span class="${k<i?'lit':k===i?'now':''}">${duckSvg()}</span>`).join('')}</div>
    <div class="step-card"><small>${i+1} / 5 · ${STEPS[i][0]}</small><h2>${STEPS[i][1]}</h2><textarea id="step-answer" placeholder="想到什么就写什么，一两句也可以">${esc(state.stepAnswers[i])}</textarea>${i===3?`<p class="gentle">${GENTLE}</p>`:''}
    <div class="row"><button type="button" class="quiet" data-nv="step-skip">跳过</button><button type="button" class="pill" data-nv="step-next">${i===4?'拼成草稿':'下一题'}</button></div></div>`;
   }
  }else if(v==='object'){
   const t=state.thing;
   host.innerHTML=`${back()}<h2 class="nw-sub">🧺 从一样东西开始</h2><p class="nw-note">先选一个“触发物”，再顺着它往下想。</p>
   <div class="things">${THINGS.map(([e,n],k)=>`<button type="button" data-thing="${k}" aria-pressed="${t===k}"><span>${e}</span>${n}</button>`).join('')}</div>
   ${t!==null?`<div class="step-card"><small>${THINGS[t][0]} ${THINGS[t][1]}</small>${THINGS[t][2].map(q=>`<h2>${q}</h2>`).join('')}<textarea id="thing-answer" placeholder="写一两句就够了"></textarea><div class="row"><button type="button" class="quiet" data-nv="thing-other">换一样东西</button><button type="button" class="pill" data-nv="thing-keep">收进篮子</button></div></div>`:''}
   ${basketBtn()}`;
  }else if(v==='basket'){
   host.innerHTML=`${back()}<h2 class="nw-sub">🧺 我的卡片篮</h2><p class="nw-note">${basket.length?'拖动卡片调整顺序，再把它们串起来。':'篮子还是空的。先去水里捞一张卡吧。'}</p>
   <div class="desk-cards" id="desk-cards">${basket.map((c,k)=>`${k&&basket[k-1].theme==='crack'?`<p class="gentle between">${GENTLE}</p>`:''}<article class="desk-card" draggable="true" data-card="${c.id}" style="--c:${(THEMES[c.theme]||THEMES.step).color};--r:${((k*37)%7)-3}deg">${themeDot(c.theme)}<p class="q">${esc(c.q)}</p><p class="a">${esc(c.a)}</p><div class="dc-tools"><button type="button" data-move="-1" aria-label="往前放">↑</button><button type="button" data-move="1" aria-label="往后放">↓</button><button type="button" data-remove aria-label="拿出篮子">×</button></div></article>`).join('')}</div>
   ${basket.length?`<div class="row center"><button type="button" class="pill" data-nv="join">把这些串起来</button></div>`:`<div class="row center"><button type="button" class="pill" data-nv="fish">去捞一张卡</button></div>`}
   ${state.joined?`<textarea id="joined" class="draft-box">${esc(state.joined)}</textarea><div class="row center"><button type="button" class="quiet" data-nv="to-letter">写成一封推荐信</button><button type="button" class="pill" data-nv="to-free-joined">写成一段自由讨论</button></div>`:''}`;
   wireDesk();
  }
 }
 function duckSvg(){return '<svg viewBox="0 0 40 34" aria-hidden="true"><ellipse cx="18" cy="24" rx="14" ry="8"/><circle cx="27" cy="13" r="7"/><path class="bk" d="M33 13q6 1 1 3z"/></svg>';}
 function stitch(){return state.stepAnswers.map((a,k)=>a.trim()?STITCH[k]+a.trim():'').filter(Boolean).join('\n\n');}
 function fishOne(){
  const pool=state.theme==='all'?Object.keys(DECK).filter(k=>k!=='light'):[state.theme];
  const light=state.theme==='all'&&Math.random()<.16;const theme=light?'light':pick(pool);
  let q=pick(DECK[theme]);if(state.current&&q===state.current.q)q=DECK[theme].find(x=>x!==q)||q;
  const pond=$('#fish-pond');pond?.classList.add('diving');state.current=null;
  setTimeout(()=>{state.current={theme,q,a:''};renderNowhere();const f=$('.fished');if(f&&!reduced()){f.classList.add('flip-in');}$('#fish-answer')?.focus({preventScroll:true});},reduced()?0:950);
 }
 function wireDesk(){
  let dragId=null;
  $$('.desk-card').forEach(card=>{
   card.addEventListener('dragstart',e=>{dragId=card.dataset.card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
   card.addEventListener('dragend',()=>{card.classList.remove('dragging');});
   card.addEventListener('dragover',e=>{e.preventDefault();});
   card.addEventListener('drop',e=>{e.preventDefault();const from=basket.findIndex(c=>String(c.id)===dragId),to=basket.findIndex(c=>String(c.id)===card.dataset.card);if(from<0||to<0||from===to)return;const [m]=basket.splice(from,1);basket.splice(to,0,m);saveBasket();renderNowhere();});
   card.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const i=basket.findIndex(c=>String(c.id)===card.dataset.card),j=i+Number(b.dataset.move);if(j<0||j>=basket.length)return;[basket[i],basket[j]]=[basket[j],basket[i]];saveBasket();renderNowhere();});
   card.querySelector('[data-remove]').onclick=()=>{basket=basket.filter(c=>String(c.id)!==card.dataset.card);saveBasket();renderNowhere();};
  });
 }
 host.addEventListener('click',e=>{
  const th=e.target.closest('[data-theme]');if(th){state.theme=th.dataset.theme;state.current=null;renderNowhere();return;}
  const tg=e.target.closest('[data-thing]');if(tg){state.thing=Number(tg.dataset.thing);renderNowhere();$('#thing-answer')?.focus({preventScroll:true});return;}
  if(e.target.closest('#pond-duck')){fishOne();return;}
  const b=e.target.closest('[data-nv]');if(!b)return;const a=b.dataset.nv;
  if(['home','fish','steps','object','basket'].includes(a)){state.view=a;if(a==='steps'&&state.stepIndex>=STEPS.length){}renderNowhere();host.scrollIntoView?.({block:'nearest'});return;}
  if(a==='clear'){basket=[];saveBasket();state.joined='';renderNowhere();return;}
  if(a==='refish'){fishOne();return;}
  if(a==='keep'){const v=$('#fish-answer').value.trim();if(!v){toast('写一两句就够了，再收进篮子。');return;}addCard({theme:state.current.theme,q:state.current.q,a:v});toast('收进卡片篮了。');state.current=null;renderNowhere();return;}
  if(a==='step-next'||a==='step-skip'){if(a==='step-next')state.stepAnswers[state.stepIndex]=$('#step-answer').value;else state.stepAnswers[state.stepIndex]='';state.stepIndex++;renderNowhere();$('#step-answer')?.focus({preventScroll:true});return;}
  if(a==='restart'){state.stepIndex=0;state.stepAnswers=['','','','',''];renderNowhere();return;}
  if(a==='steps-basket'){state.stepAnswers.forEach((v,k)=>{if(v.trim())addCard({theme:'step',q:STEPS[k][1],a:v.trim()});});toast('五个回答都放进卡片篮了。');state.view='basket';renderNowhere();return;}
  if(a==='to-free'){drafts.free.body=$('#step-draft').value;setCompose('free');toast('草稿带到了“自由讨论”，接着写吧。');return;}
  if(a==='thing-other'){state.thing=null;renderNowhere();return;}
  if(a==='thing-keep'){const v=$('#thing-answer').value.trim();if(!v){toast('写一两句就够了，再收进篮子。');return;}const t=THINGS[state.thing];addCard({theme:'thing',q:`${t[0]} ${t[2].join(' ')}`,a:v});toast('收进卡片篮了。');state.thing=null;renderNowhere();return;}
  if(a==='join'){state.joined=basket.map(c=>c.a).join('\n\n');renderNowhere();$('#joined')?.focus({preventScroll:true});return;}
  if(a==='to-letter'||a==='to-free-joined'){const text=$('#joined').value;const kind=a==='to-letter'?'letter':'free';drafts[kind].body=kind==='letter'?`亲爱的下一位读信人：\n\n${text}`:text;setCompose(kind);toast(kind==='letter'?'已经铺在信纸上了。':'已经带进“自由讨论”。');return;}
 });
 host.addEventListener('input',e=>{if(e.target.id==='fish-answer'&&state.current)state.current.a=e.target.value;if(e.target.id==='step-answer')state.stepAnswers[state.stepIndex]=e.target.value;if(e.target.id==='joined')state.joined=e.target.value;});

 function tickClock(){const d=new Date();const p=n=>String(n).padStart(2,'0');$('#clock').innerHTML=`${p(d.getHours())}:${p(d.getMinutes())}<br>${p(d.getMonth()+1)}/${p(d.getDate())}/${d.getFullYear()}`;}
 tickClock();setInterval(tickClock,15000);
 return {
  enter(){titlePh=pick(LETTER_TITLES);bodyPh=pick(LETTER_OPENERS);freePh=pick(FREE_PROMPTS);render();rotatePlaceholders();clearTimeout(yawnTimer);yawnTimer=setTimeout(yawn,15000);},
  leave(){clearInterval(phTimer);clearTimeout(idleTimer);clearTimeout(yawnTimer);},
  open(kind,view){setCompose(kind,{view});}
 };
}
