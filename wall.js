/* 留言墙（原「后来」页，现放到「天亮」页尾） */
(function(){
'use strict';
var d=document,$=function(i){return d.getElementById(i);};
var form=$('f'),input=$('m'),card=$('card'),cardT=$('cardT'),list=$('list');
if(!form)return;

var KEY='relay.v1';

function read(){
  try{var a=JSON.parse(localStorage.getItem(KEY));return Array.isArray(a)?a:[];}catch(e){return[];}
}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a));}catch(e){}}

function render(){
  var a=read(),frag=d.createDocumentFragment();
  a.slice().reverse().forEach(function(t,i){
    var li=d.createElement('li'),s=d.createElement('span'),p=d.createElement('p');
    s.textContent=String(a.length-i).padStart(2,'0');
    p.textContent=t;
    li.appendChild(s);li.appendChild(p);frag.appendChild(li);
  });
  list.textContent='';list.appendChild(frag);
}

form.addEventListener('submit',function(e){
  e.preventDefault();
  var v=input.value.trim();if(!v)return;
  var a=read();a.push(v);if(a.length>40)a=a.slice(-40);save(a);
  cardT.textContent=v;card.hidden=false;
  input.value='';render();
});

render();
})();
