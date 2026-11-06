/* Ex not X 2.0 — shared header, footer and small helpers. Plain script so it also runs from file://. */
(function(){
 const EX=window.EX={};
 const page=document.body.dataset.page||'';
 const store={
  get(k,d){try{const v=localStorage.getItem('exnotx-'+k);return v==null?d:JSON.parse(v)}catch{return d}},
  set(k,v){try{localStorage.setItem('exnotx-'+k,JSON.stringify(v))}catch{}}
 };
 EX.store=store;
 EX.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 EX.bi=(zh,en)=>`<span class="zh">${zh}</span> <span class="en">${en}</span>`;

 /* language: both → zh → en */
 const LANGS=['both','zh','en'];
 const applyLang=l=>{document.documentElement.dataset.lang=l;document.querySelectorAll('.lang-btn').forEach(b=>{b.innerHTML=l==='zh'?'<b>中</b> / EN':l==='en'?'中 / <b>EN</b>':'中 / EN';b.setAttribute('aria-label','语言 Language: '+({both:'双语 Both',zh:'中文',en:'English'})[l])})};

 const NAV=[
  ['today','index.html','今日话题','Today'],
  ['stories','stories.html','精选故事','Stories'],
  ['forum','forum.html','自由论坛','Forum'],
  ['quiz','quiz.html','感情测评','Quiz'],
  ['reviews','review.html','AI 总结','Reviews'],
  ['guidelines','guidelines.html','社区准则','Guidelines'],
 ];
 let authed=false;try{authed=localStorage.getItem('exnotx-auth')==='1'}catch{}

 const header=document.getElementById('site-header');
 if(header){
  header.className='site-header';
  header.innerHTML=`<div class="wrap">
  <div class="masthead">
   <div class="meta">今日话题 #124 · Next in <b data-countdown>--:--</b></div>
   <a class="logo" href="index.html" aria-label="Ex not X 首页"><span class="mark">EX NOT X</span><span class="sub">留学生情感社区</span></a>
   <div class="util">
    <button class="lang-btn" type="button">中 / EN</button><span class="sep"></span>
    <a class="login" href="${authed?'#logout':'login.html'}">${authed?'退出 Log out':'登录 Log in'}</a><span class="sep"></span>
    <a class="journal" href="journal.html">我的日记 Journal</a>
   </div>
  </div>
  <nav class="site-nav" aria-label="主导航">${NAV.map(([k,h,zh,en])=>`<a href="${h}"${k===page?' aria-current="page"':''}>${zh} ${en}</a>`).join('')}</nav>
 </div>`;
  header.querySelector('.lang-btn').addEventListener('click',()=>{const l=LANGS[(LANGS.indexOf(document.documentElement.dataset.lang||'both')+1)%3];store.set('lang',l);applyLang(l)});
  const lo=header.querySelector('.login');
  lo.addEventListener('click',e=>{if(lo.getAttribute('href')==='#logout'){e.preventDefault();try{localStorage.removeItem('exnotx-auth')}catch{}location.href='login.html'}});
 }
 applyLang(store.get('lang','both'));

 const night=`<div class="goodnight"><span class="script light">Good night</span><span class="brush">晚安</span></div>`;
 const footer=document.getElementById('site-footer');
 if(footer){
  const note=footer.dataset.note;
  if(footer.dataset.variant==='full'){
   footer.className='site-footer on-dark';
   footer.innerHTML=`<div class="wrap">
   <div class="footer-cols">
    <div><h4>社区 Community</h4><ul><li><a href="index.html">今日话题 Today</a></li><li><a href="forum.html">自由论坛 Forum</a></li><li><a href="quiz.html">感情测评 Quiz</a></li></ul></div>
    <div><h4>关于 About</h4><ul><li><a href="guidelines.html#story">我们的故事 Our story</a></li><li><a href="guidelines.html">社区准则 Guidelines</a></li><li><a href="guidelines.html#privacy">隐私 Privacy</a></li></ul></div>
    <div><h4>支持 Support</h4><ul><li><a href="guidelines.html#help">心理支持资源 Get help</a></li><li><a href="guidelines.html#report">举报 Report</a></li><li><a href="guidelines.html#contact">联系我们 Contact</a></li></ul></div>
    <div><h4>关注 Follow</h4><ul><li><a href="#" data-soon>小红书 RED</a></li><li><a href="#" data-soon>Instagram</a></li><li><a href="#" data-soon>公众号 WeChat</a></li></ul></div>
    <div class="footer-big-night"><span class="script light">Good<br>night</span><span class="brush">晚安</span><small>无论你在哪个时区 · wherever you are</small></div>
   </div>
   <div class="footer-base"><span>© 2026 Ex not X</span><span><button type="button" data-set-lang="zh">中文</button> · <button type="button" data-set-lang="en">English</button></span></div>
  </div>`;
   footer.querySelectorAll('[data-set-lang]').forEach(b=>b.addEventListener('click',()=>{const l=document.documentElement.dataset.lang===b.dataset.setLang?'both':b.dataset.setLang;store.set('lang',l);applyLang(l)}));
  }else{
   footer.className='site-footer slim on-dark';
   footer.innerHTML=`<div class="wrap"><p class="legal">© 2026 Ex not X · ${note||'<a href="guidelines.html">社区准则 Guidelines</a> · <a href="guidelines.html#privacy">隐私 Privacy</a> · <a href="guidelines.html#help">心理支持 Get help</a>'}</p>${night}</div>`;
  }
  footer.addEventListener('click',e=>{if(e.target.closest('[data-soon]')){e.preventDefault();EX.toast('原型里暂未接入 · Coming soon')}});
 }

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
   tr.dataset.label??=tr.innerHTML;tr.innerHTML=showing?'原文 Original':tr.dataset.label}
 });
 EX.hugHTML=(id,n)=>{const on=!!hugs[id];return `<button class="hug-btn" type="button" data-hug="${id}" aria-pressed="${on}">抱抱 Hug · <span data-n>${n+(on?1:0)}</span></button>`};
})();
