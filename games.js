/* Juegos jugables en el portafolio: el build web (Godot) solo se descarga al tocar "Jugar". */
(function(){
  document.querySelectorAll('.game-stage[data-game]').forEach(function(stage){
    var button = stage.querySelector('.game-play');
    if (!button) return;
    button.addEventListener('click', function(){
      var frame = document.createElement('iframe');
      frame.src = stage.getAttribute('data-game');
      frame.title = document.documentElement.lang === 'en' ? 'Playable game' : 'Juego jugable';
      frame.setAttribute('allow', 'fullscreen; autoplay; gamepad');
      frame.setAttribute('allowfullscreen', '');
      frame.className = 'game-frame';
      stage.classList.add('is-playing');
      stage.appendChild(frame);
      frame.addEventListener('load', function(){ try { frame.contentWindow.focus(); } catch (e) {} });
      frame.focus();
    }, {once: true});
  });
})();
