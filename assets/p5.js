/* P5 跟上 · 12 幕 / 41 选项 / 5 结局（数据表驱动，内联；存档 localStorage['follow.v1']） */
(function(){
'use strict';
var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,$=function(i){return d.getElementById(i);},SK='follow.v1',box=$('stage'),S;
/* 选项：[角色('' 通用 / z 战士 / d 指导员), 文案, 后果(¦ 前后为 体力≥3 / <3), 体力, 信任, 记忆, 标签, 救人, 特殊] */
var SC={
1:['1934 年 10 月　江西 于都','老太太','于都河上架了五座浮桥。|天黑以后，队伍开始过。|两岸不能点灯。不能说话。||老乡把自家的门板拆下来，铺在桥上。|床板也拆了。还有人家把寿材抬了出来。||你负责看着其中一段。脚底的门板吱呀一声，你下意识放轻了脚，像怕吵醒这户人家。||一个老太太走过来，往你手里塞了两个红薯。还烫着。|她说：**伢子，早点回来。**||她身后的门框，是空的。',[
['','收下。天亮前必须过完。','天亮时，河上五座桥。岸上很多门框，是空的。',1,1,0,'yudu-借门'],
['','婉拒。去拆自己的铺板。','你去拆了自己的铺板。锤子砸在手上，肿了半个月。',-1,-1,0,'yudu-自拆'],
['','收下。把棉衣脱下来，搭在她肩上。','老太太没说话。她把棉衣又塞回你怀里，转身走了。',-2,2,1,'yudu-赠衣']]],
2:['1934 年 10 月　于都，河堤','妹妹','出发前，连里发了最后一次津贴。|两块银元。||你妹妹在河堤上站着。她十五岁，手里攥着一双布鞋。|她低头替你把鞋口撑开。你想说，等我回来，你的脚也该长大了。可话到嘴边，只问了一句：合脚吗？问完才发觉，穿鞋的是自己。',[
['','两块都给她。','她把银元收下了。走出二十里，你摸到衣角发硬——她把两块都缝回来了。鞋底是她纳的。',-1,0,2,'yudu-银元'],
['','两块都带走。','两块银元揣在贴身的衣袋里。走出三十里，它们还在。你一直没舍得花。',2,0,-1,'yudu-留银'],
['','留一块。','你把一块放在她手心。她攥着，没说话。你在她手背上拍了一下，就走了。',1,0,1,'yudu-平分']]],
3:['1934 年 12 月 1 日　广西 界首','水生','江面上漂着东西。||担架上躺着你同村的人，水生，十九岁。腿从膝盖以下没了。|他说：**你走。**||小时候去河里摸鱼，总是他在前面催你。如今还是这两个字，你却怎么也迈不开腿。||全连已经走出半里。',[
['','抬着他走。','你抬着他走了三里。第四里，你把他扛在背上。到江边的时候，你还剩半条命。',-3,2,2,'xiangjiang-救人','水生'],
['','托给岸边的人家。','接他的是一对老夫妻。他们把他抬进屋，烧了水。你走的时候，他没看你。',0,-1,1,'xiangjiang-托付'],
['','留下一颗手榴弹，说：我们回来接你。','他把手榴弹接过去，藏在怀里。他说：好。',0,-1,3,'xiangjiang-永别','','g2'],
['d','命令两个人抬他。','你点了两个人的名字。他们抬起担架，一路没说话。走到半路，一个人的肩膀渗出血来。他没换肩。',-2,3,1,'xiangjiang-命令','水生']]],
4:['1934 年 12 月 3 日　湘江以东，山里','班长','过了江的，三万多人。|你们班剩四个：你，班长，一个湖南兵，一个还在发烧的。||歇脚时，你习惯地往旁边挪了挪。挪完才想起来，那个爱挨着你坐的人没过江。||班长蹲在地上，把烟袋磕了磕。|他说：**还走吗？**',[
['','走。','班长看了你一眼。他把烟袋收起来了。',0,2,0,'xiangjiang-继续'],
['','我想回家。','班长没骂你。他说：回家要走回头路。回头路比前头长。',0,0,2,'xiangjiang-动摇'],
['','（不说话，站起来，把枪背上。）','班长也站起来。他把烟袋别在腰上。',1,1,0,'xiangjiang-沉默'],
['d','把烟袋递给他。','班长接过去，装了一锅。他抽了两口，递回给你。你们谁也没再说话。',0,3,1,'xiangjiang-递烟']]],
5:['1935 年 1 月　贵州 遵义','卖炭的','连里要补人。你去街上动员。|一个卖炭的年轻人跟着你走了三条街。他十九岁。|他把扁担换了个肩，腾出手来拍衣襟。炭灰反倒印出一个清楚的掌印。你等着，没催他。|他问：**走了，还能回来吗？**',[
['','能。','他报了名。三个月后，在娄山关，他走在最前面。',0,2,2,'zunyi-承诺'],
['','不知道。','他站了很久，说：那我回去跟我娘说一声。他没有回来。',0,1,1,'zunyi-真话'],
['','（不说话，带他到报名处，让他看别人按手印。）','他看着别人按手印。他也按了。按完问你：这算不算答应了？',0,0,2,'zunyi-沉默']]],
6:['1935 年 2 月　娄山关下','','连里让每人写一封家书，写完交上去，统一寄。|纸上印着：**现在何处，不能告。**||你本来有许多话。落笔才发现，最想问的竟是：河堤那条小路，下雨还滑不滑？|墨在纸上洇开一小团。',[
['','一切都好。','信交上去了。后来你知道，那批信一封也没有寄出去。',0,0,-1,'loushan-规矩'],
['','我们在打仗。','第二天，指导员把信退给你。他说：打仗的事不要写。',0,-1,1,'loushan-实话'],
['','只写一句：鞋很好穿。','你只写了那一句。信交上去，和别人的一起，压在一个铁皮箱里。',0,1,2,'loushan-一句'],
['z','在信里夹了一片草叶。','你把一片干草叶夹在信纸里。后来信退回来，草叶碎了。',0,1,3,'loushan-草叶']]],
7:['1935 年 3 月　贵州 赤水河','','第四次过这条河。|七天前刚从这边过去。今天又回来。||队伍里有人发牢骚。|水一浸，腿上那道伤就疼。你认出了岸边那棵歪树。上一次经过时，你还跟它说，再也不见了。|班长走在前面，一句话不说。',[
['','问班长：为什么又回来？','班长想了很久，说：我也不知道。上面有上面的道理。他顿了顿：跟着走就是了。',0,2,1,'chishui-发问'],
['','跟旁边的人一起发牢骚','发完了牢骚，还是得过河。河还是那条河。',1,-1,0,'chishui-抱怨'],
['','（什么都不说，跟着走。）','你跟着走。第四次过河的时候，你已经不看对岸了。',1,0,2,'chishui-沉默']]],
8:['1935 年 6 月　四川 夹金山','路边的人','山上没有路。雪到膝盖。|前面的人在走，后面的人在跟。||路边坐着一个人，靠着石头。|他还睁着眼睛。|你摘下手套去摸。起先只摸到自己指尖在抖，等了一会儿，才分清他的脉搏。||队伍在你身后，一直往上走。',[
['','背他','你背着他走了两百步。雪没到膝盖。他在你背上说：放我下来。你没放。天黑之前，你们到了山顶。¦你背着他刚走出两步。第三步，你们一起摔进雪里。',-4,1,3,'jinshan-背人','路边的人','g3'],
['','把干粮和辣椒留下，继续走','你把最后一把炒面塞进他怀里，还有两颗辣椒。他说：你走吧。你走了。走到半山腰，你回头。他还在那里。',-2,0,2,'jinshan-留下'],
['','走过去','你从他身边走过去。雪地上有一串脚印，是往上走的。你一直走到山顶，都没有回头。',0,0,-3,'jinshan-走过']]],
9:['1935 年 8 月　川西北草地','发烧的','第七天。干粮早就没了。|皮带煮过，皮鞋底也煮过。||最后一把青稞，在你手心里。|班里还有五个人。往常分饭，总有人伸手来抢个大的。今天四双手都搁在膝上，等你先动。',[
['','平分','你把它分成五份。每人一小撮。那一小撮在嘴里，很快就没了。',-1,2,1,'caodi-平分'],
['','全给发烧的那个','你把青稞给了发烧的那个。他说：你自己呢？你说：我吃过。',-2,1,2,'caodi-让粮'],
['','自己留一半','你留下了一半。走出一里地，你回头看了一眼。没有人看你。',2,-3,-1,'caodi-自留'],
['d','当众说：我这一份，给伤员。','说完，没有人动。过了一会儿，班长把他那一撮倒进了伤员的搪瓷缸。然后第二个，第三个。',-3,4,2,'caodi-当众']]],
10:['1935 年 8 月　草地边缘','小满','一个半大的孩子坐在泥地里。|背着一支比他还长的枪。|草鞋走烂了，脚上包着布。||他说：**同志，能带上我吗？**|开口时他的嗓子还带点童音。你忽然很想知道，在家里，大人们都怎么喊他。',[
['','带上','你把他拉起来。他问：你叫什么？你说了。他说：我叫小满。',-3,1,3,'caodi-小满','小满'],
['','指给他方向，让他自己追','你指给他方向：往北，看见火光就是。他点头。你走出去很远，还看见他站在那儿。',0,0,1,'caodi-指路'],
['','报告收容队','收容队的人来把他接走了。他们走的是另一条路。',-1,1,2,'caodi-收容'],
['z','把枪接过来，替他背。','你说：枪给我。你把手给我。他抓着你，一路上没松。天黑的时候，他说：我叫小满。',-2,2,3,'caodi-背枪','小满']]],
11:['1935 年 9 月　甘肃 腊子口','向导','两边是崖，中间一条缝。|向导说：走小路，近六里，但可能没水。|地图上标的路，远十里，稳。你摸了摸腰间的水壶，听见身后有人也轻轻晃了一下。||班长问你：**你走过山路。你说。**',[
['','听向导','小路走到一半，水断了。你们舔石壁上的潮气。',-1,0,0,'laziko-向导'],
['','信地图','大路上，你们遇见一支掉队的队伍。他们跟了上来。',-1,1,0,'laziko-地图'],
['','派人先探','探路的人回来的时候，天已经黑了。你们多走了十里。',-2,2,1,'laziko-探路']]],
12:['1936 年 10 月　甘肃 会宁','','明天就要会师了。|有人生火，有人睡觉，有人在擦枪。||你坐在一边，摸出一个小本子。|这一路，你记住了一些名字。|有的记得全，有的只记得一个姓。你试着小声喊了一遍。有个名字，嘴先记起了乡音，笔尖却迟迟想不起是哪个字。',[
['','把名字一个个写下来','你写了半夜，写了三页。最后一行，你停了一下，还是写下去了。你不确定他还活着。',0,0,3,'huining-写下'],
['','明天再写，先睡','你把本子塞回怀里，睡着了。第二天醒来，火已经灭了。',2,0,0,'huining-睡下'],
['','合上本子，什么也不写','你把本子合上。有些名字，你怕写下来，就真的成了名字。',0,0,-2,'huining-合上']]]};
var EN={
1:[['@1935 年 6 月　夹金山','','你坐下来的时候，风很大。','','队伍从你身边走过去。','后面还有人在往上走。'],['你的名字，没有留在任何一份名单上。']],
2:['后来你留在了当地人家里。','伤好以后，你往北走了三年。','没有找到队伍。','!很多伤员留在了沿途的村庄。'],
3:['@1935 年 10 月　吴起镇','','你到了。','班里剩三个人。','','你记得他们的脸。','不记得他们的名字了。'],
4:['@1936 年 10 月　会宁','','有人从人群里挤过来，喊了你的名字。','','你回过头。','','你不认得他了。'],
5:['@1936 年 10 月　会宁','','有人从人群里挤过来，喊了你的名字。','','你回过头。','','是小满。','','草地里，你背过他。','!你的名字不在任何一本书里。但他记得。']};
var TERMS=[['坚定信念','坚定革命的理想和信念，坚信正义事业必然胜利'],['不怕牺牲','不怕任何艰难险阻，不惜付出一切牺牲'],
['团结奋进','顾全大局、严守纪律、紧密团结'],['艰苦奋斗','同人民群众生死相依、患难与共、艰苦奋斗']];

function fresh(){return {scene:1,role:'z',name:'小伍',hp:10,trust:0,memory:0,rescued:[],picks:[],known:[],lost:0,stops:0};}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';';});}
function save(){try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}}
function wipe(){try{localStorage.removeItem(SK);}catch(e){}}
function load(){try{var j=JSON.parse(localStorage.getItem(SK));if(j&&j.scene>1&&j.scene<=12)return j;}catch(e){}return null;}
function ops(){return SC[S.scene][3].filter(function(o){return !o[0]||o[0]===S.role;});}

/* 体力 → 全屏黑遮罩 opacity（每降 2 点 +0.06，上限 0.35）；信任 → 剪影 */
function hud(){
  $('dim').style.opacity=Math.min(.35,Math.floor(Math.max(0,10-S.hp)/2)*.06);
  var n=Math.min(6,Math.floor(Math.max(0,S.trust)/2));
  [].forEach.call(d.querySelectorAll('.sil i'),function(e,i){e.classList.toggle('on',i<n);});
}
/* 记忆 +1 → 名字浮出 */
function float(n){var e=d.createElement('span');e.className='nmf';e.textContent=n;$('fl').appendChild(e);setTimeout(function(){e.remove();},2300);}

function lines(a,t){t=t||0;var h='';
  a.forEach(function(s){
    if(!s){h+='<i class="gap"></i>';return;}
    var c=s.charAt(0),r=s.slice(1);
    if(c==='@'){h+='<h2 class="m" tabindex="-1" style="--d:'+t+'s">'+r+'</h2>';t+=.16;}
    else if(c==='!'){h+='<p class="sm" style="--d:'+(t+.3)+'s">'+r+'</p>';t+=.16;}
    else{h+='<p style="--d:'+t+'s">'+s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')+'</p>';t+=.10;}
  });
  return {h:h,t:t};}
function put(h){
  box.classList.remove('fast');box.classList.add('off');
  setTimeout(function(){box.innerHTML=h;box.classList.remove('off');scrollTo(0,0);var m=box.querySelector('.m');if(m)m.focus({preventScroll:true});},reduce?0:400);}


/* 指导员视角：每一幕多一句（和战士切入的点不同） */
var RD={
1:'你带着十一个人过河。点名字，你数了两遍。',
2:'出发前你在心里过了一遍班里的人。有两个，你怕他们走不到头。',
3:'担架上的不是你的兵。你还是站住了。',
4:'班长问你之前，你已经知道有人想走。',
5:'你去动员，等于去许诺。',
6:'班里每个人的信你都看过。有几封，你替他们改过。',
7:'怨气不解决，会变成掉队。',
8:'你走在最前面，因为后面的人在看你。',
9:'分粮是你的事。分得再公平，也总有人不够。',
10:'他不是你班里的人。管不管，是你的选择。',
11:'你要替全班做一个判断，然后一起承担。',
12:'明天会师。点名册上，有几个名字你还没有划掉。'};
var PRO={
z:['你十七岁。','于都人。家里还有一个妹妹。','','你不知道要走多久。'],
d:['你二十四岁。','你带十一个人。','','他们看着你。']};

var sceneImages=['n01','n01','n02','n02','n04','o3','n06','n08','n09','n09','n10','n12'];
function coverScene(number){
  var cover=d.querySelector('.game-cover');
  cover.querySelector('img').src='../assets/img/'+sceneImages[number-1]+'.jpg';
  cover.querySelector('p').textContent='第 '+number+' 幕 ／ 共 12 幕';
}
function start(){
  S=fresh();var sv=load();if(sv){S=sv;hud();scene();return;}
  d.querySelector('.game-cover img').src='../assets/img/n01.jpg';
  d.querySelector('.game-heading p').textContent='角色体验';
  put(lines(['@1934 年 10 月　江西 于都'],0).h+
    '<p style="--d:.1s">你叫什么名字？</p><input id="nm" value="小伍" maxlength="6" aria-label="名字" style="--d:.12s">'+
    '<p class="pick" style="--d:.16s">选择你的身份，走进这段虚构的个人回忆。</p>'+
    '<div class="roles two" style="--d:.2s">'+
      '<button class="role" data-r="z"><b>战士</b><em>十七岁，于都人。<br>念过三年书。只想跟上。</em></button>'+
      '<button class="role" data-r="d"><b>指导员</b><em>二十四岁，带十一个人。<br>要想的事，比走的路多。</em></button>'+
    '</div>');
}
function prologue(){
  var r=lines(['@1934 年 10 月　江西 于都'].concat(PRO[S.role]||[]),.3);
  put(r.h+'<button class="nx" data-k="s" aria-label="开始">走上浮桥 →</button>');
}
function scene(){
  var c=SC[S.scene],a=c[2].split('|'),r,o=ops();
  coverScene(S.scene);
  if(S.scene===6 && S.picks.indexOf('yudu-银元')>=0)a.push('','手肘压着衣角，两块银元硌了你一下。你突然很想告诉妹妹：我摸到了。');
  if(S.scene===12 && S.rescued.indexOf('小满')>=0)a.push('','写到小满，笔倒是很快。你还记得他第一次报名字时，特意把那个「满」字说得很响。');
  if(S.scene===1)a.unshift(esc(S.name)+'。'+(S.role==='d'?'二十四岁。':'十七岁。于都人。'),'');
  if(S.role==='d'&&RD[S.scene])a.unshift(RD[S.scene],'');
  r=lines(['@'+c[0]].concat(a),.3);
  put(r.h+'<div class="opts" style="--d:'+(r.t+.3)+'s">'+o.map(function(x,i){
    return '<button class="opt'+(x[1].charAt(0)==='（'?' q':'')+'" data-i="'+i+'"><b>'+'ABCD'.charAt(i)+'</b><span>'+x[1]+'</span></button>';}).join('')+'</div>');
}
function choose(i){
  var c=SC[S.scene],x=ops()[i],p=x[2].split('¦'),lo=p.length>1&&S.hp<3,k=x[8]==='g2'?'g2':(x[8]==='g3'&&lo?'g3':'');
  S.hp+=x[3];S.trust+=x[4];S.memory+=x[5];S.picks.push(x[6]);
  if(x[7]&&S.rescued.indexOf(x[7])<0)S.rescued.push(x[7]);
  if(x[3]<0)S.stops++;
  if(c[1]){if(x[5]>0){S.known.push(c[1]);float(c[1]);}else if(x[5]<0)S.lost++;}
  hud();
  put(lines(['@'+c[0]],.1).h+'<p class="res" style="--d:.4s">'+(lo?p[1]:p[0])+'</p>'+
    (S.scene===7?'<p class="sm" style="--d:1.4s">三个月后，队伍跳出了包围圈。没有人再提这件事。</p>':'')+'<button class="nx" data-k="'+k+'" aria-label="继续">继续走 →</button>');
}
function nx(k){
  if(k==='s'){scene();return;}
  if(k==='g2'){put('');setTimeout(function(){put(lines(['你走出很远，听见后面一声闷响。','','你没有回头。'],.3).h+'<button class="nx" data-k="" aria-label="继续">继续走 →</button>');},reduce?0:2000);}
  else if(k==='g3'){put('');setTimeout(go,reduce?0:3000);}
  else go();
}
function go(){
  if(S.hp<=0)return end(1);
  S.scene++;if(S.scene>12)return end(S.memory<6?3:S.trust<6?2:(S.picks.indexOf('huining-写下')>=0&&S.rescued.length>=2)?5:4);
  save();scene();
}
var AGAIN='<button class="btn" data-again="1">再走一次</button>';
/* 结局后：小征把你这一局接回历史（取最近两个有出处的选择） */
function xzNote(force){
  var map={},out=[],seen={};
  (window.XZKB||[]).forEach(function(e){map[e.t]=e;});
  var tags=(force?[force]:[]).concat(S.picks.slice().reverse());
  for(var i=0;i<tags.length&&out.length<2;i++){
    var e=map[tags[i]];if(!e||seen[e.a])continue;seen[e.a]=1;out.push(e);
  }
  if(!out.length)return '';
  return '<div class="xzfx"><p class="xzfx__h">✦ 小征</p>'+out.map(function(e){
    return '<p class="xzfx__a">'+e.a+'</p><small>〔'+e.s+'〕</small>';}).join('')+'</div>';
}
function end(n){
  wipe();hud();var e=EN[n],r;
  var dm=d.getElementById('dim');if(dm)dm.style.opacity=0;
  var qz=d.getElementById('quiz');if(qz)qz.hidden=false;
  if(n===1){
    r=lines(e[0],.3);put(r.h);
    setTimeout(function(){put('');setTimeout(function(){put('<div class="fin" style="--d:.3s">'+lines(e[1],0).h+xzNote('ending-牺牲')+AGAIN+'</div>');},reduce?0:3000);},reduce?0:(r.t+2)*1000);return;}
  r=lines(e,.3);
  var card='<section class="card"><h3>你的长征档案</h3><dl>'+TERMS.map(function(t){return '<dt>'+t[0]+'</dt><dd>'+t[1]+'</dd>';}).join('')+'</dl>'+
    '<p>走过 12 幕。停下来 '+S.stops+' 次。<br>记住 '+S.known.length+' 个名字。丢掉 '+S.lost+' 个。</p>'+
    (S.role==='d'?'<p class="sm roleend">出发时十一个人。到这里，你点了名。</p>':'')+
    '<p class="sm">这四个词，是后来的人总结的。<br>走的时候，没有人知道它们叫什么。</p>'+
    (S.known.length?'<details class="lg"><summary>名字</summary><ol>'+S.known.map(function(n){return '<li>'+n+'</li>';}).join('')+'</ol></details>':'')+'</section>';
  put(r.h+'<div class="fin" style="--d:'+(r.t+1.2)+'s">'+xzNote()+card+AGAIN+'</div>');
}
box.addEventListener('click',function(ev){
  var t=ev.target.closest('button');
  if(box.classList.contains('off'))return;
  if(!t){box.classList.add('fast');return;}
  if(t.dataset.r){S.role=t.dataset.r;S.name=($('nm').value||'').trim()||'小伍';prologue();}
  else if(t.classList.contains('opt'))choose(+t.dataset.i);
  else if(t.classList.contains('nx'))nx(t.dataset.k);
  else if(t.dataset.again){S=fresh();wipe();hud();start();}
});
box.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&ev.target.id==='nm'){S.role='z';S.name=(ev.target.value||'').trim()||'小伍';scene();}});
start();
})();
