(function(){
const CHIPS=[['M1',68],['M2',100],['M3',100],['M4',120],['M4 Pro',273],['M4 Max',546]];
const MEMS=[8,16,24,32,48,64];
const L={qwen:'qwen-color',openai:'openai',google:'google-color',meta:'meta-color',microsoft:'microsoft-color',mistral:'mistral-color',deepseek:'deepseek-color',bfl:'flux',lightricks:'lightricks'};
const ORG={qwen:'Qwen',openai:'OpenAI',google:'Google',meta:'Meta',microsoft:'Microsoft',mistral:'Mistral',deepseek:'DeepSeek',bfl:'Black Forest Labs',lightricks:'Lightricks'};
// name, org, tasks, params(B), GB at 4-bit, active GB, context, license, unit, blurb, tags
const M=[
 ['Qwen 2.5 Coder 7B','qwen',['coding'],7.6,4.1,4.1,'128K','Apache 2.0','tok','A small, fast coding model for completion, refactors and code questions. A good default for editors on 16 GB Macs.',['Code completion','Tool use']],
 ['Qwen 3 8B','qwen',['chat','reasoning'],8.2,4.6,4.6,'128K','Apache 2.0','tok','A strong all-round chat model that fits almost any Mac.',['Thinking mode']],
 ['Llama 3.1 8B','meta',['chat'],8,4.7,4.7,'128K','Llama 3.1','tok','A popular general model for chat and writing.',['Writing']],
 ['Qwen 2.5 VL 7B','qwen',['vision'],8.3,5.2,5.2,'32K','Apache 2.0','tok','Reads images and screenshots and answers questions about them.',['Screens']],
 ['Gemma 3 12B','google',['chat','vision'],12,7.3,7.3,'128K','Gemma','tok','Chat and image understanding in one mid-size model.',['Images']],
 ['Phi-4 14B','microsoft',['reasoning'],14.7,8.4,8.4,'16K','MIT','tok','Good at math and step-by-step reasoning for its size.',['Math']],
 ['FLUX.1 schnell','bfl',['image'],12,7,7,'—','Apache 2.0','img','Fast image generation from a text prompt.',['Text to image']],
 ['LTX-Video 2B','lightricks',['video'],2,4.2,4.2,'—','LTX','vid','Short video clips from text or an image.',['Text to video']],
 ['GPT-OSS 20B','openai',['reasoning','coding'],21,11.3,11.3,'128K','Apache 2.0','tok','Open-weight reasoning model with tool use.',['Tool use']],
 ['Devstral 24B','mistral',['coding'],24,14,14,'128K','Apache 2.0','tok','A coding agent model for multi-file changes.',['Agents']],
 ['Gemma 3 27B','google',['chat','vision'],27,15.6,15.6,'128K','Gemma','tok','The largest Gemma 3, with vision.',['Images']],
 ['Qwen 3 32B','qwen',['chat','reasoning'],32.8,18,18,'128K','Apache 2.0','tok','A large, capable model for long answers and analysis.',['Long answers']],
 ['DeepSeek R1 Distill 32B','deepseek',['reasoning'],32.8,18.5,18.5,'128K','MIT','tok','Thinks step by step before answering.',['Thinking']],
 ['Qwen 3.6 35B-A3B','qwen',['coding','chat'],35,20,8,'256K','Apache 2.0','tok','A mixture-of-experts model: big knowledge, fast replies.',['Mixture of experts']],
 ['Llama 3.3 70B','meta',['chat'],70.6,40,40,'128K','Llama 3.3','tok','A large general model for the heaviest tasks.',['Writing']],
 ['GPT-OSS 120B','openai',['reasoning'],117,63,63,'128K','Apache 2.0','tok','The largest open GPT model.',['Tool use']]
].map((r,i)=>({i,name:r[0],org:r[1],tasks:r[2],params:r[3],need:r[4],act:r[5],ctx:r[6],lic:r[7],unit:r[8],blurb:r[9],tags:r[10],id:r[0].toLowerCase().replace(/[^a-z0-9.]+/g,'-')}));
const TASKS=[['chat','Chat & writing','Answers, drafts, summaries'],['coding','Coding','Completion and code agents'],['reasoning','Reasoning','Math, logic, long analysis'],['vision','Vision','Read images and screens'],['image','Images','Generate pictures'],['video','Video','Generate short clips']];
const TN=t=>({chat:'Chat',coding:'Coding',reasoning:'Reasoning',vision:'Vision',image:'Image',video:'Video'})[t];
const S={chip:3,mem:1,tk:true,quant:4,cat:'all',q:'',sort:'fast',view:'simple',task:'coding',sizes:new Set(),fits:new Set([0,1,2]),all:false};
const $=s=>document.querySelector(s);const mob=()=>innerWidth<=860;
const usable=()=>MEMS[S.mem]*0.75,cap=()=>usable()*1.85,bw=()=>CHIPS[S.chip][1];
function calc(m,q){q=q||S.quant;const need=m.need*(q===8?1.9:1),act=m.act*(q===8?1.9:1);const mac=need<=usable(),tk=need<=cap();
  const st=mac?0:(tk&&S.tk?1:2);let ms,ts;
  if(m.unit==='tok'){ms=mac?Math.round(bw()*0.8/act):null;ts=tk?Math.min(140,Math.round(bw()*2.1/act*(mac?1:0.62))):null;}
  else{const k=m.unit==='img'?180:900;ms=mac?Math.round(need*k/bw()):null;ts=tk?Math.max(1,Math.round(need*k/bw()/2.6)):null;}
  return{need,mac,tk,st,ms,ts};}
const u=m=>m.unit==='tok'?'tok/s':m.unit==='img'?'s / image':'s / clip';
const fmt=(m,v)=>v==null?null:'~'+v+' '+u(m);
const logo=m=>'<span class="lg"><img src="assets/models/'+L[m.org]+'.svg" alt="" width="16" height="16"></span>';
const STX=['Runs on your Mac','Opens up with Tokkey','Too big for now'];
const cfgTxt=short=>(short?'':'Apple ')+CHIPS[S.chip][0]+' · '+MEMS[S.mem]+' GB'+(S.tk?' · Tokkey attached':'');
const SIZES=[['<3B',0,3],['3–8B',3,9],['8–16B',9,16],['16–35B',16,36],['>35B',36,999]];
function fill(sel,arr,f,v){sel.innerHTML=arr.map((a,i)=>'<option value="'+i+'"'+(i===v?' selected':'')+'>'+f(a)+'</option>').join('');}
// ----- controls
$('#chip2').onchange=e=>{S.chip=+e.target.value;render()};$('#mem2').onchange=e=>{S.mem=+e.target.value;render()};
$('#tk').onclick=()=>{S.tk=!S.tk;render()};
$('#quant').onchange=e=>{S.quant=+e.target.value;render()};
$('#q').oninput=e=>{S.q=e.target.value.toLowerCase();renderList()};
$('#sort').onchange=e=>{S.sort=e.target.value;renderList()};
$('#moreBtn').onclick=()=>{S.all=!S.all;renderList()};
$('#check').addEventListener('click',()=>{S.chip=3;S.mem=1;render()});
const setView=v=>{S.view=v;render()};
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
$('#chg').onclick=()=>setView('advanced');
const openF=()=>{$('#panel').classList.add('open');$('#scrim').classList.add('open');document.documentElement.style.overflow='hidden'},closeF=()=>{$('#panel').classList.remove('open');$('#scrim').classList.remove('open');document.documentElement.style.overflow=''};
$('#openF').onclick=openF;$('#cbarB').onclick=openF;$('#scrim').onclick=closeF;$('#apply').onclick=closeF;$('#closeF').onclick=closeF;
const CATS=[['all','All']].concat(TASKS.map(t=>[t[0],TN(t[0])]));
const setCat=c=>{S.cat=c;render()};
$('#cats').onclick=e=>{const b=e.target.closest('button');if(b)setCat(b.dataset.c)};
$('#ptasks').onclick=e=>{const b=e.target.closest('button');if(b)setCat(S.cat===b.dataset.c?'all':b.dataset.c)};
$('#sizes').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;S.sizes.has(i)?S.sizes.delete(i):S.sizes.add(i);render()};
$('#fits').onchange=e=>{const i=+e.target.dataset.i;e.target.checked?S.fits.add(i):S.fits.delete(i);render()};
$('#reset').onclick=()=>{Object.assign(S,{chip:3,mem:1,tk:true,quant:4,cat:'all',sizes:new Set(),fits:new Set([0,1])});$('#quant').value='4';render()};
S.fits=new Set([0,1]);
$('#tasks').innerHTML=TASKS.map(t=>'<button class="task" data-t="'+t[0]+'" aria-pressed="'+(t[0]===S.task)+'"><b>'+t[1]+'</b><span>'+t[2]+'</span></button>').join('');
$('#tasks').onclick=e=>{const b=e.target.closest('.task');if(!b)return;S.task=b.dataset.t;$('#tasks').querySelectorAll('.task').forEach(x=>x.setAttribute('aria-pressed',x===b));renderPicks()};
$('#seeAll').onclick=()=>{S.view='simple';setCat(S.task)};
// ----- pick
function renderPicks(){const c=M.filter(m=>m.tasks.includes(S.task)).map(m=>({m,c:calc(m)}));
  const runs=c.filter(x=>x.c.st===0).sort((a,b)=>b.m.params-a.m.params),opens=c.filter(x=>x.c.st===1).sort((a,b)=>a.m.params-b.m.params);
  let p=[];if(runs[0])p.push(runs[0]);p=p.concat(opens.slice(0,3-p.length));if(p.length<3)p=p.concat(runs.slice(1,1+3-p.length));
  $('#bestH').textContent='Best for '+TASKS.find(t=>t[0]===S.task)[1].toLowerCase()+' on your Mac';$('#seeAll').textContent='See all '+TN(S.task).toLowerCase()+' models';$('#pillT').textContent=cfgTxt();
  const max=Math.max(1,...p.map(x=>x.c.ts||x.c.ms||1));
  $('#picks').innerHTML=p.map((x,k)=>{const a=fmt(x.m,x.c.ms),b=fmt(x.m,x.c.ts);const pc=v=>v?Math.max(6,Math.round(v/max*100)):0;
   return '<article class="pick"><span class="rk">0'+(k+1)+'</span><div class="nm">'+logo(x.m)+'<b>'+x.m.name+'</b></div><div class="meta">'+x.m.params+'B · '+x.c.need.toFixed(1)+' GB</div><span class="spill s'+x.c.st+'"><i></i>'+STX[x.c.st]+'</span>'+
   '<div class="bars"><div><p>Your Mac alone</p><div class="bar"><i style="width:'+pc(x.c.ms)+'%"></i></div><b class="'+(a?'':'no')+'">'+(a||"Won't fit")+'</b></div><div><p>With Tokkey</p><div class="bar t"><i style="width:'+pc(x.c.ts)+'%"></i></div><b>'+(b||'Too big')+'</b></div></div>'+
   '<div class="speed"><div class="'+(a?'':'no')+'"><span class="label">Your Mac</span><b>'+(a||"Won't fit")+'</b></div><div class="t'+(b?'':' no')+'"><span class="label">With Tokkey</span><b>'+(b||'Too big')+'</b></div></div>'+
   '<div class="acts"><button class="btn sm" data-dl="'+x.m.i+'">Download</button><a class="det" href="#" data-open="'+x.m.i+'">Details</a></div></article>'}).join('')||'<p class="muted">No models for this task yet.</p>';}
// ----- list
function filtered(){const adv=S.view==='advanced'||(mob()&&S.view!=='simple');return M.map(m=>({m,c:calc(m)})).filter(x=>(S.cat==='all'||x.m.tasks.includes(S.cat))&&(!S.q||x.m.name.toLowerCase().includes(S.q)||x.m.org.includes(S.q))&&(!adv||((!S.sizes.size||[...S.sizes].some(i=>x.m.params>=SIZES[i][1]&&x.m.params<SIZES[i][2]))&&S.fits.has(x.c.st))));}
function renderList(){let r=filtered();const key={fit:x=>x.c.st*1000-(x.c.ts||0),fast:x=>x.c.st*1000-(x.c.ts||x.c.ms||0),small:x=>x.c.need}[S.sort];r.sort((a,b)=>key(a)-key(b));
  const shown=S.all?r:r.slice(0,6);$('#moreBtn').textContent=S.all?'Show fewer':'Show all '+r.length+' models';$('#moreBtn').hidden=r.length<=6;
  $('#rows').innerHTML=shown.map(x=>{const a=fmt(x.m,x.c.ms),b=fmt(x.m,x.c.ts);const sp=v=>'<b>'+v.split(' ')[0]+'</b><small>'+u(x.m)+'</small>';const tk=x.m.tasks.map(TN).join(' · ');
   const btn=x.c.st===0?'<button class="btn sm" data-dl="'+x.m.i+'">Download</button>':'<button class="btn sm ghost" data-dl="'+x.m.i+'">'+(x.c.st===2&&mob()?'Notify me':'Download')+'</button>';
   return '<tr class="'+(x.c.st===2?'big':'')+'" data-open="'+x.m.i+'"><td class="c-model"><div class="mrow"><i class="st s'+x.c.st+'"></i>'+logo(x.m)+'<div><b>'+x.m.name+'</b><small>'+tk+' · '+x.m.params+'B · '+x.c.need.toFixed(1)+' GB</small></div></div></td><td class="c-task">'+tk+'</td><td class="num'+(a?'':' no')+'" data-l="YOUR MAC">'+(a?sp(a)+'<button class="spi lt" data-sp="'+x.m.i+'" data-mode="mac" aria-label="Watch '+x.m.name+' type on your Mac"><i></i><i></i><i></i><b></b></button>':"Won't fit")+'</td><td class="num tk" data-l="'+(S.tk?'WITH TOKKEY':'WITHOUT TOKKEY')+'">'+(b?sp(b):'Too big')+'<button class="spi" data-sp="'+x.m.i+'" aria-label="Watch '+x.m.name+' type"'+(b?'':' disabled')+'><i></i><i></i><i></i><b></b></button></td><td class="c-size">'+x.m.params+'B</td><td class="c-mem">'+x.c.need.toFixed(1)+' GB</td><td class="c-act"><span class="stx">'+STX[x.c.st]+'</span><span>'+btn+(x.c.st===2?'<a class="nt" href="#" data-dl="'+x.m.i+'">Notify me</a>':'')+'</span></td></tr>'}).join('')||'<tr><td colspan="7">No models match. Try clearing a filter.</td></tr>';
  if(S.view==='map'&&!mob())renderMap(r);placeCol();}
// ----- memory map (Figma D): linear 0–32 GB, lollipops, Mac line, Tokkey target
function renderMap(r){const MAX=32,X=g=>Math.min(g,MAX)/MAX*100;const ux=X(usable()),cx=X(Math.min(cap(),MAX));
  const inside=r.filter(o=>o.c.need<=MAX).sort((a,b)=>a.c.need-b.c.need),bigs=r.filter(o=>o.c.need>MAX);
  const W=$('#map').clientWidth-128||1000,LW=210,slots=[64,120,176,232,288];const used=slots.map(()=>[]);
  let pts='';
  inside.forEach(o=>{const xp=X(o.c.need),px=xp/100*W;let s=-1;for(let k=0;k<slots.length;k++){if(used[k].every(v=>Math.abs(v-px)>LW)){s=k;break}}
    if(s<0)return;const near=used.flat().some(v=>Math.abs(v-px)<14);if(near)return;used[s].push(px);const top=slots[s];const h=380-top;
    pts+='<div class="pt s'+o.c.st+'" style="left:'+xp+'%;height:'+h+'px" data-tip="'+o.m.i+'"><span class="stem" style="height:'+(h-6)+'px"></span><span class="dot" style="top:0"></span><span class="lab" data-open="'+o.m.i+'" style="top:-16px">'+logo(o.m)+'<b>'+o.m.name+'</b><small>'+o.c.need.toFixed(1)+' GB</small></span></div>'});
  let ticks='';for(let g=0;g<=MAX;g+=4){ticks+='<span class="tkm" style="left:'+X(g)+'%"></span><span class="tl" style="left:'+X(g)+'%">'+g+' GB</span>';}
  const bl=bigs.map(o=>'<a data-open="'+o.m.i+'">'+logo(o.m)+'<b>'+o.m.name+' →</b><small>'+Math.round(o.c.need)+'+ GB · too big</small></a>').join('');
  const c=[0,0,0];r.forEach(o=>c[o.c.st]++);
  $('#map').innerHTML='<div class="mx"><div class="zone z1" style="width:'+ux+'%"></div>'+(S.tk?'<div class="zone z2" style="left:'+ux+'%;width:'+(cx-ux)+'%"></div>':'')+
   '<div class="vl v1" style="left:'+ux+'%"><b>Your Mac · ~'+Math.round(usable())+' GB usable</b></div>'+(S.tk?'<div class="vl v2" style="left:'+cx+'%"><b>With Tokkey · target</b></div>':'')+
   '<div class="ax"></div>'+ticks+pts+'<div class="bigs">'+bl+'</div><div class="mtip" id="mtip"></div></div>'+
   '<div class="mfoot"><span class="label">MEMORY THE MODEL NEEDS</span><div class="row"><div><b>'+c[0]+'</b><span>run on your Mac</span></div><div><b>+'+c[1]+'</b><span>open up with Tokkey</span></div><div><b>'+c[2]+'</b><span>too big for now</span></div></div></div>';
  const tip=$('#mtip');
  $('#map').querySelectorAll('.pt').forEach(p=>{const show=()=>{const o=M[+p.dataset.tip],k=calc(o);tip.innerHTML='<div class="r"><b>'+o.name+'</b><button data-dl="'+o.i+'">Download</button></div><p>Your Mac: '+(fmt(o,k.ms)||"won't fit")+'</p><p class="k">With Tokkey: '+(fmt(o,k.ts)||'too big')+'</p><a data-open="'+o.i+'">View model</a>';
      const mx=$('#map .mx').getBoundingClientRect(),pr=p.getBoundingClientRect();let l=pr.left-mx.left+240;if(l+216>mx.width)l=pr.left-mx.left-236;tip.style.left=l+'px';tip.style.top=Math.max(40,pr.top-mx.top)+'px';tip.classList.add('on')};
    p.addEventListener('mouseenter',show);p.addEventListener('focusin',show)});
  $('#map').onmouseleave=()=>tip.classList.remove('on');
  const first=$('#map .pt.s1')||$('#map .pt');if(first)first.dispatchEvent(new Event('mouseenter'));}

// ----- graphite column + speed preview (Figma 3b / A · graphite + pearl)
function placeCol(){const th=document.querySelector('.tbl th.tk'),col=$('#tkcol');if(!th||mob()){return}const t=document.querySelector('.tbl');col.style.left=th.offsetLeft+'px';col.style.width=th.offsetWidth+'px';col.style.height=t.offsetHeight+'px';}
addEventListener('resize',placeCol);
const BW=[42,22,30,14,38,26,18,34,22,40,16,28,36,20,30,24,44,14,26,36,18,40,22,30,16,28,34,24,38,20,30,26,18,36,22,28,16,40];
let spT=null,spOn=null;
function laneHTML(lbl,v,tag,cls,id){return '<div class="ln"><div class="lh2">'+lbl+(tag?'<em class="'+(cls==='t'?'f':'')+'">'+tag+'</em>':'<em></em>')+'<b>'+(v||'—')+'</b></div><div class="box '+cls+'" id="'+id+'"></div></div>';}
function tag(v){return v>=50?'FAST':v>=15?'COMFORTABLE':'SLOW'}
function closeSp(){const p=$('#spop');p.classList.remove('on');clearInterval(spT);if(spOn)spOn.classList.remove('on');spOn=null;if(mob()&&p.parentNode!==$('#tblwrap'))$('#tblwrap').appendChild(p);}
function openSp(btn){const i=+btn.dataset.sp,m=M[i],c=calc(m);if(spOn===btn)return;closeSp();spOn=btn;btn.classList.add('on');const p=$('#spop');
  const u0=u(m);const mv=c.ms,tv=c.ts;
  const off=!S.tk;p.innerHTML='<div class="k">LIVE SPEED · SAME PROMPT</div><div class="nm">'+m.name+'</div>'+laneHTML('Your Mac alone',mv?'~'+mv+' '+u0:null,mv?tag(mv):'','m','spA')+laneHTML(off?'With Tokkey · not attached':'With Tokkey','~'+tv+' '+u0,off?'':tag(tv),off?'t off':'t','spB')+'<div class="ft" id="spF"></div>';
  if(!mv){const a=$('#spA');a.className='box no';a.textContent='Won’t fit on your Mac · '+c.need.toFixed(1)+' GB needed, ~'+Math.round(usable())+' GB free';}
  if(mob()){btn.closest('tr').appendChild(p);}else{const w=$('#tblwrap').getBoundingClientRect(),r=btn.getBoundingClientRect();let l=r.right-w.left+16;if(r.right+16+460>innerWidth-16){const th=document.querySelector('.tbl th.tk');l=th.offsetLeft-476;}p.style.left=l+'px';p.style.top=Math.max(0,r.top-w.top-40)+'px';}
  p.classList.add('on');
  // decode: bars appear at tok/s pace (scaled so 3 s fills the box)
  const tok=m.unit==='tok';const rm=tok?(mv||0):0,rt=tok?tv:1;const maxRate=Math.max(rt,rm||0,1);let t0=performance.now();
  const draw=()=>{const el=(performance.now()-t0)/1000,s=Math.min(el,3);const nA=Math.floor(BW.length*Math.min(1,(rm*s)/(maxRate*3))),nB=Math.floor(BW.length*Math.min(1,(rt*s)/(maxRate*3)));
    if(mv){$('#spA').innerHTML=BW.slice(0,nA).map(w=>'<i style="width:'+w+'px"></i>').join('')+'<span class="c"></span>';}
    $('#spB').innerHTML=BW.slice(0,nB).map(w=>'<i style="width:'+w+'px"></i>').join('')+'<span class="c"></span>';
    $('#spF').textContent=(s.toFixed(1))+' s of output · '+(tok?Math.round((rm||0)*s)+' vs '+Math.round(rt*s)+' tokens':'same prompt, '+(mv?'both running':'only Tokkey can run it'));
    if(el>4.2)t0=performance.now();};
  draw();spT=setInterval(draw,80);}
document.addEventListener('mouseover',e=>{if(mob())return;const b=e.target.closest('.spi[data-sp]');if(b&&!b.disabled)openSp(b);else if(spOn&&!e.target.closest('#spop')&&!e.target.closest('.spi'))closeSp();});
document.addEventListener('click',e=>{const b=e.target.closest('.spi[data-sp]');if(b){e.preventDefault();e.stopPropagation();if(b.disabled)return;if(spOn===b)closeSp();else openSp(b);}},true);
// first time the list is on screen, blink the first icon once
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){const f=document.querySelector('.spi[data-sp]:not([disabled])');if(f)f.classList.add('pulse');io.disconnect();}},{threshold:.4});io.observe($('#tblwrap'));}
// ----- render
function render(){document.body.classList.toggle('no-tk',!S.tk);const thk=document.querySelector('.tbl th.tk');if(thk)thk.textContent=S.tk?'WITH TOKKEY':'WITHOUT TOKKEY';const v=mob()&&S.view==='map'?'simple':S.view;document.body.classList.remove('v-simple','v-advanced','v-map');document.body.classList.add('v-'+v);
  document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===v));
  fill($('#chip2'),CHIPS,a=>'Apple '+a[0]+(mob()?'':' ▾'),S.chip);fill($('#mem2'),MEMS,a=>a+' GB'+(mob()?'':' ▾'),S.mem);$('#tk').setAttribute('aria-checked',S.tk);
  $('#cats').innerHTML=CATS.map(c=>'<button class="pill'+(S.cat===c[0]?' on':'')+'" data-c="'+c[0]+'">'+c[1]+'</button>').join('');
  $('#ptasks').innerHTML=TASKS.map(t=>'<button class="pill'+(S.cat===t[0]?' on':'')+'" data-c="'+t[0]+'">'+(t[0]==='image'?'Image generation':TN(t[0]))+'</button>').join('');
  const capB=cap();$('#sizes').innerHTML=SIZES.map((s,i)=>'<button class="'+(S.sizes.has(i)?'on':(s[1]>=16&&s[1]<36&&S.tk?'tkz':''))+'" data-i="'+i+'">'+s[0]+'</button>').join('');
  $('#capNote').textContent='Your Mac: up to ~'+Math.round(usable()*1.6)+'B · With Tokkey: 35B class';
  $('#fits').innerHTML=STX.map((s,i)=>'<label class="fitr"><input type="checkbox" data-i="'+i+'"'+(S.fits.has(i)?' checked':'')+'><i class="st s'+i+'"></i>'+s+'</label>').join('');
  $('#cfgT').textContent=cfgTxt().replace(' GB',' GB unified memory');
  const n=filtered().length;$('#cfgA').textContent=cfgTxt()+(S.cat!=='all'?' · '+TN(S.cat):'')+' · '+n+' models';
  $('#apply').textContent='Show '+n+' models';
  const nf=S.sizes.size+(2-[0,1].filter(i=>S.fits.has(i)).length)+(S.fits.has(2)?1:0)+(S.quant===8?1:0)+(S.tk?0:1)+(S.cat!=='all'?1:0);
  $('#cbarT').textContent=cfgTxt(true);$('#openF').textContent='Filters'+(nf?' · '+nf:'');
  $('#listView').hidden=v==='map';$('#mapView').hidden=v!=='map';
  renderPicks();renderList();}
// ----- model page (Figma C)
function openMd(i){const m=M[i];const tn=TN(m.tasks[0]);const cc=calc(m);
  const vars=[[m.params+'B · 4-bit',calc(m,4),1],[m.params+'B · 8-bit',calc(m,8),0]];
  const rows=vars.map(v=>'<tr class="'+(v[2]?'r':'')+'"><td><i class="st s'+v[1].st+'"></i>'+v[0]+(v[2]?'<span class="rec">Recommended</span>':'')+'</td><td class="m">'+v[1].need.toFixed(1)+' GB</td><td class="y">'+(fmt(m,v[1].ms)||"Won't fit")+'</td><td class="k">'+(fmt(m,v[1].ts)||'Too big')+'</td><td><button class="btn sm'+(v[2]?'':' ghost')+'" data-dl="'+m.i+'">Download</button></td></tr>').join('');
  const sim=M.filter(z=>z!==m&&z.tasks.some(t=>m.tasks.includes(t))).slice(0,3).map(z=>z.name).join(' · ');
  const sp=v=>v?'<b>~'+v+'</b><small>'+u(m)+'</small>':'<b style="font-size:24px">'+"Won't fit"+'</b>';
  $('#mdIn').innerHTML='<button class="mp-close md-close" aria-label="Close">✕</button><nav class="mp-crumb"><button class="md-close">Models</button>/<button class="md-close">'+tn+'</button><span class="tail">/ '+m.name+'</span></nav>'+
  '<div class="mp-grid"><div class="mp-a"><div class="mp-name">'+logo(m)+'<div><h2 id="mdName">'+m.name+'</h2><p>by '+ORG[m.org]+' · '+m.lic+'</p></div></div><div class="mp-tags">'+[tn].concat(m.tags).concat(m.ctx!=='—'?[m.ctx+' context']:[]).map(t=>'<span>'+t+'</span>').join('')+'</div><p class="mp-desc">'+m.blurb+'</p></div>'+
  '<div class="mp-side" style="grid-row:span 2"><div class="fitc"><div class="cf"><i class="st s0" style="margin:0"></i>'+cfgTxt()+'</div><div class="two"><div class="a"><p>Your Mac alone</p>'+sp(cc.ms)+'</div><div><p>With Tokkey</p>'+(cc.ts?'<b>~'+cc.ts+'</b><small>'+u(m)+'</small>':'<b style="font-size:24px">Too big</b>')+'</div></div><button class="btn" data-dl="'+m.i+'">Download for my Mac · '+cc.need.toFixed(1)+' GB</button><p class="op">Opens in the Tokkey app</p></div>'+
  '<dl class="kv"><dt>Parameters</dt><dd>'+m.params+'B</dd><dt>Context</dt><dd>'+(m.ctx==='—'?'—':m.ctx+' tokens')+'</dd><dt>License</dt><dd>'+m.lic+'</dd><dt>Source</dt><dd>Hugging Face ↗</dd><dt>Runs with</dt><dd>Tokkey app</dd><dt>Updated</dt><dd>Date</dd></dl><p class="sim">Similar models: '+sim+'</p></div>'+
  '<div class="mp-b"><h3>Pick a size</h3><table class="vt"><thead><tr><th>VARIANT</th><th>MEMORY</th><th>YOUR MAC</th><th>WITH TOKKEY</th><th></th></tr></thead><tbody>'+rows+'</tbody></table><div class="cmd"><span>$ tokkey run '+m.id+'</span><button>Copy</button></div><p class="ph" style="margin-top:12px">PLACEHOLDER DATA · command syntax not final</p></div></div>';
  const d=$("#md");d.showModal();d.scrollTop=0;document.activeElement&&document.activeElement.blur();d.querySelectorAll('.md-close').forEach(b=>b.onclick=()=>d.close());d.querySelector('.cmd button').onclick=e=>{navigator.clipboard&&navigator.clipboard.writeText('tokkey run '+m.id);e.target.textContent='Copied'};}
document.addEventListener('click',e=>{const dl=e.target.closest('[data-dl]');if(dl){e.preventDefault();e.stopPropagation();if(dl.dataset.busy)return;dl.dataset.busy=1;const t=dl.textContent;dl.textContent=t==='Notify me'?'We’ll email you':'Opening…';setTimeout(()=>{dl.textContent=t;delete dl.dataset.busy},1400);return;}const o=e.target.closest('[data-open]');if(o){e.preventDefault();openMd(+o.dataset.open);}});
$('#tA').innerHTML=Array.from({length:mob()?30:32},(_,i)=>'<i class="'+(i<(mob()?4:6)?'p':'')+'"></i>').join('');
$('#tB').innerHTML=Array.from({length:16},(_,i)=>'<i class="'+(i<6?'p':i<10?'':'e')+'"></i>').join('');
render();let wm=mob();addEventListener('resize',()=>{if(mob()!==wm){wm=mob();if(!wm)closeF();render();}else if(S.view==='map')renderList();});
})();
