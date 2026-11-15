/* P2 面孔 · 六张可翻面的档案卡 + 年龄对照（数据内联） */
(function(){
'use strict';
var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
d.documentElement.classList.add('js');

/* ---------- 年龄：六个阶段，各对一个真实的人 ---------- */
var age=d.getElementById('age'),bio=d.getElementById('bio');
var B=[
 {max:19,n:'萧华',y:'1916—1985',a:19,t:'1935 年',s:'生卒年与职务据公开党史资料',
  b:['江西兴国人。17 岁任少共国际师政委。','长征时 19 岁，随部队北上。']},
 {max:25,n:'钟赤兵',y:'1914—1975',a:21,t:'1935 年 2 月',s:'求是网 · 娄山关',
  b:['1935 年 2 月，娄山关。右小腿中弹，继续指挥。','半个月内三次截肢，截去整条右腿。','部队要他留下养伤。他拄着拐，走到了陕北。']},
 {max:31,n:'陈树湘',y:'1905—1934',a:29,t:'1934 年 12 月',s:'求是网 · 湘江',
  b:['红五军团第三十四师师长。','湘江东岸，全军后卫。','1934 年 12 月 18 日牺牲，29 岁。']},
 {max:37,n:'徐向前',y:'1901—1990',a:34,t:'1935 年',s:'生卒年与职务据公开党史资料',
  b:['山西五台人。红四方面军总指挥。','1935 年率部参加长征。']},
 {max:46,n:'刘伯承',y:'1892—1986',a:43,t:'1935 年 5 月',s:'习近平 2026.10.22 讲话',
  b:['红军总参谋长。','彝海边，与彝族首领小叶丹歃血为盟。','队伍没有打一枪，穿过了彝区。']},
 {max:999,n:'徐特立',y:'1877—1968',a:57,t:'1934 年 10 月',s:'生卒年与职务据公开党史资料',
  b:['湖南善化人。毛泽东在湖南一师的老师。','1934 年出发时 57 岁，是队伍里年纪最大的几个人之一。']}
];
function pick(a){for(var i=0;i<B.length;i++){if(a<=B[i].max)return B[i];}return B[B.length-1];}
var bioTimer=0,bioAnimation=null;
function setBio(html){
  var height=bio.getBoundingClientRect().height;clearTimeout(bioTimer);if(bioAnimation)bioAnimation.cancel();
  bio.style.height='auto';bio.innerHTML=html;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var next=bio.getBoundingClientRect().height;bio.style.height=height+'px';bio.getBoundingClientRect();bio.style.height=next+'px';
  if(bio.animate)bioAnimation=bio.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.22,.68,.2,1)'});
  bioTimer=setTimeout(function(){bio.style.height='auto';bioAnimation=null;},620);
}
function sync(){
  var raw=age.value.trim(),a=Number(raw);
  if(!raw||!isFinite(a)||a<=0||a>120){
    setBio('<p class="bio__hint">填一个数字。那年，有人和你一样大。</p>');
    return;
  }
  var p=pick(a);
  setBio('<p class="bio__you">你 <b>'+a+'</b> 岁。那一年，<b>'+p.n+'</b> '+p.a+' 岁。</p>'+
    '<p class="bio__meta">'+p.n+'　'+p.y+'　'+p.t+'</p>'+
    '<ol class="bio__l">'+p.b.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>'+
    '<p class="bio__src">〔'+p.s+'〕</p>');
}
age.addEventListener('input',sync);
age.addEventListener('keydown',function(e){if(e.key==='Enter'){age.blur();}});
sync();

/* ---------- 卡片 ---------- */
var P=[
{n:'钟赤兵',y:'1914—1975',r:'独腿将军',q:'娄山关，右小腿中弹。',
 b:['1935 年 2 月，娄山关战斗。十二团政委钟赤兵右小腿中弹，继续指挥。',
    '半个月内三次截肢，最后截去整条右腿。',
    '部队要他留下养伤。他拄着拐，走到了陕北。'],s:'求是网 · 娄山关'},
{n:'陈树湘',y:'1905—1934',r:'红五军团第三十四师师长',q:'全军后卫。全师 6000 多人。',
 b:['1934 年 12 月，湘江东岸。三十四师担任全军后卫。',
    '突围时腹部中弹，昏迷被俘。',
    '1934 年 12 月 18 日，牺牲。29 岁。'],s:'求是网 · 湘江'},
{n:'徐解秀',y:'湖南汝城 · 沙洲村',r:'借宿的人家',q:'一条被子，剪成两半。',
 b:['1934 年 11 月，三名女战士借宿她家。',
    '走的时候，把仅有的一条被子剪下一半，留给她。',
    '三名女战士，没有留下姓名。'],s:'人民日报 2026.10.12'},
{n:'刘伯承',y:'1892—1986',r:'红军总参谋长',q:'彝海边上，歃血为盟。',
 b:['1935 年 5 月，红军先遣队进入彝族区。',
    '刘伯承与彝族首领小叶丹在彝海边歃血为盟。',
    '队伍没有打一枪，穿过了彝区。'],s:'习近平 2026.10.22 讲话'},
{n:'无名者',y:'——',r:'红三十四师',q:'大部分人，连名字都没有留下。',
 b:['湘江战役后，红三十四师几乎全部牺牲。',
    '史称“绝命后卫师”。',
    '他们的名字无人知晓。'],s:'求是网 · 湘江'},
{n:'文学里的红军',y:'不是史料',r:'小说',q:'《金色的鱼钩》《七根火柴》',
 b:['作者王愿坚，写于二十世纪五十年代。',
    '这两篇是小说，不是史料。',
    '我们在课本里读到的长征，有一部分是文学。'],s:'王愿坚《七根火柴》《金色的鱼钩》'}];

var grid=d.getElementById('grid');
/* 人物照片、纪念像与群像分别注明，保留原有六份资料。 */
var portraits=[
 {file:'zhong.webp',kind:'zhong',label:'历史照片',alt:'钟赤兵在飞机前的历史照片抠图'},
 {file:'chen-statue.webp',kind:'statue',label:'纪念像',alt:'陈树湘纪念铜像实拍抠图'},
 {file:'xu.webp',kind:'elder',label:'历史照片',alt:'徐解秀讲述半条被子故事时的照片抠图'},
 {file:'liu.webp',kind:'person',label:'历史照片',alt:'刘伯承历史肖像照片抠图'},
 {file:'red-army.webp',kind:'group',label:'红军群像 · 资料照',alt:'红军将士历史合影抠图，非红三十四师身份指认'},
 {file:'wang.webp',kind:'writer',label:'作者 · 王愿坚',alt:'作者王愿坚写作时的历史照片抠图'}
];
function portrait(index){var p=portraits[index];return '<img src="'+window.ASSET+'portraits/'+p.file+'" alt="'+p.alt+'" loading="lazy" decoding="async" draggable="false">';}
var images=['n05.jpg','n02.jpg','n04.jpg','n06.jpg','n09.jpg','n08.jpg'];
grid.innerHTML=P.map(function(p,index){
  return '<button class="fc" data-name="'+p.n+'" type="button" aria-pressed="false" aria-label="'+p.n+'，按下看背面">'+
    '<span class="fc__tilt"><span class="fc__in">'+
      '<span class="fc__f" aria-hidden="false"><span class="fc__glass"></span>'+
        '<span class="fc__bg"><img src="'+window.ASSET+'img/'+images[index]+'" alt="" loading="lazy" draggable="false"></span>'+
        '<span class="fc__number">0'+(index+1)+' / 背影</span><span class="fc__archive">'+portraits[index].label+'</span>'+
        '<span class="fc__portrait fc__portrait--'+portraits[index].kind+'">'+portrait(index)+'</span>'+
        '<span class="fc__text"><span class="fc__t">'+p.n+'</span><span class="fc__y">'+p.y+'</span>'+
        '<span class="fc__r">'+p.r+'</span><span class="fc__q">'+p.q+'</span></span>'+
        '<span class="fc__more">轻点，读故事<i aria-hidden="true">↗</i></span><span class="fc__sheen"></span>'+
      '</span><span class="fc__b" aria-hidden="true"><span class="fc__glass"></span><span class="fc__b-title">'+p.n+'</span>'+
        '<span class="fc__stories" role="list">'+p.b.map(function(t){return '<span role="listitem">'+t+'</span>';}).join('')+'</span>'+
        '<small>〔'+p.s+'〕</small><span class="fc__back-hint">轻点返回 / ESC</span><span class="fc__sheen"></span>'+
      '</span></span></span></button>';
}).join('');

function flip(c,on){c.setAttribute('aria-pressed',String(on));c.setAttribute('aria-label',c.dataset.name+(on?'，故事背面，再次按下返回':'，按下看背面'));c.querySelector('.fc__f').setAttribute('aria-hidden',String(on));c.querySelector('.fc__b').setAttribute('aria-hidden',String(!on));}
grid.addEventListener('click',function(e){
  var c=e.target.closest('.fc');if(!c)return;
  var on=c.getAttribute('aria-pressed')==='true';
  flip(c,!on);
});
grid.addEventListener('keydown',function(e){
  var c=e.target.closest('.fc');if(!c)return;
  if(e.key==='Escape'){flip(c,false);}
});

/* ---------- 露出 ---------- */
var sec=d.querySelector('.cards');
if(sec){
  if(!('IntersectionObserver' in window)){sec.classList.add('seen');return;}
  var io2=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){sec.classList.add('seen');io2.disconnect();}});
  },{rootMargin:'0px 0px -12% 0px'});
  io2.observe(sec);
  if(reduce)sec.classList.add('seen');
}
})();
