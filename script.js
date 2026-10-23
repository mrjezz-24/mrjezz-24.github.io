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
