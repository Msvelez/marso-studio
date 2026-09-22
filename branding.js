(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('stars');
  var context = canvas.getContext('2d');
  var stars = [];
  var width = 0;
  var height = 0;
  var deviceScale = 1;
  var time = 0;

  function seedStars(){
    var count = Math.floor((width * Math.min(height, window.innerHeight * 2.4)) / 6800);
    stars = [];
    for (var index = 0; index < count; index += 1){
      stars.push({
        x: Math.random() * width,
        y: Math.random() * Math.min(height, window.innerHeight * 2.4),
        radius: Math.random() * 1.1 + .25,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < .1
      });
    }
  }

  function resize(){
    deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = document.documentElement.scrollHeight;
    canvas.width = width * deviceScale;
    canvas.height = Math.min(height, window.innerHeight * 2.4) * deviceScale;
    canvas.style.width = width + 'px';
    canvas.style.height = canvas.height / deviceScale + 'px';
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    seedStars();
  }

  function drawStars(){
    var visibleHeight = canvas.height / deviceScale;
    context.clearRect(0, 0, width, visibleHeight);
    stars.forEach(function(star){
      var opacity = reduceMotion ? .55 : .25 + .55 * Math.abs(Math.sin(time * .7 + star.phase));
      context.globalAlpha = opacity;
      context.fillStyle = star.gold ? '#efc820' : '#ffffff';
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    if (!reduceMotion){
      time += .018;
      requestAnimationFrame(drawStars);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  drawStars();
  if (reduceMotion){ drawStars(); }

  var trail = document.querySelector('.brand-trail span');
  function updateTrail(){
    var documentElement = document.documentElement;
    var available = documentElement.scrollHeight - documentElement.clientHeight;
    var progress = available ? documentElement.scrollTop / available : 0;
    trail.style.height = Math.max(0, Math.min(100, progress * 100)) + '%';
  }
  document.addEventListener('scroll', function(){ requestAnimationFrame(updateTrail); }, {passive:true});
  updateTrail();

  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.16});
    revealItems.forEach(function(item){ observer.observe(item); });
  } else {
    revealItems.forEach(function(item){ item.classList.add('in'); });
  }

  var signalButton = document.querySelector('.signal-button');
  var differentSection = document.querySelector('.different');
  if (signalButton && differentSection){
    signalButton.addEventListener('click', function(){
      differentSection.classList.toggle('signal-active');
      signalButton.setAttribute('aria-pressed', differentSection.classList.contains('signal-active'));
    });
  }
})();
