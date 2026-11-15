/* Independent spring layers. Drag changes view; a tap still flips the archive. */
(function(){
'use strict';
var d=document,media=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),reduced=media.matches,raf=0,last=0;
var cards=[].slice.call(d.querySelectorAll('.fc')),states=[];
if(!cards.length)return;
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function render(s){
 var el=s.el,x=s.x,y=s.y;
 el.style.setProperty('--card-rx',(-y*16).toFixed(3)+'deg');el.style.setProperty('--card-ry',(x*22).toFixed(3)+'deg');el.style.setProperty('--card-lift',s.lift.toFixed(3)+'px');
 el.style.setProperty('--bg-x',(-x*27).toFixed(2)+'px');el.style.setProperty('--bg-y',(-y*21).toFixed(2)+'px');
 el.style.setProperty('--figure-x',(x*31).toFixed(2)+'px');el.style.setProperty('--figure-y',(y*23).toFixed(2)+'px');
 el.style.setProperty('--text-x',(x*42).toFixed(2)+'px');el.style.setProperty('--text-y',(-y*27).toFixed(2)+'px');
 var tilt=Math.min(1,Math.hypot(x,y)/1.414);
 el.style.setProperty('--shine-x',(50+x*45).toFixed(2)+'%');el.style.setProperty('--shine-y',(45+y*40).toFixed(2)+'%');el.style.setProperty('--shine-angle',(115+x*52-y*30).toFixed(2)+'deg');el.style.setProperty('--shine-opacity',s.hover||s.down?'.48':'.14');
 /* The light and both cast shadows share one spring-driven view vector. */
 el.style.setProperty('--portrait-shadow-x',(8-x*31).toFixed(2)+'px');el.style.setProperty('--portrait-shadow-y',(25-y*20).toFixed(2)+'px');el.style.setProperty('--portrait-shadow-blur',(15+tilt*9).toFixed(2)+'px');el.style.setProperty('--portrait-shadow-alpha',(.4+tilt*.14).toFixed(3));
 el.style.setProperty('--portrait-light',(1.04-x*.065-y*.045).toFixed(3));
 el.style.setProperty('--card-shadow-x',(-x*28).toFixed(2)+'px');el.style.setProperty('--card-shadow-y',(32-y*19).toFixed(2)+'px');el.style.setProperty('--card-shadow-blur',(58+tilt*20).toFixed(2)+'px');el.style.setProperty('--card-shadow-alpha',(.24+tilt*.12).toFixed(3));
 el.style.setProperty('--rim-x',(-x*2).toFixed(2)+'px');el.style.setProperty('--rim-y',(-y*2).toFixed(2)+'px');
}
function spring(s,key,target,dt){var velocity='v'+key;s[velocity]+=((target-s[key])*145-s[velocity]*19)*dt;s[key]+=s[velocity]*dt;if(Math.abs(target-s[key])<.0005&&Math.abs(s[velocity])<.002){s[key]=target;s[velocity]=0;}return s[key]!==target||s[velocity]!==0;}
function frame(t){
 raf=0;if(d.hidden||reduced)return;
 var dt=last?Math.min((t-last)/1000,.034):1/60;last=t;var moving=false;
 states.forEach(function(s){if(!s.visible)return;var active=spring(s,'x',s.tx,dt);active=spring(s,'y',s.ty,dt)||active;active=spring(s,'lift',s.down?-17:s.hover?-9:0,dt)||active;render(s);moving=moving||active;});
 if(moving)raf=requestAnimationFrame(frame);else last=0;
}
function start(){if(!raf&&!reduced&&!d.hidden){last=0;raf=requestAnimationFrame(frame);}}
function reset(s){s.tx=s.ty=0;s.hover=false;s.down=false;s.pointer=null;s.el.classList.remove('is-dragging');start();}
function release(s,e){if(s.pointer!==e.pointerId)return;var id=s.pointer;reset(s);if(s.el.hasPointerCapture&&s.el.hasPointerCapture(id))s.el.releasePointerCapture(id);}
cards.forEach(function(el){
 var s={el:el,x:0,y:0,vx:0,vy:0,lift:0,vlift:0,tx:0,ty:0,hover:false,down:false,visible:true,pointer:null,dragged:false,startX:0,startY:0,width:1,height:1};states.push(s);
 function aim(e){var rect=el.getBoundingClientRect();s.tx=clamp((e.clientX-rect.left)/rect.width*2-1,-1,1);s.ty=clamp((e.clientY-rect.top)/rect.height*2-1,-1,1);}
 el.addEventListener('pointerenter',function(e){if(reduced||!fine.matches||e.pointerType==='touch')return;s.hover=true;aim(e);start();},{passive:true});
 el.addEventListener('pointermove',function(e){
  if(reduced)return;
  if(s.down&&s.pointer===e.pointerId){var dx=e.clientX-s.startX,dy=e.clientY-s.startY;
   if(e.pointerType==='touch'&&!s.dragged&&Math.abs(dy)>Math.abs(dx)*1.2&&Math.abs(dy)>8){reset(s);return;}
   if(Math.hypot(dx,dy)>7){s.dragged=true;el.classList.add('is-dragging');if(el.setPointerCapture&&!el.hasPointerCapture(e.pointerId))el.setPointerCapture(e.pointerId);}
   s.tx=clamp(dx/(s.width*.28),-1,1);s.ty=clamp(dy/(s.height*.28),-1,1);start();
  }else if(fine.matches&&e.pointerType!=='touch'){s.hover=true;aim(e);start();}
 },{passive:true});
 el.addEventListener('pointerdown',function(e){if(e.button!==0||reduced)return;var rect=el.getBoundingClientRect();s.down=true;s.pointer=e.pointerId;s.dragged=false;s.startX=e.clientX;s.startY=e.clientY;s.width=rect.width;s.height=rect.height;s.tx=s.ty=0;start();},{passive:true});
 el.addEventListener('pointerup',function(e){release(s,e);},{passive:true});el.addEventListener('pointercancel',function(e){s.dragged=false;release(s,e);},{passive:true});
 el.addEventListener('lostpointercapture',function(){reset(s);},{passive:true});
 el.addEventListener('pointerleave',function(){if(!s.down)reset(s);},{passive:true});
 el.addEventListener('click',function(e){if(s.dragged&&e.detail!==0){s.dragged=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 el.addEventListener('dragstart',function(e){e.preventDefault();});el.addEventListener('keydown',function(e){if(e.key==='Escape')reset(s);});render(s);
});
/* A mouse released beyond the button must not leave it in dragging state. */
addEventListener('pointerup',function(e){states.forEach(function(s){release(s,e);});},{passive:true});
addEventListener('blur',function(){states.forEach(reset);});
var vs=d.querySelector('.vs'),rows=[].slice.call(d.querySelectorAll('.vs .row')),rowObserver=null;
if('IntersectionObserver' in window){
 var visibility=new IntersectionObserver(function(entries){entries.forEach(function(entry){var s=states.filter(function(state){return state.el===entry.target;})[0];s.visible=entry.isIntersecting;if(!s.visible){reset(s);s.x=s.y=s.vx=s.vy=s.lift=s.vlift=0;render(s);}});},{rootMargin:'100px'});states.forEach(function(s){visibility.observe(s.el);});
 rowObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){entry.target.style.setProperty('--reveal-y',entry.boundingClientRect.top<0?'-28px':'34px');entry.target.classList.toggle('is-visible',entry.isIntersecting);});},{threshold:.12,rootMargin:'0px 0px -4% 0px'});rows.forEach(function(row){rowObserver.observe(row);});if(!reduced)vs.classList.add('motion-ready');
}
function preference(){reduced=media.matches;cancelAnimationFrame(raf);raf=0;last=0;states.forEach(function(s){reset(s);s.x=s.y=s.vx=s.vy=s.lift=s.vlift=0;s.dragged=false;render(s);});if(vs)vs.classList.toggle('motion-ready',!reduced&&!!rowObserver);}
if(media.addEventListener)media.addEventListener('change',preference);
d.addEventListener('visibilitychange',function(){if(d.hidden){cancelAnimationFrame(raf);raf=0;last=0;states.forEach(reset);}else start();});
})();
