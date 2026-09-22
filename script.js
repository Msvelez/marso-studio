(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- starfield ---------- */
  var canvas = document.getElementById('stars');
  var ctx = canvas.getContext('2d');
  var stars = [];
  var W, H, DPR;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = document.documentElement.scrollHeight;
    canvas.width = W * DPR; canvas.height = Math.min(H, window.innerHeight * 2.2) * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = (canvas.height / DPR) + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    seedStars();
  }
  function seedStars(){
    var count = Math.floor((W * (canvas.height/DPR)) / 5200);
    stars = [];
    for (var i=0;i<count;i++){
      stars.push({
        x: Math.random()*W,
        y: Math.random()*(canvas.height/DPR),
        r: Math.random()*1.3 + 0.3,
        phase: Math.random()*Math.PI*2,
        speed: Math.random()*0.6 + 0.25,
        gold: Math.random() < 0.12
      });
    }
  }

  var parX = 0, parY = 0;
  window.addEventListener('mousemove', function(e){
    parX = (e.clientX / window.innerWidth - 0.5) * 14;
    parY = (e.clientY / window.innerHeight - 0.5) * 14;
  }, {passive:true});

  var t = 0;
  function draw(){
    ctx.clearRect(0,0,W,canvas.height/DPR);
    for (var i=0;i<stars.length;i++){
      var s = stars[i];
      var tw = reduceMotion ? 0.75 : (0.4 + 0.6 * Math.abs(Math.sin(t*s.speed + s.phase)));
      ctx.globalAlpha = tw;
      ctx.fillStyle = s.gold ? '#efc820' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x + parX*0.2, s.y + parY*0.2, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion){ t += 0.02; requestAnimationFrame(draw); }
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
  if (reduceMotion) draw();

  /* ---------- scroll progress trail ---------- */
  var fill = document.getElementById('trailFill');
  var head = document.getElementById('trailHead');
  function onScroll(){
    var doc = document.documentElement;
    var pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) * 100;
    pct = Math.max(0, Math.min(100, pct));
    fill.style.height = pct + '%';
    head.style.top = pct + '%';
  }
  document.addEventListener('scroll', function(){ requestAnimationFrame(onScroll); }, {passive:true});
  onScroll();

  /* ---------- origen: the story path draws in as you scroll, then a flash ignites the hero ---------- */
  var storyPath = document.getElementById('storyPath');
  var pathWrap = document.querySelector('.origen-story');
  var heroSection = document.getElementById('hero');
  var flashOverlay = document.getElementById('flashOverlay');
  var originLines = document.querySelectorAll('.origen-line');
  var pathLen = storyPath ? storyPath.getTotalLength() : 0;

  function progressFor(el){
    var r = el.getBoundingClientRect();
    var total = r.height + window.innerHeight;
    var p = (window.innerHeight - r.top) / total;
    return Math.max(0, Math.min(1, p));
  }

  if (reduceMotion){
    if (storyPath){ storyPath.style.strokeDasharray = 'none'; storyPath.style.strokeDashoffset = '0'; }
    originLines.forEach(function(el){ el.style.opacity = '1'; });
  } else {
    if (storyPath) storyPath.style.strokeDasharray = pathLen;
    function updateOrigen(){
      if (storyPath && pathWrap){
        storyPath.style.strokeDashoffset = pathLen * (1 - progressFor(pathWrap));
      }
      if (flashOverlay && heroSection){
        var heroTop = heroSection.getBoundingClientRect().top;
        var range = window.innerHeight * 0.7;
        var dist = Math.abs(heroTop - window.innerHeight * 0.5);
        var flash = Math.max(0, 1 - dist / range);
        flashOverlay.style.opacity = flash.toFixed(3);
      }
      var lineThreshold = window.innerHeight * 0.22;
      originLines.forEach(function(el){
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var dist = Math.abs(center - window.innerHeight / 2);
        var v = Math.max(0, 1 - dist / lineThreshold);
        el.style.opacity = v.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - v) * 18).toFixed(1) + 'px)';
      });
    }
    document.addEventListener('scroll', function(){ requestAnimationFrame(updateOrigen); }, {passive:true});
    updateOrigen();
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .card');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:0.18});
  revealEls.forEach(function(el){ io.observe(el); });

  /* ---------- card tilt ---------- */
  document.querySelectorAll('[data-tilt]').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var mx = ((e.clientX - r.left) / r.width) * 100;
      var my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
      if (!reduceMotion){
        var rx = ((my/100) - 0.5) * -6;
        var ry = ((mx/100) - 0.5) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      }
    });
    card.addEventListener('mouseleave', function(){ card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; });
  });

  /* ---------- click spark burst ---------- */
  document.addEventListener('click', function(e){
    if (reduceMotion) return;
    if (e.target.closest('a,button')) return;
    var n = 6;
    for (var i=0;i<n;i++){
      var el = document.createElement('div');
      el.className = 'spark-particle';
      var size = 8 + Math.random()*10;
      el.style.width = size + 'px'; el.style.height = size + 'px';
      el.style.left = (e.clientX - size/2) + 'px';
      el.style.top = (e.clientY - size/2) + 'px';
      var angle = (Math.PI*2/n) * i + Math.random()*0.5;
      var dist = 40 + Math.random()*50;
      el.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle)*dist + 'px');
      el.innerHTML = '<svg viewBox="-72 -72 144 144"><use href="#spark" fill="' + (Math.random()<0.5 ? '#efc820' : '#ffffff') + '"/></svg>';
      document.body.appendChild(el);
      el.addEventListener('animationend', function(){ this.remove(); });
    }
  });
})();
