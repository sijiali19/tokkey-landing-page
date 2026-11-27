// Docs side nav (desktop) + drawer (mobile). Usage: <aside class="side" data-side="quickstart"></aside>
(function(){
  var NAV=[['Blog',[['blog.html','Latest','latest'],['blog.html#announcements','Announcements','announcements'],['blog.html#changelog','Changelog','changelog'],['blog.html#guides','Guides','guides'],['blog.html#engineering','Engineering','engineering'],['blog.html#benchmarks','Benchmarks','benchmarks'],['blog.html#stories','Stories','stories']]],
    ['Docs',[['devdoc.html','Quickstart','quickstart'],['devdoc.html#install','Install the app','install'],['devdoc.html#plug','Plug in Tokkey','plug'],['models.html','Pick a model','pick'],['devdoc.html#tools','Local API','api'],['devdoc.html#tools','Integrations','int'],['devdoc.html#technology','How it works','technology'],['devdoc.html#help','Troubleshooting','trouble']]],
    ['Help',[['models.html#faqH','FAQ','faq'],['#','Status','status'],['#','Community','community']]]];
  function html(on){return '<button class="search" type="button" aria-label="Search docs">Search docs <kbd>⌘K</kbd></button>'+NAV.map(function(g){return '<h5>'+g[0].toUpperCase()+'</h5>'+g[1].map(function(l){return '<a href="'+l[0]+'"'+(l[2]===on?' class="on" aria-current="page"':'')+'>'+l[1]+'</a>'}).join('')}).join('')+'<div class="qs"><b>New to Tokkey?</b><p>Run your first model in about 5 minutes.</p><a href="devdoc.html">Start the quickstart →</a></div>';}
  var on='';document.querySelectorAll('[data-side]').forEach(function(el){on=el.getAttribute('data-side');el.innerHTML=html(on);el.setAttribute('aria-label','Docs navigation');});
  var d=document.createElement('div');d.className='drawer';d.setAttribute('role','dialog');d.setAttribute('aria-label','Docs menu');
  d.innerHTML='<div class="dh"><b>Docs & blog</b><button aria-label="Close">✕</button></div><nav class="side">'+html(on)+'</nav>';document.body.appendChild(d);
  d.querySelector('.dh button').onclick=function(){d.classList.remove('open')};
  d.addEventListener('click',function(e){if(e.target.closest('a'))d.classList.remove('open')});
  document.querySelectorAll('[data-open-docs]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();d.classList.add('open')})});
  document.querySelectorAll('.code .bar button').forEach(function(b){b.onclick=function(){var t=b.closest('.code').querySelector('pre').innerText.split('\n')[0].replace(/^\$ /,'');navigator.clipboard&&navigator.clipboard.writeText(t);b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}});
})();
