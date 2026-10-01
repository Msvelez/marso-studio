/* Marso Studio extras: page flash transition, comet cursor, optional sound, easter egg, local time, project filters.
   Loaded on every page (before i18n.js so the elements it creates get translated). Each feature checks the DOM it needs. */
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var SPARK = '<svg viewBox="-72 -72 144 144" aria-hidden="true"><use href="#spark" fill="currentColor"/></svg>';
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'es'; }

  /* ---------- 1. page flash: the spark fills the screen when leaving, and fades out on arrival ---------- */
  var flash = document.createElement('div');
  flash.id = 'pageFlash';
  flash.setAttribute('aria-hidden', 'true');
  flash.innerHTML = SPARK;
  document.body.appendChild(flash);

  var arriving = false;
  try { arriving = sessionStorage.getItem('marso-flash') === '1'; sessionStorage.removeItem('marso-flash'); } catch (err) {}
  if (arriving && !reduceMotion){
    flash.classList.add('arrive');
    flash.addEventListener('animationend', function(){ flash.classList.remove('arrive'); });
  }
  window.addEventListener('pageshow', function(e){ if (e.persisted) flash.classList.remove('leave'); });

  document.addEventListener('click', function(e){
    if (reduceMotion || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-soon')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    try { sessionStorage.setItem('marso-flash', '1'); } catch (err) {}
    flash.classList.add('leave');
    setTimeout(function(){ location.href = url.href; }, 600);
    setTimeout(function(){ flash.classList.remove('leave'); }, 2500);
  });

  /* ---------- 2. comet cursor ---------- */
  if (finePointer && !reduceMotion){
    var cc = document.createElement('canvas');
    cc.id = 'cometCursor';
    cc.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cc);
    var cx = cc.getContext('2d'), cw = 0, ch = 0, trail = [], cometRunning = false;
    function cometResize(){
      var d = Math.min(window.devicePixelRatio || 1, 2);
      cw = window.innerWidth; ch = window.innerHeight;
      cc.width = cw * d; cc.height = ch * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    }
    cometResize();
    window.addEventListener('resize', cometResize);
    window.addEventListener('mousemove', function(e){
      trail.push({x: e.clientX, y: e.clientY, life: 1});
      if (trail.length > 28) trail.shift();
      if (!cometRunning){ cometRunning = true; requestAnimationFrame(cometDraw); }
    }, {passive: true});
    function cometDraw(){
      cx.clearRect(0, 0, cw, ch);
      for (var i = 1; i < trail.length; i++){
        var p = trail[i], q = trail[i - 1];
        cx.strokeStyle = 'rgba(239,200,32,' + (p.life * 0.55).toFixed(3) + ')';
        cx.lineWidth = 0.5 + p.life * 3;
        cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(q.x, q.y); cx.lineTo(p.x, p.y); cx.stroke();
      }
      trail.forEach(function(p){ p.life *= 0.9; });
      trail = trail.filter(function(p){ return p.life > 0.04; });
      if (trail.length){
        var h = trail[trail.length - 1];
        cx.fillStyle = 'rgba(255,255,255,' + h.life.toFixed(2) + ')';
        cx.shadowColor = '#efc820'; cx.shadowBlur = 10;
        cx.beginPath(); cx.arc(h.x, h.y, 2.2, 0, Math.PI * 2); cx.fill();
        cx.shadowBlur = 0;
        requestAnimationFrame(cometDraw);
      } else { cometRunning = false; }
    }
  }

  /* ---------- 3. optional sound (off by default; generated with Web Audio, no audio files) ---------- */
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx){
    var labels = {es: {on: 'Silenciar sonido', off: 'Activar sonido'}, en: {on: 'Mute sound', off: 'Turn sound on'}};
    var btn = document.createElement('button');
    btn.id = 'soundToggle';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('data-i18n-skip', '');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/></svg>';
    document.body.appendChild(btn);
    var actx = null, master = null, soundOn = false, hum = null;
    function paintBtn(){
      btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      btn.setAttribute('aria-label', labels[lang()][soundOn ? 'on' : 'off']);
      btn.title = labels[lang()][soundOn ? 'on' : 'off'];
    }
    paintBtn();
    document.addEventListener('marso:lang', paintBtn);

    function startHum(){
      var lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
      var g = actx.createGain(); g.gain.value = 0;
      [55, 82.5, 110.4].forEach(function(f){
        var o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(lp); o.start();
      });
      lp.connect(g); g.connect(master);
      g.gain.linearRampToValueAtTime(0.05, actx.currentTime + 1.5);
      hum = g;
    }
    var scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    function ting(freq, vol){
      if (!soundOn || !actx) return;
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq || scale[Math.floor(Math.random() * scale.length)];
      var t = actx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.07, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.55);
    }
    btn.addEventListener('click', function(){
      if (!actx){
        actx = new AudioCtx();
        master = actx.createGain(); master.gain.value = 1; master.connect(actx.destination);
        startHum();
      }
      soundOn = !soundOn;
      if (soundOn){ actx.resume(); hum.gain.cancelScheduledValues(actx.currentTime); hum.gain.linearRampToValueAtTime(0.05, actx.currentTime + 0.8); ting(1046.5, 0.08); }
      else { hum.gain.cancelScheduledValues(actx.currentTime); hum.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4); }
      paintBtn();
    });
    document.addEventListener('mouseover', function(e){
      var t = e.target.closest && e.target.closest('.area-map-item, #scrollTrail .stop, .area-territory, nav a');
      if (t && !t.contains(e.relatedTarget)) ting();
    });
    document.addEventListener('click', function(e){
      if (e.target.closest && e.target.closest('a, button:not(#soundToggle)')) ting(1318.5, 0.05);
    });
  }

  /* ---------- 4. easter egg: a rain of comets (Konami code, or 5 quick clicks on the logo on the home) ---------- */
  function cometRain(){
    if (reduceMotion || document.getElementById('cometRain')) return;
    var c = document.createElement('canvas');
    c.id = 'cometRain'; c.setAttribute('aria-hidden', 'true');
    var d = Math.min(window.devicePixelRatio || 1, 2), w = window.innerWidth, h = window.innerHeight;
    c.width = w * d; c.height = h * d;
    document.body.appendChild(c);
    var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    var comets = [];
    for (var i = 0; i < 46; i++){
      comets.push({x: Math.random() * w * 1.3, y: -Math.random() * h * 0.8, v: 7 + Math.random() * 9, len: 60 + Math.random() * 120, gold: Math.random() < 0.6});
    }
    var start = Date.now();
    (function frame(){
      var t = Date.now() - start;
      g.clearRect(0, 0, w, h);
      comets.forEach(function(m){
        m.x -= m.v * 0.6; m.y += m.v;
        var tx = m.x + m.len * 0.6, ty = m.y - m.len;
        var grad = g.createLinearGradient(m.x, m.y, tx, ty);
        grad.addColorStop(0, m.gold ? 'rgba(239,200,32,0.95)' : 'rgba(255,255,255,0.95)');
        grad.addColorStop(1, 'rgba(255,122,47,0)');
        g.strokeStyle = grad; g.lineWidth = 2.2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(tx, ty); g.stroke();
      });
      if (t < 3600){ requestAnimationFrame(frame); } else { c.remove(); }
    })();
  }
  var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], kPos = 0;
  document.addEventListener('keydown', function(e){
    kPos = (e.keyCode === konami[kPos]) ? kPos + 1 : (e.keyCode === konami[0] ? 1 : 0);
    if (kPos === konami.length){ kPos = 0; cometRain(); }
  });
  var logo = document.querySelector('header div.brand');
  if (logo){
    var clicks = [];
    logo.addEventListener('click', function(){
      var now = Date.now();
      clicks = clicks.filter(function(t){ return now - t < 2500; });
      clicks.push(now);
      if (clicks.length >= 5){ clicks = []; cometRain(); }
    });
  }

  /* ---------- 5. local time in the home footer ---------- */
  var timeEl = document.getElementById('localTime');
  if (timeEl){
    var TZ = 'America/Bogota', CITY = 'Bogotá';
    var fmt = new Intl.DateTimeFormat('es-CO', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ});
    function tick(){ timeEl.textContent = CITY + ' · ' + fmt.format(new Date()); }
    tick(); setInterval(tick, 30000);
  }

  /* ---------- 6. project filters by technology (experiencias.html) ---------- */
  var projects = Array.prototype.slice.call(document.querySelectorAll('article.web-project'));
  var firstSection = document.getElementById('plataformas');
  if (projects.length && firstSection){
    var counts = {};
    projects.forEach(function(p){
      var tags = Array.prototype.map.call(p.querySelectorAll('.project-stack li'), function(li){ return li.textContent.trim(); });
      p._tags = tags;
      tags.forEach(function(t){ counts[t] = (counts[t] || 0) + 1; });
    });
    var shared = Object.keys(counts).filter(function(t){ return counts[t] >= 2; });
    if (shared.length){
      var bar = document.createElement('div');
      bar.className = 'project-filter';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filtrar por tecnología');
      var label = document.createElement('span');
      label.className = 'chip-label';
      label.textContent = 'Filtrar por tecnología';
      bar.appendChild(label);
      var chips = ['Todos'].concat(shared).map(function(t, i){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = t;
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        if (i > 0) b.setAttribute('data-i18n-skip', '');
        b.dataset.tag = i === 0 ? '' : t;
        bar.appendChild(b);
        return b;
      });
      firstSection.parentNode.insertBefore(bar, firstSection);
      bar.addEventListener('click', function(e){
        var b = e.target.closest('.chip'); if (!b) return;
        chips.forEach(function(c){ c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        var tag = b.dataset.tag;
        projects.forEach(function(p){ p.hidden = !!tag && p._tags.indexOf(tag) === -1; });
        document.querySelectorAll('section.area-section').forEach(function(s){
          var arts = s.querySelectorAll('article.web-project');
          if (arts.length) s.hidden = Array.prototype.every.call(arts, function(a){ return a.hidden; });
        });
      });
    }
  }
})();
