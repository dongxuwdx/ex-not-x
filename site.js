/* Ex not X 2.0 — shared header, footer, language switch and small helpers. Plain script so it also runs from file://. */
(function(){
 const EX=window.EX={};
 const page=document.body.dataset.page||'';
 const store={
  get(k,d){try{const v=localStorage.getItem('exnotx-'+k);return v==null?d:JSON.parse(v)}catch{return d}},
  set(k,v){try{localStorage.setItem('exnotx-'+k,JSON.stringify(v))}catch{}}
 };
 EX.store=store;
 EX.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 /* Language: 'both' (the design's bilingual default), 'zh' or 'en'.
    Interface copy is written as <span class="zh">…</span><span class="en">…</span> (see EX.L);
    CSS hides the other language. Plain strings (placeholders, toasts) go through EX.T.
    User content (posts, comments) is never switched — it has its own Translate button. */
 const lang=['zh','en'].includes(store.get('lang','both'))?store.get('lang'):'both';
 EX.lang=lang;
 document.documentElement.dataset.lang=lang;
 document.documentElement.lang=lang==='en'?'en':'zh-CN';
 EX.L=(zh,en)=>`<span class="zh">${zh}</span><span class="en">${en}</span>`;
 EX.T=(zh,en)=>lang==='zh'?zh:lang==='en'?en:`${zh} · ${en}`;
 EX.pick=(zh,en)=>lang==='en'?en:zh;
 EX.setLang=l=>{store.set('lang',l);location.reload()};
 const L=EX.L,T=EX.T;

 /* attributes can't hold spans: data-i18n-placeholder="中文|English" (also -aria-label, -title) */
 EX.applyAttrs=(root=document)=>{for(const a of ['placeholder','aria-label','title'])root.querySelectorAll(`[data-i18n-${a}]`).forEach(el=>{const [zh,en]=el.getAttribute(`data-i18n-${a}`).split('|');el.setAttribute(a,T(zh,en??zh))})};

 const NAV=[
  ['today','index.html','今日话题','Today'],
  ['stories','stories.html','精选故事','Stories'],
  ['forum','forum.html','自由论坛','Forum'],
  ['quiz','quiz.html','感情测评','Quiz'],
  ['reviews','review.html','AI 总结','AI Reviews'],
  ['guidelines','guidelines.html','社区准则','Guidelines'],
 ];
 if(lang==='en'){const n=NAV.find(x=>x[0]===page);document.title='Ex not X · '+(n?n[3]:page==='journal'?'Journal':'Love abroad, out loud')}
 let authed=false;try{authed=localStorage.getItem('exnotx-auth')==='1'}catch{}

 const header=document.getElementById('site-header');
 if(header){
  header.className='site-header';
  header.innerHTML=`<div class="wrap">
  <div class="masthead">
   <div class="meta"><span class="zh">今日话题 #124 · </span><span class="only-en">Prompt #124 · </span><span class="only-zh">距下一题</span><span class="en">Next in</span> <b data-countdown>--:--</b></div>
   <a class="logo" href="index.html" aria-label="Ex not X"><span class="mark">EX NOT X</span><span class="sub"><span class="zh">留学生情感社区</span><span class="only-en">Love abroad, out loud</span></span></a>
   <div class="util">
    <span class="lang-switch" role="group" aria-label="${T('语言','Language')}"><button type="button" data-set-lang="zh" aria-pressed="${lang==='zh'}">中</button><span aria-hidden="true">/</span><button type="button" data-set-lang="en" aria-pressed="${lang==='en'}">EN</button></span><span class="sep"></span>
    <a class="login" href="${authed?'#logout':'login.html'}">${authed?L('退出','Log out'):L('登录','Log in')}</a><span class="sep"></span>
    <a class="journal" href="journal.html">${L('我的日记','Journal')}</a>
   </div>
  </div>
  <nav class="site-nav" aria-label="${T('主导航','Main')}">${NAV.map(([k,h,zh,en])=>`<a href="${h}"${k===page?' aria-current="page"':''}>${L(zh,en)}</a>`).join('')}</nav>
 </div>`;
  const lo=header.querySelector('.login');
  lo.addEventListener('click',e=>{if(lo.getAttribute('href')==='#logout'){e.preventDefault();try{localStorage.removeItem('exnotx-auth')}catch{}location.href='login.html'}});
 }

 const night=`<div class="goodnight"><span class="script light">Good night</span><span class="brush zh">晚安</span></div>`;
 const footer=document.getElementById('site-footer');
 if(footer){
  const note=footer.dataset.noteZh?L(footer.dataset.noteZh,footer.dataset.noteEn):null;
  if(footer.dataset.variant==='full'){
   footer.className='site-footer on-dark';
   footer.innerHTML=`<div class="wrap">
   <div class="footer-cols">
    <div><h4>${L('社区','Community')}</h4><ul><li><a href="index.html">${L('今日话题','Today')}</a></li><li><a href="forum.html">${L('自由论坛','Forum')}</a></li><li><a href="quiz.html">${L('感情测评','Quiz')}</a></li></ul></div>
    <div><h4>${L('关于','About')}</h4><ul><li><a href="guidelines.html#story">${L('我们的故事','Our story')}</a></li><li><a href="guidelines.html">${L('社区准则','Guidelines')}</a></li><li><a href="guidelines.html#privacy">${L('隐私','Privacy')}</a></li></ul></div>
    <div><h4>${L('支持','Support')}</h4><ul><li><a href="guidelines.html#help">${L('心理支持资源','Get help')}</a></li><li><a href="guidelines.html#report">${L('举报','Report')}</a></li><li><a href="guidelines.html#contact">${L('联系我们','Contact')}</a></li></ul></div>
    <div><h4>${L('关注','Follow')}</h4><ul><li><a href="#" data-soon>${L('小红书','RED')}</a></li><li><a href="#" data-soon>Instagram</a></li><li><a href="#" data-soon>${L('公众号','WeChat')}</a></li></ul></div>
    <div class="footer-big-night"><span class="script light">Good<br>night</span><span class="brush zh">晚安</span><small>${L('无论你在哪个时区','wherever you are')}</small></div>
   </div>
   <div class="footer-base"><span>© 2026 Ex not X</span><span><button type="button" data-set-lang="zh" aria-pressed="${lang==='zh'}">中文</button> · <button type="button" data-set-lang="en" aria-pressed="${lang==='en'}">English</button></span></div>
  </div>`;
  }else{
   footer.className='site-footer slim on-dark';
   footer.innerHTML=`<div class="wrap"><p class="legal">© 2026 Ex not X · ${note||`<a href="guidelines.html">${L('社区准则','Guidelines')}</a> · <a href="guidelines.html#privacy">${L('隐私','Privacy')}</a> · <a href="guidelines.html#help">${L('心理支持','Get help')}</a>`}</p>${night}</div>`;
  }
  footer.addEventListener('click',e=>{if(e.target.closest('[data-soon]')){e.preventDefault();EX.toast(T('原型里暂未接入','Coming soon'))}});
 }

 /* 中 / EN: pick a language; picking the active one again returns to the bilingual view */
 document.addEventListener('click',e=>{const b=e.target.closest('[data-set-lang]');if(!b)return;EX.setLang(lang===b.dataset.setLang?'both':b.dataset.setLang)});
 EX.applyAttrs();

 /* countdown to the next prompt (local midnight) */
 const tick=()=>{const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.max(0,Math.floor((m-n)/1000)),h=Math.floor(s/3600),mi=Math.floor(s%3600/60);
  document.querySelectorAll('[data-countdown]').forEach(el=>el.textContent=`${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`)};
 tick();setInterval(tick,15000);

 /* toast */
 let tt;EX.toast=msg=>{let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=msg;requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)};

 /* hug + translate buttons work anywhere via delegation */
 const hugs=store.get('hugs',{});
 EX.hugState=id=>!!hugs[id];
 document.addEventListener('click',e=>{
  const hug=e.target.closest('[data-hug]');
  if(hug){const id=hug.dataset.hug,on=!hugs[id];hugs[id]=on;if(!on)delete hugs[id];store.set('hugs',hugs);
   const n=hug.querySelector('[data-n]');n.textContent=(+n.textContent)+(on?1:-1);hug.setAttribute('aria-pressed',on);hug.classList.remove('pop');void hug.offsetWidth;hug.classList.add('pop');return}
  const tr=e.target.closest('[data-translate]');
  if(tr){const box=document.getElementById(tr.dataset.translate);if(!box)return;const alt=box.dataset.alt;if(!alt)return;
   const cur=box.dataset.orig??box.innerHTML;if(box.dataset.orig==null)box.dataset.orig=cur;
   const showing=box.classList.toggle('translated');box.innerHTML=showing?EX.esc(alt):box.dataset.orig;
   tr.dataset.label??=tr.innerHTML;tr.innerHTML=showing?L('原文','Original'):tr.dataset.label}
 });
 EX.hugHTML=(id,n)=>{const on=!!hugs[id];return `<button class="hug-btn" type="button" data-hug="${id}" aria-pressed="${on}">${L('抱抱','Hug')} · <span data-n>${n+(on?1:0)}</span></button>`};
})();
