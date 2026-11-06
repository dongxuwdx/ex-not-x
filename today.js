(function(){
 const {store,esc,toast,hugHTML,L,T,pick}=EX,D=EX_DATA,P=D.prompt;
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const voteKey='vote-'+P.no;
 let vote=store.get(voteKey,null);
 const mine=store.get('comments-'+P.no,[]);
 const replies=store.get('replies-'+P.no,{});
 let filter='all',showAll=false;
 const BASE_COUNT=86;

 /* ---- vote ---- */
 const renderVote=()=>{
  const a=P.votes.a+(vote==='a'),b=P.votes.b+(vote==='b'),total=a+b;
  $$('[data-vote]').forEach(btn=>{const on=btn.dataset.vote===vote;btn.setAttribute('aria-pressed',on);
   const V=btn.dataset.vote.toUpperCase();btn.innerHTML=on?L(`已投 ${V}`,`Voted ${V}`):L(`投 ${V}`,`Vote ${V}`)});
  document.querySelector('.vote').classList.toggle('voted',!!vote);
  if(vote){
   const pa=Math.round(a/total*100),pb=100-pa;
   $('[data-pct="a"]').textContent=pa+'%';$('[data-pct="b"]').textContent=pb+'%';
   requestAnimationFrame(()=>{$('[data-bar="a"]').style.width=pa+'%';$('[data-bar="b"]').style.width=pb+'%'});
   const V=vote.toUpperCase();$('#vote-note').innerHTML=L(`你站在 ${V} · ${total} 人参与 · 再点一次可以改票`,`You voted ${V} · ${total} joined · Tap again to change`);
  }else{
   $('#vote-note').innerHTML=L(`投票后查看结果 · ${total} 人参与`,`Vote to see results · ${total} joined`);
  }
 };
 $$('[data-vote]').forEach(btn=>btn.addEventListener('click',()=>{
  const v=btn.dataset.vote;vote=vote===v?null:v;store.set(voteKey,vote);renderVote();
  if(vote)toast(vote==='a'?T('已投 A · 值得 — 下面说说你的看法','Voted A · Worth it — share your take below'):T('已投 B · 不值得 — 下面说说你的看法','Voted B · Not worth it — share your take below'));
 }));
 renderVote();

 /* ---- comments ---- */
 const sideChip=s=>s==='a'?`<span class="chip blue">A ${L('值得','Worth it')}</span>`:s==='b'?`<span class="chip black">B ${L('不值得','Not worth it')}</span>`:'';
 const all=()=>[...mine,...D.comments];
 const render=()=>{
  const list=all().filter(c=>filter==='all'||c.side===filter);
  const shown=showAll?list:list.slice(0,4+mine.length);
  const count=BASE_COUNT+mine.length;
  $$('[data-count]').forEach(el=>el.textContent=count);
  $('#see-all').hidden=showAll||list.length<=shown.length;
  $('#comments').innerHTML=shown.length?shown.map(c=>`<li class="comment${c.mine?' mine':''}" data-id="${c.id}">
   <span class="av" aria-hidden="true">${esc(c.av)}</span>
   <div>
    <div class="c-meta"><b>${esc(c.name)}</b><span>${esc(c.city)}</span>${sideChip(c.side)}<span>${esc(c.t)}</span></div>
    <p class="c-text" id="t-${c.id}"${c.alt?` data-alt="${esc(c.alt)}"`:''}>${esc(c.text)}</p>
    <div class="c-actions">
     ${c.alt?`<button class="text-link" type="button" data-translate="t-${c.id}">${L('翻译','Translate')}</button>`:''}
     ${hugHTML(c.id,c.hug)}
     <button class="hug-btn reply" type="button" data-reply="${c.id}">${L('回复','Reply')}${(replies[c.id]||[]).length?' · '+replies[c.id].length:''}</button>
    </div>
    ${(replies[c.id]||[]).length?`<ul class="replies">${replies[c.id].map(r=>`<li><b>${esc(r.name)}</b>${esc(r.text)}</li>`).join('')}</ul>`:''}
   </div></li>`).join(''):`<li class="empty">${L('这一边还没有人说话。','No one here yet.')}</li>`;
 };
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));render()}));
 $('#see-all').addEventListener('click',()=>{showAll=true;render()});

 const ALIAS=pick(['匿名的海豚','匿名的柠檬','匿名的路灯','匿名的候鸟','匿名的月亮'],['Anonymous dolphin','Anonymous lemon','Anonymous streetlight','Anonymous swallow','Anonymous moon']);
 $('#composer').addEventListener('submit',e=>{
  e.preventDefault();const ta=$('#take'),text=ta.value.trim();
  if(!text){ta.focus();toast(T('写一句再发送','Write something first'));return}
  const anon=$('#anon').checked,name=anon?ALIAS[Math.floor(Math.random()*ALIAS.length)]:pick('我','Me');
  mine.unshift({id:'m'+Date.now(),mine:true,name,av:anon?pick('匿','A'):pick('我','M'),city:pick('这里','Here'),side:vote,t:pick('刚刚','now'),hug:0,text});
  store.set('comments-'+P.no,mine);ta.value='';
  if(filter!=='all'&&filter!==vote){filter='all';$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.filter==='all'))}
  render();$('#comments .comment')?.classList.add('fade-in');
  toast(vote?T('已发送','Posted'):T('已发送。投个票，大家能看到你站哪边','Posted. Vote so others can see your side'));
 });

 document.addEventListener('click',e=>{
  const r=e.target.closest('[data-reply]');if(!r)return;
  const host=r.closest('.comment > div');let box=host.querySelector('.reply-box');
  if(box){box.remove();return}
  box=document.createElement('form');box.className='reply-box';
  box.innerHTML=`<input aria-label="${T('回复','Reply')}" placeholder="${T('温柔一点地回复…','Reply kindly…')}" maxlength="300"><button class="btn solid" type="submit">${L('回复','Reply')}</button>`;
  host.append(box);box.querySelector('input').focus();
  box.addEventListener('submit',ev=>{ev.preventDefault();const v=box.querySelector('input').value.trim();if(!v)return;
   const id=r.dataset.reply;(replies[id]??=[]).push({name:pick('匿名的你','Anonymous you'),text:v});store.set('replies-'+P.no,replies);render()});
 });
 render();

 $('#subscribe').addEventListener('submit',e=>{e.preventDefault();e.target.reset();toast(T('订阅成功（演示）· 今晚 22:00 见','Subscribed (demo) · See you at 10pm'))});
})();
