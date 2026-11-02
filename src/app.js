import {createWorld} from './scene.js';
import {extraPosts} from './demo-posts.js';
import {installEdgeReturns} from './edge-return.js';
import {demoComments,demoLetters} from './profile-demo.js';
import {LEFT_HAND_MASK} from './embedded.js';
import {DUCK_COLORS} from './river3d.js';
import {quack,splash,duckIcon} from './fx.js';
import {initWriting} from './writing.js';
import {setTags,startMotion,stanceReportHTML,stanceReportDetail,pawsHTML,WHISPERS,STANCE_NAME} from './profile.js';
// Ex not X prototype: 双手之间 (menu), 漂流论坛 (river), 我的 (profile), 写作 (write).
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={screen:'menu',stance:null,feed:'prompt',profileTab:'comments',visitor:null,lefty:false,current:null};
const seeds=[
 {id:1,author:'岸边的阿池',stance:'green',type:'prompt',likes:64,title:'分享密码之前，先聊聊为什么想要。',body:'我愿意分享，但希望这个动作来自自愿。\n\n对我来说，密码是一个很小的入口，信任才是更大的话题。我们可以一起讨论：为什么会感到不安？比起随时检查，我更想知道你在担心什么。',tags:['ENFP','慢慢建立信任','边界探索中']},
 {id:2,author:'一颗慢桃',stance:'red',type:'prompt',likes:38,title:'有些边界，也可以是爱的形状。',body:'亲密关系不需要以放弃隐私来证明。\n\n我会告诉你我的日常，也会认真听你的担心。但聊天里还有朋友对我的信任，那些话并不完全属于我。保留一点空间，让相处也能呼吸。',tags:['INFJ','喜欢独处','坦诚沟通']},
 {id:3,author:'蓝色留白',stance:'blue',type:'prompt',likes:22,title:'先听听对方，再决定答案。',body:'我们也许会在不同阶段给出不同答案。\n\n有些人把分享当作靠近，有些人把空间当作尊重。我想先听一听彼此的理由，再一起决定适合我们的距离。',tags:['INFP','保持好奇','慢热']},
 {id:4,author:'野生薄荷',stance:'green',type:'prompt',likes:81,title:'我们分享了密码，却从来没用过。',body:'我和伴侣的密码都知道，但几乎没登录过对方的账号。\n\n分享对我们而言是方便，不是检查。这个默契成立的前提，是我们都可以随时说：这件事我想留给自己。',tags:['一起成长','愿意沟通']},
 {id:5,author:'向晚',stance:'red',type:'prompt',likes:17,title:'比起知道密码，我更想被认真回应。',body:'以前我以为，知道更多就能更安心。后来发现让我踏实的，是对方愿意解释一次迟到，愿意接住一次不安。\n\n我想要的其实是回应。',tags:['学着表达','不着急']},
 {id:6,author:'小河没有答案',stance:'blue',type:'prompt',likes:45,title:'可以分享，也可以随时收回。',body:'我的选择是先把规则说清楚。知道密码，不代表拥有随时查看的许可。\n\n我们都可以改变主意。给彼此留一个说不的出口，才让我愿意靠近。',tags:['边界感','日常观察']},
 {id:7,author:'未寄出的信',stance:'letter',type:'letter',likes:42,title:'推荐给下一位：他会记得你不吃香菜。',body:'亲爱的下一位读信人：\n\n他不太会说漂亮的话，但是会记得很多小事。你随口说过的歌，他会默默加进歌单。下雨时，他会多带一把伞。\n\n我们因为生活的方向不同而分开。我依然感谢那些被认真对待的日子。希望你们能好好说话，也好好照顾自己。\n\n一个曾经同行的人',tags:['推荐信','认真告别']},
 {id:8,author:'普通星期三',stance:'free',type:'free',likes:29,title:'我们第一次没有争输赢，而是一起散步。',body:'相处第二年，我们尝试了一个很小的改变：争执没有解决的时候，先出去散步二十分钟。\n\n走到河边时，我们都安静了一点。我终于问出来：刚才那句话，为什么会让你难过？\n\n没有立刻找到答案，但是我们开始听见对方。',tags:['恋爱经历','积极沟通']},
 {id:9,author:'南风来信',stance:'letter',type:'letter',likes:61,title:'愿你遇见她的时候，也认真听她说话。',body:'亲爱的下一位读信人：\n\n她喜欢把窗户打开，喜欢冬天的太阳，喜欢讲到一半被人记住的小故事。\n\n如果有一天她沉默了，可以问问她是不是累了。她有时很会照顾别人，却忘了替自己提要求。\n\n愿你们有很多平凡而温柔的星期天。',tags:['推荐信','温柔的人']},
 {id:10,author:'两把雨伞',stance:'free',type:'free',likes:15,title:'两个人，也可以有各自的周末。',body:'以前我总希望每个周末都在一起。现在我们会留一天给自己，见朋友、看展，或者什么也不做。\n\n晚上再讲讲各自遇到的事情，反而多了很多好奇。',tags:['相处方式','独立空间']},
 {id:11,author:'岛上邮差',stance:'letter',type:'letter',likes:33,title:'这封信，写给一起长大的那几年。',body:'我们从学生时代一路走来，见过彼此最不成熟的样子。\n\n分开不意味着那段时间失去了价值。我记得被支持过的勇气，也记得我们一起学会道歉。\n\n谢谢那几年的认真。',tags:['推荐信','成长']},
 {id:12,author:'晴天再见',stance:'free',type:'free',likes:48,title:'道歉之后，改变可以从一件小事开始。',body:'我们约好，忙的时候提前说一声。\n\n很小的一件事，却减少了很多猜测。我开始觉得，关系里的改变未必需要一个很大的承诺。可以只是今天记得做到。',tags:['生活小事','感情投入']}
];
const GENDERS=['m','f',null];
const posts=[...seeds,...extraPosts].map(p=>({...p,replies:[],liked:false,gender:p.gender===undefined?GENDERS[(p.id*7)%3]:p.gender}));
const myPosts=[],myComments=demoComments.map(c=>({...c}));
const hidden=new Set(),lessOf=new Set(),shore=[];
const me={name:'Who knows',星座:'天秤座',MBTI:'INFP',地区:'上海',年龄:'26',性别:'不展示',爱好:'散步，拍照，冰美式',traits:['感受细腻','很在意回应','慢慢建立信任']};
const PAWS=[
 {q:'恋爱中，需要分享所有社交密码吗？',stance:'blue',date:'今天',same:24},
 {q:'多久不回消息，算冷淡？',stance:'red',date:'10月30日',same:41},
 {q:'前任送的礼物，应该扔掉吗？',stance:'blue',date:'10月27日',same:35},
 {q:'吵架之后，应该谁先开口？',stance:'green',date:'10月24日',same:52},
 {q:'恋爱需要报备行程吗？',stance:'red',date:'10月21日',same:38},
 {q:'可以和异性好友单独吃饭吗？',stance:'green',date:'10月18日',same:63},
 {q:'纪念日一定要过吗？',stance:'blue',date:'10月15日',same:29}
];
const votes={green:1284,blue:563,red:911};
let world=null,writing=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kindOf=p=>p.type==='prompt'?p.stance:p.type;

// ---------- toast with an optional action ----------
let toastTimer;
function toast(message,{action,onAction,duration=3400}={}){
 const t=$('#toast'),btn=$('#toast-action');$('#toast-text').textContent=message;
 btn.hidden=!action;btn.textContent=action||'';btn.onclick=()=>{t.classList.remove('visible');onAction?.();};
 t.classList.toggle('has-action',!!action);t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),action?6000:duration);
}

// ---------- navigation ----------
const seenGuide={};
function go(screen,{visitor=null}={}){
 if(screen==='prompt'){location.href='index.html';return;}
 if(!['menu','river','profile','write'].includes(screen))return;
 if(state.screen==='write'&&screen!=='write')writing?.leave();
 state.screen=screen;state.visitor=screen==='profile'?visitor:null;document.body.dataset.screen=screen;
 $$('main>.screen').forEach(s=>s.hidden=s.id!==screen+'-screen');
 world?.setScreen(screen);
 if(screen==='river')renderRiver();
 if(screen==='profile'){state.profileTab='comments';renderProfile();$('#profile-scroll').scrollTop=0;}
 startMotion(screen==='profile');
 if(screen==='write')writing.enter();
 if((screen==='menu'||screen==='river')&&!seenGuide[screen])setTimeout(()=>{if(state.screen===screen&&!seenGuide[screen]&&!dialog.open)showGuide(screen);},screen==='river'?600:900);
 history.replaceState(null,'','#'+screen);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!b.closest('dialog'))go(b.dataset.go);});

// ---------- guides ----------
const GUIDES={
 menu:{title:'双手之间',rows:[['swipe-left','← 左滑','Who knows：看看你留下的痕迹——漂出去的话、推荐信、举过的鸭掌'],['swipe-right','右滑 →','写点什么：一封推荐信、一段自由讨论，或者从“无从讲起”开始'],['swipe-up','↑ 上滑','回到漂流论坛，继续看别人怎么说']]},
 river:{title:'漂流论坛',rows:[['flick-up','轻轻上滑','刷下一批今日漂流的小鸭'],['big-up','大幅上滑','超过半屏：转到自由论坛'],['flick-down','轻轻下滑','倒回刚刚漂过去的帖子'],['big-down','大幅下滑','超过半屏：回到双手之间'],['drag-duck','拎起小鸭','拖到左右岸边，帖子就留在岸上不会漂走']]}
};
function showGuide(kind){
 seenGuide[kind]=true;const g=GUIDES[kind],layer=$('#guide-layer');
 layer.innerHTML=`<div class="guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title"><p class="section-intro">怎么玩</p><h2 id="guide-title">${g.title}</h2><ul>${g.rows.map(([k,a,b])=>`<li><span class="gesture g-${k}" aria-hidden="true"><i></i></span><b>${a}</b><span>${b}</span></li>`).join('')}</ul><button type="button" class="pill" id="guide-ok">知道了</button></div>`;
 layer.hidden=false;layer.dataset.kind=kind;const close=()=>{layer.hidden=true;layer.innerHTML='';};
 $('#guide-ok').onclick=close;$('#guide-ok').focus({preventScroll:true});layer.onclick=e=>{if(e.target===layer)close();};
}
$$('[data-guide]').forEach(b=>b.onclick=()=>showGuide(b.dataset.guide));
const guideOpen=()=>!$('#guide-layer').hidden;

// ---------- river ----------
function feedPosts(){
 return posts.filter(p=>(state.feed==='prompt'?p.type==='prompt':p.type!=='prompt')&&!hidden.has(p.id)&&!shore.includes(p)&&!(lessOf.has(kindOf(p))&&p.id%2===0));
}
function renderVotes(){
 const total=votes.green+votes.blue+votes.red,pct=k=>Math.round(votes[k]/total*100);
 $('#vote-line').innerHTML=`<span class="live" aria-hidden="true"></span>${['green','blue','red'].map(k=>`<span class="v ${k}"><i></i>${STANCE_NAME[k]} ${pct(k)}%</span>`).join('<span class="sep">·</span>')}<span class="vote-total">${total.toLocaleString('zh-CN')} 人</span><span class="vote-bar" aria-hidden="true">${['green','blue','red'].map(k=>`<b class="${k}" style="flex:${votes[k]}"></b>`).join('')}</span>`;
}
setInterval(()=>{if(state.screen!=='river'||state.feed!=='prompt')return;const r=Math.random();votes[r<.47?'green':r<.67?'blue':'red']+=1+Math.floor(Math.random()*3);renderVotes();},2400);
function renderRiver(){
 const free=state.feed==='free';
 $('#river-kind').textContent=free?'自由论坛':'今日漂流';
 $('#river-title').textContent=free?'每一段关系，都有自己的回声。':'恋爱中，需要分享所有社交密码吗？';
 if(free)$('#vote-line').innerHTML='<span class="free-note">推荐信与恋爱经历，在这里慢慢漂</span>';else renderVotes();
 $$('[data-feed]').forEach(b=>{const on=b.dataset.feed===state.feed;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 const list=feedPosts();world?.river.setPosts(list);labelEls.forEach(el=>el.remove());labelEls.clear();
 $('#reading-feed').innerHTML=list.map(p=>`<article class="reading-row"><button class="reading-open" data-read="${p.id}"><h2>${esc(p.title)}</h2><p>${esc(p.body.slice(0,80))}…</p><small>${esc(p.author)} · +1鸭 ${p.likes}</small></button></article>`).join('');
 renderShelf();
}
$('#reading-feed').addEventListener('click',e=>{const b=e.target.closest('[data-read]');if(b)openPost(posts.find(p=>p.id==b.dataset.read));});
function setFeed(f){if(state.feed===f)return;state.feed=f;renderRiver();if(!reduced){$('#world').animate([{filter:'blur(8px) brightness(1.2)',opacity:.4},{filter:'none',opacity:1}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});}}
$$('[data-feed]').forEach(b=>b.onclick=()=>setFeed(b.dataset.feed));
const labelEls=new Map();
function updateLabels(items){
 if(state.screen!=='river')return;
 const used=[],W=innerWidth<=760?150:190,H=58,shown=new Set();
 for(const it of items){
  if(shown.size>=(innerWidth<=760?4:6))break;
  const rect={l:it.x-W/2,r:it.x+W/2,t:it.y-H,b:it.y};
  if(rect.t<150||rect.l<8||rect.r>innerWidth-8)continue;
  if(used.some(u=>rect.l<u.r+6&&rect.r>u.l-6&&rect.t<u.b+4&&rect.b>u.t-4))continue;
  used.push(rect);shown.add(it.post.id);
  let el=labelEls.get(it.post.id);
  if(!el){el=document.createElement('div');el.className='duck-label';el.innerHTML=`<button type="button" class="post-preview" style="--duck:${DUCK_COLORS[kindOf(it.post)]||DUCK_COLORS.free}">${esc(it.post.title)}</button><span class="post-person">${esc(it.post.author)} · ${duckIcon()} ${it.post.likes}</span>`;el.querySelector('button').onclick=()=>openPost(it.post);$('#duck-labels').append(el);labelEls.set(it.post.id,el);}
  el.style.transform=`translate3d(${it.x}px,${it.y}px,0) translate(-50%,-100%) scale(${(.86+.14*Math.min(1,it.near)).toFixed(3)})`;el.style.opacity=String(Math.min(1,.35+it.near));el.style.display='block';
 }
 labelEls.forEach((el,id)=>{if(!shown.has(id))el.style.display='none';});
}
function pinToShore(p){if(!shore.includes(p))shore.unshift(p);renderRiver();toast('小鸭被拎到岸边了，随时可以回来看。');}
function renderShelf(){
 $('#shelf').hidden=!shore.length;
 $('#shelf-list').innerHTML=shore.map(p=>`<li><button type="button" class="shelf-open" data-shelf="${p.id}">${duckIcon(DUCK_COLORS[kindOf(p)]||DUCK_COLORS.free)}<span>${esc(p.title)}</span></button><button type="button" class="shelf-back" data-unshelf="${p.id}" aria-label="放回水里">↺</button></li>`).join('');
}
$('#shelf').addEventListener('click',e=>{const o=e.target.closest('[data-shelf]'),u=e.target.closest('[data-unshelf]');if(o)openPost(posts.find(p=>p.id==o.dataset.shelf));if(u){const i=shore.findIndex(p=>p.id==u.dataset.unshelf);if(i>=0)shore.splice(i,1);renderRiver();}});
let chipTimer;
function chip(text){const c=$('#gesture-chip');c.textContent=text;c.classList.remove('show');void c.offsetWidth;c.classList.add('show');clearTimeout(chipTimer);chipTimer=setTimeout(()=>c.classList.remove('show'),1300);}
function riverGesture(dir,big){
 if(dir==='up'&&!big){world?.river.step(3);chip('↑ 下一批小鸭漂过来了');}
 else if(dir==='up'&&big){if(state.feed==='prompt'){setFeed('free');chip('⇡ 自由论坛');}else{world?.river.step(5);chip('已经在自由论坛');}}
 else if(dir==='down'&&!big){world?.river.step(-3);chip('↓ 倒回刚刚漂过的');}
 else if(dir==='down'&&big)go('menu');
}

// ---------- post card ----------
const dialog=$('#detail-dialog');
const visitLabel=p=>p.gender==='m'?'看看这位bro':p.gender==='f'?'看看这位sis':'看看这只鸭';
const REPLY_PH=['认真说，也认真听。','轻轻说，水会带过去的。','想说点什么？鸭子们在听。'];
function openPost(p){
 if(!p)return;state.current=p;dialog.classList.remove('washed');closeMore();
 const meta=p.type==='letter'?'一封推荐信':p.type==='prompt'?`今日漂流 · ${STANCE_NAME[p.stance]}`:'自由讨论';
 $('#detail-content').innerHTML=`<p class="post-meta"><span class="meta-dot" style="background:${DUCK_COLORS[kindOf(p)]||DUCK_COLORS.free}"></span>${meta} / ${esc(p.author)} / 演示内容</p><h2>${esc(p.title)}</h2><div class="post-body ${p.type==='letter'?'letter-read':''}">${esc(p.body)}</div>
 <div class="detail-actions"><button type="button" class="quiet like-duck" id="like-post" aria-pressed="${p.liked}">${duckIcon(p.liked?'#ffd447':'#fff3c4')}<span>+1鸭 ${p.likes}</span></button><button type="button" class="quiet" id="visit-author">${visitLabel(p)}</button>${shore.includes(p)?'':'<button type="button" class="quiet" id="pin-post">拎到岸边</button>'}</div>
 <div class="reply-form"><form id="reply-form"><label for="reply-text">顺水回一句</label><input id="reply-text" placeholder="${REPLY_PH[Math.floor(Math.random()*REPLY_PH.length)]}" required maxlength="200"><button class="pill" type="submit">漂过去</button></form><div id="replies">${p.replies.map(r=>'<p class="reply">你：'+esc(r)+'</p>').join('')}</div></div>`;
 $('#like-post').onclick=e=>{p.liked=!p.liked;p.likes+=p.liked?1:-1;const b=$('#like-post');b.innerHTML=`${duckIcon(p.liked?'#ffd447':'#fff3c4')}<span>+1鸭 ${p.likes}</span>`;b.setAttribute('aria-pressed',String(p.liked));if(p.liked){quack();splash(b);b.classList.remove('bounce');void b.offsetWidth;b.classList.add('bounce');}};
 $('#visit-author').onclick=()=>{dialog.close();go('profile',{visitor:p});};
 $('#pin-post')?.addEventListener('click',()=>{dialog.close();pinToShore(p);});
 $('#reply-form').onsubmit=e=>{e.preventDefault();const text=$('#reply-text').value.trim();if(!text)return;p.replies.push(text);myComments.unshift({body:text,topic:p.title});const row=document.createElement('p');row.className='reply';row.textContent='你：'+text;$('#replies').append(row);$('#reply-text').value='';toast('已经顺水漂过去了。');};
 if(!dialog.open)dialog.showModal();
}
function closeMore(){$('#more-menu').hidden=true;$('#more-btn').setAttribute('aria-expanded','false');}
$('#more-btn').onclick=()=>{const m=$('#more-menu');m.hidden=!m.hidden;$('#more-btn').setAttribute('aria-expanded',String(!m.hidden));if(!m.hidden)m.querySelector('button').focus();};
dialog.addEventListener('click',e=>{if(!e.target.closest('.more-wrap'))closeMore();});
$('.dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$$('[data-more]').forEach(b=>b.onclick=()=>{closeMore();const p=state.current;if(!p)return;b.dataset.more==='less'?lessLikeThis(p):showReport(p);});
function lessLikeThis(p){
 const k=kindOf(p);dialog.classList.add('washed');
 setTimeout(()=>{dialog.close();dialog.classList.remove('washed');hidden.add(p.id);lessOf.add(k);if(state.screen==='river')renderRiver();
  toast('已漂走，以后会少遇到这类内容',{action:'撤销',onAction:()=>{hidden.delete(p.id);lessOf.delete(k);if(state.screen==='river')renderRiver();toast('已撤销，它漂回来了。');}});},reduced?0:650);
}
const REASONS=['骚扰或人身攻击','歧视或仇恨言论','色情或低俗内容','广告或垃圾信息','涉及自伤或危险行为','泄露他人隐私','其他'];
function showReport(p){
 $('#detail-content').innerHTML=`<p class="post-meta">举报 / ${esc(p.title)}</p><h2>告诉我们发生了什么</h2><form id="report-form" class="report-form"><fieldset><legend class="sr-only">原因</legend>${REASONS.map((r,i)=>`<label class="reason"><input type="radio" name="reason" value="${r}" ${i===REASONS.length-1?'data-other="1"':''}><span>${r}${i===REASONS.length-1?'（可填写说明）':''}</span></label>`).join('')}</fieldset><textarea id="report-note" placeholder="可以写下具体情况（选填）" maxlength="300" hidden></textarea><button class="pill" type="submit" id="report-submit" disabled>提交举报</button></form>`;
 const f=$('#report-form');f.onchange=()=>{const v=f.querySelector('input:checked');$('#report-submit').disabled=!v;$('#report-note').hidden=!v?.dataset.other;};
 f.onsubmit=e=>{e.preventDefault();dialog.close();hidden.add(p.id);if(state.screen==='river')renderRiver();toast('已收到，我们会尽快处理。这条内容已为你隐藏。',{duration:4200});};
}

// ---------- profile ----------
function profileTags(){
 const v=state.visitor;
 if(!v)return [{k:'星座',v:me.星座},{k:'MBTI',v:me.MBTI},{k:'地区',v:me.地区},{k:'年龄',v:me.年龄},{k:'性别',v:me.性别},...me.爱好.split(/[，,、\s]+/).filter(Boolean).map(x=>({k:'爱好',v:x})),...me.traits.map(x=>({k:'',v:x}))];
 const sign=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'][v.id%12];
 return [{k:'星座',v:sign},{k:'性别',v:v.gender==='m'?'男':v.gender==='f'?'女':'不展示'},{k:'地区',v:['上海','杭州','成都','北京','广州','厦门'][v.id%6]},...v.tags.map(t=>({k:/^[EI][NS][TF][JP]$/.test(t)?'MBTI':'',v:t}))];
}
function visitorPaws(v){const s=v.type==='prompt'?v.stance:['green','blue','red'][v.id%3];return [{q:'恋爱中，需要分享所有社交密码吗？',stance:s,date:'今天',same:31},{q:'吵架之后，应该谁先开口？',stance:['blue','green','red'][v.id%3],date:'10月24日',same:44},{q:'纪念日一定要过吗？',stance:['red','blue','green'][v.id%3],date:'10月15日',same:27}];}
function myPaws(){return PAWS.map((p,i)=>i===0&&state.stance?{...p,stance:state.stance}:p);}
function renderProfile(){
 const v=state.visitor;
 $('#profile-name').textContent=v?v.author:me.name;
 $('#profile-whisper').textContent=WHISPERS[Math.floor(Math.random()*WHISPERS.length)];
 $('#edit-profile').hidden=!!v;
 setTags($('#tag-cylinder'),$('#ufo-lights'),profileTags());
 const paws=v?visitorPaws(v):myPaws();
 $('#stance-report').innerHTML=stanceReportHTML(paws).replace('我的立场报告',v?'TA 的立场报告':'我的立场报告');
 $('#report-more').onclick=()=>{$('#detail-content').innerHTML=stanceReportDetail(paws,v?v.author:me.name);if(!dialog.open)dialog.showModal();};
 $$('[data-profile]').forEach(b=>{const on=b.dataset.profile===state.profileTab;b.classList.toggle('selected',on);b.setAttribute('aria-selected',String(on));});
 const host=$('#profile-content');
 if(state.profileTab==='comments'){
  const rows=v?posts.filter(p=>p.author===v.author).map(p=>({body:p.body.split('\n')[0],topic:p.title})):myComments;
  host.innerHTML=rows.map(r=>`<article class="comment-row"><p>${esc(r.body)}</p><small>${esc(r.topic)} · 漂出去的话</small></article>`).join('')||'<p class="small-note">还没有漂出去的话。</p>';
 }else if(state.profileTab==='letters'){
  const letters=v?posts.filter(p=>p.author===v.author&&p.type==='letter'):[...myPosts.filter(p=>p.type==='letter'),...demoLetters];
  host.innerHTML=letters.length?'<div class="letters">'+letters.map(p=>`<button class="envelope" data-letter="${p.id}"><span class="seal">鸭</span><strong>${esc(p.title)}</strong><small>轻触火漆，展开信件</small></button>`).join('')+'</div>':'<p class="small-note">这只鸭还没有写过推荐信。</p>';
  $$('[data-letter]').forEach(b=>b.onclick=()=>{const p=posts.find(p=>p.id==b.dataset.letter)||demoLetters.find(p=>p.id==b.dataset.letter);if(!reduced)b.animate([{transform:'translateY(0)'},{transform:'translateY(-14px) rotateX(-10deg)',opacity:.4}],{duration:300});setTimeout(()=>openPost({replies:[],liked:false,likes:0,gender:null,...p}),250);});
 }else host.innerHTML=pawsHTML(paws);
}
$$('[data-profile]').forEach(b=>b.onclick=()=>{state.profileTab=b.dataset.profile;renderProfile();});
$('#edit-profile').onclick=()=>{
 const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
 $('#detail-content').innerHTML=`<p class="post-meta">编辑资料 / 仅保存在本次体验</p><h2>让 UFO 认识你</h2><form id="profile-form" class="profile-form">
 <label>星座<select name="星座">${signs.map(s=>`<option ${s===me.星座?'selected':''}>${s}</option>`).join('')}</select></label>
 <label>MBTI<input name="MBTI" value="${esc(me.MBTI)}" maxlength="4"></label>
 <label>地区<input name="地区" value="${esc(me.地区)}" maxlength="12"></label>
 <label>年龄<input name="年龄" value="${esc(me.年龄)}" inputmode="numeric" maxlength="3"></label>
 <label>性别<select name="性别">${['女','男','不展示'].map(s=>`<option ${s===me.性别?'selected':''}>${s}</option>`).join('')}</select></label>
 <label>爱好<input name="爱好" value="${esc(me.爱好)}" maxlength="40"></label>
 <label>惯用手<select name="hand"><option value="right">右手写字</option><option value="left" ${state.lefty?'selected':''}>左手写字</option></select></label>
 <button class="pill" type="submit">保存</button></form>`;
 $('#profile-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);for(const k of ['星座','MBTI','地区','年龄','性别','爱好'])me[k]=String(f.get(k)||'').trim()||me[k];setHanded(f.get('hand')==='left');dialog.close();renderProfile();toast('资料已更新，UFO 记住了。');};
 dialog.showModal();
};

// ---------- hands ----------
document.documentElement.style.setProperty('--hand-mask',`url("${LEFT_HAND_MASK}")`);
function setHanded(lefty){
 state.lefty=lefty;world?.setLefty(lefty);
 const left=$('#hand-art-left'),right=$('#hand-art-right'),lt=$('#left-hand-target'),rt=$('#right-hand-target');
 left.dataset.go=lefty?'write':'profile';right.dataset.go=lefty?'profile':'write';lt.dataset.go=left.dataset.go;rt.dataset.go=right.dataset.go;
 left.setAttribute('aria-label',lefty?'左手：打开文字创作':'左手：打开 Who knows 数字痕迹');right.setAttribute('aria-label',lefty?'右手：打开 Who knows 数字痕迹':'右手：打开文字创作');
 lt.innerHTML=`<span class="direction">←</span><strong>${lefty?'写点什么':'Who knows'}</strong><span>${lefty?'左滑，让文字成为你':'左滑，看看留下的痕迹'}</span>`;
 rt.innerHTML=`<span class="direction">→</span><strong>${lefty?'Who knows':'写点什么'}</strong><span>${lefty?'右滑，看看留下的痕迹':'右滑，让文字成为你'}</span>`;
 $('#profile-screen .edge-return').classList.toggle('right-edge',lefty);$('#profile-screen .edge-return').classList.toggle('mirrored',lefty);
 $('#write-screen .edge-return').classList.toggle('right-edge',!lefty);$('#write-screen .edge-return').classList.toggle('mirrored',lefty);
}
installEdgeReturns($$('.edge-return'),()=>go('menu'));

// ---------- gestures ----------
// A swipe longer than half the screen height counts as a big swipe (drag and wheel alike).
const BIG_SWIPE=.5;
let drag=null,suppressClick=false;
document.addEventListener('click',e=>{if(suppressClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
document.addEventListener('pointerdown',e=>{
 if(e.button!==0||guideOpen()||e.target.closest('dialog,input,textarea,select,.topbar,#reading-feed,.shelf,.river-foot,.help-dot,.duck-label,#toast'))return;
 if(state.screen==='river'){
  const duck=world?.river.pick(e.clientX,e.clientY);
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),duck,moved:false,lifting:false};return;
 }
 if(state.screen!=='menu')return;
 const isButton=e.target.closest('button');if(isButton&&!e.target.closest('.hand-target,.hand-art'))return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
});
document.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(Math.abs(dx)+Math.abs(dy)>9)drag.moved=true;
 if(state.screen==='river'&&drag.duck&&drag.moved){
  if(!drag.lifting){drag.lifting=true;world.river.startDrag(drag.duck,e.clientX,e.clientY);}
  const hot=world.river.moveDrag(e.clientX,e.clientY);document.body.classList.toggle('shore-hot',hot);document.body.classList.toggle('shore-hot-left',hot&&e.clientX<innerWidth/2);
 }
 if(state.screen==='menu'&&drag.moved){const vertical=Math.abs(dy)>Math.abs(dx);world?.setHandGesture(vertical?(dy<0?{kind:'paddle',dy:Math.min(-dy,180)}:null):{side:dx<0?'left':'right',dx:Math.max(-180,Math.min(180,dx)),dy});}
});
document.addEventListener('pointerup',e=>{
 if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,start=drag;drag=null;world?.setHandGesture(null);
 if(state.screen==='river'){
  if(start.lifting){document.body.classList.remove('shore-hot','shore-hot-left');const where=world.river.endDrag(e.clientX);if(where==='shore')pinToShore(start.duck.post);suppressClick=true;setTimeout(()=>suppressClick=false,400);return;}
  if(!start.moved){if(start.duck)openPost(start.duck.post);return;}
  suppressClick=true;setTimeout(()=>suppressClick=false,400);
  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>35){const big=Math.abs(dy)>innerHeight*BIG_SWIPE;riverGesture(dy<0?'up':'down',big);}
  return;
 }
 if(!start.moved)return;suppressClick=true;setTimeout(()=>{suppressClick=false},500);
 if(state.screen==='menu'){
  if(dy<-55&&Math.abs(dy)>Math.abs(dx))go('river');
  else if(dx<-55&&Math.abs(dx)>Math.abs(dy))go(state.lefty?'write':'profile');
  else if(dx>55&&Math.abs(dx)>Math.abs(dy))go(state.lefty?'profile':'write');
 }
});
document.addEventListener('pointercancel',()=>{if(drag?.lifting){world.river.endDrag(innerWidth/2);document.body.classList.remove('shore-hot','shore-hot-left');}drag=null;world?.setHandGesture(null);});
// Wheel / trackpad: a short burst is a light swipe, a long one is a big swipe.
let wheelAcc=0,wheelTimer=0,wheelFired=false,wheelLock=0;
document.addEventListener('wheel',e=>{
 if(guideOpen()||e.target.closest('dialog,.workspace,#reading-feed,.profile-scroll,.shelf'))return;
 if(state.screen==='menu'){e.preventDefault();if(e.deltaY>8&&performance.now()>wheelLock){wheelLock=performance.now()+700;go('river');}return;}
 if(state.screen!=='river')return;e.preventDefault();
 wheelAcc+=e.deltaY;clearTimeout(wheelTimer);
 if(!wheelFired&&Math.abs(wheelAcc)>innerHeight*BIG_SWIPE){wheelFired=true;riverGesture(wheelAcc>0?'up':'down',true);}
 wheelTimer=setTimeout(()=>{if(!wheelFired&&Math.abs(wheelAcc)>30)riverGesture(wheelAcc>0?'up':'down',false);wheelAcc=0;wheelFired=false;},170);
},{passive:false});
document.addEventListener('keydown',e=>{
 if(e.target.closest('input,textarea,select,[contenteditable]')||$('dialog[open]'))return;
 if(guideOpen()){if(e.key==='Escape'){$('#guide-layer').hidden=true;}return;}
 if(state.screen==='menu'){if(e.key==='ArrowLeft'){e.preventDefault();go(state.lefty?'write':'profile');}if(e.key==='ArrowRight'){e.preventDefault();go(state.lefty?'profile':'write');}if(e.key==='ArrowUp'){e.preventDefault();go('river');}}
 else if(state.screen==='river'){const m={ArrowDown:['up',false],PageDown:['up',true],ArrowUp:['down',false],PageUp:['down',true]}[e.key];if(m){e.preventDefault();riverGesture(...m);}if(e.key==='Escape')go('menu');}
 else if(e.key==='Escape')go('menu');
});

// ---------- writing ----------
writing=initWriting({toast,publish({type,title,body}){
 const p={id:Date.now(),author:'漂流中的你',type,stance:type,likes:0,title,body,tags:['本次体验的新内容'],replies:[],liked:false,gender:null};
 posts.unshift(p);myPosts.unshift(p);state.feed='free';go('river');world?.river.bringNear(p.id);
 const msg=document.createElement('div');msg.className='departed';msg.textContent='它已经出发了。也许某一天，会有人读到。';document.body.append(msg);setTimeout(()=>msg.classList.add('out'),3600);setTimeout(()=>msg.remove(),4400);
}});

// ---------- boot ----------
try{world=createWorld($('#world'),{onDragState(v){document.body.classList.toggle('lifting-duck',v);}});world.river.onFrame(updateLabels);}
catch(err){console.error(err);document.body.dataset.webgl='unavailable';toast('浏览器未启用 WebGL，可以在列表里阅读帖子。');}
const entryStance=new URLSearchParams(location.search).get('stance');
if(['green','blue','red'].includes(entryStance)){state.stance=entryStance;votes[entryStance]++;$('#stance-note').textContent=`你举起了「${STANCE_NAME[entryStance]}」的鸭掌。小河里，还有不同的声音。`;const url=new URL(location.href);url.searchParams.delete('stance');history.replaceState(null,'',url);}
setHanded(false);
go(location.hash.slice(1)||'menu');
if(entryStance)setTimeout(()=>chip(`你举了「${STANCE_NAME[entryStance]}」 · 看看大家怎么说`),900);
