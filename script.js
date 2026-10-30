document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var el=document.getElementById(b.dataset.copy), t=el.textContent;
    function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}
    function fallback(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r)}
    try{navigator.clipboard.writeText(t).then(done,fallback)}catch(e){fallback()}
  });
});
// Lightbox for the design samples; arrows move within the clicked group
(function(){
  var lb=document.getElementById('lightbox'), img=document.getElementById('lb-img'), cap=document.getElementById('lb-cap'), items=[], idx=0;
  if(!lb||!lb.showModal) return;
  function show(i){
    idx=(i+items.length)%items.length;
    var b=items[idx], t=b.querySelector('img');
    img.src=b.dataset.full; img.width=b.dataset.w; img.height=b.dataset.h; img.alt=t.alt; cap.textContent=t.alt;
  }
  document.querySelectorAll('.work-item').forEach(function(b){
    b.addEventListener('click',function(){
      items=[].slice.call(b.closest('.work-group').querySelectorAll('.work-item'));
      show(items.indexOf(b)); lb.showModal();
    });
  });
  lb.querySelector('.lb-close').addEventListener('click',function(){lb.close()});
  lb.querySelector('.lb-prev').addEventListener('click',function(){show(idx-1)});
  lb.querySelector('.lb-next').addEventListener('click',function(){show(idx+1)});
  lb.addEventListener('click',function(e){if(e.target===lb) lb.close()});
  lb.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft') show(idx-1);
    else if(e.key==='ArrowRight') show(idx+1);
  });
  lb.addEventListener('close',function(){img.removeAttribute('src')});
})();
// Replay each .anim section's slide-in every time it comes back into view
(function(){
  var els=document.querySelectorAll('.anim');
  if(!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('play')});return}
  // reset once a section has fully left the screen, replay when 30% of it (or of the screen, for tall sections) is back in view
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) e.target.classList.remove('play');
      else if(e.intersectionRatio>=.3||e.intersectionRect.height>=innerHeight*.3) e.target.classList.add('play');
    });
  },{threshold:[0,.1,.2,.3]});
  els.forEach(function(el){io.observe(el)});
})();
(function(){
  var f=document.getElementById('contact-form');
  if(!f) return;
  var st=document.getElementById('form-status'), btn=f.querySelector('button');
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f._honey.value) return;
    btn.disabled=true; btn.textContent='Sending…'; st.className='form-status'; st.textContent='';
    fetch('https://formsubmit.co/ajax/jezzersonjaym@gmail.com',{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)})
      .then(function(r){return r.json().then(function(d){if(!r.ok||String(d.success)!=='true')throw 0})})
      .then(function(){f.reset();st.className='form-status ok';st.textContent="Thanks, I'll get back to you soon."})
      .catch(function(){st.className='form-status err';st.textContent="Sorry, that didn't send. Please email me at jezzersonjaym@gmail.com."})
      .then(function(){btn.disabled=false;btn.textContent='Send message'});
  });
})();
// Scroll story: map scroll position inside .story to scene progress and scrub each scene's animation
(function(){
  var story=document.getElementById('story');
  if(!story||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var scenes=story.querySelectorAll('.scene'), cards=story.querySelectorAll('.card'), dots=story.querySelectorAll('.story-dots button');
  var N=scenes.length, cur=-1, ticking=false;
  var res=story.querySelectorAll('.res'), rankN=story.querySelector('.rank-n');
  var gauge=story.querySelector('.gauge'), score=story.querySelector('.score'), files=story.querySelectorAll('.file');
  var from=[2.4,1.8,3.1], to=[.18,.14,.24];
  var feed=story.querySelector('.feed'), phone=story.querySelector('.phone'), nPosts=story.querySelector('.n-posts'), nDays=story.querySelector('.n-days');
  var fan=story.querySelector('.fan');
  function clamp(v){return v<0?0:v>1?1:v}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function render(){
    ticking=false;
    var r=story.getBoundingClientRect(), span=story.offsetHeight-innerHeight;
    var p=clamp(-r.top/span), t=p*N;
    story.style.setProperty('--p',p.toFixed(4));
    var active=Math.min(N-1,Math.floor(t));
    scenes.forEach(function(s,i){
      var d=t-i-.5; // -0.5..0.5 while this scene is current
      var vis=Math.abs(d)<.85||(i===0&&d<0)||(i===N-1&&d>0);
      s.classList.toggle('on',vis);
      if(!vis) return;
      var o=i===0&&d<0||i===N-1&&d>0?1:clamp(1-(Math.abs(d)-.35)/.3);
      // zoom-through: incoming scene grows from 0.85, outgoing scene pushes past the camera
      var sc=i===0&&d<0||i===N-1&&d>0?1:d<-.35?1-(-d-.35)*.3:d>.35?1+(d-.35)*.5:1;
      s.style.opacity=o.toFixed(3);
      s.style.transform='scale('+sc.toFixed(4)+')';
    });
    if(active!==cur){
      cur=active;
      cards.forEach(function(c,i){c.classList.toggle('on',i===cur)});
      dots.forEach(function(b,i){if(i===cur)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
    }
    // per-scene local progress 0..1 (eased), finishing a little before the scene ends
    function lp(i){return ease(clamp((t-i-.1)/.6))}
    var a=lp(0); // SEO: your result climbs from #5 to #1, others shift down
    res.forEach(function(el){
      var f=+el.style.getPropertyValue('--from');
      el.style.setProperty('--pos',(f===4?4-4*a:f+a).toFixed(3));
    });
    rankN.textContent='#'+Math.round(5-4*a);
    var b=lp(1); // speed: files shrink, score climbs 38 -> 96
    files.forEach(function(el,i){
      el.style.setProperty('--s',b.toFixed(3));
      var v=from[i]+(to[i]-from[i])*b;
      el.querySelector('.size').textContent=v>=1?v.toFixed(1)+' MB':Math.round(v*1000)+' KB'+(b>.98?' · WebP':'');
    });
    var g=Math.round(38+58*b);
    score.textContent=g; gauge.style.setProperty('--g',g); gauge.classList.toggle('good',g>=90);
    var c=lp(2); // social: feed scrolls, counters climb
    feed.style.setProperty('--f',(c*Math.max(0,feed.scrollHeight-phone.clientHeight+20)).toFixed(1));
    nPosts.textContent=Math.round(c*120); nDays.textContent=Math.round(c*30);
    fan.style.setProperty('--sp',lp(3).toFixed(3)); // design: posters fan out
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  dots.forEach(function(b){
    b.addEventListener('click',function(){
      var span=story.offsetHeight-innerHeight, top=story.getBoundingClientRect().top+scrollY;
      scrollTo({top:top+span*((+b.dataset.go+.65)/N),behavior:'smooth'});
    });
  });
  render();
})();
