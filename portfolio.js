(function(){
  var digitalPlaceholders = document.querySelectorAll('.digital-placeholder');
  if (digitalPlaceholders.length >= 2){
    var prototypeImages = [
      ['assets-publicidad/billboard/branding/prototipo-figma-1-reflections.png', 'Prototipo de Figma Reflections'],
      ['assets-publicidad/billboard/branding/prototipo-figma-2-asertika.png', 'Prototipo de Figma Asértika']
    ];
    digitalPlaceholders.forEach(function(placeholder, index){
      var image = document.createElement('img');
      image.src = prototypeImages[index][0];
      image.alt = prototypeImages[index][1];
      image.loading = 'lazy';
      placeholder.replaceWith(image);
    });
  }

  var socialTrack = document.querySelector('.campaign-social-track');
  if (socialTrack){
    socialTrack.classList.add('campaign-composition');
  }

  var applications = document.querySelector('.poster-applications');
  if (applications && !applications.querySelector('[data-billboard]')){
    var billboard = document.createElement('img');
    billboard.src = 'assets-publicidad/billboard/billboard.png';
    billboard.alt = 'Aplicación billboard de una campaña';
    billboard.loading = 'lazy';
    billboard.dataset.billboard = 'true';
    var wildposting = applications.querySelector('img[src*="wildposting"]');
    applications.insertBefore(billboard, wildposting ? wildposting.nextSibling : applications.firstChild);
  }

  var identityLogos = document.querySelector('.identity-logos');
  var externalLogos = identityLogos && Array.prototype.slice.call(identityLogos.querySelectorAll('img[src*="logotipo-mg-"]'));
  if (externalLogos && externalLogos.length){
    externalLogos.forEach(function(image){ image.remove(); });
    var mgThree = document.createElement('img');
    mgThree.src = 'assets-publicidad/billboard/branding/logotipo-mg-3.png';
    mgThree.alt = 'Variación gráfica externa del logotipo MG';
    mgThree.loading = 'lazy';
    externalLogos.push(mgThree);
    var externalSection = document.createElement('section');
    externalSection.className = 'portfolio-section external-identity-section';
    externalSection.setAttribute('aria-labelledby', 'external-identity-title');
    externalSection.innerHTML = '<div class="wrap"><div class="portfolio-heading"><p class="eyebrow">Archivo paralelo</p><h2 id="external-identity-title">Otras formas<br>de <em>identidad.</em></h2><p>Una selección de logos desarrollados para otros proyectos, separada del caso de Marso Studio.</p></div><div class="external-identity-grid"></div></div>';
    externalLogos.forEach(function(image){
      var figure = document.createElement('figure');
      figure.className = 'external-identity-piece';
      figure.appendChild(image);
      var caption = document.createElement('figcaption');
      caption.textContent = 'Logotipo / proyecto externo';
      figure.appendChild(caption);
      externalSection.querySelector('.external-identity-grid').appendChild(figure);
    });
    document.querySelector('.portfolio-process').before(externalSection);
  }

  var pieces = document.querySelectorAll('.portfolio-piece img, .wall-poster img, .communication-email img, .communication-wide img, .communication-socials img, .digital-window img, .identity-logo img, .identity-banner img, .identity-signature img, .identity-logos img');
  var projectFacts = [
    {selector:'.campaign-case .portfolio-heading', title:'CAMPAÑA / FILM', type:'Campaña audiovisual', role:'Dirección de arte', pieces:'Poster · Postal · Social', concept:'Un universo visual consistente en cada punto de contacto.'},
    {selector:'.poster-section .portfolio-heading', title:'POSTERS', type:'Publicidad editorial', role:'Diseño gráfico', pieces:'Poster · MUPI · Billboard', concept:'Imágenes pensadas para pedir espacio y quedarse en la memoria.'},
    {selector:'.communication-section .portfolio-heading', title:'COMUNICACIÓN', type:'Sistema de contenidos', role:'Dirección visual', pieces:'Email · Postal · Social', concept:'Una identidad que cambia de formato sin perder su voz.'},
    {selector:'.digital-case .portfolio-heading', title:'EXPERIENCIAS DIGITALES', type:'Prototipo Figma', role:'UX/UI · Dirección visual', pieces:'Reflections · Asértika', concept:'Interfaces diseñadas para dar a una idea un lugar donde vivir.'},
    {selector:'.marso-case .portfolio-heading', title:'MARSO STUDIO', type:'Identidad de marca', role:'Dirección de arte · Branding', pieces:'Logo · Sistema · Aplicaciones', concept:'La identidad que estás recorriendo también es una pieza del proyecto.'}
  ];
  projectFacts.forEach(function(fact){
    var heading = document.querySelector(fact.selector);
    if (!heading || heading.querySelector('.project-fact')) return;
    var factBox = document.createElement('aside');
    factBox.className = 'project-fact';
    factBox.innerHTML = '<span>FICHA DE PROYECTO</span><dl><div><dt>Proyecto</dt><dd>' + fact.title + '</dd></div><div><dt>Tipo</dt><dd>' + fact.type + '</dd></div><div><dt>Rol</dt><dd>' + fact.role + '</dd></div><div><dt>Piezas</dt><dd>' + fact.pieces + '</dd></div></dl><p>' + fact.concept + '</p>';
    heading.appendChild(factBox);
  });

  var signalButton = document.querySelector('.portfolio-signal-button');
  var experiment = document.querySelector('.portfolio-experiment');
  if (signalButton && experiment){
    signalButton.addEventListener('click', function(){
      var active = experiment.classList.toggle('is-active');
      signalButton.setAttribute('aria-pressed', active);
    });
    experiment.addEventListener('pointermove', function(event){
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var rect = experiment.getBoundingClientRect();
      experiment.style.setProperty('--signal-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
      experiment.style.setProperty('--signal-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  var dialog = document.createElement('dialog');
  dialog.className = 'portfolio-lightbox';
  dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="Cerrar imagen">×</button><img alt=""><p></p>';
  document.body.appendChild(dialog);
  var lightboxImage = dialog.querySelector('img');
  var lightboxCaption = dialog.querySelector('p');
  var close = dialog.querySelector('.lightbox-close');

  pieces.forEach(function(piece){
    piece.tabIndex = 0;
    piece.setAttribute('role', 'button');
    piece.addEventListener('click', openPiece);
    piece.addEventListener('keydown', function(event){
      if (event.key === 'Enter' || event.key === ' '){ event.preventDefault(); openPiece.call(piece, event); }
    });
  });

  function openPiece(){
    lightboxImage.src = this.currentSrc || this.src;
    lightboxImage.alt = this.alt;
    lightboxCaption.textContent = this.alt;
    dialog.showModal();
  }
  function closeDialog(){ dialog.close(); lightboxImage.removeAttribute('src'); }
  close.addEventListener('click', closeDialog);
  dialog.addEventListener('click', function(event){ if (event.target === dialog) closeDialog(); });
  document.addEventListener('keydown', function(event){ if (event.key === 'Escape' && dialog.open) closeDialog(); });
})();
