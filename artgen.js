/* 造像 · AI 决定画面，本站用 SVG 画出来
   无 key / 断网 / 超时 → 按地点本地兜底 */
(function(){
'use strict';
var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,$=function(i){return d.getElementById(i);};
var cfg=window.XZ||{},key=(cfg.key||'').trim(),ep=(cfg.proxy||'').trim()||cfg.endpoint;
var $f=$('af'),$out=$('out'),$ld=$('ld'),$art=$('art'),$fig=$('artFig'),$note=$('artNote'),$acts=$('acts');
if(!key){var of=$('off');if(of)of.hidden=false;}
if(!$f)return;

var PLACES={
'于都':['夜','江','马灯','1934 年 10 月','夜里过河，不许点灯'],
'湘江':['雾','江','担架','1934 年 11 月','江水很凉，岸上很挤'],
'遵义':['夜','城','马灯','1935 年 1 月','城里的屋顶是湿的'],
'泸定桥':['雾','桥','枪','1935 年 5 月','没有桥面，只有铁索'],
'夹金山':['雪','山','草鞋','1935 年 6 月','雪到膝盖，前面的人在走'],
'草地':['雾','草地','锅','1935 年 8 月','一脚下去，泥没到小腿'],
'腊子口':['雾','山','枪','1935 年 9 月','两边是崖，中间一条缝'],
'吴起镇':['晴','城','锅','1935 年 10 月','黄土塬上，队伍停下来']
};
var ORDER=['于都','湘江','遵义','泸定桥','夹金山','草地','腊子口','吴起镇'];

var SYS=[
'你在为一站长篇长征主题网站画一张插画，只负责决定画面构成。',
'只输出一个 JSON 对象，不要别的文字，不要代码块。',
'字段：',
'{"weather":"雪|雾|雨|夜|晴","land":"山|江|桥|草地|城","prop":"马灯|担架|草鞋|枪|锅|","note":"一句画面描述，不超过 22 字"}',
'规则：weather、land 必须从给定选项里选一个；prop 从给定选项里选一个，没有就空字符串。',
'note 写这幅画的实物细节，不写情绪，不用形容词堆砌，不用感叹号。',
'land 必须和地点对得上：于都、湘江是江，遵义、吴起镇是城，泸定桥是桥，夹金山、腊子口是山，草地是草地。',
'不要出现真实人物姓名，不要写文字标语。'
].join('\n');

var P=null,busy=0,last={place:'于都',note:''};

function pickPlace(){var r=$f.querySelector('[name=p]:checked');return (r&&r.value)||'于都';}
function localSpec(place){
  var d0=PLACES[place]||PLACES['于都'];
  return {weather:d0[0],land:d0[1],prop:d0[2],note:d0[4]};
}
function parse(t){
  var a=t.indexOf('{'),b=t.lastIndexOf('}');
  if(a<0||b<0)return null;
  try{var j=JSON.parse(t.slice(a,b+1));return j&&j.land?j:null;}catch(e){return null;}
}
function paint(spec,place){
  $fig.innerHTML=window.XZArt?window.XZArt.draw({
    weather:spec.weather,land:spec.land,prop:spec.prop,
    place:place,date:(PLACES[place]||[])[3]||'',note:spec.note
  }):'';
  $note.textContent=spec.note||'';
  $art.hidden=false;
  last={place:place,note:spec.note||''};
}
function done(){busy=0;$ld.classList.add('off');$acts.hidden=false;}

function request(place,wish,twist){
  var extra=wish?('\n读者想看到：'+wish):'';
  if(twist)extra+='\n换一个构图，不要和上一张一样。';
  var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort();},9000);
  return fetch(ep,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},signal:ctl.signal,
    body:JSON.stringify({model:cfg.model||'deepseek-chat',temperature:.9,max_tokens:180,stream:false,
      messages:[{role:'system',content:SYS},
        {role:'user',content:'地点：'+place+'（'+(PLACES[place]||[])[4]+'）'+extra}]})})
  .then(function(r){clearTimeout(tm);if(!r.ok)throw 0;return r.json();})
  .then(function(j){
    var t=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    return parse(String(t||''));
  });
}

function draw(place,wish,twist){
  if(busy)return;
  busy=1;
  $out.hidden=false;$ld.classList.remove('off');$art.hidden=true;$acts.hidden=true;
  setTimeout(function(){$out.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});},reduce?0:260);
  if(!key||!ep){setTimeout(function(){paint(localSpec(place),place);done();},reduce?0:500);return;}
  request(place,wish,twist).then(function(spec){
    paint(spec||localSpec(place),place);done();
  }).catch(function(){
    paint(localSpec(place),place);done();
    $note.textContent=($note.textContent?$note.textContent+'　':'')+'（这次没连上，按地点给了一张）';
  });
}

$f.addEventListener('submit',function(e){
  e.preventDefault();
  $('err').textContent='';
  draw(pickPlace(),$('an').value.trim(),false);
});

$('again').addEventListener('click',function(){
  draw(last.place,$('an').value.trim(),true);
});

$('save').addEventListener('click',function(){
  var svg=$fig.querySelector('svg');if(!svg)return;
  var b=this,txt=b.textContent;
  var s=new XMLSerializer().serializeToString(svg);
  var img=new Image();
  img.onload=function(){
    var c=d.createElement('canvas');c.width=1400;c.height=980;
    var x=c.getContext('2d');
    x.fillStyle='#F6F1E7';x.fillRect(0,0,c.width,c.height);
    x.drawImage(img,0,0,c.width,c.height);
    c.toBlob(function(blob){
      if(!blob)return;
      var a=d.createElement('a');a.href=URL.createObjectURL(blob);
      a.download='夜行-造像.png';d.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href);},2000);
      b.textContent='已保存';setTimeout(function(){b.textContent=txt;},1600);
    },'image/png');
  };
  img.onerror=function(){b.textContent='保存失败';setTimeout(function(){b.textContent=txt;},1600);};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
});
})();
