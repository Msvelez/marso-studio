(function(){
  var dialog = null;
  var leaveOnClose = false;
  var copy = {
    es:{kicker:'Estación en mantenimiento',coming:'viene en camino.',text:'Estamos preparando las piezas de esta sección. Muy pronto volverá a abrir sus puertas.',button:'Seguir explorando',alert:' está en mantenimiento. ¡Vuelve pronto!'},
    en:{kicker:'Station under maintenance',coming:'is on its way.',text:'We\'re preparing the pieces for this section. It will open its doors again very soon.',button:'Keep exploring',alert:' is under maintenance. Come back soon!'}
  };
  var names = {'Diseño Digital':'Digital Design','Contenido + Motion':'Content + Motion'};

  function language(){return document.documentElement.lang === 'en' ? 'en' : 'es';}

  function build(){
    dialog = document.createElement('dialog');
    dialog.className = 'soon-dialog';
    dialog.setAttribute('aria-labelledby','soon-title');
    dialog.setAttribute('data-i18n-skip','');
    dialog.innerHTML = '<span class="soon-orbit" aria-hidden="true"><i></i></span><p class="eyebrow soon-kicker"></p><h2 id="soon-title"></h2><p class="soon-text"></p><button type="button" class="btn btn-solid soon-close"><span class="soon-button"></span> <span aria-hidden="true">→</span></button>';
    document.body.appendChild(dialog);
    dialog.querySelector('.soon-close').addEventListener('click',function(){dialog.close();});
    dialog.addEventListener('click',function(event){if (event.target === dialog){dialog.close();}});
    dialog.addEventListener('close',function(){if (leaveOnClose){window.location.href = 'index.html';}});
  }

  function fill(name){
    var lang = language();
    var text = copy[lang];
    var label = lang === 'en' ? (names[name] || name) : name;
    dialog.querySelector('.soon-kicker').textContent = text.kicker;
    var title = dialog.querySelector('#soon-title');
    title.textContent = label + ' ';
    var em = document.createElement('em');
    em.textContent = text.coming;
    title.appendChild(em);
    dialog.querySelector('.soon-text').textContent = text.text;
    dialog.querySelector('.soon-button').textContent = text.button;
  }

  var currentName = '';
  function open(name){
    if (!dialog){build();}
    currentName = name;
    fill(name);
    if (typeof dialog.showModal === 'function'){dialog.showModal();} else {window.alert(name + copy[language()].alert);}
  }

  document.addEventListener('click',function(event){
    var link = event.target.closest && event.target.closest('[data-soon]');
    if (!link){return;}
    event.preventDefault();
    open(link.getAttribute('data-soon'));
  });
  document.addEventListener('marso:lang',function(){if (dialog && currentName){fill(currentName);}});

  var pageName = document.body.getAttribute('data-soon-page');
  if (pageName){leaveOnClose = true;open(pageName);}
})();
