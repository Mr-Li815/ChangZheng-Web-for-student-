/* 丈量：一次性数字入场、轻量反馈与可暂停的镜头视差。file:// 可用。 */
(function(){
'use strict';
var d=document,root=d.documentElement,page=d.querySelector('.measure-page');if(!page)return;
var motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine) and (min-width:761px)'),reduced=motion.matches;
var scope=d.querySelector('.scope'),cameraButton=d.querySelector('.camera-toggle'),box=d.getElementById('dots'),replay=d.querySelector('.replay'),status=d.getElementById('dots-status');
var tiles=[].slice.call(d.querySelectorAll('.bento-tile')),numbers=[].slice.call(d.querySelectorAll('[data-n]')),rows=[].slice.call(d.querySelectorAll('[data-compare]'));
var dotTimers=[],countFrames=new Map(),played=false,paused=false,scopeVisible=false,raf=0,last=0;
var camera={x:0,y:0,vx:0,vy:0,tx:0,ty:0};
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function clearDots(){dotTimers.forEach(clearTimeout);dotTimers=[];}
function later(fn,ms){dotTimers.push(setTimeout(fn,ms));}
for(var i=0;i<14;i++){var person=d.createElement('i');person.style.setProperty('--delay',i*28+'ms');box.appendChild(person);}
function showDots(fromUser){
 clearDots();played=true;
 box.classList.remove('is-arrived','is-entering');
 if(reduced||d.hidden){box.classList.add('is-arrived');if(fromUser)status.textContent='图示：出发的十四人中，一人到达陕北。';return;}
 box.classList.add('is-entering');
 later(function(){box.classList.remove('is-entering');},40);
 later(function(){box.classList.add('is-arrived');if(fromUser)status.textContent='图示重播完成：出发的十四人中，一人到达陕北。';},1100);
}
replay.addEventListener('click',function(){status.textContent='';showDots(true);});
function count(el){
 if(el.dataset.counted)return;el.dataset.counted='true';
 var value=Number(el.dataset.n),start=null;
 if(reduced||d.hidden){el.textContent=String(value);return;}
 function tick(time){
  if(start===null)start=time;var progress=Math.min(1,(time-start)/650),ease=1-Math.pow(1-progress,3);
  el.textContent=String(Math.round(value*ease));
  if(progress<1)countFrames.set(el,requestAnimationFrame(tick));else countFrames.delete(el);
 }
 countFrames.set(el,requestAnimationFrame(tick));
}
function reveal(tile){
 tile.classList.add('seen');[].forEach.call(tile.querySelectorAll('[data-n]'),count);
 if(tile.classList.contains('cut')&&!played)showDots(false);
}
if('IntersectionObserver' in window){
 root.classList.add('measure-enhanced');
 var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){reveal(entry.target);revealObserver.unobserve(entry.target);}});},{threshold:.08});
 tiles.forEach(function(tile){revealObserver.observe(tile);});
 var scopeObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){scopeVisible=entry.isIntersecting;if(!scopeVisible)resetCamera();});},{threshold:0});scopeObserver.observe(scope);
}else{scopeVisible=true;tiles.forEach(reveal);}
tiles.forEach(function(tile){
 tile.addEventListener('pointermove',function(e){if(reduced||!fine.matches||e.pointerType==='touch')return;var rect=tile.getBoundingClientRect();tile.style.setProperty('--hot-x',(e.clientX-rect.left).toFixed(1)+'px');tile.style.setProperty('--hot-y',(e.clientY-rect.top).toFixed(1)+'px');},{passive:true});
});
function matchRow(key){rows.forEach(function(row){row.classList.toggle('is-matched',row.dataset.compare===key);});}
rows.forEach(function(row){row.addEventListener('pointerenter',function(){matchRow(row.dataset.compare);});row.addEventListener('pointerleave',function(){matchRow(null);});});
function cameraEnabled(){return !reduced&&fine.matches&&!paused&&!root.classList.contains('lite');}
function writeCamera(){scope.style.setProperty('--cam-x',camera.x.toFixed(4));scope.style.setProperty('--cam-y',camera.y.toFixed(4));}
function resetCamera(){
 cancelAnimationFrame(raf);raf=0;last=0;camera.x=camera.y=camera.vx=camera.vy=camera.tx=camera.ty=0;writeCamera();
}
function frame(time){
 raf=0;if(d.hidden||!scopeVisible||!cameraEnabled()){resetCamera();return;}
 var dt=last?Math.min(.032,(time-last)/1000):1/60;last=time;
 ['x','y'].forEach(function(axis){var velocity='v'+axis;camera[velocity]+=(camera['t'+axis]-camera[axis])*95*dt;camera[velocity]*=Math.exp(-18*dt);camera[axis]+=camera[velocity]*dt;});
 writeCamera();
 var moving=Math.abs(camera.x-camera.tx)+Math.abs(camera.y-camera.ty)+Math.abs(camera.vx)+Math.abs(camera.vy)>.002;
 if(moving)raf=requestAnimationFrame(frame);else{camera.x=camera.tx;camera.y=camera.ty;camera.vx=camera.vy=0;writeCamera();last=0;}
}
function start(){if(!raf&&scopeVisible&&cameraEnabled()&&!d.hidden){last=0;raf=requestAnimationFrame(frame);}}
scope.addEventListener('pointermove',function(e){
 if(!cameraEnabled()||e.pointerType==='touch')return;var rect=scope.getBoundingClientRect();
 camera.tx=clamp((e.clientX-rect.left)/rect.width*2-1,-1,1);camera.ty=clamp((e.clientY-rect.top)/rect.height*2-1,-1,1);start();
},{passive:true});
scope.addEventListener('pointerleave',function(){camera.tx=camera.ty=0;start();},{passive:true});
function updateButton(){cameraButton.disabled=reduced;cameraButton.setAttribute('aria-pressed',String(paused));cameraButton.querySelector('span').textContent=reduced?'静态景深':paused?'开启景深':'暂停景深';}
cameraButton.addEventListener('click',function(){paused=!paused;resetCamera();updateButton();});updateButton();
function preference(){
 reduced=motion.matches;resetCamera();clearDots();box.classList.remove('is-entering');if(played)box.classList.add('is-arrived');
 countFrames.forEach(function(id,el){cancelAnimationFrame(id);el.textContent=el.dataset.n;});countFrames.clear();updateButton();
}
if(motion.addEventListener)motion.addEventListener('change',preference);
if(fine.addEventListener)fine.addEventListener('change',resetCamera);
addEventListener('resize',resetCamera,{passive:true});
d.addEventListener('visibilitychange',function(){if(d.hidden){resetCamera();clearDots();if(played){box.classList.remove('is-entering');box.classList.add('is-arrived');}countFrames.forEach(function(id,el){cancelAnimationFrame(id);el.textContent=el.dataset.n;});countFrames.clear();}});
})();
