/* 小征 · 星火舱（3D 光球 + 视差 + 错峰入场 + 滚动吸附）
   本地检索优先，外接 API 可选；无 key 或断网自动降级 */
(function(){
'use strict';
var d=document,cfg=window.XZ||{};
function KB(){return window.XZKB||[];}
var key=(cfg.key||'').trim();
var apiDead=0;
var ep=(cfg.proxy||'').trim()||cfg.endpoint;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 面板骨架 ---------- */
var p=d.createElement('aside');
p.className='xzp';p.id='xzp';
p.setAttribute('role','dialog');
p.setAttribute('aria-label','小征');
p.innerHTML=
 '<div class="xzp__sky" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i></div>'+
 '<header class="xzp__h">'+
   '<span class="xzp__orbwrap"><canvas class="xzp__orb" aria-hidden="true"></canvas></span>'+
   '<div class="xzp__id"><b>小征</b><small>长征路上的青年讲解员</small></div>'+
   '<span class="xzp__state" id="xzstate" aria-label="离线模式"></span>'+
   '<button class="xzp__x" type="button" aria-label="关闭">✕</button>'+
 '</header>'+
 '<div class="xzp__rail" aria-hidden="true"><span>于都</span><i class="rail-line"><b id="xzrail"></b></i><span>会宁</span></div>'+
 '<div class="xzp__b" id="xzb" aria-live="polite"></div>'+
 '<form class="xzp__f" id="xzf">'+
   '<input id="xzq" autocomplete="off" placeholder="问一句话，我讲一段路…" aria-label="你的问题">'+
   '<button type="submit"><span>传令</span><i aria-hidden="true">→</i></button>'+
 '</form>'+
 '<p class="xzp__m" id="xzm">离线模式 · 仅站内资料</p>';
d.body.appendChild(p);

var body=p.querySelector('#xzb'),form=p.querySelector('#xzf'),input=p.querySelector('#xzq'),
    mode=p.querySelector('#xzm'),state=p.querySelector('#xzstate'),rail=p.querySelector('#xzrail'),
    sky=p.querySelector('.xzp__sky'),btn=d.querySelector('.nav .xz'),opened=0,busy=0,msgCount=0;

function setMode(){
  if(key){mode.textContent='在线模式 · 完整对话';mode.className='xzp__m live';state.classList.add('live');state.setAttribute('aria-label','在线模式');}
  else{mode.textContent='离线模式 · 仅站内资料';mode.className='xzp__m';state.classList.remove('live');state.setAttribute('aria-label','离线模式');}
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
  window.setTimeout(function(){input.focus();},reduce?0:420);
}
function close(){
  p.classList.remove('on');
  if(btn)btn.setAttribute('aria-expanded','false');
  if(orb)orb.stop();
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
  el.innerHTML=cls==='a'?'<em>★</em><span>'+esc(txt)+'</span>':esc(txt);
  body.appendChild(el);
  if(extra){var s=d.createElement('div');s.className='xzr src';s.textContent=extra;body.appendChild(s);}
  bump();scrollEnd();
  return el;
}

/* ---------- 开场 ---------- */
var PRESETS=['这条路到底有多长？','钟赤兵是谁？','你能聊点别的吗？'];
function hello(){
  say('a','你好，我是小征。关于这条路，你可以问我——');
  var box=d.createElement('div');box.className='xzchips';
  PRESETS.forEach(function(q,i){
    var b=d.createElement('button');b.type='button';b.textContent=q;
    b.style.setProperty('--i',String(i));
    b.addEventListener('click',function(){ask(q);});
    box.appendChild(b);
  });
  body.appendChild(box);
  scrollEnd();
}

/* ---------- 检索 ---------- */
function score(e,q){
  var n=0;
  (e.k||[]).forEach(function(k){if(q.indexOf(k)>=0)n+=k.length>2?2:1;});
  return n;
}
function top(q,n){
  return KB().map(function(e,i){return {e:e,s:score(e,q)};})
    .filter(function(x){return x.s>0;})
    .sort(function(a,b){return b.s-a.s;})
    .slice(0,n).map(function(x){return x.e;});
}

/* ---------- 问 ---------- */
function ask(q){
  q=(q||'').trim();if(!q||busy)return;
  busy=1;
  say('u',q);
  input.value='';
  var hit=top(q,3);
  var wait=say('a','…');
  if(key&&!apiDead){
    api(q,hit).then(function(ans){
      wait.remove();
      say('a',ans);
      if(hit.length)say('src','〔'+uniqSrc(hit).join('　')+'〕');
      busy=0;
    }).catch(function(){
      apiDead=1;
      wait.remove();
      var r=local(q,hit);say('a',r.text);
      if(r.src)say('src','〔'+r.src+'〕');
      say('note','网络没有接通。以上来自站内资料。');
      busy=0;
    });
  }else{
    setTimeout(function(){
      wait.remove();
      var r=local(q,hit);say('a',r.text);
      if(r.src)say('src','〔'+r.src+'〕');
      busy=0;
    },340);
  }
}
function uniqSrc(list){
  var o=[];list.forEach(function(e){if(o.indexOf(e.s)<0)o.push(e.s);});return o;
}
function local(q,hit){
  if(!hit.length)return {text:'离线的时候我只能答站内的资料，这个问题不行。联网之后可以随便问。',src:''};
  var e=hit[0];
  return {text:e.a,src:e.s};
}

/* ---------- 外接 API ---------- */
var SYS=[
'你是「小征」，一个网站里的 AI 讲解员，也是普通的大模型助手。',
'观众是十五到二十岁的学生，你和他们同龄。',
'',
'【说话方式】',
'短句。一句不超过 30 字。不用感叹号。不说教，不煽情。',
'不出现这些词：我们要、应当、伟大、铭记、传承、可歌可泣、让我们、共同。',
'回答控制在 150 字以内。能一句话说清就别写两句。',
'',
'【你所在的网站】',
'《夜行 · 以我青春，续写长征华章》，九个页面：',
'1 序章 · 火柴：1934 年 10 月，8.6 万人从江西于都出发',
'2 一 · 里程：12 个节点——于都、湘江、通道·黎平、遵义、赤水·娄山关、金沙江、大渡河·泸定桥、夹金山、川西北草地、腊子口、吴起镇、会宁',
'3 二 · 面孔：填你的年龄，对照一个同龄的人；六张档案卡——钟赤兵、陈树湘、徐解秀、刘伯承、无名者、文学里的红军',
'4 三 · 物件：门板、担架、电报稿、马灯、绑腿、草鞋、行军锅、半条被子',
'5 四 · 数字：每 14 人只有 1 人到达陕北；373 天；日均约 70 里；中央红军与全体红军两套口径',
'6 五 · 跟上：12 幕角色扮演，41 个选项，5 种结局',
'7 六 · 精神：五个方面，最后会反问你一句',
'8 七 · 接力：三组并置、留言墙、八道数字快答',
'9 尾 · 火柴',
'',
'【站内定下的数字，必须原样使用，不许改写或换算】',
'8.6 万余人出发；湘江后锐减至 3 万余人；历时 373 天；日均约 70 里；最远行程二万五千里；',
'翻越 20 多座大山，渡过 20 多条河流，重要战役战斗 380 多次，占领 60 多座城镇；',
'遵义会议 1935 年 1 月 15 日至 17 日；陈树湘 29 岁，1934 年 12 月 18 日；钟赤兵娄山关失去右腿；',
'半条被子：三名女战士、湖南汝城沙洲村、徐解秀。',
'',
'【怎么回答】',
'问网站上有的，用上面的内容和数字答，并且可以顺手指一句去哪一页看。',
'问别的事情，正常回答。不要拒绝，不要生硬地拉回长征，也不要说“站里没有收录”。',
'只有当你确实不知道、或者涉及没有定论的具体细节时，才说不知道。',
'不描述人物外貌，不评价历史人物，不渲染死亡细节。',
'',
'直接输出中文回答，不要加标题，不要用 JSON，不要写“小征：”这样的前缀。'
].join('\n');

function api(q,hit){
  var ctx=hit.length?hit.map(function(e,i){return (i+1)+'. '+e.a;}).join('\n'):'（这一条没有检索到站内资料，按常识回答即可）';
  var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort();},cfg.timeout||9000);
  return fetch(ep,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
    body:JSON.stringify({
      model:cfg.model||'deepseek-chat',
      temperature:cfg.temperature==null?0.5:cfg.temperature,
      max_tokens:cfg.maxTokens||420,
      stream:false,
      messages:[
        {role:'system',content:SYS+'\n\n【站内相关资料，仅供参考，不要照抄】\n'+ctx},
        {role:'user',content:q}
      ]
    }),
    signal:ctl.signal
  }).then(function(r){
    clearTimeout(tm);
    if(!r.ok)throw new Error('http '+r.status);
    return r.json();
  }).then(function(j){
    var txt=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(!txt)throw new Error('empty');
    return String(txt).trim().slice(0,600);
  });
}

/* ---------- 绑定 ---------- */
form.addEventListener('submit',function(e){
  e.preventDefault();
  ask(input.value);
});
})();
