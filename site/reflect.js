/* 感情测评 · questions and the summary writer. Works in the browser (window.EX_REFLECT) and in node tests (module.exports). */
(function(root){
 const SECTIONS=[
  {key:'beginning',zh:'开始',en:'Beginning',range:[1,5]},
  {key:'together',zh:'相处',en:'Together',range:[6,10]},
  {key:'friction',zh:'摩擦',en:'Friction',range:[11,15]},
  {key:'now',zh:'现在',en:'Now',range:[16,20]},
 ];
 /* dims, each 0 (left) → 100 (right):
    expr: holds in → says it · conflict: withdraw → engage · close: space → togetherness · future: day by day → plan ahead
    an option's `y` / `t` nudges you / them on a dim; `tag` is remembered for the story */
 const Q=[
  {id:'met',type:'text',zh:'你们是在哪里、怎么认识的？',en:'Where and how did you meet?',ph:'比如：在伦敦的一节统计课上 · e.g. in a statistics class in London'},
  {id:'first',zh:'谁先迈出了第一步？',en:'Who made the first move?',opts:[
   {zh:'我',en:'Me',tag:'me'},{zh:'TA',en:'Them',tag:'them'},{zh:'差不多同时',en:'Both, at once',tag:'both'},{zh:'记不清了',en:"Can't remember",tag:'blur'}]},
  {id:'drew',zh:'最初，TA 身上什么吸引了你？',en:'What drew you to them at first?',opts:[
   {zh:'不费力的松弛',en:'An effortless ease',tag:'ease'},{zh:'认真和可靠',en:'Their steadiness',tag:'steady'},{zh:'有趣，总能逗笑我',en:'They made me laugh',tag:'fun'},{zh:'温柔，很会照顾人',en:'Their gentleness',tag:'gentle'}]},
  {id:'early',zh:'刚在一起时，你们多常联系？',en:'Early on, how often did you talk?',opts:[
   {zh:'几乎一直在线',en:'Almost always online',y:{close:20},t:{close:20}},{zh:'每天固定时间',en:'At a set time each day',y:{close:8,future:8},t:{close:8}},{zh:'想起来就聊',en:'Whenever we felt like it',y:{close:-10},t:{close:-6}},{zh:'TA 找我更多',en:'They reached out more',t:{close:18,expr:10}}]},
  {id:'far',zh:'那时，你觉得这段感情会走多远？',en:'Back then, how far did you think it would go?',opts:[
   {zh:'想过很远的以后',en:'I pictured a long future',y:{future:22}},{zh:'先好好在一起再说',en:'Just be good together first',y:{future:-6}},{zh:'没想那么多',en:"Didn't think about it",y:{future:-20}},{zh:'有点不敢想',en:'Too scared to think about it',y:{future:-4,expr:-8}}]},

  {id:'yLove',zh:'你最常怎么表达爱？',en:'How do you usually show love?',opts:[
   {zh:'做事：记住小事、提前安排',en:'Doing: small details, planning ahead',y:{expr:-22},tag:'acts'},{zh:'说出口：想你、爱你',en:'Saying it: miss you, love you',y:{expr:24},tag:'words'},{zh:'陪着：一起待着就好',en:'Being there: just being together',y:{close:16,expr:-6},tag:'time'},{zh:'小礼物和惊喜',en:'Little gifts and surprises',y:{expr:-8},tag:'gifts'}]},
  {id:'tLove',zh:'TA 最常怎么表达爱？',en:'How do they usually show love?',opts:[
   {zh:'做事',en:'By doing things',t:{expr:-22},tag:'acts'},{zh:'说出口',en:'By saying it',t:{expr:24},tag:'words'},{zh:'陪着',en:'By being there',t:{close:16,expr:-4},tag:'time'},{zh:'礼物和惊喜',en:'Gifts and surprises',t:{expr:-6},tag:'gifts'}]},
  {id:'missYou',zh:'收到一句“想你”，你通常会？',en:'When they say “miss you”, you usually…',opts:[
   {zh:'马上回“我也是”',en:'Reply “me too” right away',y:{expr:18}},{zh:'心里开心，但回得很简单',en:'Feel happy, reply briefly',y:{expr:-16}},{zh:'用行动回应，比如打电话',en:'Answer with action, like a call',y:{expr:-6,close:8}},{zh:'有点不知道怎么接',en:"Not sure what to say",y:{expr:-24}}]},
  {id:'yClose',zh:'一周里，你更想要？',en:'In a week, you would rather have…',opts:[
   {zh:'各自的空间，偶尔见面',en:'Our own space, meet sometimes',y:{close:-24}},{zh:'固定的见面或视频',en:'Regular calls or dates',y:{close:6}},{zh:'越多越好',en:'As much as possible',y:{close:24}},{zh:'看状态',en:'Depends on my mood',y:{close:-6}}]},
  {id:'tClose',zh:'TA 呢？',en:'And them?',opts:[
   {zh:'更需要空间',en:'Needs more space',t:{close:-24}},{zh:'固定的见面或视频',en:'Regular calls or dates',t:{close:6}},{zh:'越多越好',en:'As much as possible',t:{close:24}},{zh:'我也说不准',en:"I can't tell",t:{}}]},

  {id:'about',zh:'你们最常因为什么起摩擦？',en:'What do you clash about most?',opts:[
   {zh:'回消息',en:'Replying to messages',tag:'texts'},{zh:'以后',en:'The future',tag:'future'},{zh:'时差和见面',en:'Time zones and visits',tag:'distance'},{zh:'朋友和家人',en:'Friends and family',tag:'family'},{zh:'钱',en:'Money',tag:'money'}],multi:true},
  {id:'yFight',zh:'吵架时，你会？',en:'In a fight, you…',opts:[
   {zh:'先沉默，等平静了再谈',en:'Go quiet until I calm down',y:{conflict:-26}},{zh:'当下就想说清楚',en:'Want to talk it out now',y:{conflict:24}},{zh:'讲道理',en:'Argue it logically',y:{conflict:10,expr:-6}},{zh:'先哄对方',en:'Smooth it over first',y:{conflict:-8,expr:6}}]},
  {id:'tFight',zh:'吵架时，TA 会？',en:'In a fight, they…',opts:[
   {zh:'先沉默',en:'Go quiet',t:{conflict:-26}},{zh:'把情绪摆上桌',en:'Put their feelings on the table',t:{conflict:24,expr:10}},{zh:'讲道理',en:'Argue it logically',t:{conflict:10}},{zh:'先哄我',en:'Smooth it over',t:{conflict:-8,expr:8}}]},
  {id:'swallow',zh:'你会为了不起争执，把真实的感受咽回去吗？',en:'Do you swallow your feelings to avoid a fight?',opts:[
   {zh:'经常',en:'Often',y:{expr:-18,conflict:-8},tag:'often'},{zh:'偶尔',en:'Sometimes',y:{expr:-8},tag:'sometimes'},{zh:'很少',en:'Rarely',y:{expr:12},tag:'rarely'}]},
  {id:'makeup',zh:'吵完，你们通常怎么和好？',en:'After a fight, how do you make up?',opts:[
   {zh:'TA 先来找我',en:'They come to me first',t:{conflict:8},tag:'them'},{zh:'我先低头',en:'I reach out first',y:{conflict:8},tag:'me'},{zh:'假装没发生过',en:'Pretend it never happened',y:{conflict:-8},t:{conflict:-6},tag:'skip'},{zh:'认真谈一次',en:'A proper talk',y:{conflict:6},t:{conflict:6},tag:'talk'}]},

  {id:'feel',type:'text',zh:'用一句话，形容你现在对这段感情的感觉。',en:'In one line, how does this relationship feel right now?',ph:'比如：想念，但有点累 · e.g. missing them, but a bit tired'},
  {id:'yFuture',zh:'说到以后，你？',en:'About the future, you…',opts:[
   {zh:'想要一个方向',en:'Want a direction',y:{future:24}},{zh:'走一步看一步',en:'Take it day by day',y:{future:-22}},{zh:'有想法但没说出口',en:'Have ideas but haven\'t said them',y:{future:14,expr:-10}},{zh:'还没想好',en:'Not sure yet',y:{future:-6}}]},
  {id:'tFuture',zh:'TA 呢？',en:'And them?',opts:[
   {zh:'早做规划',en:'Plans ahead',t:{future:24}},{zh:'更习惯活在当下',en:'Lives in the present',t:{future:-24}},{zh:'总把话题岔开',en:'Changes the subject',t:{future:-14,conflict:-8}},{zh:'我不知道',en:"I don't know",t:{}}]},
  {id:'want',zh:'现在，你最想要的是？',en:'Right now, what do you want most?',opts:[
   {zh:'一次真正坦白的谈话',en:'One honest conversation',tag:'talk'},{zh:'一个明确的答案',en:'A clear answer',tag:'answer'},{zh:'更多的陪伴',en:'More time together',tag:'time'},{zh:'学会放下',en:'To let go',tag:'letgo'}]},
  {id:'extra',type:'text',optional:true,zh:'还有什么想写下的吗？（可以跳过）',en:'Anything else you want to write down? (optional)',ph:'写给自己，也可以写给 TA… · To yourself, or to them…'},
 ];

 const STATUS={together:['在一起','Together'],over:['已经结束','It\'s over'],undefined:['暧昧中','Undefined'],onesided:['单方面喜欢','One-sided']};

 const ARCH={
  lighthouse:{zh:'守灯人',en:'The Lighthouse',love:['用行动去爱，记得每一件小事','Through actions and small details'],conflict:['先退后、先沉默，想等平静了再谈','Steps back to cool down first'],needs:['稳定、可预期的回应','Steady, predictable replies']},
  sunny:{zh:'晴天表达者',en:'The Sunny Speaker',love:['用语言去爱，常把“想你”挂在嘴边','Through words, says “miss you” often'],conflict:['直面问题，希望当下就说清楚','Wants to talk it out right away'],needs:['被回应、被说出口的爱','To hear love said back']},
  fixer:{zh:'安静的修理工',en:'The Quiet Fixer',love:['不太说，但会把事情做好','Says little, fixes things'],conflict:['想马上解决，但不太讲感受','Wants it solved now, feelings later'],needs:['被信任、被看见付出','To be trusted and seen']},
  letter:{zh:'写信的人',en:'The Letter Writer',love:['会说爱，也会认真地写下来','Says it, and writes it down'],conflict:['怕伤到彼此，先躲开一会儿','Steps away so no one gets hurt'],needs:['温柔的语气、安全感','A gentle tone and safety']},
 };
 const archOf=s=>s.expr<50?(s.conflict<50?'lighthouse':'fixer'):(s.conflict<50?'letter':'sunny');

 const clamp=v=>Math.max(4,Math.min(96,v));
 function score(ans){
  const y={expr:50,conflict:50,close:50,future:50},t={expr:50,conflict:50,close:50,future:50},tags={};
  for(const q of Q){if(q.type==='text')continue;const a=ans[q.id];if(a==null)continue;
   for(const i of [].concat(a)){const o=q.opts[i];if(!o)continue;
    for(const k in o.y||{})y[k]+=o.y[k];for(const k in o.t||{})t[k]+=o.t[k];
    if(o.tag)(tags[q.id]??=[]).push(o.tag)}}
  for(const k in y){y[k]=clamp(y[k]);t[k]=clamp(t[k])}
  return {y,t,tags};
 }

 const DIMS=[
  {k:'expr',zh:'表达',en:'Expressing',l:['藏在心里','Holds in'],r:['说出口','Says it']},
  {k:'conflict',zh:'冲突时',en:'In conflict',l:['后退','Withdraw'],r:['直面','Engage']},
  {k:'close',zh:'亲密需求',en:'Closeness',l:['需要空间','Space'],r:['需要陪伴','Togetherness']},
  {k:'future',zh:'对未来',en:'The future',l:['走一步看一步','Day by day'],r:['早做规划','Plan ahead']},
 ];

 function dimNote(d,y,t,n){
  const gap=Math.abs(y-t),close=gap<18;
  const N=n;
  if(d==='expr')return close?[`你们表达爱的方式很像，这让很多话不需要翻译。`,`You express love in similar ways — less gets lost in translation.`]
   :y<t?[`你们最大的差距在这里：${N} 在等你开口，你在等 ${N} 读懂。`,`Your biggest gap: ${N} waits for words, you wait to be understood.`]
   :[`你习惯说出口，${N} 更习惯藏在心里——TA 的沉默不一定是冷淡。`,`You say it; ${N} holds it in — their quiet isn't always distance.`];
  if(d==='conflict')return close?[`吵架时你们的节奏差不多，这是很难得的默契。`,`You fight at a similar pace — that's rarer than it sounds.`]
   :y<t?[`一个追、一个退，是很常见的模式，也最容易被一句“我没有走开”打破。`,`A classic chase-and-retreat — often eased by “I'm not going anywhere.”`]
   :[`你想马上说清，${N} 需要先退一步。给 TA 一个回来的时间点，会好很多。`,`You want to talk now; ${N} needs a step back. Agreeing on when to come back helps.`];
  if(d==='close')return close?[`你们其实很接近，都想靠近彼此。`,`You're closer than you think — you both want to be near.`]
   :y<t?[`${N} 想要更多陪伴，你需要更多空间——这不是爱得少，只是充电方式不同。`,`${N} wants more togetherness, you need more space — different ways to recharge, not less love.`]
   :[`你想要更多陪伴，${N} 需要更多空间——说出你需要多少，比猜更省力。`,`You want more togetherness, ${N} needs more space — naming how much beats guessing.`];
  return close?[`你们对未来的节奏很像。`,`You're at the same pace about the future.`]
   :y>t?[`你想要一个方向，${N} 更习惯活在当下。`,`You want a direction; ${N} lives more in the present.`]
   :[`${N} 想早做规划，你更想走一步看一步。`,`${N} wants a plan; you'd rather take it day by day.`];
 }

 const DRAW={ease:['身上那种不费力的松弛','effortless ease'],steady:['身上那种认真和可靠','steadiness'],fun:['总能逗笑你的样子','way of making you laugh'],gentle:['那份温柔和会照顾人','gentleness']};
 const LOVEWAY={acts:['用行动去爱','through what you do'],words:['把爱说出口','by saying it'],time:['用陪伴去爱','by being there'],gifts:['用小礼物和惊喜去爱','with little gifts and surprises']};
 const ABOUT={texts:['“回消息”','replying to messages'],future:['“以后”','the future'],distance:['时差和见面','time zones and visits'],family:['朋友和家人','friends and family'],money:['钱','money']};

 function summarize(input){
  const ans=input.answers||{},N=(input.name||'TA').trim()||'TA',st=STATUS[input.status]||STATUS.together,dur=(input.duration||'').trim();
  const {y,t,tags}=score(ans);
  const yA=ARCH[archOf(y)],tA=ARCH[archOf(t)];
  const tag=id=>(tags[id]||[])[0];
  const met=(ans.met||'').trim(),feel=(ans.feel||'').trim(),extra=(ans.extra||'').trim();
  const first=tag('first'),drew=DRAW[tag('drew')]||DRAW.ease;
  const firstZh={me:'是你先迈出了第一步',them:`是 ${N} 先迈出了第一步`,both:'你们几乎同时走向了对方',blur:'谁先靠近已经记不清了'}[first]||'你们慢慢走近了彼此';
  const firstEn={me:'you made the first move',them:`${N} made the first move`,both:'you moved toward each other at the same time',blur:"neither of you remembers who moved first"}[first]||'you slowly found each other';
  const began=[
   `${met?`你们${met.startsWith('在')?'':'在'}${met}认识。`:'你们在一个还很陌生的地方遇见。'}${firstZh}。你被 ${N} ${drew[0]}吸引——在一个什么都陌生的城市里，TA 让你觉得，有人接住了你。`,
   `You met ${met?`— in your words, “${met}”`:'somewhere still unfamiliar'}. ${firstEn[0].toUpperCase()+firstEn.slice(1)}. You were drawn to ${N}'s ${drew[1]} — in a city where everything was new, they made you feel caught.`];
  const yl=LOVEWAY[tag('yLove')]||LOVEWAY.acts,tl=LOVEWAY[tag('tLove')]||LOVEWAY.words,same=tag('yLove')===tag('tLove');
  const loved=same?[`${dur?'这段时间里，':''}你们都习惯${yl[0]}。这让很多话不需要翻译——只是偶尔，也需要有人把它说出来。`,
   `${dur?`Over ${dur}, `:''}you both love ${yl[1]}. Less gets lost in translation — though sometimes it still needs saying out loud.`]
   :[`${dur?`这段时间里，`:''}你习惯${yl[0]}，${N} 更习惯${tl[0]}，也更需要你用 TA 的方式回应。你们都很用力，只是用的是两种不同的语言。`,
   `You love ${yl[1]}; ${N} loves ${tl[1]}, and needs it back that way. You were both trying hard — just in two different languages.`];
  const ab=(tags.about||['texts']).map(k=>ABOUT[k]).filter(Boolean);
  const sw=tag('swallow');
  const stuck=[
   `摩擦大多关于${ab.map(a=>a[0]).join('和')}。${y.conflict<t.conflict?`吵架时 ${N} 会把情绪摆上桌，而你会先沉默，想等自己平静了再谈——在 TA 看来，这份沉默像是你退后了一步。`:y.conflict>t.conflict+10?`吵架时你想马上说清楚，而 ${N} 会先退后——在你看来，那像是 TA 不在乎。`:'吵架时你们的节奏差不多，难的是吵完以后谁先开口。'}${sw==='often'?'你说，你经常为了不起争执，把真实的感受咽回去。':sw==='sometimes'?'你说，你偶尔会为了不起争执，把真实的感受咽回去。':''}`,
   `Most of the friction is about ${ab.map(a=>a[1]).join(' and ')}. ${y.conflict<t.conflict?`In a fight ${N} puts feelings on the table, while you go quiet until you've calmed down — to them, that silence looks like a step back.`:y.conflict>t.conflict+10?`In a fight you want to settle it now, while ${N} steps back — to you, that looks like not caring.`:'You fight at a similar pace; the hard part is who speaks first afterwards.'}${sw==='often'?' You said you often swallow how you really feel to keep the peace.':sw==='sometimes'?' You said you sometimes swallow how you really feel to keep the peace.':''}`];
  const want={talk:['一次真正坦白的谈话','one honest conversation'],answer:['一个明确的答案','a clear answer'],time:['更多的陪伴','more time together'],letgo:['学会放下','to let go']}[tag('want')]||['一次真正坦白的谈话','one honest conversation'];
  const nowP=[
   `${feel?`你形容现在的感觉是“${feel}”。`:''}${input.status==='over'?'这段感情已经结束了，':input.status==='undefined'?'你们还在暧昧里，':input.status==='onesided'?'这份喜欢目前还是单方面的，':'你们还在一起，'}${want[0]==='一个明确的答案'?'你想要的是一个明确的答案。':`你最想要的，是${want[0]}。`}`,
   `${feel?`You described how it feels now as “${feel}”. `:''}${input.status==='over'?"It's over now, and ":input.status==='undefined'?"It's still undefined, and ":input.status==='onesided'?"For now the feeling is one-sided, and ":"You're still together, and "}what you want most is ${want[1]}.`];
  const reflect=y.expr<50?[`这段感情里，你一直是那个默默做事的人。但关系不只需要行动，也需要你偶尔走出来，告诉对方：我需要你。你担心“说出来就会吵架”，可也许那正是 ${N} 一直在等的。下一次想沉默之前，试着先说一句：我需要一点时间，但我没有走开。`,
   `In this relationship you've been the one who shows up quietly. But it needs more than actions — sometimes it needs you to step out and say: I need you. You worry that saying it will start a fight, but maybe that's exactly what ${N} has been waiting for. Next time you're about to go quiet, try: I need a moment, but I'm not going anywhere.`]
   :[`你一直是那个把爱说出口的人，这很珍贵。但说出口的爱，也需要留一点空间给对方用 TA 的方式回应。下一次没有立刻得到回音时，试着先相信：${N} 的安静，不一定是离开。`,
   `You've been the one who says it out loud — that matters. But spoken love also needs room for ${N} to answer in their own way. Next time an echo doesn't come right away, try believing first: their quiet isn't necessarily leaving.`];
  return {
   name:N,status:st,duration:dur,you:{key:archOf(y),...yA,dims:y},them:{key:archOf(t),...tA,dims:t},
   headline:headline(y,t,ab,input.status,N),
   story:[['你们的开始','How it began',began],['你们怎么相爱','How you loved',loved],['你们卡住的地方','Where you got stuck',stuck],['现在的你们','Where you are now',nowP]],
   reflection:reflect,
   questions:[[`你最近一次咽回去的话是什么？`,`What's the last thing you held back?`],[`如果 ${N} 读到这份总结，你希望 TA 先看到哪一句？`,`If ${N} read this, which line should they see first?`],[`那次“${want[0]}”，你想从哪句话开始？`,`How would you begin ${want[1]}?`]],
   dims:DIMS.map(d=>({...d,y:y[d.k],t:t[d.k],note:dimNote(d.k,y[d.k],t[d.k],N)})),
   extra,
  };
 }
 function headline(y,t,about,status,N){
  if(about.some(a=>a[1]==='time zones and visits'))return ['一段隔着时差、却始终有人留着灯的感情','Hours apart, and someone always kept the light on'];
  if(status==='over')return ['一段已经结束、但仍值得被好好写下的感情','Over now, and still worth writing down'];
  if(Math.abs(y.expr-t.expr)>25)return ['两个人都很用力，只是说着不同的语言','Both trying hard, in two different languages'];
  return ['一段还在慢慢学着靠近的感情','Still learning how to come closer'];
 }

 /* the exact example from the 2.0 design, shown before anyone takes the quiz */
 const DEMO={
  demo:true,name:'J',status:STATUS.together,duration:'2 年 · 异地 1 年',date:'Nov 5, 2026',
  you:{key:'lighthouse',...ARCH.lighthouse},them:{key:'sunny',...ARCH.sunny},
  headline:['一段隔着 8 小时时差、却始终有人留着灯的感情','Eight hours apart, and someone always kept the light on'],
  basis:['在一起 2 年 · 异地 1 年 · 基于你的 20 个回答与你写下的话','From your 20 answers and your own words'],
  story:[
   ['你们的开始','How it began',['你们在伦敦的一节统计课上认识。是 J 先借了你的计算器，也是 J 在下课后多问了一句“要不要一起吃饭”。你被 TA 身上那种不费力的松弛吸引——在一个什么都陌生的城市里，TA 让你第一次觉得，有人接住了你。','You met in a statistics class in London. J borrowed your calculator first, and J was the one who asked, after class, “want to grab food?” You were drawn to their effortless ease — in a city where everything was unfamiliar, they were the first to make you feel caught.']],
   ['你们怎么相爱','How you loved',['这两年里，你用行动去爱：记得 TA 的课表，提前订好回国的机票，在 TA 熬夜时留一份夜宵。J 更习惯把爱说出口，也更需要你说出口。你们都很用力，只是用的是两种不同的语言。','For two years you loved through actions: remembering their timetable, booking flights home early, leaving a late-night snack when they stayed up. J is more used to saying love out loud — and needs to hear it back. You were both trying hard, just in two different languages.']],
   ['你们卡住的地方','Where you got stuck',['去年 J 回国工作，你们之间多了 8 个小时。摩擦大多关于“回消息”和“以后”。吵架时 J 会把情绪摆上桌，而你会先沉默，想等自己平静了再谈——在 TA 看来，这份沉默像是你退后了一步。你说，你偶尔会为了不起争执，把真实的感受咽回去。','Last year J went home for work, and eight hours opened up between you. Most of the friction is about replying to messages and the future. In a fight J puts feelings on the table, while you go quiet until you\'ve calmed down — to them, that silence looks like a step back. You said you sometimes swallow how you really feel to keep the peace.']],
   ['现在的你们','Where you are now',['你形容现在的感觉是“想念，但有点累”。你们还在一起，只是你不确定下一步。你最想要的不是一个答案，而是一次真正坦白的谈话。','You described how it feels now as “missing them, but a bit tired.” You\'re still together, just unsure of the next step. What you want most isn\'t an answer — it\'s one truly honest conversation.']],
  ],
  reflection:['这段感情里，你一直是那个留着灯的人。但关系不只需要灯，也需要你偶尔走出来，告诉对方：我冷了。你担心“说出来就会吵架”，可也许那正是 J 一直在等的——“你终于让我靠近了”。下一次想沉默之前，试着先说一句：我需要一点时间，但我没有走开。','In this relationship you\'ve always been the one keeping the light on. But a relationship needs more than a light — sometimes it needs you to step out and say: I\'m cold. You worry that saying it will start a fight, but maybe that\'s exactly what J has been waiting for — “you finally let me in.” Next time you\'re about to go quiet, try saying first: I need a moment, but I\'m not going anywhere.'],
  questions:[['你最近一次咽回去的话是什么？',"What's the last thing you held back?"],['如果 J 读到这份总结，你希望 TA 先看到哪一句？','If J read this, which line should they see first?'],['那次“好好谈一次”，你想从哪句话开始？','How would you open that honest talk?']],
  dims:DIMS.map(d=>({...d,...{expr:{y:28,t:82,note:['你们最大的差距在这里：J 在等你开口，你在等 J 读懂。','Your biggest gap: J waits for words, you wait to be understood.']},conflict:{y:22,t:84,note:['一个追、一个退，是很常见的模式，也最容易被一句“我没有走开”打破。','A classic chase-and-retreat — often eased by “I\'m not going anywhere.”']},close:{y:58,t:72,note:['你们其实很接近，都想靠近彼此。','You\'re closer than you think — you both want to be near.']},future:{y:80,t:42,note:['你想要一个方向，J 更习惯活在当下。','You want a direction; J lives more in the present.']}}[d.k]})),
 };

 const api={SECTIONS,Q,STATUS,ARCH,DIMS,score,summarize,DEMO};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.EX_REFLECT=api;
})(typeof window!=='undefined'?window:globalThis);
