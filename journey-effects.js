/* 跋涉：长征意象、独立流场、镜头视差与流动数字。 */
(function(){
'use strict';
var d=document,body=d.body,motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),reduce=motion.matches,paused=false,raf=0,last=0,lastDraw=0,elapsed=0;
var nodes=[].slice.call(d.querySelectorAll('[data-journey-scene]'));
if(!nodes.length)return;
var vertex='attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}';
var fragment=[
 'precision mediump float;',
 'varying vec2 v_uv;',
 'uniform vec2 u_resolution; uniform vec2 u_pointer;',
 'uniform float u_time; uniform float u_mode; uniform float u_progress; uniform float u_energy;',
 'void main(){',
 ' vec2 uv=v_uv; float aspect=u_resolution.x/max(1.0,u_resolution.y);',
 ' vec2 p=vec2(uv.x*aspect,uv.y); float t=u_time*.56;',
 ' p+=vec2(sin(p.y*3.1+t),cos(p.x*2.3-t))*(.26+u_energy*.10)+u_pointer*.17;',
 ' float a=.5+.5*sin(p.x*3.2+p.y*2.2+t+sin(p.y*3.6-t)*.8);',
 ' float b=.5+.5*cos(p.y*3.4-p.x*1.9-t*.8);',
 ' float light=exp(-length((uv-vec2(.5,.5))-u_pointer*.14)*3.7);',
 ' vec3 ink=mix(vec3(.28,.025,.035),vec3(.82,.16,.055),smoothstep(.12,.85,a));',
 ' ink=mix(ink,vec3(.96,.57,.22),smoothstep(.5,.96,b)*.54);',
 ' ink+=light*vec3(.09,.035,.009);',
 ' float ribbon=.5+.5*sin(p.x*5.6+p.y*19.0-t*4.8+sin(p.y*7.0-t)*1.2);',
 ' ink=mix(ink,vec3(.99,.68,.28),pow(ribbon,8.0)*(.48+u_energy*.12));',
 ' vec3 paper=mix(vec3(.94,.89,.79),vec3(.82,.73,.56),a*.37);',
 ' paper=mix(paper,vec3(.79,.45,.29),pow(b,4.0)*.20);',
 ' paper=mix(paper,vec3(.86,.84,.69),light*.28);',
 ' paper+=sin(uv.x*8.0+uv.y*9.0-u_progress*3.0+t)*.012;',
 ' vec3 color=mix(ink,paper,u_mode);',
 ' float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);',
 ' color+=(grain-.5)*.008; gl_FragColor=vec4(color,1.0);',
 '}'
].join('\n');
function Shader(canvas,mode){this.canvas=canvas;this.mode=mode;this.gl=null;this.ready=false;this.error='';this.init();}
Shader.prototype.init=function(){
 var self=this,gl;
 try{gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});}catch(e){}
 if(!gl){this.error='unavailable';return;}
 function compile(kind,source){var shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){self.error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);return null;}return shader;}
 var vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
 var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){this.error=gl.getProgramInfoLog(program);return;}
 gl.useProgram(program);var buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 var pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 this.gl=gl;this.program=program;this.uniforms={};['u_resolution','u_pointer','u_time','u_mode','u_progress','u_energy'].forEach(function(key){self.uniforms[key]=gl.getUniformLocation(program,key);});
 gl.deleteShader(vs);gl.deleteShader(fs);this.ready=true;
};
Shader.prototype.draw=function(scene,time){
 if(!this.ready||!this.gl)return false;
 var gl=this.gl,u=this.uniforms;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.useProgram(this.program);
 gl.uniform2f(u.u_resolution,this.canvas.width,this.canvas.height);gl.uniform2f(u.u_pointer,scene.camera.x,-scene.camera.y);gl.uniform1f(u.u_time,time+this.mode*37);gl.uniform1f(u.u_mode,this.mode);gl.uniform1f(u.u_progress,scene.progress);gl.uniform1f(u.u_energy,scene.energy);gl.drawArrays(gl.TRIANGLES,0,6);return true;
};
function rgba(a){return 'rgba(164,73,37,'+a+')';}
function star(ctx,x,y,r){ctx.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;var px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
function flag(ctx,s,t){
 ctx.strokeStyle=rgba(.60);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-s*.45,-s*.7);ctx.lineTo(-s*.45,s*.85);ctx.stroke();
 ctx.beginPath();var j,x,y;for(j=0;j<=24;j++){x=-s*.43+j/24*s*1.25;y=-s*.65+Math.sin(j/24*5-t*2.8)*s*.13;if(!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
 for(j=24;j>=0;j--){x=-s*.43+j/24*s*1.25;y=-s*.01+Math.sin(j/24*5-t*2.8+.4)*s*.13;ctx.lineTo(x,y);}ctx.closePath();ctx.fillStyle='rgba(169,43,31,.36)';ctx.fill();ctx.stroke();
 ctx.fillStyle='rgba(207,158,84,.72)';star(ctx,-s*.14,-s*.33+Math.sin(1.2-t*2.2)*s*.05,s*.13);
}
function mountains(ctx,s,t){
 ctx.strokeStyle=rgba(.43);ctx.fillStyle='rgba(194,157,103,.14)';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(-s,s*.47);ctx.lineTo(-s*.42,-s*.48);ctx.lineTo(-s*.12,-s*.05);ctx.lineTo(s*.25,-s*.83);ctx.lineTo(s,s*.47);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='rgba(255,252,231,.8)';ctx.beginPath();ctx.moveTo(s*.25,-s*.83);ctx.lineTo(s*.03,-s*.37);ctx.lineTo(s*.22,-s*.44);ctx.lineTo(s*.38,-s*.28);ctx.lineTo(s*.51,-s*.36);ctx.closePath();ctx.fill();
 ctx.strokeStyle=rgba(.13);for(var i=0;i<3;i++){var y=s*(.64+i*.13);ctx.beginPath();ctx.moveTo(-s*1.12,y);ctx.quadraticCurveTo(-s*.2,y-s*.12,s*1.13,y-s*.03);ctx.stroke();}
}
function footprints(ctx,s,t){
 for(var i=0;i<4;i++){ctx.save();ctx.translate((i%2?1:-1)*s*.24,(i-1.5)*s*.44);ctx.rotate(i%2?.18:-.18);ctx.globalAlpha=.38+.2*Math.sin(t*1.1-i*.8);ctx.fillStyle='rgba(150,89,51,.15)';ctx.strokeStyle=rgba(.38);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-s*.10,-s*.20);ctx.bezierCurveTo(-s*.23,-s*.19,-s*.23,s*.06,-s*.12,s*.14);ctx.bezierCurveTo(s*.02,s*.23,s*.17,s*.04,s*.12,-s*.13);ctx.bezierCurveTo(s*.10,-s*.25,-s*.01,-s*.28,-s*.10,-s*.20);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(-s*.095,s*.21,s*.19,s*.13);ctx.restore();}
}
function marchingTrail(ctx,s,t){
 function at(u){return [-s+u*s*2,s*(.36-.78*u+Math.sin(u*6.28)*.22)];}
 ctx.strokeStyle=rgba(.4);ctx.lineWidth=1.3;ctx.setLineDash([4,7]);ctx.beginPath();for(var j=0;j<=32;j++){var p=at(j/32);j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();ctx.setLineDash([]);
 [0,.5,1].forEach(function(u){var p=at(u);ctx.fillStyle=rgba(.38);ctx.beginPath();ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fill();});var light=at((t*.12)%1);ctx.fillStyle='rgba(187,78,39,.65)';ctx.beginPath();ctx.arc(light[0],light[1],3.5,0,Math.PI*2);ctx.fill();
}
function lantern(ctx,s,t){
 ctx.strokeStyle=rgba(.35);ctx.lineWidth=.9;ctx.beginPath();ctx.arc(0,-s*.38,s*.27,Math.PI,0);ctx.moveTo(-s*.28,-s*.35);ctx.lineTo(-s*.36,s*.48);ctx.lineTo(s*.36,s*.48);ctx.lineTo(s*.28,-s*.35);ctx.closePath();ctx.stroke();ctx.strokeRect(-s*.40,s*.49,s*.80,s*.13);ctx.beginPath();ctx.moveTo(-s*.18,-s*.3);ctx.lineTo(-s*.15,s*.4);ctx.moveTo(s*.18,-s*.3);ctx.lineTo(s*.15,s*.4);ctx.stroke();
 var glow=ctx.createRadialGradient(0,s*.15,0,0,s*.15,s*.55);glow.addColorStop(0,'rgba(218,151,67,.16)');glow.addColorStop(1,'rgba(218,151,67,0)');ctx.fillStyle=glow;ctx.fillRect(-s*.65,-s*.45,s*1.3,s*1.3);ctx.fillStyle='rgba(182,81,33,.3)';ctx.beginPath();ctx.moveTo(0,-s*.12);ctx.bezierCurveTo(-s*.24,s*.12,-s*.12,s*.34,0,s*.35);ctx.bezierCurveTo(s*.18,s*.31,s*.12,s*.1,0,-s*.12);ctx.fill();
}
var motifs={flag:flag,mountains:mountains,footprints:footprints,trail:marchingTrail,lantern:lantern};
function longMarchElements(scene,time){
 var ctx=scene.ctx,w=scene.w,h=scene.h,t=time*.42;
 scene.models.forEach(function(model,index){
  var depth=model.depth,cx=model.x*w+Math.sin(t*.64+index)*18+scene.camera.x*depth,cy=model.y*h+Math.cos(t*.52+index)*13+scene.camera.y*depth*.72+scene.scroll*depth*.24;
  var scale=model.size*Math.min(1.15,w/720+.35);ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.32+index)*.065+scene.camera.x*.065);motifs[model.kind](ctx,scale,t+index*.7);ctx.restore();
 });
 scene.pulses=scene.pulses.filter(function(p){var age=time-p.at;if(age>1.2)return false;ctx.save();ctx.globalAlpha=(1-age/1.2)*.28;ctx.strokeStyle='#b65435';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,12+age*75,0,Math.PI*2);ctx.stroke();ctx.restore();return true;});
}
function drawNumbers(scene,rect){
 var ctx=scene.ctx,dpr=scene.dpr,field=scene.shader.canvas;
 scene.numberNodes.forEach(function(el,index){
  var box=el.getBoundingClientRect(),x=box.left-rect.left,y=box.top-rect.top,width=box.width,height=box.height;
  if(width<1||height<1)return;
  var cs=getComputedStyle(el),fontSize=parseFloat(cs.fontSize),letterSpacing=parseFloat(cs.letterSpacing)||0;
  var mask=el._journeyMask;if(!mask){mask=d.createElement('canvas');el._journeyMask=mask;}
  var mw=Math.ceil(width*dpr),mh=Math.ceil(height*dpr);if(mask.width!==mw||mask.height!==mh){mask.width=mw;mask.height=mh;}
  var mc=mask.getContext('2d');if(!mc)return;
  mc.setTransform(dpr,0,0,dpr,0,0);mc.clearRect(0,0,width,height);mc.globalCompositeOperation='source-over';mc.fillStyle='#fff';mc.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;mc.textBaseline='alphabetic';
  var metrics=mc.measureText('0123456789'),ascent=metrics.fontBoundingBoxAscent||fontSize*.82,descent=metrics.fontBoundingBoxDescent||fontSize*.2,baseline=(height-ascent-descent)/2+ascent,px=0;
  String(el.textContent).split('').forEach(function(letter){mc.fillText(letter,px,baseline);px+=mc.measureText(letter).width+letterSpacing;});
  mc.globalCompositeOperation='source-in';
  /* Glyphs carry the very same live shader field as their own number scene. */
  mc.drawImage(field,Math.max(0,x*dpr),Math.max(0,y*dpr),Math.max(1,width*dpr),Math.max(1,height*dpr),0,0,width,height);
  mc.globalCompositeOperation='source-over';
  /* A visible ink wake and a travelling wave distort contours, never the facts. */
  var amplitude=Math.min(9,fontSize*.07)*(1+scene.energy*.35),lift=Math.sin(elapsed*1.2+index*.72)*2.4;
  ctx.save();ctx.globalAlpha=.10;ctx.drawImage(mask,x+Math.sin(elapsed*1.5+index)*11,y+lift+3,width,height);ctx.restore();
  for(var strip=0;strip<height;strip+=2){var sh=Math.min(2.4,height-strip),phase=strip/height*Math.PI*2,dx=Math.sin(phase*1.18-elapsed*2.55+index*.85)*amplitude+Math.sin(phase*2.3+elapsed*1.1)*amplitude*.27;ctx.drawImage(mask,0,strip*dpr,mask.width,Math.min(sh*dpr,mask.height-strip*dpr),x+dx,y+strip+lift,width,sh);}
 });
}
var scenes=nodes.map(function(node,index){
 var scene={node:node,kind:node.dataset.journeyScene,canvas:node.querySelector('.geometry-field'),camera:{x:0,y:0},velocity:{x:0,y:0},pointer:{x:0,y:0},energy:0,w:0,h:0,dpr:1,visible:false,scroll:0,progress:0,pulses:[],models:[],numberNodes:[],planes:[]};
 scene.ctx=scene.canvas.getContext('2d');scene.shader=new Shader(node.querySelector('.shader-field'),index);
 node.dataset.effectRenderer=scene.shader.ready?'webgl':'css-fallback';
 scene.models=index?[{kind:'mountains',x:.22,y:.29,size:88,depth:-34},{kind:'flag',x:.76,y:.27,size:78,depth:66},{kind:'lantern',x:.72,y:.76,size:62,depth:48},{kind:'footprints',x:.25,y:.77,size:57,depth:-24}]:[{kind:'flag',x:.78,y:.16,size:108,depth:92},{kind:'mountains',x:.16,y:.44,size:132,depth:-40},{kind:'trail',x:.82,y:.65,size:108,depth:58},{kind:'footprints',x:.23,y:.87,size:76,depth:72}];
 if(!index){scene.numberNodes=[].slice.call(node.querySelectorAll('[data-fluid-value]'));scene.planes=[].slice.call(node.querySelectorAll('.stat-step'));}
 node.addEventListener('pointerdown',function(e){if(reduce||paused||e.target.closest('button'))return;var r=node.getBoundingClientRect();scene.pulses.push({x:e.clientX-r.left,y:e.clientY-r.top,at:elapsed});start();},{passive:true});
 node.querySelector('.shader-field').addEventListener('webglcontextlost',function(e){e.preventDefault();scene.shader.ready=false;node.dataset.effectRenderer='css-fallback';node.classList.remove('canvas-number-ready');});
 node.querySelector('.shader-field').addEventListener('webglcontextrestored',function(){scene.shader.init();node.dataset.effectRenderer=scene.shader.ready?'webgl':'css-fallback';renderScene(scene);start();});
 return scene;
});
function size(scene){
 scene.w=scene.node.clientWidth;scene.h=scene.node.clientHeight;scene.dpr=Math.min(devicePixelRatio||1,1.35);
 [scene.canvas,scene.shader.canvas].forEach(function(canvas){var w=Math.max(1,Math.round(scene.w*scene.dpr)),h=Math.max(1,Math.round(scene.h*scene.dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}});
}
function renderScene(scene,dt){
 if(!scene.w||!scene.h)return;
 var rect=scene.node.getBoundingClientRect();scene.scroll=Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/Math.max(innerHeight,rect.height)));
 var activeMotion=!reduce&&!paused;
 var step=Math.min(Math.max(dt||1/30,1/240),.05);
 if(activeMotion){['x','y'].forEach(function(axis){scene.velocity[axis]+=((scene.pointer[axis]-scene.camera[axis])*105-scene.velocity[axis]*17)*step;scene.camera[axis]=Math.max(-1.15,Math.min(1.15,scene.camera[axis]+scene.velocity[axis]*step));});scene.energy*=Math.exp(-step*2.8);}
 else{scene.camera.x=scene.camera.y=scene.velocity.x=scene.velocity.y=scene.energy=0;}
 if(scene.kind==='numbers'){
  scene.planes.forEach(function(row){var depth=parseFloat(row.style.getPropertyValue('--depth'))||10,offset=activeMotion?scene.scroll*depth*.65:0;row.style.setProperty('--plane-x',(scene.camera.x*depth*3).toFixed(3)+'px');row.style.setProperty('--plane-y',(scene.camera.y*depth*2.35+offset).toFixed(3)+'px');row.style.setProperty('--label-x',(-scene.camera.x*depth*1.15).toFixed(3)+'px');row.style.setProperty('--label-y',(-scene.camera.y*depth*.8).toFixed(3)+'px');});
  var hero=d.querySelector('.journey-hero');hero.style.setProperty('--heading-x',(scene.camera.x*29).toFixed(2)+'px');hero.style.setProperty('--heading-y',(scene.camera.y*18).toFixed(2)+'px');
 }else{
  scene.node.style.setProperty('--route-x',(scene.camera.x*38).toFixed(2)+'px');scene.node.style.setProperty('--route-y',(scene.camera.y*29+(activeMotion?scene.scroll*12:0)).toFixed(2)+'px');scene.node.style.setProperty('--route-rx',(-scene.camera.y*5.5).toFixed(2)+'deg');scene.node.style.setProperty('--route-ry',(scene.camera.x*7.5).toFixed(2)+'deg');
  var line=d.querySelector('#map .line');if(line){var length=parseFloat(line.style.strokeDasharray)||1;scene.progress=1-(parseFloat(line.style.strokeDashoffset)||0)/length;}
  var title=d.querySelector('.c.cur h2'),current=scene.node.querySelector('.route-scene-current');if(title&&current&&current.textContent!==title.textContent)current.textContent=title.textContent;
 }
 var glReady=scene.shader.draw(scene,elapsed);
 if(scene.ctx){scene.ctx.setTransform(scene.dpr,0,0,scene.dpr,0,0);scene.ctx.clearRect(0,0,scene.w,scene.h);longMarchElements(scene,reduce?0:elapsed);}
 var useNumbers=scene.kind==='numbers'&&glReady&&scene.ctx&&!reduce&&!paused;
 if(useNumbers){try{drawNumbers(scene,rect);scene.node.classList.add('canvas-number-ready');scene.node.dataset.effectText='flowing-canvas';}catch(e){scene.node.classList.remove('canvas-number-ready');scene.node.dataset.effectText='flowing-css';}}
 else{scene.node.classList.remove('canvas-number-ready');if(scene.kind==='numbers')scene.node.dataset.effectText=reduce||paused?'static':'flowing-css';}
}
function frame(time){
 raf=0;if(d.hidden)return;
 if(!last)last=time;var dt=Math.min((time-last)/1000,.08);last=time;
 if(!reduce&&!paused)elapsed+=dt;
 if(time-lastDraw>=1000/30){var drawDt=lastDraw?Math.min((time-lastDraw)/1000,.05):1/30;lastDraw=time;scenes.forEach(function(scene){if(scene.visible)renderScene(scene,drawDt);});}
 if(!reduce&&!paused&&scenes.some(function(scene){return scene.visible;}))raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&!d.hidden&&!reduce&&!paused&&scenes.some(function(scene){return scene.visible;})){last=0;raf=requestAnimationFrame(frame);}}
function resize(){scenes.forEach(function(scene){size(scene);renderScene(scene);});start();}
if('IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){var scene=scenes.filter(function(s){return s.node===entry.target;})[0];scene.visible=entry.isIntersecting;if(scene.visible)renderScene(scene);});start();},{rootMargin:'100px 0px 100px 0px'});scenes.forEach(function(scene){observer.observe(scene.node);});}
else scenes.forEach(function(scene){scene.visible=true;});
/* One camera target across the page prevents jumps at the former panel edges. */
d.addEventListener('pointermove',function(e){if(reduce||paused||!fine.matches)return;var x=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2)),y=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2));scenes.forEach(function(scene){var travel=Math.hypot(x-scene.pointer.x,y-scene.pointer.y);scene.energy=Math.min(1,scene.energy+travel*1.8);scene.pointer.x=x;scene.pointer.y=y;});start();},{passive:true});
d.documentElement.addEventListener('pointerleave',function(){scenes.forEach(function(scene){scene.pointer.x=scene.pointer.y=0;});start();},{passive:true});
var toggle=d.querySelector('.journey-motion-toggle');toggle.addEventListener('click',function(){paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.querySelector('span').textContent=paused?'继续动效':'暂停动效';toggle.querySelector('i').textContent=paused?'▶':'Ⅱ';body.classList.toggle('journey-effects-paused',paused);if(paused){cancelAnimationFrame(raf);raf=0;}scenes.forEach(function(scene){if(paused){scene.camera.x=scene.camera.y=0;}renderScene(scene);});start();});
function preference(){reduce=motion.matches;cancelAnimationFrame(raf);raf=0;scenes.forEach(function(scene){scene.camera.x=scene.camera.y=0;renderScene(scene);});start();}
if(motion.addEventListener)motion.addEventListener('change',preference);
d.addEventListener('visibilitychange',function(){if(d.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
addEventListener('resize',resize);addEventListener('load',resize);resize();
})();
