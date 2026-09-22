(function(){
  var socialTrack = document.querySelector('.campaign-social-track');
  if (socialTrack){
    socialTrack.classList.add('campaign-autoplay');
    var socialImages = Array.prototype.slice.call(socialTrack.querySelectorAll('img'));
    var socialIndex = 0;
    socialImages.forEach(function(image, index){ image.classList.toggle('is-active', index === 0); });
    if (socialImages.length > 1){
      window.setInterval(function(){
        socialImages[socialIndex].classList.remove('is-active');
        socialIndex = (socialIndex + 1) % socialImages.length;
        socialImages[socialIndex].classList.add('is-active');
      }, 3600);
    }
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

  var pieces = document.querySelectorAll('.portfolio-piece img, .wall-poster img, .communication-email img, .communication-wide img, .communication-socials img, .identity-logo img, .identity-banner img, .identity-signature img, .identity-logos img');
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
