/* 同行入口层：弹簧反馈与入场动效。游戏代码不在这里执行或改写。 */
(function(){
'use strict';
var d=document,root=d.documentElement;
var motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
var pointerQuery=matchMedia('(hover: hover) and (pointer: fine)');
var reduce=motionQuery.matches;
var cards=[].slice.call(d.querySelectorAll('.experience-card'));
if(!cards.length)return;
var states=[],keys=['x','y','rx','ry','s'];
function vector(){return {x:0,y:0,rx:0,ry:0,s:1};}
function write(state){
 var p=state.p,face=state.face;
 face.style.setProperty('--spring-x',p.x.toFixed(3)+'px');
 face.style.setProperty('--spring-y',p.y.toFixed(3)+'px');
 face.style.setProperty('--spring-rx',p.rx.toFixed(3)+'deg');
 face.style.setProperty('--spring-ry',p.ry.toFixed(3)+'deg');
 face.style.setProperty('--spring-scale',p.s.toFixed(5));
}
function animate(state){
 if(reduce||state.raf||d.hidden)return;
 state.card.classList.add('is-springing');state.last=0;
 function frame(time){
  state.raf=0;
  var dt=state.last?Math.min((time-state.last)/1000,.025):1/60;
  state.last=time;var settled=true;
  keys.forEach(function(key){
   /* Semi-implicit integration of a damped spring: F = -kx - cv. */
   var stiffness=210,damping=19,force=(state.target[key]-state.p[key])*stiffness-state.v[key]*damping;
   state.v[key]+=force*dt;state.p[key]+=state.v[key]*dt;
   var epsilon=key==='s'?.00004:.015;
   if(Math.abs(state.target[key]-state.p[key])>epsilon||Math.abs(state.v[key])>epsilon*10)settled=false;
  });
  if(settled){keys.forEach(function(key){state.p[key]=state.target[key];state.v[key]=0;});}
  write(state);
  if(!settled)state.raf=requestAnimationFrame(frame);
  else state.card.classList.remove('is-springing');
 }
 state.raf=requestAnimationFrame(frame);
}
function update(state){
 var active=state.hovering||state.focused;
 state.card.classList.toggle('is-active',active);
 state.target={
  x:state.hovering?state.nx*4:0,
  y:state.pressed?2:(active?-7:0)+(state.hovering?state.ny*1.8:0),
  rx:state.hovering?-state.ny*3:0,
  ry:state.hovering?state.nx*4:0,
  s:state.pressed?.986:(active?1.007:1)
 };
 if(reduce){state.p=vector();write(state);return;}
 animate(state);
}
function reset(state){
 cancelAnimationFrame(state.raf);state.raf=0;state.p=vector();state.v={x:0,y:0,rx:0,ry:0,s:0};state.target=vector();state.hovering=false;state.focused=false;state.pressed=false;state.nx=state.ny=0;
 state.card.classList.remove('is-active','is-springing');write(state);
}
function locate(state,e){
 var r=state.card.getBoundingClientRect(),x=Math.max(0,Math.min(r.width,e.clientX-r.left)),y=Math.max(0,Math.min(r.height,e.clientY-r.top));
 state.nx=(x/r.width-.5)*2;state.ny=(y/r.height-.5)*2;
 state.face.style.setProperty('--spot-x',x+'px');state.face.style.setProperty('--spot-y',y+'px');
 return {x:x,y:y};
}
function ripple(state,point){
 if(reduce||!state.face.animate)return;
 var el=d.createElement('span');el.className='entry-ripple';el.setAttribute('aria-hidden','true');el.style.left=point.x+'px';el.style.top=point.y+'px';state.face.appendChild(el);
 var effect=el.animate([{opacity:.18,transform:'scale(.1)'},{opacity:0,transform:'scale(24)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
 effect.finished.then(function(){el.remove();},function(){el.remove();});
}
cards.forEach(function(card){
 var state={card:card,face:card.querySelector('.experience-face'),p:vector(),v:{x:0,y:0,rx:0,ry:0,s:0},target:vector(),raf:0,last:0,hovering:false,focused:false,pressed:false,nx:0,ny:0};states.push(state);
 card.addEventListener('pointerenter',function(e){if(!pointerQuery.matches)return;state.hovering=true;locate(state,e);update(state);},{passive:true});
 card.addEventListener('pointermove',function(e){if(!pointerQuery.matches)return;state.hovering=true;locate(state,e);update(state);},{passive:true});
 card.addEventListener('pointerleave',function(){state.hovering=false;state.pressed=false;state.nx=state.ny=0;update(state);},{passive:true});
 card.addEventListener('pointerdown',function(e){if(e.button!==0)return;state.pressed=true;ripple(state,locate(state,e));update(state);},{passive:true});
 card.addEventListener('pointerup',function(){state.pressed=false;update(state);},{passive:true});
 card.addEventListener('pointercancel',function(){state.hovering=false;state.pressed=false;update(state);},{passive:true});
 card.addEventListener('focus',function(){state.focused=true;state.nx=state.ny=0;update(state);});
 card.addEventListener('blur',function(){state.focused=false;state.pressed=false;update(state);});
 card.addEventListener('keydown',function(e){if(e.key==='Enter'){state.pressed=true;update(state);}});
 card.addEventListener('keyup',function(){state.pressed=false;update(state);});
});
/* Reveal effects only hide content when a working observer can reveal it again. */
var revealItems=cards.concat([].slice.call(d.querySelectorAll('.follow-next')));
if(!reduce&&'IntersectionObserver' in window){
 root.classList.add('hub-motion');
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.12,rootMargin:'0px 0px -18px 0px'});
 revealItems.forEach(function(el){observer.observe(el);});
}else revealItems.forEach(function(el){el.classList.add('is-visible');});
function motionChanged(){
 reduce=motionQuery.matches;
 states.forEach(reset);
 if(reduce){root.classList.remove('hub-motion');revealItems.forEach(function(el){el.classList.add('is-visible');});}
}
if(motionQuery.addEventListener)motionQuery.addEventListener('change',motionChanged);
d.addEventListener('visibilitychange',function(){if(d.hidden)states.forEach(reset);});
addEventListener('pageshow',function(e){if(e.persisted)states.forEach(reset);});
addEventListener('resize',function(){states.forEach(function(state){state.hovering=false;state.nx=state.ny=0;update(state);});});
})();
