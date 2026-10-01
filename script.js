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
  var stops = document.querySelectorAll('#scrollTrail .stop');
  function placeStops(){
    var doc = document.scrollingElement || document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    stops.forEach(function(a){
      var sec = document.getElementById(a.dataset.target);
      if (!sec || max <= 0) return;
      var pct = (sec.getBoundingClientRect().top + doc.scrollTop) / max * 100;
      a.style.top = Math.max(0, Math.min(100, pct)) + '%';
    });
  }
  window.addEventListener('resize', placeStops);
  window.addEventListener('load', placeStops);
  placeStops();
  var fill = document.getElementById('trailFill');
  var head = document.getElementById('trailHead');
  function onScroll(){
    // scrollingElement + innerHeight: index.html has no doctype (quirks mode), so documentElement.clientHeight is the full page height
    var doc = document.scrollingElement || document.documentElement;
    var pct = doc.scrollTop / (doc.scrollHeight - window.innerHeight) * 100;
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

  /* ---------- active section in header nav ---------- */
  var navLinks = document.querySelectorAll('nav.links a[href^="#"]');
  var navIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      navLinks.forEach(function(a){
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current','true');
        else a.removeAttribute('aria-current');
      });
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main > section[id]').forEach(function(sec){ navIO.observe(sec); });

  /* ---------- loader: the flash counts up, then grows until it fills the screen ---------- */
  var loader = document.getElementById('loader');
  var loaderPct = document.getElementById('loaderPct');
  if (loader && !reduceMotion){
    var heroVideo = document.querySelector('.hero video');
    var shown = 0, finished = false, startT = Date.now();
    var MIN_MS = 1400, MAX_MS = 4000;
    document.body.style.overflow = 'hidden';
    function finish(){
      if (finished) return; finished = true;
      loaderPct.textContent = '100%';
      loader.classList.add('ignite');
      setTimeout(function(){
        loader.classList.add('done');
        document.body.style.overflow = '';
        setTimeout(placeStops, 100);
      }, 750);
    }
    (function tick(){
      if (finished) return;
      var elapsed = Date.now() - startT;
      var ready = heroVideo ? heroVideo.readyState : 4;
      var base = Math.min(100, elapsed / MIN_MS * 100);
      var target = ready >= 3 ? base : Math.min(base, 85);
      shown += (target - shown) * 0.2;
      loaderPct.textContent = Math.round(shown) + '%';
      if ((ready >= 3 && elapsed > MIN_MS) || elapsed > MAX_MS) return finish();
      requestAnimationFrame(tick);
    })();
  } else if (loader){ loader.remove(); }

  /* ---------- area map: each area is a constellation; hover draws its lines in ---------- */
  var areaMap = document.querySelector('.area-map');
  var SHAPES = {
    branding:{at:[.15,.30],p:[[-.9,-.7],[-.2,-1],[.7,-.55],[.95,.15],[.3,.85],[-.6,.6],[-.1,-.1]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,1],[6,3],[6,5]]},
    digital:{at:[.33,.70],p:[[-1,-.6],[0,-.8],[1,-.6],[1,.5],[0,.8],[-1,.5],[0,0]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,1],[6,4]]},
    motion:{at:[.55,.30],p:[[-1,.3],[-.55,-.5],[-.1,.4],[.35,-.45],[.8,.35],[1,-.1]],e:[[0,1],[1,2],[2,3],[3,4],[4,5]]},
    '3d':{at:[.75,.70],p:[[0,-1],[.9,-.5],[.9,.5],[0,1],[-.9,.5],[-.9,-.5],[0,0]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,1],[6,5],[6,3]]},
    web:{at:[.90,.30],p:[[-.4,-.9],[-1,0],[-.4,.9],[.4,.9],[1,0],[.4,-.9],[0,.1]],e:[[0,1],[1,2],[3,4],[4,5],[0,5],[2,3],[6,1],[6,4]]}
  };
  if (areaMap){
    var mapMQ = window.matchMedia('(min-width:861px)');
    var mapCanvas = null, mapCtx = null, mapItems = [], mapW = 0, mapH = 0, mapDPR = 1;
    var mapVisible = false, mapRunning = false, mapT = 0;

    function mapDraw(){
      mapCtx.clearRect(0,0,mapW,mapH);
      var r = Math.min(80, mapW * 0.07);
      mapItems.forEach(function(it){
        var sh = it.shape;
        it.h += (it.target - it.h) * (reduceMotion ? 1 : 0.08);
        if (Math.abs(it.target - it.h) < 0.002) it.h = it.target;
        var h = it.h, cx = sh.at[0] * mapW, cy = sh.at[1] * mapH;
        var pts = sh.p.map(function(q){ return [cx + q[0]*r, cy + q[1]*r]; });
        mapCtx.lineWidth = 1;
        sh.e.forEach(function(ed){
          mapCtx.strokeStyle = 'rgba(184,179,164,0.22)';
          mapCtx.beginPath(); mapCtx.moveTo(pts[ed[0]][0], pts[ed[0]][1]); mapCtx.lineTo(pts[ed[1]][0], pts[ed[1]][1]); mapCtx.stroke();
        });
        sh.e.forEach(function(ed, i){
          var k = Math.max(0, Math.min(1, h * sh.e.length - i));
          if (k <= 0) return;
          var a = pts[ed[0]], b = pts[ed[1]];
          mapCtx.strokeStyle = 'rgba(239,200,32,' + (0.5 + 0.5 * k) + ')';
          mapCtx.beginPath(); mapCtx.moveTo(a[0], a[1]); mapCtx.lineTo(a[0] + (b[0]-a[0])*k, a[1] + (b[1]-a[1])*k); mapCtx.stroke();
        });
        pts.forEach(function(q, i){
          var tw = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.abs(Math.sin(mapT * 0.9 + i * 1.7 + cx));
          mapCtx.globalAlpha = tw + h * (1 - tw);
          mapCtx.shadowColor = '#efc820'; mapCtx.shadowBlur = 14 * h;
          mapCtx.fillStyle = h > 0.05 ? '#efc820' : '#ffffff';
          mapCtx.beginPath(); mapCtx.arc(q[0], q[1], 1.6 + 2.4 * h, 0, Math.PI * 2); mapCtx.fill();
        });
        mapCtx.shadowBlur = 0; mapCtx.globalAlpha = 1;
      });
      mapT += 0.02;
    }
    function mapLoop(){
      if (!mapVisible || !mapCtx){ mapRunning = false; return; }
      mapDraw();
      if (reduceMotion && mapItems.every(function(it){ return it.h === it.target; })){ mapRunning = false; return; }
      requestAnimationFrame(mapLoop);
    }
    function mapKick(){ if (!mapRunning && mapCtx){ mapRunning = true; requestAnimationFrame(mapLoop); } }
    function mapSize(){
      mapDPR = Math.min(window.devicePixelRatio || 1, 2);
      mapW = areaMap.clientWidth; mapH = areaMap.clientHeight;
      mapCanvas.width = mapW * mapDPR; mapCanvas.height = mapH * mapDPR;
      mapCtx.setTransform(mapDPR,0,0,mapDPR,0,0);
      mapKick();
    }
    function mapEnable(){
      if (mapCanvas) return;
      areaMap.classList.add('is-constellation');
      mapCanvas = document.createElement('canvas');
      mapCanvas.className = 'constellation-canvas';
      mapCanvas.setAttribute('aria-hidden','true');
      areaMap.insertBefore(mapCanvas, areaMap.firstChild);
      mapCtx = mapCanvas.getContext('2d');
      mapItems = [];
      Object.keys(SHAPES).forEach(function(key){
        var el = areaMap.querySelector('.area-map-' + key);
        if (!el) return;
        el.style.setProperty('--cx', (SHAPES[key].at[0] * 100) + '%');
        el.style.setProperty('--cy', (SHAPES[key].at[1] * 100) + '%');
        var it = {el: el, shape: SHAPES[key], h: 0, target: 0};
        function on(){ it.target = 1; mapKick(); }
        function off(){ it.target = 0; mapKick(); }
        el.addEventListener('mouseenter', on); el.addEventListener('focus', on);
        el.addEventListener('mouseleave', off); el.addEventListener('blur', off);
        mapItems.push(it);
      });
      mapSize();
      setTimeout(placeStops, 50);
    }
    function mapDisable(){
      if (!mapCanvas) return;
      areaMap.classList.remove('is-constellation');
      mapCanvas.remove(); mapCanvas = null; mapCtx = null;
      mapItems.forEach(function(it){ it.el.style.removeProperty('--cx'); it.el.style.removeProperty('--cy'); });
      mapItems = [];
      setTimeout(placeStops, 50);
    }
    function mapSync(){ if (mapMQ.matches) mapEnable(); else mapDisable(); }
    mapSync();
    (mapMQ.addEventListener ? mapMQ.addEventListener('change', mapSync) : mapMQ.addListener(mapSync));
    window.addEventListener('resize', function(){ if (mapCanvas) mapSize(); });
    new IntersectionObserver(function(entries){
      mapVisible = entries[0].isIntersecting; if (mapVisible) mapKick();
    }).observe(areaMap);
  }

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
