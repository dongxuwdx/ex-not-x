(function(){
 const {store,esc,toast,hugHTML}=EX,D=EX_DATA;
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const mine=store.get('posts',[]);
 const threads=store.get('threads',{});
 let cat='all',sort='latest',q='';
 const catName=id=>{const c=D.categories.find(c=>c[0]===id);return c?`${c[1]} ${c[2]}`:''};
 const isZh=s=>/[一-鿿]/.test(s);

 $('#cats').innerHTML=D.categories.map(([id,zh,en])=>`<button type="button" data-cat="${id}" aria-pressed="${id==='all'}">${zh} ${en}</button>`).join('');
 $('#w-cat').innerHTML=D.categories.slice(1).map(([id,zh,en])=>`<option value="${id}">${zh} ${en}</option>`).join('');

 const render=()=>{
  let list=[...mine,...D.posts];
  if(cat!=='all')list=list.filter(p=>p.cat===cat);
  if(q){const k=q.toLowerCase();list=list.filter(p=>[p.title,p.body,p.altTitle,p.altBody,p.author,p.city].join(' ').toLowerCase().includes(k))}
  if(sort==='top')list.sort((a,b)=>b.hug+b.replies-(a.hug+a.replies));
  else if(sort==='support')list=list.filter(p=>p.support);
  else list.sort((a,b)=>a.h-b.h);
  $('[data-n]').textContent=list.length;
  $('#posts').innerHTML=list.length?list.map(p=>{
   const tr=p.altBody?`<button class="text-link" type="button" data-translate="b-${p.id}" data-pair="h-${p.id}">${p.lang==='zh'?'Translate to EN':'翻译成中文'}</button>`:'';
   const n=(threads[p.id]||[]).length;
   const acts=`<div class="acts">${tr}${hugHTML(p.id,p.hug)}<button class="rep" type="button" data-thread="${p.id}" aria-expanded="false">回复 Replies · ${p.replies+n}</button></div>`;
   const by=`<span class="byline"><b>${esc(p.author)}</b> · ${esc(p.city)} · ${p.h<1?'now':p.h+'h'}</span>`;
   return `<li class="post${p.photo?' has-photo':''}" id="${p.id}">
    ${p.photo?'<div class="photo thumb"><span class="tag">B&amp;W</span></div>':''}
    <div class="main">
     <div class="tags"><span class="cat">${catName(p.cat)}</span><span class="chip">${p.lang==='zh'?'中文':'EN'}</span>${p.support?'<span class="chip blue">求安慰 Needs support</span>':''}${p.school?'<span class="chip">仅同校 My school</span>':''}</div>
     <h2 id="h-${p.id}"${p.altTitle?` data-alt="${esc(p.altTitle)}"`:''}>${esc(p.title)}</h2>
     <p class="body" id="b-${p.id}"${p.altBody?` data-alt="${esc(p.altBody)}"`:''}>${esc(p.body)}</p>
     <div class="foot">${by}${acts}</div>
    </div>
   </li>`}).join(''):`<li class="none">没有找到相关的帖子。<span class="en">No posts match.</span></li>`;
 };

 /* translating a post swaps its title too */
 document.addEventListener('click',e=>{const b=e.target.closest('[data-pair]');if(!b)return;const h=document.getElementById(b.dataset.pair);if(!h||!h.dataset.alt)return;
  if(h.dataset.orig==null)h.dataset.orig=h.innerHTML;h.innerHTML=h.classList.toggle('translated')?esc(h.dataset.alt):h.dataset.orig},true);

 $('#cats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;cat=b.dataset.cat;$$('[data-cat]').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
 $$('[data-sort]').forEach(b=>b.addEventListener('click',()=>{sort=b.dataset.sort;$$('[data-sort]').forEach(x=>x.setAttribute('aria-pressed',x===b));render()}));
 let qt;$('#q').addEventListener('input',e=>{clearTimeout(qt);qt=setTimeout(()=>{q=e.target.value.trim();render()},120)});

 /* reply thread */
 const DEMO_REPLIES=[{name:'匿名的灯塔',text:'抱抱你。你不是一个人。'},{name:'Ari',text:'Been there. It gets lighter, I promise.'}];
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-thread]');if(!b)return;
  const post=b.closest('.post'),open=post.querySelector('.thread');
  if(open){open.remove();b.setAttribute('aria-expanded','false');return}
  b.setAttribute('aria-expanded','true');
  const id=b.dataset.thread,p=[...mine,...D.posts].find(x=>x.id===id);
  const t=document.createElement('div');t.className='thread fade-in';
  const draw=()=>{const list=[...(p.mine?[]:DEMO_REPLIES),...(threads[id]||[])];
   t.innerHTML=`${p.support?'<p class="comfort-note">楼主只想被安慰，请温柔一点，不急着给建议。 · Comfort, not advice.</p>':''}
   <ul>${list.map(r=>`<li><b>${esc(r.name)}</b>${esc(r.text)}</li>`).join('')||'<li style="color:var(--muted)">还没有回复 · No replies yet</li>'}</ul>
   <form><input aria-label="回复" placeholder="${p.support?'说一句安慰的话… Say something kind…':'写下你的回复… Write a reply…'}" maxlength="500"><button class="btn solid" type="submit">回复 Reply</button></form>`;
   t.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();const v=ev.target.querySelector('input').value.trim();if(!v)return;
    (threads[id]??=[]).push({name:'匿名的你',text:v});store.set('threads',threads);draw();
    b.textContent=`回复 Replies · ${p.replies+threads[id].length}`;t.querySelector('input').focus()})};
  draw();post.append(t);t.querySelector('input').focus();
 });

 /* write */
 const sw=$('#w-anon');
 sw.addEventListener('click',()=>{const on=sw.getAttribute('aria-checked')!=='true';sw.setAttribute('aria-checked',on);sw.textContent=on?'开 ON':'关 OFF'});
 const ALIAS=['匿名的候鸟','匿名的路灯','匿名的月亮','匿名的柠檬','匿名的海豚'];
 $('#write').addEventListener('submit',e=>{
  e.preventDefault();const title=$('#w-title').value.trim(),body=$('#w-body').value.trim();
  if(!title||!body){$('#w-err').textContent=!title?'请写一个标题 · Add a title':'请写一点正文 · Add a few words';(!title?$('#w-title'):$('#w-body')).focus();return}
  $('#w-err').textContent='';
  const anon=sw.getAttribute('aria-checked')==='true';
  const p={id:'u'+Date.now(),mine:true,cat:$('#w-cat').value,lang:isZh(title+body)?'zh':'en',support:$('#w-comfort').checked,
   school:document.querySelector('[name=vis]:checked').value==='school',author:anon?ALIAS[Math.floor(Math.random()*ALIAS.length)]:'我 Me',city:'Here',h:0,hug:0,replies:0,title,body};
  mine.unshift(p);store.set('posts',mine);e.target.reset();sw.setAttribute('aria-checked','true');sw.textContent='开 ON';
  cat='all';sort='latest';q='';$('#q').value='';$$('[data-cat]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.cat==='all'));$$('[data-sort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.sort==='latest'));
  render();const el=document.getElementById(p.id);el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600);
  toast('已发布 · Published');
 });

 render();
 if(location.hash){const el=document.getElementById(location.hash.slice(1));if(el){setTimeout(()=>{el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1800)},60)}}
})();
