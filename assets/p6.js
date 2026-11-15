/* P6 火种 · 长征行军路线图
   经纬度真实坐标（等距圆柱投影），底图为中华人民共和国行政区划图
   省界/国界来源 DataV.GeoAtlas；路线与点位据公开史料标绘 */
(function(){
'use strict';
var d=document,NS='http://www.w3.org/2000/svg',
    reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,
    svg=d.getElementById('map');
d.documentElement.classList.add('js');
if(!svg)return;

/* 只取大陆及近海岛：南界 17°N，裁去南海海域 */
var W=1000,H=586,L0=72.5,L1=136,B0=17,B1=54.2;
function X(l){return (l-L0)/(L1-L0)*W;}
function Y(b){return (B1-b)/(B1-B0)*H;}
function P(a){return [X(a[0]),Y(a[1])];}
function n(v){return v.toFixed(1);}
function curve(a){
  var p=a.map(P),s='M'+n(p[0][0])+' '+n(p[0][1]),i;
  for(i=0;i<p.length-1;i++){
    var p0=p[i-1]||p[i],p1=p[i],p2=p[i+1],p3=p[i+2]||p2;
    s+='C'+n(p1[0]+(p2[0]-p0[0])/6)+' '+n(p1[1]+(p2[1]-p0[1])/6)+','+
        n(p2[0]-(p3[0]-p1[0])/6)+' '+n(p2[1]-(p3[1]-p1[1])/6)+','+n(p2[0])+' '+n(p2[1]);
  }
  return s;
}
function rings(rs){
  var s='';
  rs.forEach(function(r){
    var i;
    for(i=0;i<r.length;i+=2)s+=(i?'L':'M')+n(X(r[i]))+' '+n(Y(r[i+1]));
    s+='Z';
  });
  return s;
}
function mk(t,at){var e=d.createElementNS(NS,t),k;for(k in at)e.setAttribute(k,at[k]);return e;}

var RIVERS=[
 {n:'长江',w:2,pts:[[91,33.4],[96,32.6],[99.4,29.6],[101.4,26.6],[104.6,28.6],[106.6,29.6],[110.3,30.8],[114.3,30.6],[117.3,31.8],[119.4,31.6],[121.6,31.5]],at:[112,31.6]},
 {n:'黄河',w:2,pts:[[96,34.8],[100.6,35.6],[103.4,36.1],[105.6,37.4],[106.8,38.6],[108.9,40.4],[110.6,40.7],[110.4,37.6],[110.6,34.8],[113.6,34.8],[116.6,35.6],[118.2,37.4]],at:[109.2,40.9]},
 {n:'大渡河',w:1.2,pts:[[101.4,32.6],[102.2,31.4],[102.4,30.2],[102.4,29.3],[103.4,28.8]],at:[101.4,30.6]},
 {n:'金沙江',w:1.4,pts:[[96.6,32.8],[98.6,29.6],[99.6,27.4],[100.6,26.4],[102.2,26.6],[103.8,26.6],[104.6,27.6]],at:[100.4,27.2]},
 {n:'湘江',w:1.1,pts:[[111.2,25.4],[112.2,26.6],[112.6,27.6],[112.9,28.6]],at:[112.9,28.9]},
 {n:'乌江',w:1.1,pts:[[105.6,26.6],[107.2,27.2],[108.6,27.6],[109.4,28.4]],at:[108.6,28.7]},
 {n:'赤水河',w:1,pts:[[104.6,27.6],[105.6,28],[106.2,28.1],[106.6,28.4]],at:[104.4,27.4]}
];

/* 四支队伍：高饱和配色，与纸色底图拉开 */
var ROUTES=[
 {id:'r1',n:'红一方面军',sub:'中央红军 · 1934.10—1935.10',tag:'二万五千里',color:'#E03A2B',w:3.4,
  pts:[[115.4,25.95],[112.6,25.4],[110.9,25.6],[109.8,26.2],[109.1,26.2],[107.9,26.7],[107.4,27.1],
   [106.9,27.7],[106.4,28.1],[105.9,28.3],[105.0,27.9],[105.9,28.1],[106.4,27.9],[105.8,28.2],
   [106.0,27.4],[106.4,26.6],[104.4,25.6],[103.2,25.4],[102.4,26.5],[102.2,26.7],[102.4,27.6],
   [102.3,29.1],[102.2,29.9],[102.8,30.4],[102.6,30.9],[102.4,31.0],[102.6,31.4],[103.0,32.6],
   [103.2,33.4],[103.6,34.1],[104.4,34.2],[105.0,35.0],[106.6,35.6],[108.2,36.9],[109.7,37.1]]},
 {id:'r2',n:'红二方面军',sub:'红二、六军团 · 1935.11—1936.10',tag:'湘鄂川黔 → 甘孜',color:'#1E6FE0',w:2.9,dash:'11 6',
  pts:[[110.2,29.4],[110.5,29.1],[109.7,27.4],[109.2,27.4],[108.2,27.5],[105.3,27.3],[104.5,25.7],
   [102.4,25.2],[100.2,26.9],[99.7,27.8],[99.6,29.6],[100.0,31.6],[102.4,32.8],[103.3,33.3],
   [104.4,34.2],[105.7,35.7]]},
 {id:'r3',n:'红四方面军',sub:'1935.3—1936.10',tag:'川陕 → 会宁',color:'#0E9F8E',w:2.9,dash:'4 5',
  pts:[[107.2,31.9],[105.9,31.7],[105.5,32.3],[104.5,32.4],[103.9,31.7],[102.4,31.0],[103.0,32.6],
   [101.7,32.9],[102.4,31.0],[102.8,30.1],[102.9,30.2],[100.0,31.6],[105.0,35.7]]},
 {id:'r4',n:'红二十五军',sub:'1934.11—1935.9',tag:'鄂豫皖 → 陕北',color:'#8B4FE0',w:2.7,dash:'2 4',
  pts:[[114.4,31.9],[113.4,32.4],[111.6,33.8],[111.1,34.1],[109.9,33.9],[109.3,34.2],[107.4,34.4],
   [105.7,34.6],[105.3,34.9],[107.6,36.0],[109.5,36.9]]}
];

/* 关键点位：点开即出卡片（均属红一方面军序列） */
var PTS1=[
 {l:[115.4,25.95],n:'于都',t:'于都出发',dt:'1934.10.17',
  x:'中央红军主力 8.6 万余人从于都河渡口出发，开始了举世闻名的二万五千里长征。',s:'共产党员网'},
 {l:[110.9,25.6],n:'湘江',t:'湘江战役',dt:'1934.11.27—12.1',
  x:'红军血战五昼夜，突破国民党军第四道封锁线。中央红军由出发时的 8.6 万余人锐减至 3 万余人。',s:'共产党员网'},
 {l:[109.1,26.2],n:'黎平',t:'黎平会议',dt:'1934.12.18',
  x:'中共中央政治局在贵州黎平召开会议，肯定了毛泽东向贵州转兵的主张，改变了原定到湘西与红二、六军团会合的计划。',s:'共产党员网'},
 {l:[106.9,27.7],n:'遵义',t:'遵义会议',dt:'1935.1.15—17',
  x:'中共中央政治局扩大会议，事实上确立了毛泽东在党中央和红军的领导地位，是党的历史上一个生死攸关的转折点。',s:'共产党员网'},
 {l:[105.9,28.3],n:'土城·赤水',t:'四渡赤水',dt:'1935.1.19—3.22',
  x:'红军在川黔滇边四次渡过赤水河，采取声东击西、避实击虚的战法，在运动中摆脱了国民党军的围追堵截。',s:'共产党员网'},
 {l:[102.4,26.5],n:'皎平渡',t:'巧渡金沙江',dt:'1935.5.3',
  x:'红军在皎平渡等渡口，用七条小船、九天九夜从容渡过金沙江，跳出了数十万敌军的包围圈。',s:'共产党员网'},
 {l:[102.3,29.1],n:'安顺场',t:'强渡大渡河',dt:'1935.5.25',
  x:'红一团在安顺场强渡大渡河，十七勇士乘一条小船冒着弹雨登岸夺占渡口，粉碎了敌人妄图使红军成为「石达开第二」的企图。',s:'共产党员网'},
 {l:[102.2,29.9],n:'泸定桥',t:'飞夺泸定桥',dt:'1935.5.29',
  x:'二十二名突击队员攀着十三根铁索，冒着火海弹雨冲过大渡河，夺取泸定桥，打开了北上通道。',s:'共产党员网'},
 {l:[102.6,30.9],n:'夹金山',t:'翻越夹金山',dt:'1935.6.18',
  x:'夹金山是红军长征翻越的第一座大雪山，海拔 4000 多米。中央红军全部翻越夹金山。',s:'共产党员网'},
 {l:[103.2,33.4],n:'草地',t:'过草地',dt:'1935.8',
  x:'红军进入茫茫水草地，七天七夜，忍饥受冻，以野菜、皮带充饥，付出了巨大牺牲。',s:'共产党员网'},
 {l:[103.6,34.1],n:'腊子口',t:'突破腊子口',dt:'1935.9.17',
  x:'红军攻破天险腊子口，打开了北上进入甘南的通道，彻底粉碎了国民党军企图阻止红军北上的计划。',s:'共产党员网'},
 {l:[108.2,36.9],n:'吴起镇',t:'到达陕北',dt:'1935.10.19',
  x:'中央红军到达陕北吴起镇。历时一年、纵横十余省的长征胜利结束。',s:'共产党员网'},
 {l:[105.0,35.7],n:'会宁',t:'会宁会师',dt:'1936.10.9',
  x:'红一方面军与红四方面军在会宁会师；10 月 22 日红二方面军到达将台堡。三大主力会师，长征胜利结束。',s:'共产党员网'}
];
var LAB={ '土城·赤水':['end',-9,4], '安顺场':['end',-9,4], '夹金山':['end',-9,-2] };
var LABFIX={'四川':[105.2,30.9],'贵州':[107.7,26.2],'云南':[99.4,24.4],'甘肃':[98.5,38.5]};

/* ---------- 四支部队，共用节点、档案与播放引擎 ---------- */
var $=function(id){return d.getElementById(id);};
var SOURCE={
 qianxi:['中央党史和文献研究院 · 转战黔西北','https://www.dswxyjy.org.cn/n1/2018/0212/c244523-29820661.html'],
 atlas:['中央党史和文献研究院','https://www.dswxyjy.org.cn/GB/427277/462086/index.html'],
 second:['中国军网 · 马蹄声碎','https://www.81.mil.cn/wh_208594/16336471.html'],
 grass:['中国国家博物馆 · 长征日记','https://www.12371.gov.cn/web/article/1438665470022258688/web/content_1438665470022258688.html'],
 north:['人民网 · 红二方面军长征在甘肃','https://dangshi.people.com.cn/n1/2016/1020/c85037-28794827.html'],
 fourth:['中国军网 · 红四方面军发展历程','https://www.81.mil.cn/2021zt/2021-10/17/content_10099994_2.htm'],
 south:['人民网 · 红四方面军南下川康边','https://dangshi.people.com.cn/n1/2016/0902/c406330-28687932.html'],
 twentyfive:['中国军网 · 独树镇战斗','https://www.81.mil.cn/yljnt_208627/lsda_208656/16351944.html'],
 yu:['中国共产党新闻网 · 血战庾家河','https://cpc.people.com.cn/n1/2026/0611/c443712-40738097.html'],
 yongping:['人民网 · 永坪会师','https://dangshi.people.com.cn/n1/2021/0714/c436975-32157361.html'],
 jingchuan:['平凉市文旅局 · 四坡村反击战','https://wlj.pingliang.gov.cn/ztzl/wwbh/art/2022/art_0dd9f3c6f0fb42d5994c94b0691c0428.html']
};
function event(l,name,title,date,copy,source){return {l:l,n:name,t:title,dt:date,x:copy,source:SOURCE[source||'atlas']};}
ROUTES[0].events=PTS1.slice(0,12);
ROUTES[0].pts=ROUTES[0].pts.slice(0,-1);
ROUTES[0].events.forEach(function(pt){pt.source=SOURCE.atlas;});
ROUTES[1].tag='桑植 → 将台堡';
ROUTES[1].events=[
 event([110.16,29.44],'桑植·刘家坪','从桑植出发','1935.11.19','红二、红六军团告别湘鄂川黔革命根据地，从桑植刘家坪等地开始长征。','atlas'),
 event([106.03,27.02],'黔西','转战黔西','1936.02','部队向黔西、大定、毕节地区转战，继而进入乌蒙山区。','qianxi'),
 event([105.29,27.30],'毕节','进入黔西北','1936.02','红二、红六军团在黔西北机动作战，寻找突破围追堵截的机会。','qianxi'),
 event([104.30,26.65],'乌蒙山','乌蒙山回旋战','1936.03','红二、红六军团在滇黔边乌蒙山区回旋作战，以灵活机动摆脱围追堵截。','atlas'),
 event([99.95,26.87],'石鼓','抢渡金沙江','1936.04','部队经丽江抵达石鼓一带，从石鼓、巨甸等渡口渡过金沙江，继续向北。','second'),
 event([99.99,31.62],'甘孜','甘孜会师','1936.06—07','红二、红六军团与红四方面军在甘孜地区会师，随后组成红二方面军，共同北上。','atlas'),
 event([102.70,33.45],'松潘草地','穿越草地','1936.07—08','红二方面军从甘孜北上，穿越松潘草地，在艰苦环境中继续向甘南前进。','grass'),
 event([104.22,34.05],'哈达铺','走向甘南','1936.09','走出草地后，红二方面军到达哈达铺地区，为继续北上和主力会师创造条件。','north'),
 event([105.72,35.89],'将台堡','将台堡会师','1936.10','红二方面军在将台堡与红一方面军会师，完成长征。','north')
];
ROUTES[1].pts=[[110.16,29.44],[110.5,28.8],[109.7,27.4],[108.2,27.5],[106.03,27.02],[105.29,27.30],[104.3,26.65],[104.5,25.7],[102.4,25.2],[100.2,26.4],[99.95,26.87],[99.7,27.8],[99.6,29.6],[99.99,31.62],[100.9,32.4],[102.7,33.45],[104.22,34.05],[104.8,34.7],[105.72,35.89]];
ROUTES[2].events=[
 event([107.2,31.9],'川陕根据地','离开川陕根据地','1935.03','红四方面军从川陕根据地向西转移，强渡嘉陵江，开始长征。','atlas'),
 event([105.93,31.73],'苍溪·嘉陵江','强渡嘉陵江','1935.03—04','红四方面军在嘉陵江一线发起渡江战役，向西挺进，策应中央红军。','atlas'),
 event([103.85,31.68],'茂县','向川西北推进','1935.05—07','红四方面军在茂县等地作战，为实现与红一方面军会师创造条件。','atlas'),
 event([102.36,31.0],'懋功','懋功会师','1935.06','红一、红四方面军在懋功地区会师，两支队伍在雪山脚下汇合。','fourth'),
 event([101.7,32.9],'阿坝','行至阿坝','1935.08—09','红四方面军主力随左路军穿过草地到达阿坝，随后又折返南下。','fourth'),
 event([102.9,30.17],'天全·芦山','南下川康边','1935.秋—1936.初','南下部队转战天全、芦山等地，付出重大代价，后向西康北部转移。','south'),
 event([99.99,31.62],'甘孜','在甘孜重新集结','1936.春夏','部队西进道孚、炉霍、甘孜等地整编，后与红二、红六军团会师，一同北上。','fourth'),
 event([102.7,33.45],'松潘草地','再次北上','1936.07—08','红四方面军与红二方面军从甘孜地区北上，再次穿过草地，向甘南前进。','fourth'),
 event([105.05,35.69],'会宁','会宁会师','1936.10.09','红四方面军与红一方面军在会宁会师，长征走向胜利。','atlas')
];
ROUTES[2].pts=[[107.2,31.9],[105.93,31.73],[105.5,32.3],[104.5,32.4],[103.85,31.68],[102.36,31.0],[103.0,32.6],[101.7,32.9],[102.36,31.0],[102.9,30.17],[101.1,30.98],[100.7,31.4],[99.99,31.62],[100.7,32.4],[102.7,33.45],[103.5,34.4],[104.2,35.1],[105.05,35.69]];
ROUTES[3].events=[
 event([114.43,31.92],'何家冲','从何家冲出发','1934.11.16','红二十五军由河南罗山何家冲出发，开始战略转移，踏上长征道路。','twentyfive'),
 event([113.11,33.25],'独树镇','血战独树镇','1934.11.26','部队在河南方城独树镇一带遭到堵截，经激战突出重围，继续向伏牛山区前进。','twentyfive'),
 event([110.38,33.70],'丹凤·庾家河','庾家河会议与战斗','1934.12.10','部队在庾家河研究建立鄂豫陕根据地，会议期间与来袭敌军激战，打破围堵。','yu'),
 event([106.30,33.91],'两当','西征入甘','1935.08','红二十五军沿秦岭北麓西进，进入甘肃并攻占两当，策应主力红军的行动。','yongping'),
 event([105.67,34.86],'秦安','北渡渭河','1935.08','部队北渡渭河、进入秦安一带，继续向北，逼近静宁。','yongping'),
 event([106.13,35.62],'隆德·六盘山','翻越六盘山','1935.08','红二十五军攻占隆德后翻越六盘山，随后向陇东地区转进。','yongping'),
 event([107.26,35.33],'泾川·四坡村','四坡村反击战','1935.08.21','部队渡汭河时遭敌突袭，吴焕先率部反击，在这场战斗中牺牲。','jingchuan'),
 event([109.66,37.08],'永坪镇','先期到达陕北','1935.09.15','红二十五军抵达延川永坪镇，随后与陕甘红军会师，为迎接主力红军创造条件。','yongping')
];
ROUTES[3].pts=[[114.43,31.92],[113.7,32.3],[113.11,33.25],[112.5,33.7],[111.05,34.05],[110.38,33.70],[109.3,34.0],[108.8,34.0],[107.4,34.2],[106.30,33.91],[105.7,34.58],[105.67,34.86],[106.13,35.62],[106.28,35.63],[106.65,35.54],[107.26,35.33],[107.7,35.68],[108.2,36.1],[108.8,36.7],[109.66,37.08]];
var palette=['#f16c50','#79bade','#bbcda1','#e0b76f'];
ROUTES.forEach(function(rt,i){rt.color=palette[i];rt.remember=0;rt.progress=0;});
var defs=mk('defs',{});svg.appendChild(defs);
var base=mk('g',{});svg.appendChild(base);
function add(el){base.appendChild(el);return el;}
var grid=add(mk('g',{'class':'grid'}));
for(var gx=75;gx<=135;gx+=2.5)grid.appendChild(mk('line',{x1:n(X(gx)),y1:0,x2:n(X(gx)),y2:H}));
for(var gy=20;gy<=54;gy+=2.5)grid.appendChild(mk('line',{x1:0,y1:n(Y(gy)),x2:W,y2:n(Y(gy))}));
var OUT=window.CHINA_OUT||[];
if(OUT.length)add(mk('path',{d:rings(OUT),'class':'outfill'}));
var gp=add(mk('g',{'class':'provs'}));
(window.CHINA_GEO||[]).forEach(function(prov){gp.appendChild(mk('path',{d:rings(prov[1]),'class':'prov'}));});
if(OUT.length)add(mk('path',{d:rings(OUT),'class':'border'}));
var islands=add(mk('g',{'class':'isles'}));
(window.CHINA_ISL||[]).forEach(function(c){if(c[1]>B0)islands.appendChild(mk('circle',{cx:n(X(c[0])),cy:n(Y(c[1])),r:.7}));});
var labels=add(mk('g',{'class':'provlabs'}));
(window.CHINA_LABELS||[]).forEach(function(l){var c=LABFIX[l[0]]||[l[1],l[2]],t=mk('text',{x:n(X(c[0])),y:n(Y(c[1])),'class':'provlab'});t.textContent=l[0];labels.appendChild(t);});
var rivers=add(mk('g',{'class':'rivers'}));
RIVERS.forEach(function(r){rivers.appendChild(mk('path',{d:curve(r.pts),'class':'riv'}));});
var routeLayer=add(mk('g',{'class':'routes'}));
var nodeLayer=add(mk('g',{'class':'all-waypoints'}));
var active=0,eventIndex=-1,playback=0,playing=false,raf=0,revealAnimation=null;
ROUTES.forEach(function(rt,armyIndex){
 var pathData=curve(rt.pts),ghost=mk('path',{d:pathData,'class':'route route-ghost',stroke:rt.color,'stroke-width':1.5});routeLayer.appendChild(ghost);rt.ghost=ghost;
 var mask=mk('mask',{id:'reveal-'+rt.id,maskUnits:'userSpaceOnUse',x:0,y:0,width:W,height:H});
 var maskPath=mk('path',{d:pathData,fill:'none',stroke:'#fff','stroke-width':25,'stroke-linecap':'round'});mask.appendChild(maskPath);defs.appendChild(mask);rt.maskPath=maskPath;
 var el=mk('path',{d:pathData,'class':'route',stroke:rt.color,'stroke-width':3,mask:'url(#reveal-'+rt.id+')'});if(rt.dash)el.setAttribute('stroke-dasharray',rt.dash);routeLayer.appendChild(el);rt.el=el;rt.len=el.getTotalLength();
 maskPath.style.strokeDasharray=String(rt.len);maskPath.style.strokeDashoffset='0';
 var group=mk('g',{'class':'ways','data-army':rt.id});nodeLayer.appendChild(group);rt.group=group;
 var samples=[];for(var k=0;k<=1200;k++)samples.push(el.getPointAtLength(rt.len*k/1200));
 var lastSample=0;
 rt.events.forEach(function(pt,i){
  var q=P(pt.l),best=Infinity,bestI=lastSample;
  for(var s=lastSample;s<samples.length;s++){var dis=Math.hypot(samples[s].x-q[0],samples[s].y-q[1]);if(dis<best){best=dis;bestI=s;}}
  lastSample=bestI;pt.fraction=i===0?0:(i===rt.events.length-1?1:bestI/1200);pt.q=q;
  var node=mk('g',{'class':'wp',role:'button',tabindex:'-1','aria-label':rt.n+'，'+pt.n+'，'+pt.t+'，'+pt.dt,'aria-pressed':'false'});
  pt.leader=mk('line',{'class':'label-lead',x1:n(q[0]),y1:n(q[1]),x2:n(q[0]),y2:n(q[1])});node.appendChild(pt.leader);
  pt.hit=mk('circle',{cx:n(q[0]),cy:n(q[1]),r:10,'class':'hit'});node.appendChild(pt.hit);
  pt.halo=mk('circle',{cx:n(q[0]),cy:n(q[1]),r:7,'class':'halo'});node.appendChild(pt.halo);
  pt.dot=mk('circle',{cx:n(q[0]),cy:n(q[1]),r:2.5,'class':'dot'});node.appendChild(pt.dot);
  pt.label=mk('text',{'class':'wlab'});
  pt.labelT=mk('tspan',{'class':'wlab-t'});pt.labelT.textContent=pt.t;
  pt.labelN=mk('tspan',{'class':'wlab-n'});pt.labelN.textContent=pt.n;
  pt.label.appendChild(pt.labelT);pt.label.appendChild(pt.labelN);
  node.appendChild(pt.label);
  node.addEventListener('click',function(ev){ev.stopPropagation();seekEvent(i);});
  node.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();seekEvent(i);}});
  group.appendChild(node);pt.el=node;
 });
 /* Time is allocated to travel AND reading: about 45–60 seconds per route. */
 rt.schedule=[];var clock=0;
 rt.events.forEach(function(pt,i){
  if(i){var prev=rt.events[i-1],travel=2000+(pt.fraction-prev.fraction)*9800;rt.schedule.push({type:'travel',start:clock,end:clock+travel,from:prev.fraction,to:pt.fraction,event:i-1});clock+=travel;}
  rt.schedule.push({type:'hold',start:clock,end:clock+2800,from:pt.fraction,to:pt.fraction,event:i});clock+=2800;
 });
 rt.duration=clock;rt.elapsed=0;
});
var runner=add(mk('circle',{'class':'runner',r:3.5,visibility:'hidden'}));
var runnerRing=add(mk('circle',{'class':'runner-ring',r:9,visibility:'hidden'}));
/* 事件卡片：贴在地图节点旁边，点击节点才出现 */
var card=$('map-card'),cardOpen=false;
function cardPlace(){
 if(!cardOpen||eventIndex<0)return;
 var rt=ROUTES[active],pt=rt.events[eventIndex];if(!pt||!pt.q)return;
 var bw=bx.clientWidth,bh=bx.clientHeight;if(!bw||!bh)return;
 var sx=(pt.q[0]-view[0])/view[2]*bw,sy=(pt.q[1]-view[1])/view[3]*bh;
 var lx0=sx,lx1=sx;
 if(pt.label){var lr=pt.label.getBoundingClientRect(),br=bx.getBoundingClientRect();if(lr.width){lx0=lr.left-br.left;lx1=lr.right-br.left;}}
 var w=card.offsetWidth||230,h=card.offsetHeight||150,gap=14,left=Math.max(sx,lx1)+gap;
 if(left+w>bw-10)left=Math.min(sx,lx0)-gap-w;
 if(left<10)left=Math.max(10,Math.min(bw-w-10,sx+gap));
 var top=Math.max(10,Math.min(bh-h-10,sy-h/2));
 card.style.left=Math.round(left)+'px';card.style.top=Math.round(top)+'px';
}
function openCard(){cardOpen=true;card.hidden=false;cardPlace();}
function closeCard(){cardOpen=false;card.hidden=true;}
function cardPulse(){
 if(reduce||!card.animate)return;
 card.animate([{opacity:.25,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'});
}
function showEvent(index,animate,stayClosed){
 var rt=ROUTES[active];eventIndex=(index+rt.events.length)%rt.events.length;rt.remember=eventIndex;var pt=rt.events[eventIndex];
 $('mc-index').textContent=String(eventIndex+1).padStart(2,'0')+' / '+String(rt.events.length).padStart(2,'0');
 $('mc-date').textContent=pt.dt;$('mc-title').textContent=pt.t;$('mc-copy').textContent=pt.x;
 var src=$('mc-source');src.textContent='资料来源：'+pt.source[0]+' ↗';src.href=pt.source[1];
 $('map-current-place').textContent=pt.n;
 rt.events.forEach(function(p,j){p.el.classList.toggle('on',j===eventIndex);p.el.setAttribute('aria-pressed',String(j===eventIndex));});
 if(stayClosed){closeCard();return;}
 openCard();
 if(animate)cardPulse();
}
function setPlayButton(){var b=$('play-route');b.setAttribute('aria-pressed',String(playing));b.innerHTML=playing?'<span aria-hidden="true">Ⅱ</span> 暂停播放':'<span aria-hidden="true">▶</span> '+(ROUTES[active].elapsed>0&&ROUTES[active].elapsed<ROUTES[active].duration?'继续播放':'播放路线');bx.classList.toggle('is-playing',playing);}
function stopPlayback(){playback++;playing=false;cancelAnimationFrame(raf);runner.setAttribute('visibility','hidden');runnerRing.setAttribute('visibility','hidden');if(revealAnimation){revealAnimation.cancel();revealAnimation=null;}ROUTES[active].maskPath.style.strokeDashoffset='0';if(bx)setPlayButton();}
function updateProgress(){var p=ROUTES[active].progress;$('route-progress').value=p;$('playback-percent').textContent=Math.round(p*100)+'%';ROUTES[active].events.forEach(function(pt){pt.el.classList.toggle('reached',pt.fraction<=p+.0001);});}
function selectArmy(index){
 stopPlayback();active=index;eventIndex=-1;var rt=ROUTES[index];
 rt.progress=0;rt.elapsed=0;rt.remember=0;$('atlas').style.setProperty('--route-color',rt.color);svg.style.setProperty('--route-color',rt.color);card.style.setProperty('--route-color',rt.color);
 ROUTES.forEach(function(r,i){var selected=i===index;r.ghost.style.opacity=selected?'.2':'.07';r.el.style.opacity=selected?'1':'0';r.el.classList.toggle('route-active',selected);r.group.style.display=selected?'':'none';r.events.forEach(function(pt){pt.el.tabIndex=selected?0:-1;});r.btn.classList.toggle('on',selected);r.btn.setAttribute('aria-pressed',String(selected));});
 $('map-route-name').textContent=rt.n;$('map-route-period').textContent=rt.sub;$('playback-state').textContent='待出发 · '+rt.events.length+' 个主要节点';
 showEvent(0,true,true);updateProgress();resetView();setPlayButton();
 if(!reduce&&rt.maskPath.animate){rt.maskPath.style.strokeDashoffset='0';revealAnimation=rt.maskPath.animate([{strokeDashoffset:String(rt.len)},{strokeDashoffset:'0'}],{duration:3600,easing:'cubic-bezier(.32,.06,.28,1)'});}
}
ROUTES.forEach(function(rt,i){var b=d.createElement('button');b.type='button';b.className='army';b.style.setProperty('--army',rt.color);b.setAttribute('aria-pressed','false');b.innerHTML='<small>0'+(i+1)+' <i aria-hidden="true"></i></small><b>'+rt.n+'</b><span>'+rt.events.length+' 个主要节点</span>';b.addEventListener('click',function(){selectArmy(i);});$('armies').appendChild(b);rt.btn=b;});
function seekEvent(index){
 stopPlayback();var rt=ROUTES[active];showEvent(index,true);var point=rt.events[eventIndex];rt.progress=point.fraction;var hold=rt.schedule.filter(function(s){return s.type==='hold'&&s.event===eventIndex;})[0];rt.elapsed=hold.start;updateProgress();$('playback-state').textContent='已定位 · '+point.n;setPlayButton();
}
$('mc-prev').addEventListener('click',function(e){e.stopPropagation();seekEvent(eventIndex-1);});
$('mc-next').addEventListener('click',function(e){e.stopPropagation();seekEvent(eventIndex+1);});
$('mc-close').addEventListener('click',function(e){e.stopPropagation();closeCard();});
function playRoute(){
 if(playing){stopPlayback();$('playback-state').textContent='已暂停 · '+ROUTES[active].events[eventIndex].n;return;}
 var rt=ROUTES[active];if(rt.elapsed>=rt.duration){rt.elapsed=0;rt.progress=0;}
 if(revealAnimation){revealAnimation.cancel();revealAnimation=null;}
 playing=true;setPlayButton();var token=++playback,last=0;
 showEvent(eventIndex<0?0:eventIndex,false);
 runner.setAttribute('visibility',reduce?'hidden':'visible');runnerRing.setAttribute('visibility',reduce?'hidden':'visible');
 function step(ts){
  if(token!==playback)return;
  if(!last)last=ts;
  rt.elapsed=Math.min(rt.duration,rt.elapsed+Math.min(ts-last,100)*Number($('playback-speed').value));last=ts;
  var phase=rt.schedule[rt.schedule.length-1];for(var p=0;p<rt.schedule.length;p++){if(rt.elapsed<rt.schedule[p].end){phase=rt.schedule[p];break;}}
  var amount=(rt.elapsed-phase.start)/(phase.end-phase.start);rt.progress=phase.from+(phase.to-phase.from)*Math.max(0,Math.min(1,amount));
  var q=rt.el.getPointAtLength(rt.len*rt.progress);[runner,runnerRing].forEach(function(r){r.setAttribute('cx',n(q.x));r.setAttribute('cy',n(q.y));});
  rt.maskPath.style.strokeDashoffset=String(rt.len*(1-rt.progress));
  if(eventIndex!==phase.event)showEvent(phase.event,true);
  var place=rt.events[phase.event].n;$('playback-state').textContent=(phase.type==='hold'?'停驻 · ':'行进 · ')+place;
  bx.classList.toggle('at-node',phase.type==='hold');updateProgress();
  if(rt.elapsed<rt.duration)raf=requestAnimationFrame(step);
  else{playing=false;rt.progress=1;updateProgress();setPlayButton();runner.setAttribute('visibility','hidden');runnerRing.setAttribute('visibility','hidden');$('playback-state').textContent='已抵达 · '+rt.events[rt.events.length-1].n;rt.maskPath.style.strokeDashoffset='0';}
 }
 raf=requestAnimationFrame(step);
}
$('play-route').addEventListener('click',playRoute);
/* A fitted camera gives every army the same large, readable map treatment. */
var bx=d.querySelector('.mapbox'),overview=false,zoom=1,panX=0,panY=0,view=[0,0,1000,586],drag=null;
function baseView(){
 var aspect=(bx.clientWidth||900)/(bx.clientHeight||580),w,h,cx,cy;
 if(overview){w=W;h=H;cx=W/2;cy=H/2;}
 else{var coords=ROUTES[active].pts.map(P),xs=coords.map(function(p){return p[0];}),ys=coords.map(function(p){return p[1];});var loX=Math.min.apply(null,xs),hiX=Math.max.apply(null,xs),loY=Math.min.apply(null,ys),hiY=Math.max.apply(null,ys);w=hiX-loX+88;h=hiY-loY+82;cx=(loX+hiX)/2;cy=(loY+hiY)/2;}
 if(w/h<aspect)w=h*aspect;else h=w/aspect;
 return [cx-w/2,cy-h/2,w,h];
}
function overlap(a,b){var w=Math.min(a[2],b[2])-Math.max(a[0],b[0]),h=Math.min(a[3],b[3])-Math.max(a[1],b[1]);return w>0&&h>0?w*h:0;}
function layoutLabels(){
 var rt=ROUTES[active],bw=bx.clientWidth,bh=bx.clientHeight,unit=view[2]/bw,size=innerWidth<=520?10.5:12;
 var spots=rt.events.map(function(pt){return [(pt.q[0]-view[0])/unit,(pt.q[1]-view[1])/unit];});
 var used=[[8,8,185,100],[bw-54,8,bw-8,65],[10,bh-67,310,bh-5]];
 rt.events.forEach(function(pt,i){
  var x=spots[i][0],y=spots[i][1],tw=Math.max(pt.t.length,pt.n.length*.78)*size+4,th=size*2.15;
  var candidates=[[11,-9,0],[11,18,0],[-11,-9,1],[-11,18,1],[12,-27,0],[-12,-27,1],[12,35,0],[-12,35,1],[22,-44,0],[-22,-44,1],[24,51,0],[-24,51,1]],best=null,cost=Infinity;
  candidates.forEach(function(c,k){var left=x+c[0]-(c[2]?tw:0),top=y+c[1]-size,rect=[left-3,top-3,left+tw+3,top+th+3],score=k*.6;
   used.forEach(function(u){score+=overlap(rect,u)*5;});spots.forEach(function(q,j){if(j!==i)score+=overlap(rect,[q[0]-5,q[1]-5,q[0]+5,q[1]+5])*12;});
   score+=(Math.max(0,6-rect[0])+Math.max(0,rect[2]-bw+6)+Math.max(0,6-rect[1])+Math.max(0,rect[3]-bh+6))*80;
   if(score<cost){cost=score;best={c:c,rect:rect};}
  });
  used.push(best.rect);var c=best.c;
  pt.label.setAttribute('x',n(pt.q[0]+c[0]*unit));pt.label.setAttribute('y',n(pt.q[1]+c[1]*unit));pt.label.setAttribute('text-anchor',c[2]?'end':'start');pt.label.style.fontSize=(size*unit)+'px';pt.label.style.strokeWidth=(3*unit)+'px';
  pt.labelN.setAttribute('dy',(size*unit*1.02).toFixed(2));
  pt.leader.setAttribute('x2',n(pt.q[0]+c[0]*unit));pt.leader.setAttribute('y2',n(pt.q[1]+(c[1]-size/3)*unit));pt.leader.style.opacity=Math.abs(c[1])>20?'.65':'0';
  pt.dot.setAttribute('r',n(3.2*unit));pt.halo.setAttribute('r',n(8.5*unit));pt.hit.setAttribute('r',n(13*unit));
 });
 runner.setAttribute('r',n(4*unit));runnerRing.setAttribute('r',n(10*unit));
}
function applyView(){
 var b=baseView(),w=b[2]/zoom,h=b[3]/zoom,limitX=(b[2]-w)/2,limitY=(b[3]-h)/2;
 panX=Math.max(-limitX,Math.min(limitX,panX));panY=Math.max(-limitY,Math.min(limitY,panY));view=[b[0]+(b[2]-w)/2+panX,b[1]+(b[3]-h)/2+panY,w,h];svg.setAttribute('viewBox',view.map(n).join(' '));
 bx.classList.toggle('is-zoomed',zoom>1);$('map-zoom').setAttribute('aria-pressed',String(zoom>1));$('map-zoom').textContent=zoom>1?'− 复位':'＋ 放大';$('map-overview').setAttribute('aria-pressed',String(overview));$('map-overview').textContent=overview?'↙ 路线':'↗ 全图';layoutLabels();cardPlace();
}
function resetView(){zoom=1;panX=0;panY=0;applyView();}
$('map-zoom').addEventListener('click',function(){zoom=zoom===1?1.65:1;panX=panY=0;applyView();});
$('map-overview').addEventListener('click',function(){overview=!overview;resetView();});
svg.addEventListener('pointerdown',function(e){if(zoom===1||e.target.closest('.wp')||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY};svg.setPointerCapture(e.pointerId);bx.classList.add('dragging');});
svg.addEventListener('pointermove',function(e){if(!drag)return;panX=drag.px-(e.clientX-drag.x)*view[2]/bx.clientWidth;panY=drag.py-(e.clientY-drag.y)*view[3]/bx.clientHeight;applyView();});
function endDrag(){drag=null;bx.classList.remove('dragging');}
svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);svg.addEventListener('lostpointercapture',endDrag);
d.addEventListener('keydown',function(e){if(e.key==='Escape'){closeCard();stopPlayback();resetView();}});
bx.addEventListener('click',function(e){
 if(e.target.closest('.map-card')||e.target.closest('.wp')||e.target.closest('.map-tools')||e.target.closest('.map-readout'))return;
 closeCard();
});
d.addEventListener('visibilitychange',function(){if(d.hidden&&playing){stopPlayback();$('playback-state').textContent='已暂停 · '+ROUTES[active].events[eventIndex].n;}});
addEventListener('resize',applyView);selectArmy(0);
/* Scroll reveals, number impacts and year changes. Reduced motion keeps all facts visible. */
var revealObserver=null;
function reveal(el){el.classList.add('is-visible');if(el.hasAttribute('data-stat'))countStat(el);}
function observe(el){el.classList.add('reveal');if(reduce||!revealObserver)reveal(el);else revealObserver.observe(el);}
function countStat(el){
 if(el.dataset.counted)return;el.dataset.counted='true';var target=Number(el.dataset.stat),decimals=target%1?1:0,begin=0;
 function format(value){return value.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});}
 if(reduce){el.textContent=format(target);return;}
 function step(ts){if(!begin)begin=ts;var p=Math.min(1,(ts-begin)/1700),v=target*(1-Math.pow(1-p,4));el.textContent=format(decimals?v:Math.round(v));if(p<1)requestAnimationFrame(step);}
 requestAnimationFrame(step);
}
if(!reduce&&'IntersectionObserver' in window){revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){reveal(entry.target);revealObserver.unobserve(entry.target);}});},{threshold:.16,rootMargin:'0px 0px -25px 0px'});d.documentElement.classList.add('motion-ready');}
[].forEach.call(d.querySelectorAll('.distance .section-label,.distance-primary h2,[data-stat],.day-stat,.people-stat,.chronicle-head,.next-chapter'),observe);
var distance=d.querySelector('.distance');if(revealObserver){var distanceObserver=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting;})){distance.classList.add('distance-visible');distanceObserver.disconnect();}},{threshold:.25});distanceObserver.observe(distance);}else distance.classList.add('distance-visible');
var tabs=[].slice.call(d.querySelectorAll('.year-tabs [role=tab]'));
function chooseYear(index,focus){
 tabs.forEach(function(t,i){var selected=i===index;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;var panel=$(t.getAttribute('aria-controls'));panel.hidden=!selected;if(selected){[].forEach.call(panel.querySelectorAll('li'),function(row,j){row.classList.remove('is-visible');row.style.setProperty('--reveal-delay',Math.min(j,5)*65+'ms');observe(row);});}});if(focus)tabs[index].focus();
}
tabs.forEach(function(tab,i){tab.addEventListener('click',function(){chooseYear(i,false);});tab.addEventListener('keydown',function(e){var j=i;if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();chooseYear(j,true);});});
function tabOrientation(){d.querySelector('.year-tabs').setAttribute('aria-orientation',innerWidth<=520?'horizontal':'vertical');}
addEventListener('resize',tabOrientation);tabOrientation();chooseYear(0,false);
})();


