import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
await import('../site/reflect.js');
const R=globalThis.EX_REFLECT;

const PAGES={'index.html':'today','stories.html':'stories','forum.html':'forum','quiz.html':'quiz','review.html':'reviews','guidelines.html':'guidelines','journal.html':'journal'};

test('every 2.0 page is gated, shares the header/footer and loads plain scripts (file:// safe)',()=>{
 for(const [file,page] of Object.entries(PAGES)){
  const html=read('../site/'+file);
  assert.match(html,/localStorage\.getItem\('exnotx-auth'\)!=='1'/,file+' gate');
  assert.match(html,new RegExp(`<body data-page="${page}">`),file);
  assert.match(html,/<header id="site-header"><\/header>/,file);
  assert.match(html,/<footer id="site-footer"/,file);
  assert.doesNotMatch(html,/type="module"/,file);
  for(const [,src] of html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g))assert.ok(fs.existsSync(new URL('../site/'+src,import.meta.url)),`${file} → ${src}`);
 }
});

test('the nav carries the six 2.0 sections in order',()=>{
 const js=read('../site/site.js');
 const order=['今日话题','精选故事','自由论坛','感情测评','AI 总结','社区准则'].map(s=>js.indexOf(`'${s}'`));
 assert.ok(order.every(i=>i>0));
 assert.deepEqual([...order].sort((a,b)=>a-b),order);
});

test('the quiz has 20 questions split 5/5/5/5 across the four sections',()=>{
 assert.equal(R.Q.length,20);
 assert.deepEqual(R.SECTIONS.map(s=>s.range),[[1,5],[6,10],[11,15],[16,20]]);
 for(const q of R.Q)if(q.type!=='text')assert.ok(q.opts.length>=3,q.id);
});

test('the design example pairs 守灯人 with 晴天表达者 and both readings agree',()=>{
 assert.equal(R.DEMO.you.zh,'守灯人');assert.equal(R.DEMO.them.zh,'晴天表达者');
 const s=R.summarize({name:'J',status:'together',duration:'两年',answers:{met:'伦敦的一节统计课上',first:1,drew:0,yLove:0,tLove:1,missYou:1,about:[0,1],yFight:0,tFight:1,swallow:1,feel:'想念，但有点累',yFuture:0,tFuture:1,want:0}});
 assert.equal(s.you.zh,'守灯人');assert.equal(s.them.zh,'晴天表达者');
 assert.equal(s.story.length,4);
 assert.match(s.story[0][2][0],/伦敦的一节统计课上/);
 assert.match(s.story[3][2][0],/想念，但有点累/);
 for(const d of s.dims){assert.ok(d.y>=0&&d.y<=100&&d.t>=0&&d.t<=100);assert.equal(d.note.length,2)}
});

test('summaries never leave TA unnamed or crash on an empty quiz',()=>{
 const s=R.summarize({name:'',answers:{}});
 assert.equal(s.name,'TA');
 assert.ok(s.story.every(([, ,p])=>p[0]&&p[1]&&!p[0].includes('undefined')&&!p[1].includes('undefined')));
});
