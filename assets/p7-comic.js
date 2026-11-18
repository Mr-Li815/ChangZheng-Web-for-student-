/* P7 分镜 · 全屏吸附翻页 + 运镜揭示 / 视差 / 火星 / 拟声词 / 自动放映 */
(function(){
'use strict';
var d=document,NS='http://www.w3.org/2000/svg',root=d.documentElement,
    reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

/* 轻量模式：核数少 / 内存小 / 加了 ?lite / 手动按 L —— 关掉一切逐帧重绘的特效 */
var qs=location.search,
    forceLite=/[?&]lite\b/.test(qs),
    forceFull=/[?&]full\b/.test(qs),
    weak=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4,
    lite=forceLite||(!forceFull&&(weak||localStorage.getItem('p7lite')==='1'));
if(lite)root.classList.add('lite');
d.addEventListener('keydown',function(e){
  if(e.key!=='l'&&e.key!=='L')return;
  lite=!lite;root.classList.toggle('lite',lite);
  try{localStorage.setItem('p7lite',lite?'1':'0');}catch(x){}
},true);

var shots=[].slice.call(d.querySelectorAll('.shot')),
panels=[].slice.call(d.querySelectorAll('#s1,#s2,#s3,#s4,#s5,#s6,#s7'));

/* ---------- 名牌：二十二格 ---------- */
(function(){
  var box=d.getElementById('plates');if(!box)return;
  var named=[['廖大珠','二连连长'],['王海云','二连指导员'],['李友林','战士'],['刘金山','战士'],
    ['刘梓华','战士'],['赵长发','战士'],['杨田铭','战士'],['云贵川','战士']];
  box.innerHTML=named.map(function(person){
    return '<div class="plate"><b>'+person[0]+'</b><i>'+person[1]+'</i></div>';
  }).join('');
})();

/* ---------- 逐格揭示：入镜即开演（运镜由 CSS .seen 动画承担） ---------- */
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target);}});},
    {rootMargin:'0px 0px -12% 0px',threshold:.18});
  shots.forEach(function(p){io.observe(p);});
}else{shots.forEach(function(p){p.classList.add('seen');});}

/* ---------- 火星：沿火把线随机升起 ---------- */
(function(){
  if(reduce||lite)return;
  var paths=[].slice.call(d.querySelectorAll('.p7 .torch'));
  paths.forEach(function(path){
    var L;
    try{L=path.getTotalLength();}catch(e){return;}
    if(!L)return;
    var n=Math.max(4,Math.min(7,Math.round(L/260))),i;
    for(i=0;i<n;i++){
      var pt=path.getPointAtLength(L*((i+.35+Math.random()*.3)/n));
      var c=d.createElementNS(NS,'circle');
      c.setAttribute('cx',pt.x.toFixed(1));
      c.setAttribute('cy',pt.y.toFixed(1));
      c.setAttribute('r',(0.9+Math.random()*1.3).toFixed(1));
      c.setAttribute('class','spark'+(Math.random()<.4?' b':''));
      c.style.setProperty('--dx',((Math.random()-.5)*18).toFixed(1)+'px');
      c.style.animation='ember '+(2.2+Math.random()*1.8).toFixed(2)+'s ease-out '+(-Math.random()*3).toFixed(2)+'s infinite';
      path.parentNode.appendChild(c);
    }
  });

  /* 大火焰：从火苗底部冒火星 */
  [].slice.call(d.querySelectorAll('.p7 .fire path')).forEach(function(fp){
    var b;try{b=fp.getBBox();}catch(e){return;}
    if(!b||!b.width)return;
    for(var i=0;i<3;i++){
      var c=d.createElementNS(NS,'circle');
      c.setAttribute('cx',(b.x+b.width*(.28+Math.random()*.44)).toFixed(1));
      c.setAttribute('cy',(b.y+b.height*(.72+Math.random()*.26)).toFixed(1));
      c.setAttribute('r',(1+Math.random()*1.5).toFixed(1));
      c.setAttribute('class','spark b');
      c.style.setProperty('--dx',((Math.random()-.5)*24).toFixed(1)+'px');
      c.style.animation='ember '+(1.9+Math.random()*1.6).toFixed(2)+'s ease-out '+(-Math.random()*2.4).toFixed(2)+'s infinite';
      fp.parentNode.appendChild(c);
    }
  });
})();

/* ---------- 火：给每一簇火苗加火舌与烟 ---------- */
(function(){
  if(reduce||lite)return;
  var flames=[].slice.call(d.querySelectorAll('.p7 .fire > path, .p7 .flick > path'));
  flames.forEach(function(fp){
    var b;try{b=fp.getBBox();}catch(e){return;}
    if(!b||b.height<52)return;                 /* 只给大火焰加，小火把不动 */
    var g=fp.parentNode,i;
    for(i=0;i<2;i++){
      var t=d.createElementNS(NS,'path');
      t.setAttribute('d','M0 0C-2.4-11-1.2-21 .6-28 2.6-19 3-9 1.2 0Z');
      t.setAttribute('class','tongue');
      t.setAttribute('transform','translate('+(b.x+b.width*(.24+i*.26)).toFixed(1)+' '+
        (b.y+b.height*.78).toFixed(1)+') scale('+(.34+i*.09).toFixed(2)+')');
      t.style.animationDelay=(-Math.random()*1.5).toFixed(2)+'s';
      g.appendChild(t);
    }
    for(i=0;i<1;i++){
      var sm=d.createElementNS(NS,'ellipse');
      sm.setAttribute('cx',(b.x+b.width*(.35+i*.3)).toFixed(1));
      sm.setAttribute('cy',(b.y-6).toFixed(1));
      sm.setAttribute('rx',(b.width*(.3+i*.1)).toFixed(1));
      sm.setAttribute('ry',(b.width*(.16+i*.05)).toFixed(1));
      sm.setAttribute('class','smoke');
      sm.style.animationDelay=(-Math.random()*6).toFixed(2)+'s';
      g.appendChild(sm);
    }
  });
})();

/* ---------- 二十二：沿铁索数点 ---------- */
(function(){
  var box=d.getElementById('beads');if(!box)return;
  var chain=d.querySelectorAll('#s5 .chain')[2];if(!chain)return;
  var L=chain.getTotalLength(),n=22,i;
  var ring={0:1,3:1,6:1,9:1,12:1,15:1,18:1,21:1};   /* 八位留下姓名的 */
  for(i=0;i<n;i++){
    var t=(i+.5)/n,pt=chain.getPointAtLength(L*t);
    var g=d.createElementNS(NS,'g');
    g.setAttribute('class','bead');
    g.style.animationDelay=(-i*.21).toFixed(2)+'s';
    var c=d.createElementNS(NS,'circle');
    c.setAttribute('cx',pt.x.toFixed(1));c.setAttribute('cy',pt.y.toFixed(1));c.setAttribute('r','2.9');
    g.appendChild(c);
    if(ring[i]){
      var r=d.createElementNS(NS,'circle');
      r.setAttribute('cx',pt.x.toFixed(1));r.setAttribute('cy',pt.y.toFixed(1));r.setAttribute('r','8.4');
      r.setAttribute('class','bead-ring');
      g.appendChild(r);
    }
    box.appendChild(g);
  }
})();

/* ---------- 场景内视差：各层随滚动漂移，与运镜叠加 ---------- */
var scenes=[].slice.call(d.querySelectorAll('.scene')),layers=[];
scenes.forEach(function(a){
  [].slice.call(a.querySelectorAll('.layer[data-r]')).forEach(function(g){layers.push([a,g,+g.getAttribute('data-r')]);});
});
if(layers.length&&!reduce&&!lite){
  var lp=0;
  function para(){
    lp=0;var vh=innerHeight;
    layers.forEach(function(L){
      var r=L[0].getBoundingClientRect();
      if(r.bottom<-40||r.top>vh+40)return;
      var mid=r.top+r.height/2-vh/2;
      L[1].style.transform='translateY('+(mid*L[2]*.5).toFixed(1)+'px)';
    });
  }
  var lastP=0;
  addEventListener('scroll',function(){
    if(lp)return;
    var t=Date.now();
    if(t-lastP<32)return;lastP=t;
    lp=requestAnimationFrame(para);
  },{passive:true});
  addEventListener('resize',para,{passive:true});para();
}

/* ---------- 当前在第几格 ---------- */
function curIdx(){
  var y=scrollY,best=0,bd=1e9;
  shots.forEach(function(s,i){var dd=Math.abs(s.offsetTop-y);if(dd<bd){bd=dd;best=i;}});
  return best;
}

/* ---------- 拟声词：点击重播 ---------- */
d.addEventListener('click',function(e){
  var s=e.target.closest('.sfx');if(!s)return;
  s.classList.remove('boing');void s.offsetWidth;s.classList.add('boing');
});

/* ---------- 胶片进度条 ---------- */
var bar=null,btns=[],playBtn,fill;
(function(){
  if(panels.length<2)return;
  var names=['电令','夜行','对岸','铁索','勇士','夺桥','过桥'];
  bar=d.createElement('nav');bar.className='p7bar';bar.setAttribute('aria-label','分镜进度');
  bar.innerHTML='<button type="button" class="p7bar__play" aria-label="暂停自动放映">❚❚</button>'+
    '<span class="p7bar__p" aria-hidden="true"><i></i></span>'+
    panels.map(function(p,i){
      return '<button type="button" data-i="'+i+'" aria-label="跳到第 '+(i+1)+' 格">'+names[i]+'</button>';
    }).join('');
  d.body.appendChild(bar);
  btns=[].slice.call(bar.querySelectorAll('button[data-i]'));
  fill=bar.querySelector('.p7bar__p i');
  btns.forEach(function(b){b.addEventListener('click',function(){
    stopShow();
    cutTo(panels[+b.dataset.i]);
  });});
  var busy=0,bp=-1;
  function prog(){
    busy=0;var y=scrollY+innerHeight*.45;bp=-1;
    panels.forEach(function(p,i){if(p.offsetTop<=y)bp=i;});
    btns.forEach(function(b,i){b.classList.toggle('on',i===bp);if(i===bp)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  }
  addEventListener('scroll',function(){if(!busy){busy=1;requestAnimationFrame(prog);}},{passive:true});
  prog();
})();

/* 每幅先停留供阅读，再用短叠化切到下一幅。手动滚动仍是连续长卷。 */
var playing=!reduce,frame=0,elapsed=0,lastTime=0,transition=null;
var dwell=[5200,10000,11000,11500,9000,15000,9000,10500,6000];
playBtn=bar.querySelector('.p7bar__play');

function cutTo(shot){
  function show(){
    shot.classList.add('seen');
    shot.scrollIntoView({behavior:'instant',block:'start'});
  }
  if(transition)transition.skipTransition();
  if(reduce||lite||!d.startViewTransition){show();return;}
  root.classList.add('reel-cut');
  var cut=d.startViewTransition(show);
  transition=cut;
  cut.finished.finally(function(){
    if(transition===cut){transition=null;root.classList.remove('reel-cut');}
  });
}
function markPlay(){
  playBtn.textContent=playing?'Ⅱ':'▶';
  playBtn.setAttribute('aria-label',playing?'暂停自动放映':'开始自动放映');
  bar.classList.toggle('off',!playing);
}
function stopShow(){
  playing=false;cancelAnimationFrame(frame);frame=0;elapsed=0;lastTime=0;
  fill.style.transform='scaleX(0)';markPlay();
}
function tick(now){
  if(!playing)return;
  if(!d.hidden && lastTime)elapsed+=Math.min(now-lastTime,120);
  lastTime=now;
  var i=curIdx(),fraction=elapsed/dwell[i];
  fill.style.transform='scaleX('+Math.min(1,fraction)+')';
  if(fraction>=1){
    if(i===shots.length-1){stopShow();return;}
    elapsed=0;cutTo(shots[i+1]);
  }
  frame=requestAnimationFrame(tick);
}
function toggleShow(){
  if(playing){stopShow();return;}
  if(curIdx()===shots.length-1)cutTo(shots[0]);
  playing=true;lastTime=0;markPlay();frame=requestAnimationFrame(tick);
}
playBtn.addEventListener('click',toggleShow);
addEventListener('wheel',stopShow,{passive:true});
addEventListener('touchmove',stopShow,{passive:true});
d.addEventListener('keydown',function(e){
  if(e.defaultPrevented||e.altKey||e.metaKey||e.ctrlKey||e.target.closest('input,textarea,select,[contenteditable=true],.march-nav,.xz-panel'))return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    e.preventDefault();stopShow();
    cutTo(shots[Math.max(0,Math.min(shots.length-1,curIdx()+(e.key==='ArrowRight'?1:-1)))]);
  }else if(e.key===' '&&!e.target.closest('a,button')){
    e.preventDefault();toggleShow();
  }else if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key))stopShow();
});
markPlay();
if(playing)frame=requestAnimationFrame(tick);

/* ---------- 小征：读到最后现身 ---------- */
(function(){
  var ask=d.getElementById('ask'),end=d.getElementById('sEnd');if(!ask||!end)return;
  var said=0;
  function speak(){if(said)return;said=1;setTimeout(function(){ask.classList.add('on');},reduce?0:1500);}
  if('IntersectionObserver' in window){
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){speak();io2.disconnect();}});},
      {rootMargin:'0px 0px -12% 0px'});
    io2.observe(end);
  }else speak();
})();

})();
