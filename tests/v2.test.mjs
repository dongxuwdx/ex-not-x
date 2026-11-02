import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');

test('every page is branded Ex not X and the top navigation pills are gone',()=>{
 for(const file of ['../who-knows-entry.html','../index.html']){
  const html=read(file),header=html.slice(html.indexOf('<header'),html.indexOf('</header>'));
  assert.match(header,/class="site-brand" href="index\.html"[^>]*>Ex not X</);
  assert.doesNotMatch(header,/site-nav|今日问题<|漂流论坛<|我的</);
 }
});

test('the prompt card follows the 11.1 copy and layout',()=>{
 const html=read('../who-knows-entry.html');
 assert.match(html,/今天想和你聊聊/);
 assert.match(html,/class="question">恋爱中，需要分享所有社交密码吗？<\/h1>/,'prompt stays on one line');
 assert.match(html,/亲密的距离，由你定义</,'note has no full stop');
 for(const removed of ['你正从背面看今日问题','转到正面','按住画面拖动','保留判断<'])assert.ok(!html.includes(removed),removed);
 for(const [stance,label] of [['green','赞同'],['blue','or'],['red','反对']])assert.match(html,new RegExp(`href="experience\\.html\\?stance=${stance}#river"[^>]*>(?:<span[^>]*>.<\\/span>)?${label}<`));
 assert.match(html,/class="flip-guide"/);
});

test('the river surface and the duck bobbing share one wave function',async()=>{
 const src=read('../src/river3d.js');
 const js=src.slice(src.indexOf('export function waveHeight'),src.indexOf('const WAVE_GLSL'));
 const glsl=src.slice(src.indexOf('const WAVE_GLSL'),src.indexOf('function duckGeometry'));
 const nums=s=>s.match(/\d*\.\d+/g).join(',');
 assert.equal(nums(js),nums(glsl));
});

test('each discussion stream has 24 distinct demo posts',async()=>{
 const {extraPosts}=await import('../src/demo-posts.js');
 assert.equal(extraPosts.filter(p=>p.type==='prompt').length,18);
 assert.equal(extraPosts.filter(p=>p.type!=='prompt').length,18);
 const source=read('../src/app.js');
 const seedBlock=source.slice(source.indexOf('const seeds=['),source.indexOf('const GENDERS='));
 assert.equal((seedBlock.match(/type:'prompt'/g)||[]).length,6);
 assert.equal((seedBlock.match(/type:'(?:free|letter)'/g)||[]).length,6);
});

test('post card copy matches 11.1',()=>{
 const src=read('../src/app.js')+read('../index.html');
 for(const s of ['看看这位bro','看看这位sis','看看这只鸭','+1鸭','顺水回一句','漂过去','认真说，也认真听。','轻轻说，水会带过去的。','想说点什么？鸭子们在听。','少给我看这类','已漂走，以后会少遇到这类内容','撤销','告诉我们发生了什么','提交举报','已收到，我们会尽快处理。这条内容已为你隐藏。'])assert.ok(src.includes(s),s);
 assert.match(read('../index.html'),/data-tip="回到岸边"/);
});

test('letter word-count tiers use the 11.1 wording',()=>{
 const src=read('../src/writing.js');
 for(const s of ['信纸还空着，慢慢来','已经落笔了 · ','开始有点像一封信了 · ','小鸭在旁边认真听着 · ','这封信已经很有分量了 · ','看得出来，你真的很了解 TA · ','它已经出发了。也许某一天，会有人读到。'])assert.ok((src+read('../src/app.js')).includes(s),s);
 assert.match(src,/n<=20[\s\S]*n<=100[\s\S]*n<=300[\s\S]*n<=600/);
});
