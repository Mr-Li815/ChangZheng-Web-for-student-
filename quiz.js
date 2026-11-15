/* 活动 A · 八个数（题目与答案不变；加进度线、反馈动效、重答与去向） */
(function(){
'use strict';
var d=document,box=d.getElementById('q'),bar=d.getElementById('qb');
if(!box)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

var QS=[
['中央红军从江西出发时有多少人？',['8.6 万余','3 万余','7 千余','20 万'],0],
['渡过湘江后，中央红军锐减到？',['5 万余','3 万余','1 万余','7 千余'],1],
['中央红军长征走了多少天？',['368 天','250 天','373 天','500 天'],2],
['平均每天行军约多少里？',['120 里','70 里','30 里','200 里'],1],
['到达陕北时，每多少人只有 1 人？',['5 人','30 人','50 人','14 人'],3],
['翻越了多少座大山？',['20 多座','5 座','50 座','3 座'],0],
['泸定桥突击队有多少人？',['8 人','50 人','22 人','100 人'],2],
['三大主力会师在哪一年？',['1935 年','1936 年','1934 年','1937 年'],1]];

var i=0,ok=0,locked=0;

function progress(){if(bar)bar.style.transform='scaleX('+(i/QS.length)+')';}

function countUp(el,to){
  if(reduce||!to){el.textContent=to;return;}
  var t0=0;(function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/900);
    el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);})(0);
}

function draw(){
  progress();
  if(i>=QS.length){
    box.innerHTML='<p class="q__t">你知道 <b class="qn">0</b> / '+QS.length+'。</p>'+
      '<p class="qres">这些数字，都有出处。前面几页里都找得到。</p>'+
      '<div class="qact"><button class="btn" type="button" data-a="again">再答一次</button>'+
      '<a class="btn" href="p5b-story.html">去「入列」</a><a class="btn" href="p5-follow.html">返回同行</a></div>';
    countUp(box.querySelector('.qn'),ok);
    return;
  }
  var q=QS[i],h='<p class="q__n">'+(i+1)+' / '+QS.length+'</p><p class="q__t">'+q[0]+'</p><div class="qopts">';
  q[1].forEach(function(o,k){
    h+='<button class="qopt" data-k="'+k+'" style="--k:'+k+'"><b>'+'ABCD'.charAt(k)+'</b><span>'+o+'</span></button>';
  });
  box.innerHTML=h+'</div>';
  locked=0;
}

box.addEventListener('click',function(e){
  if(e.target.closest('[data-a="again"]')){i=0;ok=0;draw();return;}
  var b=e.target.closest('.qopt');
  if(!b||locked)return;
  locked=1;
  var q=QS[i],k=+b.dataset.k,right=(k===q[2]);
  if(right)ok++;
  [].forEach.call(box.querySelectorAll('.qopt'),function(x,j){
    x.disabled=true;
    if(j===q[2])x.classList.add('ok');
    else if(j===k)x.classList.add('no');
  });
  i++;progress();
  setTimeout(draw,right?600:1150);
});

draw();
})();
