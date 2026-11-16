/* 跋涉：轻量的数字墨色与微幅视差。路线图独立于装饰画布。 */
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
 ' vec2 p=vec2(uv.x*aspect,uv.y); float t=u_time*.18;',
 ' p+=vec2(sin(p.y*3.1+t),cos(p.x*2.3-t))*(.16+u_energy*.03)+u_pointer*.04;',
 ' float a=.5+.5*sin(p.x*3.2+p.y*2.2+t+sin(p.y*3.6-t)*.8);',
 ' float b=.5+.5*cos(p.y*3.4-p.x*1.9-t*.8);',
 ' float light=exp(-length((uv-vec2(.5,.5))-u_pointer*.14)*3.7);',
 ' vec3 ink=mix(vec3(.28,.025,.035),vec3(.82,.16,.055),smoothstep(.12,.85,a));',
 ' ink=mix(ink,vec3(.96,.57,.22),smoothstep(.5,.96,b)*.54);',
 ' ink+=light*vec3(.09,.035,.009);',
 ' float ribbon=.5+.5*sin(p.x*5.6+p.y*19.0-t*1.5+sin(p.y*7.0-t)*.4);',
 ' ink=mix(ink,vec3(.86,.43,.22),pow(ribbon,8.0)*.18);',
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
var motifs={flag:flag,mountains:mountains};
function longMarchElements(scene,time){
 var ctx=scene.ctx,w=scene.w,h=scene.h,t=time*.16;
 scene.models.forEach(function(model,index){
  var depth=model.depth,cx=model.x*w+Math.sin(t*.64+index)*3+scene.camera.x*depth*.3,cy=model.y*h+Math.cos(t*.52+index)*2+scene.camera.y*depth*.2;
  var scale=model.size*Math.min(1.05,w/720+.35);ctx.save();ctx.globalAlpha=fine.matches ? .34 : .16;ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.32+index)*.012+scene.camera.x*.01);motifs[model.kind](ctx,scale,t+index*.7);ctx.restore();
 });
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
  /* Only the ink changes; draw each numeral once to keep contours crisp. */
  ctx.drawImage(mask,x,y,width,height);
 });
}
var scenes=nodes.map(function(node,index){
 var scene={node:node,kind:node.dataset.journeyScene,canvas:node.querySelector('.geometry-field'),camera:{x:0,y:0},velocity:{x:0,y:0},pointer:{x:0,y:0},energy:0,w:0,h:0,dpr:1,visible:false,scroll:0,progress:0,models:[],numberNodes:[],planes:[]};
 scene.ctx=scene.canvas.getContext('2d');scene.shader=new Shader(node.querySelector('.shader-field'),index);
 node.dataset.effectRenderer=scene.shader.ready?'webgl':'css-fallback';
 scene.models=[{kind:'flag',x:.84,y:.15,size:74,depth:16},{kind:'mountains',x:.16,y:.57,size:88,depth:-9}];
 scene.numberNodes=[].slice.call(node.querySelectorAll('[data-fluid-value]'));scene.planes=[].slice.call(node.querySelectorAll('.stat-step'));
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
 var activeMotion=!reduce&&!paused&&fine.matches;
 var step=Math.min(Math.max(dt||1/30,1/240),.05);
 if(activeMotion){['x','y'].forEach(function(axis){scene.velocity[axis]+=((scene.pointer[axis]-scene.camera[axis])*58-scene.velocity[axis]*16)*step;scene.camera[axis]=Math.max(-1,Math.min(1,scene.camera[axis]+scene.velocity[axis]*step));});scene.energy*=Math.exp(-step*2.8);}
 else{scene.camera.x=scene.camera.y=scene.velocity.x=scene.velocity.y=scene.energy=0;}
 if(scene.kind==='numbers'){
  scene.planes.forEach(function(row){var depth=parseFloat(row.style.getPropertyValue('--depth'))||10,offset=activeMotion?scene.scroll*depth*.1:0;row.style.setProperty('--plane-x',(scene.camera.x*depth*.35).toFixed(3)+'px');row.style.setProperty('--plane-y',(scene.camera.y*depth*.28+offset).toFixed(3)+'px');row.style.setProperty('--label-x',(-scene.camera.x*depth*.12).toFixed(3)+'px');row.style.setProperty('--label-y',(-scene.camera.y*depth*.1).toFixed(3)+'px');});
  var hero=d.querySelector('.journey-hero');hero.style.setProperty('--heading-x',(scene.camera.x*4).toFixed(2)+'px');hero.style.setProperty('--heading-y',(scene.camera.y*3).toFixed(2)+'px');
 }
 var glReady=scene.shader.draw(scene,elapsed);
 if(scene.ctx){scene.ctx.setTransform(scene.dpr,0,0,scene.dpr,0,0);scene.ctx.clearRect(0,0,scene.w,scene.h);longMarchElements(scene,activeMotion?elapsed:0);}
 var useNumbers=scene.kind==='numbers'&&glReady&&scene.ctx&&activeMotion;
 if(useNumbers){try{drawNumbers(scene,rect);scene.node.classList.add('canvas-number-ready');scene.node.dataset.effectText='flowing-canvas';}catch(e){scene.node.classList.remove('canvas-number-ready');scene.node.dataset.effectText='flowing-css';}}
 else{scene.node.classList.remove('canvas-number-ready');if(scene.kind==='numbers')scene.node.dataset.effectText=reduce||paused?'static':'flowing-css';}
}
function frame(time){
 raf=0;if(d.hidden)return;
 if(!last)last=time;var dt=Math.min((time-last)/1000,.08);last=time;
 if(!reduce&&!paused&&fine.matches)elapsed+=dt;
 if(time-lastDraw>=1000/24){var drawDt=lastDraw?Math.min((time-lastDraw)/1000,.05):1/24;lastDraw=time;scenes.forEach(function(scene){if(scene.visible)renderScene(scene,drawDt);});}
 if(!reduce&&!paused&&fine.matches&&scenes.some(function(scene){return scene.visible;}))raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&!d.hidden&&!reduce&&!paused&&fine.matches&&scenes.some(function(scene){return scene.visible;})){last=0;raf=requestAnimationFrame(frame);}}
function resize(){scenes.forEach(function(scene){size(scene);renderScene(scene);});start();}
if('IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){var scene=scenes.filter(function(s){return s.node===entry.target;})[0];scene.visible=entry.isIntersecting;if(scene.visible)renderScene(scene);});start();},{rootMargin:'100px 0px 100px 0px'});scenes.forEach(function(scene){observer.observe(scene.node);});}
else scenes.forEach(function(scene){scene.visible=true;});
/* One camera target across the page prevents jumps at the former panel edges. */
d.addEventListener('pointermove',function(e){if(reduce||paused||!fine.matches)return;var x=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2)),y=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2));scenes.forEach(function(scene){var travel=Math.hypot(x-scene.pointer.x,y-scene.pointer.y);scene.energy=Math.min(1,scene.energy+travel*.3);scene.pointer.x=x;scene.pointer.y=y;});start();},{passive:true});
d.documentElement.addEventListener('pointerleave',function(){scenes.forEach(function(scene){scene.pointer.x=scene.pointer.y=0;});start();},{passive:true});
var toggle=d.querySelector('.journey-motion-toggle');toggle.addEventListener('click',function(){paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.querySelector('span').textContent=paused?'继续动效':'暂停动效';toggle.querySelector('i').textContent=paused?'▶':'Ⅱ';body.classList.toggle('journey-effects-paused',paused);if(paused){cancelAnimationFrame(raf);raf=0;}scenes.forEach(function(scene){if(paused){scene.camera.x=scene.camera.y=0;}renderScene(scene);});start();});
function preference(){reduce=motion.matches;cancelAnimationFrame(raf);raf=0;scenes.forEach(function(scene){scene.camera.x=scene.camera.y=0;renderScene(scene);});start();}
if(motion.addEventListener)motion.addEventListener('change',preference);
if(fine.addEventListener)fine.addEventListener('change',preference);
d.addEventListener('visibilitychange',function(){if(d.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
addEventListener('resize',resize);addEventListener('load',resize);resize();
})();
