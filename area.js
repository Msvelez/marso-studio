(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('stars');
  var context = canvas.getContext('2d');
  var stars = [];
  var width = 0;
  var height = 0;
  var scale = 1;
  var time = 0;

  function seed(){
    var count = Math.floor((width * Math.min(height, window.innerHeight * 2.4)) / 7200);
    stars = [];
    for (var i = 0; i < count; i += 1){
      stars.push({x:Math.random() * width,y:Math.random() * Math.min(height, window.innerHeight * 2.4),r:Math.random() * 1.1 + .25,p:Math.random() * Math.PI * 2,g:Math.random() < .1});
    }
  }
  function resize(){
    scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = document.documentElement.scrollHeight;
    canvas.width = width * scale;
    canvas.height = Math.min(height, window.innerHeight * 2.4) * scale;
    canvas.style.width = width + 'px';
    canvas.style.height = canvas.height / scale + 'px';
    context.setTransform(scale,0,0,scale,0,0);
    seed();
  }
  function draw(){
    var visibleHeight = canvas.height / scale;
    context.clearRect(0,0,width,visibleHeight);
    stars.forEach(function(star){
      context.globalAlpha = reduceMotion ? .55 : .25 + .55 * Math.abs(Math.sin(time * .7 + star.p));
      context.fillStyle = star.g ? '#efc820' : '#ffffff';
      context.beginPath(); context.arc(star.x,star.y,star.r,0,Math.PI * 2); context.fill();
    });
    context.globalAlpha = 1;
    if (!reduceMotion){time += .018;requestAnimationFrame(draw);}
  }
  window.addEventListener('resize',resize); resize(); draw(); if (reduceMotion){draw();}

  var trail = document.querySelector('.area-trail span');
  function updateTrail(){
    var root = document.documentElement;
    var available = root.scrollHeight - root.clientHeight;
    trail.style.height = (available ? root.scrollTop / available * 100 : 0) + '%';
  }
  document.addEventListener('scroll',function(){requestAnimationFrame(updateTrail);},{passive:true}); updateTrail();

  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}});},{threshold:.14});
    revealItems.forEach(function(item){observer.observe(item);});
  } else {revealItems.forEach(function(item){item.classList.add('in');});}

  document.querySelectorAll('[data-tilt]').forEach(function(item){
    item.addEventListener('mousemove',function(event){
      var rect = item.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width * 100;
      var y = (event.clientY - rect.top) / rect.height * 100;
      item.style.setProperty('--mx',x + '%'); item.style.setProperty('--my',y + '%');
      if (!reduceMotion){item.style.transform = 'perspective(900px) rotateX(' + ((y / 100 - .5) * -3) + 'deg) rotateY(' + ((x / 100 - .5) * 3) + 'deg)';}
    });
    item.addEventListener('mouseleave',function(){item.style.transform = '';});
  });

  var trigger = document.querySelector('.area-trigger');
  var experiment = document.querySelector('.area-experiment');
  if (trigger && experiment){trigger.addEventListener('click',function(){var active = experiment.classList.toggle('is-active');trigger.setAttribute('aria-pressed',active);});}
})();
