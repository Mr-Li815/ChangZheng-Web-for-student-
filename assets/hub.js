/* 同行 · 分流页：条目依次露出 + 光斑跟手 */
(function(){
'use strict';
var d=document;
d.documentElement.classList.add('js');
var rows=[].slice.call(d.querySelectorAll('.row'));
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});
rows.forEach(function(r){
  io.observe(r);
  r.addEventListener('pointermove',function(e){
    var b=r.getBoundingClientRect();
    r.style.setProperty('--mx',(e.clientX-b.left)+'px');r.style.setProperty('--my',(e.clientY-b.top)+'px');
  },{passive:true});
});
})();
