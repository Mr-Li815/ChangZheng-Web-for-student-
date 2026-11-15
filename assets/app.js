/* 夜行 · 共享脚本（普通 IIFE，无 module，数据内联，file:// 可用） */
(function(){
'use strict';
var d=document,root=d.documentElement,body=d.body,
reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if((navigator.hardwareConcurrency||8)<4)root.classList.add('lite');

/* ---------- 导航 / 页码 ---------- */
var PAGES=[['index.html','序章'],['p1-journey.html','跋涉'],['p2-faces.html','背影'],['p3-objects.html','行装'],['p4-numbers.html','丈量'],
['p5-follow.html','同行'],['p6-spirit.html','火种'],['p7-comic.html','分镜'],['p8-flame.html','天亮']];
var cur=+body.dataset.i||0,A=PAGES[cur-1],B=PAGES[cur+1];
var ATRoot=(body.dataset.i==='0');
window.ASSET=(ATRoot?'':'../')+'assets/';
function pgHref(f,i){return (i===0||f==='index.html')?(ATRoot?'index.html':'../index.html'):((ATRoot?'pages/':'')+f);}
/* 全站导览：按原有章节顺序分为启程、跋涉、续写三程。 */
var chapterNotes=['于都 · 点燃微光','沿着足迹，走进山河','看见同行的人','打开随身的行囊','用数字丈量征途','入列，走一段自己的路','重访四支队伍的路线','让历史走进下一帧','把回声留给后来的人'];
var chapterMarks=['序','一','二','三','四','五','六','七','终'];
var branchPages=[['p5-run.html','十二幕','主线体验'],['p5a-quiz.html','八个数','数字快答'],['p5b-story.html','你要走的那一段','入列故事'],['p5c-art.html','你走过的地方','沿途造像']];
var currentFile=location.pathname.split('/').pop(),branchCurrent=null;
branchPages.forEach(function(p){if(p[0]===currentFile)branchCurrent=p;});
function mesh(){return '<span class="march-mesh" aria-hidden="true"><i></i><i></i><i></i><span></span></span>';}
var nav=d.createElement('nav');nav.className='nav march-nav';nav.setAttribute('aria-label','长征章节导览');
nav.innerHTML='<div class="march-bar">'+mesh()+
 '<a class="march-brand" href="'+pgHref('index.html',0)+'" aria-label="夜行，返回序章"><span class="march-emblem" aria-hidden="true">★</span><span>夜行<small>长征 · 行路之间</small></span></a>'+
 '<span class="march-divider" aria-hidden="true"></span>'+
 '<div class="march-index"><ol class="march-stops">'+PAGES.map(function(p,i){
   return '<li><a class="march-stop" href="'+pgHref(p[0],i)+'"'+(i===cur?' aria-current="page"':'')+'><span class="march-stop-number">'+String(i).padStart(2,'0')+'</span><b>'+p[1]+'</b></a></li>';
 }).join('')+'</ol><span class="march-liquid" aria-hidden="true"></span></div>'+
 '<button class="xz march-assistant" type="button" aria-label="打开小征讲解员" aria-haspopup="dialog" aria-controls="xzp" aria-expanded="false"><span aria-hidden="true">✦</span><b>小征</b></button>'+
 '<span class="march-trail" aria-hidden="true">'+PAGES.map(function(p,i){return '<i'+(i===cur?' class="here"':(i<cur?' class="passed"':''))+'></i>';}).join('')+'</span></div>';
body.insertBefore(nav,d.getElementById('main'));
var indexBox=nav.querySelector('.march-index'),liquid=nav.querySelector('.march-liquid');
var stopLinks=[].slice.call(nav.querySelectorAll('.march-stop'));
function syncGuideViewport(){nav.style.setProperty('--guide-viewport',d.documentElement.clientWidth+'px');}
syncGuideViewport();
/* 章节全部摊在条上：悬停/聚焦时高亮块滑过去 */
function placeLiquid(link,instant){
 if(!link)return;
 var b=link.getBoundingClientRect(),p=indexBox.getBoundingClientRect();
 if(instant)liquid.classList.add('instant');
 liquid.style.setProperty('--liquid-x',(b.left-p.left+indexBox.scrollLeft).toFixed(1)+'px');
 liquid.style.setProperty('--liquid-y',(b.top-p.top+indexBox.scrollTop).toFixed(1)+'px');
 liquid.style.setProperty('--liquid-w',b.width.toFixed(1)+'px');
 liquid.style.setProperty('--liquid-h',b.height.toFixed(1)+'px');
 liquid.classList.add('ready');
 if(instant)requestAnimationFrame(function(){liquid.classList.remove('instant');});
}
stopLinks.forEach(function(link){
 link.addEventListener('pointerenter',function(){placeLiquid(link,false);});
 link.addEventListener('focus',function(){placeLiquid(link,false);});
});
indexBox.addEventListener('pointerleave',function(){placeLiquid(stopLinks[cur],false);});
nav.addEventListener('keydown',function(e){
 var i=stopLinks.indexOf(d.activeElement);if(i<0)return;
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 e.preventDefault();e.stopPropagation();
 var next=(i+(e.key==='ArrowRight'?1:stopLinks.length-1))%stopLinks.length;
 stopLinks[next].focus();
});
addEventListener('resize',function(){syncGuideViewport();placeLiquid(stopLinks[cur],true);});
d.addEventListener('visibilitychange',function(){nav.classList.toggle('mesh-paused',d.hidden);});
requestAnimationFrame(function(){placeLiquid(stopLinks[cur],true);});
var pg=d.createElement('footer');pg.className='pager';
pg.innerHTML=(A?'<a href="'+pgHref(A[0],cur-1)+'">← '+A[1]+'</a>':'<span></span>')+'<span class="num">'+(cur+1)+' / '+PAGES.length+'</span>'+(B?'<a href="'+pgHref(B[0],cur+1)+'">'+B[1]+' →</a>':'<span></span>');
body.appendChild(pg);

/* ---------- 页脚 ---------- */
var ft=d.createElement('footer');ft.className='foot';
ft.innerHTML='<div class="foot__in">'+
  '<p class="foot__t">夜行 · 以我青春，续写长征华章<em>AI + 网页设计与制作技能竞赛　2026</em></p>'+
  '<p class="foot__k">史实来源　求是网 · 人民日报 · 光明日报 · 新华社</p>'+
  '<p class="foot__k foot__addr">中国共产党历史展览馆'+
    '<em>北京市朝阳区北辰东路 9 号</em>'+
    '<em>010-87992000</em>'+
    '<em>周二至周日 9:00—17:00（16:00 停止入馆）</em></p>'+
'</div>';
body.appendChild(ft);

/* ---------- 转场：进入淡入 + 光扫；离开 200ms 黑场 ---------- */
requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('on');});});
d.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target||a.hasAttribute('download'))return;
  var h=a.getAttribute('href');if(!h||h[0]==='#'||/^[a-z]+:/i.test(h))return;
  e.preventDefault();root.classList.add('leave');
  setTimeout(function(){location.href=a.href;},reduce?0:200);
});
addEventListener('pageshow',function(e){if(e.persisted)root.classList.remove('leave');});
[].forEach.call(d.querySelectorAll('[data-reset]'),function(a){a.addEventListener('click',function(){try{localStorage.removeItem('follow.v1');}catch(e){}});});

/* ---------- 路线（P0 的 G1 与 P8 的回响共用；坐标为示意值） ---------- */
var N=[['于都','1934.10',89.5,82.4,'l'],['湘江','1934.11.27',61.3,83.4,'l'],['遵义','1935.1.15–17',39.2,76.2,'r'],
['大渡河 · 泸定桥','1935.5',11.4,68.7,'r'],['吴起镇','1935.10.19',46.6,44.3,'r']];
function seg(a,b,k,m){var dx=b[0]-a[0],dy=b[1]-a[1],nx=-dy*.16*k,ny=dx*.16*k;
  return (m?'M'+a:'')+'C'+[a[0]+dx*.33+nx,a[1]+dy*.33+ny,a[0]+dx*.66-nx,a[1]+dy*.66-ny,b[0],b[1]];}
function route(svg){
  var r=svg.getBoundingClientRect(),W=r.width,H=r.height,
  P=N.map(function(n){return [n[2]*W/100,n[3]*H/100];}),full='',i,j,p;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  if(!svg._p){svg._p=[];for(i=0;i<5;i++){p=d.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('pathLength','1');if(i===4)p.setAttribute('class','pulse');svg.appendChild(p);svg._p.push(p);}}
  for(j=0;j<4;j++){svg._p[j].setAttribute('d',seg(P[j],P[j+1],j%2?1:-1,1));full+=seg(P[j],P[j+1],j%2?1:-1,!j);}
  svg._p[4].setAttribute('d',full);
  return P;
}

/* ---------- P0 · 序章：一根火柴，点着整条路（自动，不需要点） ---------- */
var st=d.getElementById('g1'),match=d.getElementById('match');
if(st){
  var svg=st.querySelector('.route'),light=st.querySelector('.light'),
      segs=[],P=[],nl=[],prev=0,raf=0,SEG=2000;
  try{prev=sessionStorage.getItem('yx.g1');}catch(e){}

  nl=N.map(function(n){var e=d.createElement('div');e.className='n';e.dataset.s=n[4];
    e.style.left=n[2]+'%';e.style.top=n[3]+'%';e.innerHTML='<i></i><em>'+n[1]+'</em><b>'+n[0]+'</b>';
    st.appendChild(e);return e;});

  function size(){P=route(svg);segs=svg._p.slice(0,4);}
  size();addEventListener('resize',size);

  function move(x,y,k){light.style.transform='translate3d('+x+'px,'+y+'px,0) scale('+(k||1)+')';}

  /* 火星：点着的那一刻炸开几粒 */
  function sparks(x,y,n){
    if(reduce)return;
    for(var i=0;i<n;i++){
      var e=d.createElement('i');e.className='ember';
      e.style.left=x+'px';e.style.top=y+'px';
      e.style.setProperty('--dx',((Math.random()-.5)*80).toFixed(0)+'px');
      e.style.setProperty('--dy',(-28-Math.random()*95).toFixed(0)+'px');
      e.style.setProperty('--d',(1.1+Math.random()*1.5).toFixed(2)+'s');
      e.style.setProperty('--dl',(Math.random()*.5).toFixed(2)+'s');
      st.appendChild(e);
      (function(el){setTimeout(function(){if(el.parentNode)el.remove();},3200);})(e);
    }
  }

  function ignite(i){
    if(!nl[i]||nl[i].classList.contains('on'))return;
    nl[i].classList.add('on');
    if(P[i])sparks(P[i][0],P[i][1],i===N.length-1?10:4);
  }

  function end(){
    try{sessionStorage.setItem('yx.g1','1');}catch(e){}
    st.classList.add('done');
    light.classList.add('off');
    var last=P[P.length-1];
    if(!reduce&&last){
      var f=d.createElement('div');f.className='flare';
      f.style.left=last[0]+'px';f.style.top=last[1]+'px';
      st.appendChild(f);
      setTimeout(function(){if(f.parentNode)f.remove();},2600);
    }
    setTimeout(function(){root.classList.add('nav-on');},reduce?0:800);
    setTimeout(function(){match.classList.add('armed');match.disabled=false;},reduce?0:1900);
  }

  function allOn(){
    nl.forEach(function(e){e.classList.add('on');});
    segs.forEach(function(p){p.classList.add('on');});
    end();
  }

  function run(){
    if(prev||reduce)return allOn();
    if(!P.length)return allOn();
    light.classList.add('on');
    move(P[0][0],P[0][1],1);
    ignite(0);
    var k=0;
    function burn(){
      if(k>=segs.length)return end();
      var path=segs[k],L=path.getTotalLength(),t0=Date.now(),iv;
      path.style.transitionDuration=SEG+'ms';
      path.style.transitionTimingFunction='linear';
      path.classList.add('on');
      iv=setInterval(function(){
        var p=Math.min(1,(Date.now()-t0)/SEG),pt=path.getPointAtLength(L*p);
        move(pt.x,pt.y,1+.45*Math.sin(p*Math.PI));
        if(p>=1)clearInterval(iv);
      },16);
      setTimeout(function(){clearInterval(iv);k++;ignite(k);burn();},SEG);
    }
    setTimeout(burn,1000);
  }
  run();

  match.addEventListener('click',function(){
    if(match.disabled)return;match.disabled=true;
    var r=match.getBoundingClientRect(),b=d.createElement('div');
    b.className='bloom';b.style.left=r.left+r.width/2+'px';b.style.top=r.top+8+'px';
    d.body.appendChild(b);
    setTimeout(function(){location.href=match.dataset.href;},reduce?0:600);
  });
}

/* ---------- P8 · 火柴与路线的回响 ---------- */
var ec=d.getElementById('echo');
if(ec){
  route(ec);addEventListener('resize',function(){route(ec);});
  setTimeout(function(){ec._p.slice(0,4).forEach(function(p,i){p.style.transitionDelay=(1.6+i*.8)+'s';p.classList.add('on');});},60);
  if(match)setTimeout(function(){match.classList.add('armed');},reduce?0:900);
}

/* ---------- 序章：导览不再等夜行游戏走完 ---------- */
if(body.hasAttribute('data-late')){
  setTimeout(function(){root.classList.add('nav-on');},reduce?0:1100);
}
})();
