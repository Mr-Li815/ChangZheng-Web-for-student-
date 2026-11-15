/* P1 里程 · 路线点亮（滚动驱动）+ 数字滚动 + 12 张节点卡；数据内联 */
(function(){
'use strict';
var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,NS='http://www.w3.org/2000/svg';
d.documentElement.classList.add('js');
var O={门板:1,担架:2,电报稿:3,马灯:4,绑腿:5,草鞋:6,行军锅:7,半条被子:8};
var S=[
['于都','1934.10',25.95,115.41,'夜里过河。老乡把门板拆下来，铺在桥上。','8.6 万余人','门板','新华社《长征第一渡》'],
['湘江','1934.11.27',25.68,110.66,'血战五昼夜。这是长征最惨烈的一战。','8.6 万 → 3 万余','担架','求是网·湘江'],
['通道 · 黎平','1934.12',26.16,109.78,'不去湘西了。转向贵州。','长征途中第一次中央政治局会议','电报稿','光明日报 2026.9.12'],
['遵义','1935.1.15–17',27.73,106.93,'会开了三天。','增选毛泽东为中央政治局常委','马灯','新华社 2026.6.8'],
['赤水 · 娄山关','1935.1–3',28.59,105.70,'四次过同一条河。两次夺同一座关。','跳出四十万大军包围','绑腿','光明日报 2026.9.12'],
['金沙江','1935.5',26.05,102.30,'三万余主力全部安全渡过。','三万余','行军锅','光明日报 2026.9.12'],
['大渡河 · 泸定桥','1935.5',29.91,102.23,'没有桥面，只有铁索。','22 名突击队','草鞋','求是视频《这一座铁索桥》'],
['夹金山','1935.6',30.87,102.75,'终年积雪。大多身着单衣、脚穿草鞋。','海拔四千多米','草鞋','光明日报 2026.9.12'],
['川西北草地','1935.8',33.58,102.96,'第七天。皮带煮过，皮鞋底也煮过。','严重缺粮','行军锅','人民日报 2026.10.12'],
['腊子口','1935.9 中旬',34.13,103.60,'两边是崖，中间一条缝。','长征最后一道天险','绑腿','求是网·吴起'],
['吴起镇','1935.10.19',36.93,108.18,'到了。中央红军长征胜利结束。','行程二万五千里','—','求是网·吴起'],
['会宁','1936.10',35.70,105.05,'三大主力会师。长征结束。','近 7 万红军','—','求是网·会宁']];

/* 卡片 */
function pad(n){return ('0'+n).slice(-2);}
d.getElementById('cards').innerHTML=S.map(function(s,i){
  return '<article class="c"><div class="c__in">'+
  '<figure class="fig"><span class="fig__ph"><b>'+s[0]+'</b>'+s[1]+'<i>配图待补</i></span>'+
  '<img src="'+window.ASSET+'img/n'+pad(i+1)+'.jpg" alt="'+s[0]+' · '+s[1]+'" loading="lazy" onerror="this.remove()"></figure>'+
  '<span class="d">'+s[1]+'</span><h2>'+s[0]+'</h2><p class="l">'+s[4]+'</p><p class="v">'+s[5]+'</p>'+
  (O[s[6]]?'<a class="obj" href="p3-objects.html#o'+O[s[6]]+'"><i>物件</i>'+s[6]+'</a>':'')+
  (i===4?'<p class="age">那年，钟赤兵 21 岁。</p>':'')+'<small>〔'+s[7]+'〕</small></div></article>';}).join('');

/* 路线：经纬度 → 示意坐标，Catmull-Rom 转贝塞尔，预计算 12 站的里程比例 */
var P=S.map(function(s){return [30+(s[3]-101.5)/14.5*540,480-(s[2]-25)/12.5*440];});
function bez(i){var a=P[i-1]||P[i],b=P[i],c=P[i+1],e=P[i+2]||c;
  return 'C'+[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6,c[0],c[1]];}
var svg=d.getElementById('map'),base=svg.querySelector('.base'),line=svg.querySelector('.line'),
  w=svg.querySelector('.walker'),ct=svg.querySelector('.ct'),g=svg.querySelector('.pts'),
  tmp=d.createElementNS(NS,'path'),full='M'+P[0],cum=[0],tot=0,i,b;
svg.appendChild(tmp);
for(i=0;i<11;i++){b=bez(i);full+=b;tmp.setAttribute('d','M'+P[i]+b);tot+=tmp.getTotalLength();cum.push(tot);}
svg.removeChild(tmp);
base.setAttribute('d',full);line.setAttribute('d',full);
var L=line.getTotalLength(),F=cum.map(function(c){return c/tot;});
line.style.strokeDasharray=L;line.style.strokeDashoffset=L;
var pts=P.map(function(p,i){var e=d.createElementNS(NS,'g'),r=p[0]<300;
  e.setAttribute('class','pt');e.setAttribute('transform','translate('+p[0]+' '+p[1]+')');
  e.style.setProperty('--dl',(-i*0.43).toFixed(2)+'s');
  e.innerHTML='<circle class="hl" r="21"/><circle class="spark" r="2.1"/><circle class="rg" r="9"/><rect x="-3" y="-3" width="6" height="6"/><text x="'+(r?12:-12)+'" y="5" text-anchor="'+(r?'start':'end')+'">'+S[i][0]+'</text>';
  g.appendChild(e);return e;});

/* 总路线鸟瞰缩略图：同一份路径，缩到 180px */
var ov=d.getElementById('ov'),ovBase=ov.querySelector('.ov__base'),ovLine=ov.querySelector('.ov__line'),
  ovPts=ov.querySelector('.ov__pts'),ovDot=ov.querySelector('.ov__dot'),ovL=0,ovMini=[];
ovBase.setAttribute('d',full);ovLine.setAttribute('d',full);
ovL=ovLine.getTotalLength();
ovLine.style.strokeDasharray=ovL;ovLine.style.strokeDashoffset=ovL;
P.forEach(function(p){var c=d.createElementNS(NS,'circle');c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);c.setAttribute('r',2.2);ovPts.appendChild(c);ovMini.push(c);});
/* 按路线实际范围收紧鸟瞰图视野 */
try{
  var bb=ovLine.getBBox(),px=Math.max(14,bb.width*.09),py=Math.max(14,bb.height*.09);
  ov.querySelector('svg').setAttribute('viewBox',
    (bb.x-px)+' '+(bb.y-py)+' '+(bb.width+px*2)+' '+(bb.height+py*2));
}catch(e){}

/* 滚动 → p（0–1）：视口中线落在相邻两张卡的中心之间时，在两站里程比例间插值；每帧只写一次 */
var cards=[].slice.call(d.querySelectorAll('.c')),mid=[],vh=0,busy=0,cur=-1,on=[];
function measure(){vh=innerHeight;mid=cards.map(function(c){var r=c.getBoundingClientRect();return r.top+scrollY+r.height/2;});}
function frame(){
  busy=0;var y=scrollY+vh*.5,i=0,p,k,u,q;
  if(y<=mid[0])p=0;else if(y>=mid[11]){p=1;i=11;}
  else{while(mid[i+1]<y)i++;u=(y-mid[i])/(mid[i+1]-mid[i]);p=F[i]+(F[i+1]-F[i])*u;i+=u>.5?1:0;}
  line.style.strokeDashoffset=L*(1-p);
  q=line.getPointAtLength(L*p);w.setAttribute('transform','translate('+q.x+' '+q.y+')');
  ct.style.transform='translateY('+(-p*36)+'px)';
  if(ovL){
    ovLine.style.strokeDashoffset=ovL*(1-p);
    var m=ovLine.getPointAtLength(ovL*p);
    ovDot.setAttribute('cx',m.x);ovDot.setAttribute('cy',m.y);
  }
  for(k=0;k<12;k++){var t=y>=mid[k]-1;if(on[k]!==t){on[k]=t;pts[k].classList.toggle('lit',t);if(ovMini[k])ovMini[k].classList.toggle('lit',t);}}
  if(i!==cur){if(cur>=0){cards[cur].classList.remove('cur');pts[cur].classList.remove('cur');}
    cur=i;cards[i].classList.add('cur');pts[i].classList.add('cur');}
}
function sync(){measure();frame();}
addEventListener('scroll',function(){if(!busy){busy=1;requestAnimationFrame(frame);}},{passive:true});
addEventListener('resize',sync);addEventListener('load',sync);sync();

/* 进入路线区才显示鸟瞰图 */
var track=d.querySelector('.track');
if(track&&ov){
  var ioT=new IntersectionObserver(function(es){
    es.forEach(function(e){ov.classList.toggle('on',e.isIntersecting);});
  },{rootMargin:'-10% 0px -10% 0px'});
  ioT.observe(track);
}

/* 数字墙：进入视口 0 → 目标值，800ms easeOutExpo */
function count(n){var T=+n.dataset.n,dec=+n.dataset.d||0,t0=0;
  (function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/800);n.textContent=(T*(k===1?1:1-Math.pow(2,-10*k))).toFixed(dec);if(k<1)requestAnimationFrame(step);})(0);}
var nums=d.querySelectorAll('[data-n]');
if(!reduce)[].forEach.call(nums,function(n){n.textContent=(0).toFixed(+n.dataset.d||0);});
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add('in');
  var n=e.target.querySelector('[data-n]');if(n&&!reduce)count(n);});},{rootMargin:'0px 0px -20% 0px'});
[].forEach.call(d.querySelectorAll('.w'),function(x){io.observe(x);});
})();
