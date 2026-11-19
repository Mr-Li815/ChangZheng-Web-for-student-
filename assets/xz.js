/* 小征 · 星火舱（3D 光球 + 视差 + 错峰入场 + 滚动吸附）
   在线请求只走本站接口；断网时使用站内资料 */
(function(){
'use strict';
var d=document,cfg=window.XZ||{};
function KB(){return window.XZKB||[];}
var apiDead=0;
var ep=(cfg.proxy||'').trim();
var online=!!ep&&/^https?:$/.test(window.location.protocol);
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 面板骨架 ---------- */
var p=d.createElement('aside');
p.className='xzp';p.id='xzp';
p.setAttribute('role','dialog');
p.setAttribute('aria-labelledby','xztitle');
var SPARK='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z" fill="currentColor"/></svg>';
p.innerHTML=
 '<div class="xzp__sky" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i></div>'+
 '<header class="xzp__h">'+
   '<span class="xzp__orbwrap"><canvas class="xzp__orb" aria-hidden="true"></canvas><span class="xzp__orb-tag">AI</span></span>'+
   '<div class="xzp__id"><span class="xzp__eyebrow">AI COMPANION</span><b id="xztitle">小征<em>智能讲解员</em></b><small>让每一个疑问，都有回声。</small></div>'+
   '<span class="xzp__state" id="xzstate" aria-label="离线模式"></span>'+
   '<button class="xzp__x" type="button" aria-label="关闭">✕</button>'+
 '</header>'+
 '<div class="xzp__rail" aria-hidden="true"><span>于都</span><i class="rail-line"><b id="xzrail"></b></i><span>会宁</span></div>'+
 '<div class="xzp__b" id="xzb" aria-live="polite"></div>'+
 '<form class="xzp__f" id="xzf">'+
   '<span class="xzp__input-spark" aria-hidden="true">'+SPARK+'</span>'+
   '<input id="xzq" autocomplete="off" maxlength="1200" placeholder="向 AI 提问，聊聊你想知道的…" aria-label="向小征 AI 提问">'+
   '<button type="submit" aria-label="发送问题"><span>发送</span><i aria-hidden="true">↑</i></button>'+
 '</form>'+
 '<p class="xzp__m" id="xzm">离线模式 · 仅站内资料</p>';
d.body.appendChild(p);

var body=p.querySelector('#xzb'),form=p.querySelector('#xzf'),input=p.querySelector('#xzq'),
    mode=p.querySelector('#xzm'),state=p.querySelector('#xzstate'),rail=p.querySelector('#xzrail'),
    sky=p.querySelector('.xzp__sky'),btn=d.querySelector('.nav .xz'),opened=0,busy=0,msgCount=0;
var send=form.querySelector('button');

function setMode(){
  var live=online&&!apiDead;
  p.classList.toggle('is-thinking',!!busy);
  form.setAttribute('aria-busy',String(!!busy));
  send.disabled=!!busy;
  if(live){mode.textContent=busy?'AI 正在生成回答…':'AI 在线 · 长征讲解与学习问答';mode.className='xzp__m live';state.classList.add('live');state.setAttribute('aria-label',busy?'AI 正在生成回答':'AI 在线');}
  else{mode.textContent='站内资料模式 · 随时可以提问';mode.className='xzp__m';state.classList.remove('live');state.setAttribute('aria-label','站内资料模式');}
}
setMode();

/* ---------- 3D 光球（WebGL 着色器） ---------- */
var orb=(function(canvas){
  var gl=null;
  try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'})||
        canvas.getContext('experimental-webgl',{alpha:true,antialias:true,premultipliedAlpha:true});}catch(e){}
  if(!gl){canvas.classList.add('is-css');return null;}
  var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS=[
  'precision mediump float;',
  'uniform vec2 uRes;uniform float uT;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
  'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}',
  'void main(){',
  ' vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y)*2.;',
  ' float r=length(uv),R=.74;',
  ' float z=sqrt(max(0.,1.-min(1.,(r*r)/(R*R))));',
  ' vec3 n=vec3(uv/R,z);',
  ' float f=fbm(uv*2.6+vec2(uT*.10,-uT*.07));',
  ' float f2=fbm(uv*4.2-vec2(uT*.06,uT*.09)+f*1.6);',
  ' vec3 deep=vec3(.30,.035,.030);',
  ' vec3 mid=vec3(.88,.235,.12);',
  ' vec3 hot=vec3(1.,.79,.44);',
  ' vec3 col=mix(deep,mid,smoothstep(.18,.80,f));',
  ' col=mix(col,hot,smoothstep(.58,.96,f2)*.85);',
  ' vec3 L=normalize(vec3(-.45,.55,.72));',
  ' float diff=max(dot(n,L),0.);',
  ' float rim=pow(1.-z,2.4);',
  ' float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),24.);',
  ' vec3 outC=col*(.30+.95*diff)+hot*rim*.55+vec3(1.,.92,.78)*spec*.75;',
  ' float disc=1.-smoothstep(R-.014,R,r);',
  ' float glow=exp(-(r-R)*7.)*.62;',
  ' float breathe=.90+.10*sin(uT*.85);',
  ' vec3 glowC=mix(mid,hot,.34);',
  ' vec3 rgb=mix(glowC*glow,outC,disc);',
  ' float a=clamp((disc+glow)*breathe,0.,1.);',
  ' gl_FragColor=vec4(rgb*a,a);',
  '}'].join('\n');
  function sh(type,src){
    var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){return null;}
    return s;
  }
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);
  if(!vs||!fs){canvas.classList.add('is-css');return null;}
  var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){canvas.classList.add('is-css');return null;}
  gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var aLoc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc,2,gl.FLOAT,false,0,0);
  var uRes=gl.getUniformLocation(prog,'uRes'),uT=gl.getUniformLocation(prog,'uT');
  var raf=0,run=false,start=0,last=0;
  function size(){
    var s=canvas.clientWidth||60,dpr=Math.min(devicePixelRatio||1,2);
    var w=Math.max(1,Math.round(s*dpr)),h=Math.max(1,Math.round(s*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    gl.uniform2f(uRes,canvas.width,canvas.height);
  }
  function frame(t){
    if(!run)return;
    if(!start)start=t;
    gl.uniform1f(uT,(t-start)/1000);
    gl.drawArrays(gl.TRIANGLES,0,3);
    raf=requestAnimationFrame(frame);
  }
  function drawOnce(t){
    size();gl.uniform1f(uT,(t||0)/1000);gl.drawArrays(gl.TRIANGLES,0,3);
  }
  return {
    start:function(){
      size();
      if(reduce){drawOnce(800);return;}
      if(run)return;
      run=true;start=0;raf=requestAnimationFrame(frame);
    },
    stop:function(){run=false;cancelAnimationFrame(raf);},
    resize:function(){if(run){size();}else{size();}}
  };
})(p.querySelector('.xzp__orb'));

/* ---------- 开关 ---------- */
function open(){
  p.classList.add('on');
  if(btn)btn.setAttribute('aria-expanded','true');
  if(orb)orb.start();
  if(!opened){opened=1;window.setTimeout(hello,reduce?0:260);}
  window.setTimeout(function(){if(p.classList.contains('on'))input.focus();},reduce?0:420);
}
function close(){
  p.classList.remove('on');
  if(btn)btn.setAttribute('aria-expanded','false');
  if(orb)orb.stop();
  if(btn)btn.focus();
}
if(btn)btn.addEventListener('click',function(e){e.preventDefault();p.classList.contains('on')?close():open();});
p.querySelector('.xzp__x').addEventListener('click',close);
addEventListener('keydown',function(e){
  if(e.key==='Escape'&&p.classList.contains('on'))close();
});
addEventListener('resize',function(){if(orb)orb.resize();});

/* ---------- 视差 + 长征进度 ---------- */
function parallax(){
  var y=body.scrollTop;
  if(sky&&!reduce){
    sky.style.setProperty('--py',(y*-0.05).toFixed(1)+'px');
    sky.style.setProperty('--py2',(y*-0.022).toFixed(1)+'px');
  }
}
body.addEventListener('scroll',parallax,{passive:true});
function railStep(n){
  msgCount=n;
  if(rail)rail.style.setProperty('--p',Math.min(1,Math.max(0,(n-1)/8)).toFixed(3));
}

/* ---------- 消息 ---------- */
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function bump(){
  var n=body.querySelectorAll('.xzr').length;
  msgCount=n;
  if(rail)rail.style.setProperty('--p',Math.min(1,Math.max(0,(n-1)/9)).toFixed(3));
}
function scrollEnd(){
  requestAnimationFrame(function(){
    body.scrollTo({top:body.scrollHeight,behavior:reduce?'auto':'smooth'});
  });
}
function say(cls,txt,extra){
  var el=d.createElement('div');
  el.className='xzr '+cls;
  el.style.setProperty('--i',String(Math.min(body.querySelectorAll('.xzr').length,8)));
  if(cls==='a'){
    var thinking=txt==='…';
    if(thinking)el.classList.add('is-waiting');
    el.innerHTML='<span class="xzr__meta">'+SPARK+'<b>小征</b><i>AI</i></span>'+
      (thinking?'<span class="xz-thinking" role="status"><span class="xz-thinking__wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>正在组织回答</span></span>':'<span class="xzr__content">'+esc(txt)+'</span>');
  }else el.textContent=txt;
  body.appendChild(el);
  if(extra){var s=d.createElement('div');s.className='xzr src';s.textContent=extra;body.appendChild(s);}
  bump();scrollEnd();
  return el;
}

/* ---------- 开场 ---------- */
var PRESETS=['长征为什么开始？','哪四支队伍参加了长征？','长征途中吃什么？'];
function hello(){
  say('a','你好，我是小征，你的 AI 讲解员。关于长征，或其他学习问题，都可以问我。');
  suggest(PRESETS);
}
function suggest(questions){
  var box=d.createElement('div');box.className='xzchips';
  questions.forEach(function(q,i){
    var b=d.createElement('button');b.type='button';b.textContent=q;
    b.style.setProperty('--i',String(i));
    b.addEventListener('click',function(){ask(q);});
    box.appendChild(b);
  });
  body.appendChild(box);
  scrollEnd();
}

/* ---------- 检索 ---------- */
function normalize(text){
  return text.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'').replace(/为啥|咋会/g,'为什么');
}
var genericTerms=new Set(['是什么','出发','1934','1935','1936','战争','战斗','留下','剪','牺牲','名字','多少人','多少座','22']);
var broadTerms=new Set(['从哪里出发','从哪儿出发','出发地','长征从哪','多远','多少里','几天','多少天','到陕北','到达陕北','战役','会师']);
var entries=KB().map(function(entry){
  var terms=Array.from(new Set((entry.k||[]).concat(entry.q||[]).map(normalize))).filter(function(term){
    return term.length>=2&&!genericTerms.has(term);
  }).sort(function(a,b){return b.length-a.length;});
  return {entry:entry,terms:terms};
});
function top(question,limit){
  var query=normalize(question);
  var matches=entries.flatMap(function(record){
    var term=record.terms.find(function(candidate){
      if(query.indexOf(candidate)<0)return false;
      // 单独问“长征”时给概览，其他主题需要独立证据，避免误答成概览。
      return candidate!=='长征'||/^(请|能否|可以)?(介绍一下|介绍|讲讲|说说|什么是)?(红军)?长征(是什么|历史|概况|吗)?$/.test(query);
    });
    if(!term)return [];
    var specificity=(broadTerms.has(term)?5:term.length*5)+(query===term?12:0)+(record.entry.q?7:0);
    return [{entry:record.entry,score:specificity}];
  }).sort(function(a,b){return b.score-a.score;});
  var seen=new Set();
  return matches.map(function(match){return match.entry;}).filter(function(entry){
    if(seen.has(entry.a))return false;
    seen.add(entry.a);return true;
  }).slice(0,limit);
}

/* ---------- 问 ---------- */
function ask(q){
  q=(q||'').trim();if(!q||busy)return;
  busy=1;
  say('u',q);
  input.value='';
  var hit=top(q,5);
  var wait=say('a','…');
  if(online){
    apiDead=0;setMode();
    api(q,hit).then(function(ans){
      wait.remove();
      say('a',ans);
      if(hit.length)say('src','站内参考 · '+uniqSrc(hit).slice(0,3).join(' / '));
      busy=0;setMode();
    }).catch(function(error){
      apiDead=1;setMode();
      wait.remove();
      local(hit);
      say('note',error.status===429?'在线问答请求较多，请稍后再试。':'在线问答暂时连不上，下次提问会重新连接。');
      busy=0;setMode();
    });
  }else{
    setMode();
    setTimeout(function(){
      wait.remove();
      local(hit);
      busy=0;setMode();
    },340);
  }
}
function uniqSrc(list){
  var o=[];list.forEach(function(e){if(o.indexOf(e.s)<0)o.push(e.s);});return o;
}
function local(hit){
  if(!hit.length){
    say('a','你想了解哪个地点、人物或事件？可以只输入一个名字，比如“遵义”或“红25军”。');
    suggest(['四支红军分别从哪里出发？','彝海结盟发生了什么？','为什么草地那么难走？']);
    return;
  }
  var entry=hit[0];
  say('a',entry.a);
  var reference=say('src','资料来源 · ');
  if(entry.u){
    var link=d.createElement('a');
    link.href=entry.u;link.target='_blank';link.rel='noopener noreferrer';link.textContent=entry.s+' ↗';
    reference.appendChild(link);
  }else reference.append(entry.s);
}

/* ---------- 本站在线问答接口 ---------- */
function api(q,hit){
  var ctx=hit.map(function(e,i){return (i+1)+'. '+(e.q?e.q+'：':'')+e.a+'（来源：'+e.s+'）';}).join('\n');
  var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort();},cfg.timeout||40000);
  return fetch(ep,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question:q,context:ctx}),
    signal:ctl.signal
  }).then(function(r){
    if(!r.ok){var error=new Error('http '+r.status);error.status=r.status;throw error;}
    return r.json();
  }).then(function(j){
    var txt=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(typeof txt!=='string'||!txt.trim())throw new Error('empty');
    return txt.trim().slice(0,600);
  }).finally(function(){clearTimeout(tm);});
}

/* ---------- 绑定 ---------- */
form.addEventListener('submit',function(e){
  e.preventDefault();
  ask(input.value);
});
})();
