
/* Hero + closing section · ambient character field — the quiet state from the homepage hero:
   a low-contrast field of characters that drifts slowly; soft rings pass through it on their own and when the pointer moves or clicks. */
(function(){
 [['heroAmb','#dbe9ff',.34,.12,.08],['endAmb','#dbe9ff',.34,.12,.08],['fxAmb','#282c29',.2,.06,.045]].forEach(function(c){
  var cv=document.getElementById(c[0]); if(!cv) return;
  var host=cv.parentNode,cx=cv.getContext('2d'),R=' .·:-=+*',P=[],W=0,H=0,dpr=1,dirty=1,act=0,vis=1,lastClick=0,
      reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;dirty=1}
  size();window.addEventListener('resize',size);
  if('ResizeObserver' in window) new ResizeObserver(size).observe(cv);
  function add(x,y){if(reduce)return;P.push({x:x,y:y,t:performance.now()/1000});if(P.length>3)P.shift();act=1}
  function ring(x,y,t){var s=0;for(var i=0;i<P.length;i++){var e=P[i],a=t-e.t;if(a<0||a>6)continue;var d=Math.hypot(x-e.x,(y-e.y)*1.15),g=(d-a*70)/48;s+=Math.exp(-g*g)*Math.exp(-a/2.4)*(.55+.45*Math.cos(d*.045))}return Math.min(1,s)}
  function base(x,y,t){var a=Math.sin(x*.0062+1.3+t*.11)*Math.sin(y*.0081+.4-t*.07),b=Math.sin(x*.0027-y*.0041+2.1+t*.09),v=Math.max(0,.55*a+.45*b);return v*v}
  function draw(now){
    var t=now/1000,small=W<700,cw=small?9:11,ch=small?14:17;
    cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
    cx.font=(small?10:12)+'px "Geist Mono",ui-monospace,monospace';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=c[1];
    for(var y=ch/2;y<H;y+=ch)for(var x=cw/2;x<W;x+=cw){
      var v=base(x,y,reduce?0:t)*.32+ring(x,y,t)*.9,ix=Math.min(7,Math.floor(v*8));
      if(ix<1)continue;
      cx.globalAlpha=Math.min(c[2],c[3]+ix*c[4]);cx.fillText(R.charAt(ix),x,y);
    }
    cx.globalAlpha=1;
  }
  function at(e){var r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
  host.addEventListener('pointerdown',function(e){var n=performance.now();if(n-lastClick<700)return;lastClick=n;var p=at(e);add(p[0],p[1])},{passive:true});
  var lm=0,lx=-999,ly=-999;
  host.addEventListener('pointermove',function(e){var n=performance.now(),p=at(e);if(n-lm<420||Math.hypot(p[0]-lx,p[1]-ly)<90)return;lm=n;lx=p[0];ly=p[1];add(lx,ly)},{passive:true});
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){vis=es[0].isIntersecting?1:0;if(vis)dirty=1},{threshold:0}).observe(host);
  setTimeout(function(){add(W*.62,H*.5)},1500);
  /* gentle motion: the field drifts slowly and a soft ring surfaces every few seconds */
  if(!reduce) setInterval(function(){if(vis&&!document.hidden)add(W*(.15+.7*Math.random()),H*(.2+.6*Math.random()))},4200);
  var fr=0;(function loop(now){requestAnimationFrame(loop);if(!vis)return;if(reduce){if(dirty){draw(now);dirty=0}return}if(!(fr++%3)||dirty){draw(now);dirty=0}})(performance.now());
 });
})();
