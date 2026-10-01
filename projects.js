/* Marso Studio: every project in the portfolio, modelled as a plain object.
   Content (titles, summaries, roles, stacks, durations) is copied from the site pages; nothing here is new copy.
   Fields are only present when the site states them. Text values stay in Spanish, like the pages (English lives in i18n-en.js).

   Project shape
     id        unique slug
     title     name as shown on the site
     area      'web' | 'branding' | 'motion' | '3d'      (see MARSO_PROJECTS.areas)
     category  slug inside the area                       (see MARSO_PROJECTS.categories)
     summary   one-line description from the site
     page      where it lives on this site (file + anchor)
     cover     main image or video path (relative to the site root)
   Optional: context, type, role, tools, stack, status, duration, audience, note, technicalNotes,
             links {live, process}, pieces [{ title, type?, image?, video?, duration?, description? }], process {...}, concept {...} */
(function(){
  var areas = {
    web:      {label: 'Experiencias Web',      page: 'experiencias.html'},
    branding: {label: 'Branding + Publicidad', page: 'branding.html'},
    motion:   {label: 'Contenido + Motion',    page: 'motion.html'},
    '3d':     {label: '3D + Exploración',      page: 'lab.html'}
  };

  var categories = {
    'civic-platform':      {area: 'web', label: 'Plataforma cívica'},
    'digital-campaign':    {area: 'web', label: 'Campañas digitales'},
    'interactive-story':   {area: 'web', label: 'Relato interactivo'},
    'portfolio-prototype': {area: 'web', label: 'Portafolios + prototipos'},

    'campaign':            {area: 'branding', label: 'Campañas'},
    'advertising':         {area: 'branding', label: 'Publicidad'},
    'communication':       {area: 'branding', label: 'Comunicación'},
    'identity':            {area: 'branding', label: 'Identidad'},
    'illustration':        {area: 'branding', label: 'Ilustración'},

    'experimental-short':  {area: 'motion', label: 'Corto experimental'},
    'video-campaign':      {area: 'motion', label: 'Campañas en video'},
    'direction':           {area: 'motion', label: 'Dirección'},
    'editing':             {area: 'motion', label: 'Edición'},
    'docudrama':           {area: 'motion', label: 'Docudrama'},

    'animated-series':     {area: '3d', label: 'Serie animada 3D'},
    'animation':           {area: '3d', label: 'Animación + texturas'},
    'digital-sculpture':   {area: '3d', label: 'Escultura digital'}
  };

  var list = [

    /* ---------- web: experiencias.html ---------- */
    {
      id: 'mision-representante',
      title: 'Misión Representante',
      area: 'web', category: 'civic-platform',
      context: 'Creación Digital · Universidad El Bosque',
      summary: 'Una elección estudiantil convertida en misión: postulación, perfiles de candidatos, votación y publicación de resultados.',
      stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Firebase'],
      technicalNotes: 'Firebase Authentication verifica la identidad institucional; Firestore actualiza fases, candidaturas y votos en tiempo real, y Firebase Storage gestiona los medios. Motion anima las transiciones. Las reglas de Firestore protegen la votación y evitan el voto duplicado.',
      links: {live: 'https://msvelez.github.io/eleccion-representantes-2026/'},
      page: 'experiencias.html#plataformas',
      cover: 'assets-web/mision-representante.jpg'
    },
    {
      id: 'parchate',
      title: 'Párchate',
      area: 'web', category: 'digital-campaign',
      context: 'Hackathon · Seguros Bolívar',
      summary: 'Una campaña para acercar los seguros a jóvenes con humor, situaciones cotidianas y contenido pensado para compartirse.',
      stack: ['HTML', 'CSS', 'JavaScript', 'Phosphor Icons'],
      technicalNotes: 'El pitch se recorre como una historia vertical por scroll, con piezas gráficas y videos 9:16. Incluye un loader Tetris animado hecho en JavaScript y una interfaz responsive. La campaña incorpora contenido creado con IA.',
      links: {live: 'https://msvelez.github.io/hackathon_sb_2026/'},
      page: 'experiencias.html#campanas',
      cover: 'assets-web/parchate-seguros.jpg'
    },
    {
      id: 'global-seguros',
      title: 'Global Seguros',
      area: 'web', category: 'digital-campaign',
      context: 'Hackathon · Global Seguros',
      summary: 'Una propuesta para simplificar el recorrido del cliente y hacer más clara la exploración de coberturas y servicios.',
      stack: ['HTML', 'CSS', 'JavaScript', 'JSON'],
      technicalNotes: 'La landing organiza el journey en pasos, beneficios y preguntas frecuentes, con animaciones de entrada mediante Intersection Observer. El prototipo de catálogo usa datos JSON y el carrito persiste en localStorage; es una simulación frontend, sin servidor, base de datos ni pagos conectados.',
      links: {live: 'https://msvelez.github.io/REMODELO-DE-EXPERIENCIA-DE-USUARIO-GLOBAL-SEGUROS-HACKATON-2026/'},
      page: 'experiencias.html#campanas',
      cover: 'assets-web/global-seguros.jpg'
    },
    {
      id: 'el-corazon-del-asesino',
      title: 'El Corazón del Asesino',
      area: 'web', category: 'interactive-story',
      context: 'Composición plástica · Relato audiovisual',
      summary: 'Una narración de suspenso inspirada en Poe, contada con páginas que se abren, imágenes y un pulso sonoro.',
      stack: ['HTML', 'CSS 3D', 'JavaScript', 'Audio'],
      technicalNotes: 'Las páginas giran con transformaciones CSS 3D controladas por inputs checkbox, sin librerías externas. JavaScript sincroniza la música y modifica su velocidad según la escena; el ritmo, el movimiento y el sonido construyen el suspenso.',
      links: {live: 'https://msvelez.github.io/Libro-Alb-m/'},
      page: 'experiencias.html#relatos',
      cover: 'assets-web/libro-album.jpg'
    },
    {
      id: 'maria-sofia-portafolio',
      title: 'María Sofía · Portafolio',
      area: 'web', category: 'portfolio-prototype',
      context: 'Prototipo personal',
      summary: 'El primer prototipo para reunir trabajos de 3D, diseño de interfaces y creación digital en un mismo espacio.',
      stack: ['HTML', 'CSS', 'Google Fonts'],
      technicalNotes: 'Maquetación estática con secciones de presentación, servicios, trabajos y blog. La interfaz se apoya en Space Grotesk y estilos CSS; no carga bibliotecas JavaScript. El formulario visible es una demostración frontend, no un envío conectado.',
      links: {live: 'https://msvelez.github.io/Portafolio/index.html'},
      page: 'experiencias.html#prototipos',
      cover: 'assets-web/portfolio-prototype.jpg'
    },
    {
      id: 'marso-studio',
      title: 'Marso Studio',
      area: 'web', category: 'portfolio-prototype',
      context: 'Portafolio · Experiencia web actual',
      summary: 'Este mismo sitio: una identidad digital que une relato, diseño, código, 3D e ilustración en una experiencia de scroll.',
      stack: ['HTML', 'CSS', 'JavaScript', 'Canvas + SVG'],
      technicalNotes: 'JavaScript dibuja el campo de estrellas en Canvas y coordina las revelaciones con Intersection Observer. Un recorrido SVG responde al scroll; el parallax, la inclinación de tarjetas y el soporte para movimiento reducido completan la interacción.',
      links: {live: 'index.html#hero'},
      page: 'experiencias.html#prototipos',
      cover: 'assets-web/marso-studio.jpg'
    },
    {
      id: 'figma-reflections',
      title: 'Reflections',
      area: 'web', category: 'portfolio-prototype',
      type: 'Prototipo Figma',
      role: 'UX/UI · Dirección visual',
      summary: 'Interfaces diseñadas para dar a una idea un lugar donde vivir.',
      page: 'experiencias.html#prototipos',
      cover: 'assets-publicidad/billboard/branding/prototipo-figma-1-reflections.png'
    },
    {
      id: 'figma-asertika',
      title: 'Asértika',
      area: 'web', category: 'portfolio-prototype',
      type: 'Prototipo Figma',
      role: 'UX/UI · Dirección visual',
      summary: 'Interfaces diseñadas para dar a una idea un lugar donde vivir.',
      links: {process: 'https://www.canva.com/design/DAGnqZoLXqE/BMIFk6rCshIPN0TijdODBg/view'},
      page: 'experiencias.html#prototipos',
      cover: 'assets-publicidad/billboard/branding/prototipo-figma-2-asertika.png'
    },

    /* ---------- branding: branding.html ---------- */
    {
      id: 'un-paso-en-falso',
      title: 'Un paso en falso',
      area: 'branding', category: 'campaign',
      type: 'Campaña audiovisual',
      role: 'Dirección de arte',
      summary: 'Un concepto de film que se expande: poster, personajes, postales y piezas sociales bajo una misma dirección visual.',
      pieces: [
        {title: 'Poster principal', image: 'assets-publicidad/billboard/campana-film/poster-campana-1.png'},
        {title: 'Segundo poster', image: 'assets-publicidad/billboard/campana-film/poster-campana-2.png'},
        {title: 'Tríptico, frente', image: 'assets-publicidad/billboard/campana-film/triptico-vista-frontal.png'},
        {title: 'Tríptico, dorso', image: 'assets-publicidad/billboard/campana-film/triptico-vista-tarsera.png'},
        {title: 'Social: Angye', image: 'assets-publicidad/billboard/campana-film/publicidad-instagram-angye.png'},
        {title: 'Social: David', image: 'assets-publicidad/billboard/campana-film/publicidad-instagram-david.png'},
        {title: 'Social: Emily', image: 'assets-publicidad/billboard/campana-film/publicidad-instagram-emily.png'},
        {title: 'Social: Mariana', image: 'assets-publicidad/billboard/campana-film/publicidad-instagram-mariana.png'},
        {title: 'Social: Sofía', image: 'assets-publicidad/billboard/campana-film/publicidad-instagram-sofia.png'}
      ],
      links: {process: 'https://www.canva.com/design/DAG4cXVRAa0/_P43fCc_6MONnnZ5VHxwGg/view'},
      page: 'branding.html#campanas',
      cover: 'assets-publicidad/billboard/campana-film/poster-campana-1.png'
    },
    {
      id: 'posters-publicidad',
      title: 'Posters',
      area: 'branding', category: 'advertising',
      type: 'Publicidad editorial',
      role: 'Diseño gráfico',
      summary: 'Seis posters, seis maneras de construir presencia cuando una imagen necesita ocupar espacio.',
      pieces: [
        {title: 'Coca-Cola Magazine', type: 'Poster', image: 'assets-publicidad/billboard/posters/poster-cocacola-magazine.png'},
        {title: 'Forrest Gump', type: 'Ilustración', image: 'assets-publicidad/billboard/posters/poster-ilustrado-forrest-gump.png'},
        {title: 'Kings of Leon', type: 'Estéreo Picnic', image: 'assets-publicidad/billboard/posters/poster-kingsofleon-estereo-picnic.png'},
        {title: 'Lady Gaga', type: 'Estéreo Picnic', image: 'assets-publicidad/billboard/posters/poster-ladygaga-estereo-picnic.png'},
        {title: 'The Cure', type: 'Estéreo Picnic', image: 'assets-publicidad/billboard/posters/poster-thecure-estereo-picnic.png'},
        {title: 'The Marías', type: 'Estéreo Picnic', image: 'assets-publicidad/billboard/posters/poster-themarias-estereo-picnic.png'}
      ],
      process: {
        title: 'Estéreo Picnic: del autorretrato al póster',
        summary: 'Ideas de autorretrato, bocetos, referentes, paletas y texturas que llevaron a los posters de Lady Gaga, Kings of Leon y The Cure. La propuesta final, para el Mayhem Tour de Lady Gaga, usa el fotomontaje y unas manos que cubren el rostro para hablar de opresión, transformación y deseo.',
        event: 'Estéreo Picnic (ficticio)',
        technique: 'Fotomontaje · ilustración · texturas',
        image: 'assets-publicidad/billboard/proceso/proceso-posters-estereo-picnic.jpg'
      },
      applications: [
        {title: 'MUPI', image: 'assets-publicidad/billboard/mupi/mupi-ladygaga-estereo-picnic.png'},
        {title: 'Wildposting', image: 'assets-publicidad/billboard/wildposting/wildposting.png'},
        {title: 'Billboard', image: 'assets-publicidad/billboard/billboard.png'}
      ],
      page: 'branding.html#posters',
      cover: 'assets-publicidad/billboard/posters/poster-ladygaga-estereo-picnic.png'
    },
    {
      id: 'autorretrato-vectorial',
      title: 'Autorretrato vectorial',
      area: 'branding', category: 'illustration',
      type: 'Ilustración vectorial',
      tools: ['Adobe Illustrator'],
      summary: 'Una ilustración que transmite alegría, energía y juego.',
      palette: ['Amarillo', 'rojo', 'morado', 'azul'],
      page: 'branding.html#posters',
      cover: 'assets-publicidad/billboard/proceso/autorretrato-vectorial.jpg'
    },
    {
      id: 'mambo-infraleve-postales',
      title: 'Postales Mambo Infraleve',
      area: 'branding', category: 'communication',
      type: 'Impreso',
      summary: 'Antes de imprimirse, cada postal fue boceto, prueba y ajuste.',
      links: {process: 'https://www.canva.com/design/DAGzJOz3AkA/z5QHLoIvp5yMgS5tFaCqNw/view'},
      page: 'branding.html#comunicacion',
      cover: 'assets-publicidad/billboard/comunicacion/postales-mambo-infraleve.png'
    },
    {
      id: 'sistema-de-contenidos',
      title: 'Sistema de contenidos',
      area: 'branding', category: 'communication',
      type: 'Sistema de contenidos',
      role: 'Dirección visual',
      summary: 'Una identidad que cambia de formato sin perder su voz.',
      pieces: [
        {title: 'Email: Coca-Cola', image: 'assets-publicidad/billboard/comunicacion/email-cocacola.png'},
        {title: 'Email: The North Face', image: 'assets-publicidad/billboard/comunicacion/email-northface.png'},
        {title: 'Carrusel: Chocosapiens', image: 'assets-publicidad/billboard/comunicacion/carrusel-publicacion-chocosapiens.png'},
        {title: 'SPFC: Curso', image: 'assets-publicidad/billboard/comunicacion/spfc-publicacion-curso.png'},
        {title: 'SPFC: De vuelta', image: 'assets-publicidad/billboard/comunicacion/spfc-publicacion-devuelta-1.png'},
        {title: 'SPFC: Navidad', image: 'assets-publicidad/billboard/comunicacion/spfc-publicacion-navidad-frontal.png'}
      ],
      page: 'branding.html#comunicacion',
      cover: 'assets-publicidad/billboard/comunicacion/carrusel-publicacion-chocosapiens.png'
    },
    {
      id: 'identidad-marso-studio',
      title: 'Identidad de Marso Studio',
      area: 'branding', category: 'identity',
      type: 'Identidad de marca',
      role: 'Dirección de arte · Branding',
      summary: 'La señal de cuatro puntas se convierte en logotipo, banner y firma: un mismo sistema que viaja de la pantalla al correo sin perder su dirección.',
      pieces: [
        {title: 'Logotipo final', image: 'assets-publicidad/billboard/branding/marso-logotipo-final.png'},
        {title: 'Banner', image: 'assets-publicidad/billboard/branding/banner-marso-1.png'},
        {title: 'Firma de email', image: 'assets-publicidad/billboard/branding/email-signature-marso.png'},
        {title: 'Variación del logotipo', image: 'assets-publicidad/billboard/branding/logotipo-marso-1.png'}
      ],
      page: 'branding.html#identidad',
      cover: 'assets-publicidad/billboard/branding/marso-logotipo-final.png'
    },
    {
      id: 'logotipos-mg',
      title: 'Logotipos MG',
      area: 'branding', category: 'identity',
      type: 'Logotipo · proyecto externo',
      summary: 'Una selección de logos desarrollados para otros proyectos, separada del caso de Marso Studio.',
      pieces: [
        {title: 'Logotipo MG', image: 'assets-publicidad/billboard/branding/logotipo-mg-1.png'},
        {title: 'Variación del logotipo MG', image: 'assets-publicidad/billboard/branding/logotipo-mg-2.png'},
        {title: 'Variación gráfica externa', image: 'assets-publicidad/billboard/branding/logotipo-mg-3.png'}
      ],
      page: 'branding.html#otras-identidades',
      cover: 'assets-publicidad/billboard/branding/logotipo-mg-1.png'
    },
    {
      id: 'ilustraciones-vectoriales',
      title: 'Escenas hechas de vectores',
      area: 'branding', category: 'illustration',
      type: 'Ilustración vectorial',
      tools: ['Adobe Illustrator'],
      summary: 'Ilustraciones en Adobe Illustrator donde la forma geométrica, el color plano y las sombras largas construyen la atmósfera.',
      pieces: [
        {title: 'Serpiente y garras', image: 'assets-publicidad/ilustracion/vector-01.jpg'},
        {title: 'Tres perros', image: 'assets-publicidad/ilustracion/vector-02.jpg'},
        {title: 'Tras las barras', image: 'assets-publicidad/ilustracion/vector-03.jpg'},
        {title: 'Corredor de luz', image: 'assets-publicidad/ilustracion/vector-04.jpg'}
      ],
      page: 'branding.html#ilustracion',
      cover: 'assets-publicidad/ilustracion/vector-01.jpg'
    },

    /* ---------- motion: motion.html ---------- */
    {
      id: 'inmutable',
      title: 'Inmutable',
      area: 'motion', category: 'experimental-short',
      type: 'Cortometraje experimental',
      summary: 'Una piedra y el agua como únicos protagonistas: un corto que intenta darle forma a la obsesión.',
      theme: 'La obsesión',
      cast: 'La piedra y el agua',
      pieces: [
        {title: 'Versión 1', video: 'assets-motion/inmutable-v1.mp4', duration: '1:00'},
        {title: 'Versión 2', video: 'assets-motion/inmutable-v2.mp4', duration: '1:00'}
      ],
      page: 'motion.html#inmutable',
      cover: 'assets-motion/inmutable-v1.mp4'
    },
    {
      id: 'spfc-servicios',
      title: 'SPFC',
      area: 'motion', category: 'video-campaign',
      type: 'Campaña publicitaria',
      client: 'SPFC',
      goal: 'Dar a conocer sus servicios',
      format: 'Video vertical 9:16',
      duration: '0:42',
      summary: 'Una campaña para la empresa SPFC que expone los servicios que ofrece.',
      page: 'motion.html#campanas',
      cover: 'assets-motion/spfc-servicios.mp4'
    },
    {
      id: 'maria-sofia-representante',
      title: 'María Sofía',
      area: 'motion', category: 'video-campaign',
      type: 'Campaña de candidatura',
      client: 'Candidatura propia',
      goal: 'Lanzarme como representante',
      format: 'Video vertical 9:16',
      duration: '0:48',
      summary: 'Una campaña publicitaria propia para lanzarme como representante: la candidata también es la marca.',
      page: 'motion.html#campanas',
      cover: 'assets-motion/maria-sofia-representante.mp4'
    },
    {
      id: 'el-desayuno',
      title: 'El desayuno',
      area: 'motion', category: 'direction',
      type: 'Video nostálgico · ejercicio de clase',
      role: 'Dirección',
      team: 'Compañeros de clase',
      duration: '3:26',
      summary: 'Un video nostálgico hecho con mis compañeros: un ejercicio donde asumí la dirección.',
      page: 'motion.html#direccion',
      cover: 'assets-motion/el-desayuno.mp4'
    },
    {
      id: 'la-camisa',
      title: 'La camisa',
      area: 'motion', category: 'editing',
      type: 'Cortometraje de thriller',
      role: 'Edición',
      focus: 'Ritmo · tensión · montaje',
      duration: '3:13',
      summary: 'Un cortometraje de thriller donde estuve a cargo de la edición.',
      page: 'motion.html#edicion',
      cover: 'assets-motion/la-camisa.mp4'
    },
    {
      id: 'serie-docudramas',
      title: 'Serie de docudramas',
      area: 'motion', category: 'docudrama',
      type: 'Docudrama policiaco · pitch deck',
      summary: 'Un docudrama policiaco: el pitch deck de la serie, con sus videos, tal como se presentó.',
      links: {process: 'https://www.canva.com/design/DAG4Zi0DaOA/z9Lt6KpeBhRVv6vkt-sVVA/view'},
      page: 'motion.html#docudrama',
      cover: null
    },

    /* ---------- 3d: lab.html ---------- */
    {
      id: 'juken',
      title: 'JUKEN',
      area: '3d', category: 'animated-series',
      type: 'Serie animada 3D',
      role: 'Diseño de personajes · escultura digital · retopología',
      status: 'Biblia narrativa completa y personajes listos para rig y animación',
      audience: 'Jóvenes en busca de identidad',
      summary: 'JUKEN es una serie animada 3D que sigue a una nueva generación de guerreros de linajes como Leonaris y Ursavel.',
      pairs: ['Ciro y Arion', 'Avgí y Ares', 'Medea y Kismet', 'Dabee y Abejix'],
      concept: {
        character: 'Avgí',
        animal: 'Ares, un leongato espiritual',
        weapon: 'Ares Lucent',
        image: 'assets-3d/juken/avgi-concepto.png'
      },
      pieces: [
        {title: 'Avgí, sculpt en T-pose', image: 'assets-3d/juken/avgi-sculpt-tpose.png'},
        {title: 'Detalle: cabello y gesto', image: 'assets-3d/juken/avgi-sculpt-detalle-cabello.png'},
        {title: 'Pitch', image: 'assets-3d/juken/juken-presentacion.png'}
      ],
      page: 'lab.html#juken',
      cover: 'assets-3d/juken/avgi-sculpt-tpose.png'
    },
    {
      id: 'animaciones-y-texturas',
      title: 'Loops de animación y texturas',
      area: '3d', category: 'animation',
      type: 'Animación · loop',
      summary: 'Loops cortos para probar ritmo, luz y superficie: pequeñas pruebas que se repiten hasta que el movimiento se siente natural.',
      pieces: [
        {title: 'Estela', type: 'Animación · loop', image: 'assets-3d/animacion/esfera-neon-estela.gif', description: 'Una esfera que deja rastro: timing, arco de movimiento y luz de borde.'},
        {title: 'Rayas', type: 'Textura · animación', image: 'assets-3d/animacion/tubos-rayados.gif', description: 'Un patrón rayado que envuelve la curva y acompaña el giro.'},
        {title: 'Señal', type: 'Prueba de movimiento', image: 'assets-3d/animacion/pixel-magenta.gif', description: 'Un punto en la oscuridad basta para probar una trayectoria.'}
      ],
      page: 'lab.html#animacion',
      cover: 'assets-3d/animacion/esfera-neon-estela.gif'
    },
    {
      id: 'criatura-y-marco',
      title: 'Criatura y marco',
      area: '3d', category: 'digital-sculpture',
      type: 'Modelado orgánico · detalle de rostros',
      summary: 'Una criatura de tentáculos atraviesa un cuadro y arrastra rostros esculpidos consigo: un ejercicio de anatomía, pliegue y composición.',
      page: 'lab.html#esculturas',
      cover: 'assets-3d/modelado/escultura-tentaculos-marco.gif'
    }
  ];

  window.MARSO_PROJECTS = {
    areas: areas,
    categories: categories,
    list: list,
    byId: function(id){ return list.filter(function(p){ return p.id === id; })[0] || null; },
    byArea: function(area){ return list.filter(function(p){ return p.area === area; }); },
    byCategory: function(category){ return list.filter(function(p){ return p.category === category; }); },
    byTech: function(tag){ return list.filter(function(p){ return p.stack && p.stack.indexOf(tag) !== -1; }); }
  };
})();
