(function(){
  var dialog = null;
  var leaveOnClose = false;

  function build(){
    dialog = document.createElement('dialog');
    dialog.className = 'soon-dialog';
    dialog.setAttribute('aria-labelledby','soon-title');
    dialog.innerHTML = '<span class="soon-orbit" aria-hidden="true"><i></i></span><p class="eyebrow">Estación en mantenimiento</p><h2 id="soon-title"></h2><p class="soon-text">Estamos preparando las piezas de esta sección. Muy pronto volverá a abrir sus puertas.</p><button type="button" class="btn btn-solid soon-close">Seguir explorando <span aria-hidden="true">→</span></button>';
    document.body.appendChild(dialog);
    dialog.querySelector('.soon-close').addEventListener('click',function(){dialog.close();});
    dialog.addEventListener('click',function(event){if (event.target === dialog){dialog.close();}});
    dialog.addEventListener('close',function(){if (leaveOnClose){window.location.href = 'index.html';}});
  }

  function open(name){
    if (!dialog){build();}
    var title = dialog.querySelector('#soon-title');
    title.textContent = name + ' ';
    var em = document.createElement('em');
    em.textContent = 'viene en camino.';
    title.appendChild(em);
    if (typeof dialog.showModal === 'function'){dialog.showModal();} else {window.alert(name + ' está en mantenimiento. ¡Vuelve pronto!');}
  }

  document.addEventListener('click',function(event){
    var link = event.target.closest && event.target.closest('[data-soon]');
    if (!link){return;}
    event.preventDefault();
    open(link.getAttribute('data-soon'));
  });

  var pageName = document.body.getAttribute('data-soon-page');
  if (pageName){leaveOnClose = true;open(pageName);}
})();
