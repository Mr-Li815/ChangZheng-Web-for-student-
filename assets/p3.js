/* 行装：惯性展廊、分层视差；手机原生纵向阅读，桌面保留循环横廊。 */
(function(){
'use strict';
var d=document,rail=d.getElementById('rail');if(!rail)return;
var motion=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:700px)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
var reduced=motion.matches,vertical=phone.matches,originals=[].slice.call(rail.querySelectorAll('.ex')),items=originals.slice(1),clones=[];
var stopButtons=[].slice.call(d.querySelectorAll('[data-object]')),prev=d.querySelector('.objects-prev'),next=d.querySelector('.objects-next'),play=d.querySelector('.objects-play');
var number=d.getElementById('object-number'),nameNode=d.getElementById('object-name'),bar=d.querySelector('.prog i');
var paused=reduced,userPlay=false,infos=[],current=-1,position=0,target=0,max=0,view=1,loopStart=0,loopLength=1,raf=0,last=0,wake=0,holdUntil=Date.now()+3000;
var MOTION=.4,AUTO_DESKTOP=22,AUTO_MOBILE=12,nativePointer=null;
var camera={x:0,y:0,tx:0,ty:0},drag={down:false,id:null,x:0,start:0,lastX:0,lastTime:0,velocity:0,moved:false};
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function interactive(el){return el&&el.closest&&el.closest('button,a,input,textarea,select,[contenteditable=true],[role=dialog]');}
items.forEach(function(panel,i){
 var title=panel.querySelector('h2'),fig=d.createElement('figure');panel.id='o'+(i+1);panel.dataset.objectIndex=String(i+1);title.id='object-title-'+(i+1);panel.setAttribute('aria-labelledby',title.id);
 fig.className='fig';fig.innerHTML='<span class="fig__ph">'+title.textContent+'</span><span class="image-plane"><img src="'+window.ASSET+'img/o'+(i+1)+'.jpg" alt="'+title.textContent+' · 物件影像" loading="'+(i===0?'eager':'lazy')+'" decoding="async" draggable="false"></span><figcaption class="figure-word">物件影像 / 长征行装</figcaption>';panel.appendChild(fig);
});
originals[0].dataset.objectIndex='0';
items.forEach(function(panel){var clone=panel.cloneNode(true);clone.classList.add('dup');clone.removeAttribute('id');clone.removeAttribute('aria-labelledby');clone.setAttribute('aria-hidden','true');clone.inert=true;[].slice.call(clone.querySelectorAll('[id]')).forEach(function(node){node.removeAttribute('id');});rail.appendChild(clone);clones.push(clone);});
[].slice.call(rail.querySelectorAll('.fig')).forEach(function(fig){var img=fig.querySelector('img');function loaded(){fig.classList.add('has-image');}img.addEventListener('load',loaded);img.addEventListener('error',function(){fig.classList.remove('has-image');fig.querySelector('.fig__ph').textContent='影像暂未载入';img.style.opacity='0';});if(img.complete&&img.naturalWidth)loaded();});
function read(){return vertical?rail.scrollTop:rail.scrollLeft;}
function write(value){if(vertical)rail.scrollTop=value;else rail.scrollLeft=value;}
function measure(){
 view=Math.max(1,vertical?rail.clientHeight:rail.clientWidth);
 var panels=vertical?originals:originals.concat(clones);
 infos=panels.map(function(panel){return {el:panel,index:Number(panel.dataset.objectIndex)||0,start:vertical?panel.offsetTop:panel.offsetLeft,size:vertical?panel.offsetHeight:panel.offsetWidth};});
 max=Math.max(0,(vertical?rail.scrollHeight:rail.scrollWidth)-view);loopStart=items[0].offsetLeft;loopLength=clones[0].offsetLeft-loopStart;if(loopLength<view)loopLength=view*items.length;
 rail.dataset.layout=vertical?'vertical':'horizontal';rail.setAttribute('aria-label',vertical?'物件展廊，上下滚动浏览八件行装':'物件展廊，横向滚动或拖动浏览八件行装');
 var tip=d.querySelector('.tip');if(tip)tip.textContent=vertical?'上下滑动，沿着物件向前。':'滚动或拖动，沿着物件向前。';
}
function updatePlay(){
 play.disabled=reduced;play.setAttribute('aria-pressed',String(paused));play.setAttribute('title','缓速自动播放；手动浏览后稍停再继续，可随时暂停');play.querySelector('span').textContent=reduced?'静态浏览':paused?'播放展廊':'暂停展廊';play.querySelector('i').textContent=reduced?'—':paused?'▶':'Ⅱ';
}
function active(index){
 if(index===current)return;current=index;number.textContent=index?('0'+index):'序';nameNode.textContent=index?items[index-1].querySelector('h2').textContent:'八件东西';
 stopButtons.forEach(function(button){if(Number(button.dataset.object)===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});prev.disabled=index===0;next.disabled=vertical&&index===items.length;
}
function render(dt){
 var blend=reduced?1:1-Math.exp(-dt*7);camera.x+=(camera.tx-camera.x)*blend;camera.y+=(camera.ty-camera.y)*blend;
 if(Math.abs(camera.x-camera.tx)<.0005)camera.x=camera.tx;if(Math.abs(camera.y-camera.ty)<.0005)camera.y=camera.ty;
 var closest=Infinity,index=0;
 infos.forEach(function(info){
  var phase=(info.start+info.size*.5-position-view*.5)/view,distance=Math.abs(phase);
  if(distance<closest){closest=distance;index=info.index;}
  if(distance>2.1)return;
  var p=clamp(phase,-1.8,1.8),x=(reduced?0:(vertical?camera.x*20:-p*Math.min(view*.075,105)+camera.x*32))*MOTION,y=(reduced?0:(vertical?-p*44+camera.y*16:camera.y*27))*MOTION;
  info.el.style.setProperty('--image-x',x.toFixed(2)+'px');info.el.style.setProperty('--image-y',y.toFixed(2)+'px');info.el.style.setProperty('--image-r',((reduced?0:camera.x*.65)*MOTION).toFixed(3)+'deg');
  info.el.style.setProperty('--copy-x',((reduced||vertical?0:p*26-camera.x*8)*MOTION).toFixed(2)+'px');info.el.style.setProperty('--copy-y',((reduced?0:(vertical?p*12:0)-camera.y*6)*MOTION).toFixed(2)+'px');
  info.el.style.setProperty('--letter-x',((reduced?0:(vertical?camera.x*-20:p*55))*MOTION).toFixed(2)+'px');info.el.style.setProperty('--letter-y',((reduced?0:(vertical?p*30:camera.y*-16))*MOTION).toFixed(2)+'px');
  var opacity=reduced?1:clamp((1.4-distance)/.7,0,1);info.el.style.setProperty('--copy-opacity',opacity.toFixed(3));info.el.style.setProperty('--image-opacity',(reduced?1:clamp((1.7-distance)/.8,0,1)).toFixed(3));
  if(info.index===0){info.el.style.setProperty('--cover-x',((reduced?0:-p*70+camera.x*21)*MOTION).toFixed(2)+'px');info.el.style.setProperty('--cover-y',((reduced?0:camera.y*18)*MOTION).toFixed(2)+'px');}
 });
 active(index);if(bar)bar.style.width=(index/items.length*100).toFixed(2)+'%';
 return Math.abs(camera.x-camera.tx)+Math.abs(camera.y-camera.ty)>.001;
}
function frame(time){
 raf=0;if(d.hidden)return;
 var dt=last?Math.min(.05,(time-last)/1000):1/60;last=time;
 var auto=!paused&&!reduced&&!drag.down&&nativePointer===null&&Date.now()>=holdUntil;
 if(auto)target+=dt*(vertical?AUTO_MOBILE:AUTO_DESKTOP);
 target=clamp(target,0,max);
 if(reduced||drag.down)position=target;else position+=(target-position)*(1-Math.exp(-dt*8));
 if(Math.abs(target-position)<.08)position=target;
 if(!vertical&&position>=loopStart+loopLength){position-=loopLength;target-=loopLength;}
 if(vertical&&auto&&position>=max-.1){paused=true;position=target=max;updatePlay();}
 write(position);var cameraMoving=render(dt),moving=Math.abs(target-position)>.08||cameraMoving;
 if(moving||(!paused&&!reduced&&Date.now()>=holdUntil&&!drag.down&&nativePointer===null))raf=requestAnimationFrame(frame);
 else{last=0;if(!paused&&!reduced&&!drag.down&&nativePointer===null){clearTimeout(wake);wake=setTimeout(start,Math.max(20,holdUntil-Date.now()+20));}}
}
function start(){if(!raf&&!d.hidden){last=0;raf=requestAnimationFrame(frame);}}
function hold(ms){holdUntil=Date.now()+(ms||6000);clearTimeout(wake);}
function originalOffset(index){var panel=originals[index];return vertical?panel.offsetTop:panel.offsetLeft;}
function go(index,instant,fromUser){
 index=clamp(index,0,items.length);hold(6000);target=originalOffset(index);if(instant||reduced){position=target;write(position);render(1/60);}start();
 if(fromUser&&index){try{history.replaceState(null,'','#o'+index);}catch(e){}}
}
function step(direction){
 if(direction>0&&current===items.length&&!vertical){hold(6000);target=loopStart+loopLength;start();return;}
 go(clamp(current+direction,0,items.length),false,true);
}
play.addEventListener('click',function(){if(reduced)return;userPlay=true;paused=!paused;holdUntil=0;updatePlay();start();});
prev.addEventListener('click',function(){step(-1);});next.addEventListener('click',function(){step(1);});
stopButtons.forEach(function(button){button.addEventListener('click',function(){go(Number(button.dataset.object),false,true);});});
var enter=d.querySelector('.objects-enter');if(enter)enter.addEventListener('click',function(){go(1,false,true);});
rail.addEventListener('wheel',function(e){
 if(vertical||e.ctrlKey)return;e.preventDefault();hold();var delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
 if(e.deltaMode===1)delta*=16;else if(e.deltaMode===2)delta*=view;target=clamp(target+delta,0,max);start();
},{passive:false});
rail.addEventListener('scroll',function(){var actual=read();if(Math.abs(actual-position)>1.8){position=target=clamp(actual,0,max);hold();}start();},{passive:true});
rail.addEventListener('pointermove',function(e){if(!fine.matches||reduced)return;var rect=rail.getBoundingClientRect();camera.tx=clamp((e.clientX-rect.left)/rect.width*2-1,-1,1);camera.ty=clamp((e.clientY-rect.top)/rect.height*2-1,-1,1);start();},{passive:true});
rail.addEventListener('pointerleave',function(){camera.tx=camera.ty=0;start();},{passive:true});
rail.addEventListener('pointerdown',function(e){
 if(interactive(e.target)||(e.pointerType==='mouse'&&e.button!==0))return;
 if(vertical){nativePointer=e.pointerId;hold();return;}
 drag.down=true;drag.id=e.pointerId;drag.x=drag.lastX=e.clientX;drag.start=position;drag.lastTime=e.timeStamp||0;drag.velocity=0;drag.moved=false;hold();target=position;
},{passive:true});
addEventListener('pointermove',function(e){
 if(!drag.down||e.pointerId!==drag.id)return;var delta=drag.x-e.clientX;
 if(Math.abs(delta)>6){drag.moved=true;rail.classList.add('is-dragging');if(rail.setPointerCapture&&!rail.hasPointerCapture(e.pointerId))rail.setPointerCapture(e.pointerId);}
 if(!drag.moved)return;if(e.cancelable)e.preventDefault();var time=e.timeStamp||drag.lastTime+16;
 drag.velocity=drag.velocity*.55+(drag.lastX-e.clientX)/Math.max(12,time-drag.lastTime)*.45;drag.lastX=e.clientX;drag.lastTime=time;target=clamp(drag.start+delta,0,max);hold();start();
},{passive:false});
function release(e,cancel){
 if(!drag.down||(e&&e.pointerId!==undefined&&e.pointerId!==drag.id))return;var id=drag.id;
 drag.down=false;drag.id=null;rail.classList.remove('is-dragging');hold();if(!cancel&&drag.moved&&!reduced)target=clamp(target+clamp(drag.velocity*70,-view*.12,view*.12),0,max);
 if(rail.hasPointerCapture&&rail.hasPointerCapture(id))rail.releasePointerCapture(id);start();
}
function releaseNative(e){if(nativePointer===e.pointerId){nativePointer=null;hold();start();}}
addEventListener('pointerup',function(e){releaseNative(e);release(e,false);},{passive:true});addEventListener('pointercancel',function(e){releaseNative(e);release(e,true);},{passive:true});
rail.addEventListener('lostpointercapture',function(e){release(e,true);},{passive:true});rail.addEventListener('dragstart',function(e){e.preventDefault();});
addEventListener('keydown',function(e){
 if(e.defaultPrevented||interactive(e.target)||e.altKey||e.ctrlKey||e.metaKey)return;
 var k=e.key;if(k==='ArrowRight'||k==='PageDown'||k==='ArrowDown'){e.preventDefault();step(1);}
 else if(k==='ArrowLeft'||k==='PageUp'||k==='ArrowUp'){e.preventDefault();step(-1);}
 else if(k==='Home'){e.preventDefault();go(0,false,false);}
 else if(k==='End'){e.preventDefault();go(items.length,false,true);}
 else if(k===' '){e.preventDefault();if(!reduced){userPlay=true;paused=!paused;holdUntil=0;updatePlay();start();}}
});
function resize(){
 var index=Math.max(0,current),changed=vertical!==phone.matches;release(null,true);nativePointer=null;vertical=phone.matches;
 if(changed){rail.scrollLeft=rail.scrollTop=0;if(!userPlay)paused=reduced;}
 measure();position=target=clamp(originalOffset(index),0,max);write(position);render(1/60);updatePlay();start();
}
addEventListener('resize',resize,{passive:true});addEventListener('load',function(){measure();render(1/60);start();});
addEventListener('hashchange',function(){var match=location.hash.match(/^#o([1-8])$/);if(match)go(Number(match[1]),false,false);});
function preference(){reduced=motion.matches;paused=true;camera.x=camera.y=camera.tx=camera.ty=0;position=target=read();updatePlay();render(1/60);start();}
if(motion.addEventListener)motion.addEventListener('change',preference);
d.addEventListener('visibilitychange',function(){cancelAnimationFrame(raf);raf=0;last=0;clearTimeout(wake);if(d.hidden){nativePointer=null;release(null,true);}else start();});
measure();updatePlay();var initial=location.hash.match(/^#o([1-8])$/);position=target=initial?originalOffset(Number(initial[1])):0;if(initial)hold(8000);write(position);render(1/60);start();
})();
