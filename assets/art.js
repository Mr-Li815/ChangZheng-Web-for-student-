/* 生图引擎：AI 给出画面要素，这里用 SVG 画出来。
   保证风格统一、可离线、无版权问题。 */
window.XZArt=(function(){
'use strict';

var SANS='"Noto Sans SC","Source Han Sans SC","PingFang SC",sans-serif';
var SERIF='"Noto Serif SC","Source Han Serif SC","Songti SC",serif';
var MONO='"JetBrains Mono",ui-monospace,Consolas,monospace';

function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rnd(seed){var x=seed||1;return function(){x=(x*1664525+1013904223)>>>0;return x/4294967296;};}

/* 一条山脊折线 */
function ridge(y,amp,n,r,fill,op){
  var pts=[],i,x,step=600/(n-1);
  for(i=0;i<n;i++){x=i*step;pts.push([x,y+ (r()-0.5)*amp*2]);}
  var d='M-10 420 L-10 '+pts[0][1].toFixed(1);
  for(i=1;i<n;i++){
    var p=pts[i-1],c=pts[i],mx=(p[0]+c[0])/2;
    d+=' Q'+mx.toFixed(1)+' '+((p[1]+c[1])/2).toFixed(1)+' '+c[0].toFixed(1)+' '+c[1].toFixed(1);
  }
  d+=' L610 420 Z';
  return '<path d="'+d+'" fill="'+fill+'" opacity="'+op+'"/>';
}

/* 小人：背影 */
function figure(x,y,s,col){
  return '<g transform="translate('+x+' '+y+') scale('+s+')" fill="'+col+'">'+
    '<circle cx="0" cy="-26" r="5.2"/>'+
    '<path d="M-6 -20 C-7 -10 -7 2 -6 10 L-3.4 10 L-2.2 -2 L-1 10 L1.8 10 L2.4 -2 L3.6 10 L6.4 10 C7 2 7 -10 6 -20 Z"/>'+
    '<path d="M-6 -20 L-9 -6 L-6.4 -5 L-3.6 -19 Z"/>'+
    '<path d="M6 -20 L9 -6 L6.4 -5 L3.6 -19 Z"/>'+
    '<rect x="-6" y="-30" width="12" height="3" rx="1"/>'+
    '</g>';
}

/* 小道具 */
function prop(kind,x,y,col){
  if(kind==='马灯')return '<g transform="translate('+x+' '+y+')" stroke="'+col+'" fill="none" stroke-width="1.6">'+
    '<rect x="-5" y="-9" width="10" height="13" rx="1"/><path d="M-5 -9 L0 -13 L5 -9"/><path d="M0 -9 L0 4"/></g>';
  if(kind==='担架')return '<g transform="translate('+x+' '+y+')" stroke="'+col+'" fill="none" stroke-width="1.6">'+
    '<rect x="-13" y="-4" width="26" height="8" rx="1"/><path d="M-16 -2 L-13 -2 M13 -2 L16 -2"/></g>';
  if(kind==='草鞋')return '<g transform="translate('+x+' '+y+')" stroke="'+col+'" fill="none" stroke-width="1.5">'+
    '<path d="M-6 0 C-6 -5 6 -5 6 0 L4 4 L-4 4 Z"/><path d="M-3 -2 L3 -2"/></g>';
  if(kind==='枪')return '<g transform="translate('+x+' '+y+')" stroke="'+col+'" stroke-width="1.6">'+
    '<path d="M0 0 L0 -26"/><path d="M-3 -22 L3 -22"/></g>';
  if(kind==='锅')return '<g transform="translate('+x+' '+y+')" stroke="'+col+'" fill="none" stroke-width="1.6">'+
    '<path d="M-8 -2 C-8 6 8 6 8 -2"/><path d="M-8 -2 L8 -2"/><path d="M-6 6 L-8 9 M6 6 L8 9"/></g>';
  return '';
}

function weather(kind,r){
  var out='',i;
  if(kind==='雪'){for(i=0;i<70;i++){var x=r()*600,y=r()*380;out+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(r()*1.5+0.6).toFixed(1)+'" fill="#1B1814" opacity="'+(0.10+r()*0.22).toFixed(2)+'"/>';}}
  else if(kind==='雨'){for(i=0;i<60;i++){var x=r()*600,y=r()*380;out+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+' l-5 12" stroke="#1B1814" stroke-width="1" opacity="'+(0.06+r()*0.1).toFixed(2)+'"/>';}}
  else if(kind==='雾'){for(i=0;i<5;i++){out+='<rect x="-10" y="'+(120+i*46)+'" width="620" height="30" fill="#F6F1E7" opacity="0.55"/>';}}
  else if(kind==='夜'){out+='<circle cx="486" cy="76" r="22" fill="none" stroke="#1B1814" stroke-width="1.2" opacity=".45"/><circle cx="486" cy="76" r="22" fill="#F6F1E7" opacity=".72"/>';}
  else if(kind==='晴'){out+='<circle cx="472" cy="82" r="26" fill="#C0392B" opacity=".16"/>';}
  return out;
}

function terrain(kind,r){
  var out='';
  if(kind==='江'){
    out+='<rect x="0" y="292" width="600" height="108" fill="#1B1814" opacity=".05"/>';
    var i;for(i=0;i<9;i++){var y=300+i*11;out+='<path d="M'+(20+r()*90).toFixed(0)+' '+y+' h'+(60+r()*180).toFixed(0)+'" stroke="#1B1814" stroke-width="1" opacity=".18"/>';}
    out+=ridge(268,26,7,r,'#1B1814','.14')+ridge(288,14,6,r,'#1B1814','.20');
  }else if(kind==='桥'){
    out+=ridge(250,30,6,r,'#1B1814','.13');
    out+='<g stroke="#1B1814" stroke-width="1.4" opacity=".55">'+
      '<path d="M120 200 L120 300 M480 200 L480 300"/>'+
      '<path d="M120 214 Q300 282 480 214" fill="none"/>'+
      '<path d="M120 238 Q300 300 480 238" fill="none" stroke-width="1"/>'+
      '</g>';
    out+='<rect x="0" y="300" width="600" height="100" fill="#1B1814" opacity=".05"/>';
  }else if(kind==='草地'){
    out+='<rect x="0" y="270" width="600" height="130" fill="#1B1814" opacity=".05"/>';
    var j;for(j=0;j<90;j++){var x=r()*600,y=290+r()*100;out+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+' l2 -6" stroke="#1B1814" stroke-width="1" opacity=".2"/>';}
    out+='<rect x="-10" y="272" width="620" height="10" fill="#F6F1E7" opacity=".6"/>';
  }else if(kind==='城'){
    out+=ridge(262,18,6,r,'#1B1814','.12');
    out+='<g fill="#1B1814" opacity=".13"><rect x="120" y="238" width="360" height="70"/>'+
      '<rect x="120" y="230" width="360" height="10"/><rect x="278" y="252" width="44" height="56"/></g>';
  }else{
    out+=ridge(238,34,6,r,'#1B1814','.12')+ridge(272,26,7,r,'#1B1814','.18')+ridge(306,18,8,r,'#1B1814','.26');
  }
  return out;
}

function draw(spec){
  var seed=hash(JSON.stringify(spec)),r=rnd(seed);
  var wth=spec.weather||'雾',land=spec.land||'山';
  var w=wth==='夜';
  var s='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+
        (spec.note||'插图').replace(/"/g,'')+'">';
  s+='<rect width="600" height="420" fill="'+(w?'#EDE4D6':'#F6F1E7')+'"/>';
  s+='<rect width="600" height="'+(w?230:200)+'" fill="#1B1814" opacity="'+(w?'.07':'.04')+'"/>';
  s+=weather(wth,r);
  s+=terrain(land,r);
  /* 人 */
  var fx=280+r()*70, fy=318+r()*20;
  s+='<ellipse cx="'+fx.toFixed(0)+'" cy="'+(fy+12).toFixed(0)+'" rx="26" ry="5" fill="#1B1814" opacity=".10"/>';
  s+=figure(fx,fy,1.7+r()*0.4,'#1B1814');
  s+='<g transform="translate('+(fx+52).toFixed(0)+' '+fy.toFixed(0)+') scale(1.35)">'+prop(spec.prop||'', 0, -4, '#1B1814')+'</g>';
  /* 颗粒 */
  s+='<g opacity=".05">';
  var i;for(i=0;i<160;i++){s+='<circle cx="'+(r()*600).toFixed(0)+'" cy="'+(r()*420).toFixed(0)+'" r="0.8" fill="#1B1814"/>';}
  s+='</g>';
  /* 角标 */
  s+='<text x="24" y="398" font-family=\''+MONO+'\' font-size="10" fill="#1B1814" opacity=".45" letter-spacing="2">'+
     (spec.place||'')+(spec.date?'　'+spec.date:'')+'</text>';
  s+='<text x="576" y="398" text-anchor="end" font-family=\''+SERIF+'\' font-size="11" fill="#1B1814" opacity=".4">夜行</text>';
  s+='</svg>';
  return s;
}

return {draw:draw};
})();
