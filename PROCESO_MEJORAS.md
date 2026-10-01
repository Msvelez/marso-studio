# Proceso de mejoras del portafolio

Bitácora de las mejoras al portafolio, inspiradas en el análisis de 6 sitios de referencia
(`OUTPUT/analisis_sitios_landing/resumenes/` en el repo `agente-claude`).
Rama de trabajo: `mejoras-referencias`. Fecha de inicio: 2026-10-01.

## 1. De dónde salen las ideas

| Referencia | Qué se tomó |
|---|---|
| Robby Leonardi | Poder saltar a una sección, el punto débil de su scroll lineal |
| Brittany Chiang | Nav que resalta la sección activa, enlace "Skip to content" |
| Henry Heffernan, Jesse Zhou | Loader temático |
| Bruno Simon, Jesse Zhou | Mapa explorable en vez de tarjetas |
| Lynn Fisher | Archivo de versiones anteriores |
| Bruno Simon, Brittany Chiang | Bitácora o devlog |

## 2. Estado

| Mejora | Estado | Archivos |
|---|---|---|
| Barra de scroll clicable | Hecha | `index.html`, `style.css`, `script.js` |
| Sección activa en el header | Hecha | `style.css`, `script.js` |
| Loader temático "Encendiendo el destello…" | Hecha | `index.html`, `style.css`, `script.js`, `i18n-en.js` |
| Mapa de áreas como constelaciones | Hecha | `style.css`, `script.js` |
| Skip link "Saltar al contenido" | Hecha | `index.html`, `style.css`, `i18n-en.js` |
| Favicon con el destello | Hecha | las 6 páginas |
| Vista previa al compartir (Open Graph) | Hecha | las 6 páginas |
| Filtros de proyectos por tecnología | Hecha | `extras.js`, `extras.css` (en `experiencias.html`) |
| Transición de destello entre páginas | Hecha | `extras.js`, `extras.css` |
| Cursor de cometa | Hecha | `extras.js`, `extras.css` |
| Sonido opcional | Hecha | `extras.js`, `extras.css` |
| Easter egg: lluvia de cometas | Hecha | `extras.js`, `extras.css` |
| Hora local en el footer | Hecha | `index.html`, `extras.js` |
| Proyectos como objetos | Hecha (PR #2) | `projects.js` |
| Perfil del home en JSON, renderizado desde ahí | Hecha (PR #3) | `profile.json`, `profile.js`, `index.html`, `i18n.js` |
| Panel de administración del home (CRUD) | Hecha | `admin/`, `package.json`, `.gitignore`, `profile.js` |
| Panel para proyectos y páginas de área | Pendiente | |
| Redes + CV en el footer | Pendiente: faltan las URLs reales | |
| Versiones anteriores | Pendiente: faltan versiones y fechas | |
| Bitácora de proceso | Pendiente: falta decidir quién escribe las notas | |

## 3. Cómo funciona cada cambio

**Barra de scroll clicable.** Seis `<a class="stop">` dentro de `#scrollTrail`. `placeStops()` calcula la posición de cada una como `offsetTop / (scrollHeight - innerHeight)` y se recalcula en `load`, `resize` y cuando cambia la altura de la página (fin del loader, activación del mapa). Con `scroll-behavior:smooth` (ya existía) el clic desliza hasta la sección.

**Sección activa.** Un `IntersectionObserver` con `rootMargin:'-45% 0px -50% 0px'` marca como activa la sección que cruza el centro de la pantalla y pone `aria-current="true"` en su enlace de la nav. El estilo reutiliza el subrayado dorado del hover.

**Loader.** Cuenta de 0 a 100 % mientras el video del hero llega a `readyState >= 3`. Dura mínimo 1.4 s para que se vea y máximo 4 s para no bloquear. Al terminar, el destello crece (`scale(90)`) hasta llenar la pantalla de dorado y luego se disuelve. Con `prefers-reduced-motion` se elimina. Los textos tienen versión en inglés en `i18n-en.js`.

**Skip link.** Un `<a class="skip-link" href="#main">` es el primer elemento de la página y queda fuera de pantalla hasta recibir foco con Tab, momento en que aparece arriba a la izquierda. `<main>` ahora tiene `id="main"` y `tabindex="-1"` para que el foco se mueva al contenido. Se ve por encima del loader (`z-index:200`).

**Mapa de constelaciones.** Es una mejora progresiva: los 5 `<a class="area-map-item">` siguen en el HTML y siguen siendo la zona clicable (teclado, lectores de pantalla y el aviso de mantenimiento de `soon.js` funcionan igual). En pantallas de 861 px o más, JS agrega la clase `is-constellation` y un `<canvas>` detrás. Cada área tiene una figura definida por puntos y aristas (`SHAPES`). Al hacer hover o foco, las líneas se dibujan una a una en dorado. El canvas solo anima cuando la sección está visible. En móvil se conservan las tarjetas originales.

**Archivos nuevos compartidos.** `extras.css` y `extras.js` se cargan en las 6 páginas. El script va antes de `i18n.js` para que los elementos que crea (chips, botón de sonido) entren en la traducción. Cada función revisa que exista el DOM que necesita, así que el mismo archivo sirve en todas.

**Favicon.** SVG incrustado como `data:` con la estrella de 8 puntas en dorado (`#efc820`). Antes `favicon.ico` daba 404.

**Open Graph.** `og:title`, `og:description`, `og:url`, `og:image` y `twitter:card` en cada página, tomando título y descripción de la propia página. La imagen es `assets-web/marso-studio.jpg` para todas. `index.html` no tenía `description`; se agregó una.

**Transición de destello.** Al hacer clic en un enlace interno a otra página `.html`, el destello llena la pantalla de dorado (600 ms) y luego navega. En la página nueva, una capa dorada se desvanece. Se omite con `prefers-reduced-motion`, con enlaces `target="_blank"`, con teclas modificadoras (Ctrl, Cmd…) y con los enlaces de "En mantenimiento" (`data-soon`), que manejan su propio aviso. Un temporizador de seguridad la quita a los 2.5 s si la navegación falla.

**Cursor de cometa.** Un `<canvas>` fijo dibuja una estela dorada de los últimos 28 puntos del mouse. Solo se activa con puntero fino (no en pantallas táctiles) y solo anima mientras hay estela.

**Sonido.** Botón abajo a la izquierda, apagado por defecto. Todo se genera con Web Audio, sin archivos de audio: un zumbido grave (tres osciladores a 55, 82.5 y 110.4 Hz con filtro) y un "ting" de escala pentatónica en hover y clic. El estado no se guarda entre páginas porque los navegadores exigen un gesto del usuario para iniciar audio.

**Easter egg.** Código Konami (↑ ↑ ↓ ↓ ← → ← → B A) en cualquier página, o 5 clics rápidos en el logo de la home, lanzan una lluvia de 46 cometas durante unos 3.6 s.

**Hora local.** En el footer del home: "Bogotá · 14:19", actualizada cada 30 s con `Intl.DateTimeFormat`. **Supuesto:** la zona `America/Bogota` y el texto "Bogotá" están en las constantes `TZ` y `CITY` de `extras.js`; se cambian ahí si no aplican. Va en el footer y no dentro de la píldora "Disponible" porque `i18n.js` traduce esa píldora por su HTML exacto y añadirle un elemento rompería la traducción.

**Filtros por tecnología.** Los chips se generan a partir de los `<li>` de `.project-stack` y solo incluyen tecnologías que aparecen en 2 o más proyectos (hoy HTML, CSS y JavaScript). Al elegir una, se ocultan los proyectos que no la usan y las secciones que quedan vacías.

**Perfil en JSON (`profile.json` + `profile.js`).** Todo el contenido del home (marca, contacto, nav, origen, hero, manifiesto, proceso, áreas, sección de contacto, footer y título del sitio) vive en `profile.json`; `profile.js` lo carga con `fetch` y lo pinta en la página.
- **Sobre el HTML actual:** `index.html` conserva su texto en español como respaldo y solo recibe atributos `data-profile`. Si el JSON no carga (sin red, `file://`), la página se ve igual y la consola avisa.
- **Atributos:** `data-profile` (contenido), `data-profile-text` (solo el nodo de texto propio, para no tocar íconos), `data-profile-href`, `data-profile-attr-NAME` (cualquier atributo; se quita si el dato no existe) y `data-profile-list` (listas). Las rutas dentro de una lista empiezan con `.`. Las plantillas usan `{ruta}` y `{?ruta| prefijo}` (el prefijo solo sale si el dato existe, p. ej. el " · En mantenimiento" de Diseño Digital).
- **Texto con formato sin HTML en el JSON:** `**negrita**`, `*cursiva*` y salto de línea `\n` (se convierte en `<br>`).
- **Listas:** los hijos se emparejan por posición con el arreglo. En `nav` y `process.steps` se pueden agregar o quitar elementos desde el JSON (se clona el último). `origin.lines` y `areas.items` son `data-profile-fixed`: el diseño depende de la cantidad (animación de las líneas, 5 constelaciones), así que solo se rellenan los que coinciden y se avisa en consola si no.
- **Inglés:** `i18n.js` traduce por el HTML en español de cada bloque. Para que no se pisen, `profile.js` expone `window.marsoProfileReady` y `i18n.js` espera esa promesa antes de aplicar el idioma guardado. Como los textos del JSON son idénticos al HTML original, el diccionario `i18n-en.js` no cambió.
- **Qué no se renderiza:** las etiquetas Open Graph, que los rastreadores leen sin ejecutar JavaScript, y por eso siguen en el HTML.

**Panel de administración (`admin/`).** CRUD del contenido del home (`profile.json`) para editar desde el navegador, sin tocar código.

*Cómo se usa:* en la carpeta del portafolio, `node admin/server.js` (o `npm run admin`) y abrir http://localhost:8766/admin/. No tiene dependencias: usa solo módulos de Node. Para cambiar el puerto: `PORT=8777 node admin/server.js`.

*Por qué un servidor local:* el sitio vive en GitHub Pages, que es hosting estático y no puede guardar datos. El servidor escribe directamente en `profile.json` de tu computador; después se publica con git (el panel muestra el comando tras cada guardado). El panel también está dentro del sitio publicado, pero allí no encuentra el servidor y solo muestra las instrucciones: no puede modificar nada.

| Archivo | Para qué sirve |
|---|---|
| `admin/server.js` | Sirve el sitio y una API (`/api/profile`, `/api/backups`, `/api/restore`). Valida, hace respaldo y escribe de forma atómica (archivo temporal + rename). |
| `admin/profile.schema.json` | Describe cada campo (tipo, etiqueta, ayuda, obligatorio, mínimos y máximos, listas de cantidad fija). El formulario y la validación salen de aquí. |
| `admin/validate.js` | El mismo validador corre en el servidor y en el navegador: lo que el panel acepta es lo que el servidor acepta. |
| `admin/index.html`, `admin.js`, `admin.css` | La interfaz: formulario generado desde el esquema, índice lateral y vista previa. |

*Qué permite (CRUD):*
- **Leer:** carga `profile.json` y arma un formulario por sección.
- **Editar (Update):** validación en vivo con el error bajo cada campo, contador de errores y marca en el índice lateral. Vista previa en vivo en un iframe con el borrador sin guardar (por `postMessage`; `profile.js` vuelve a pintar). Ctrl+S guarda.
- **Crear y borrar (Create/Delete):** en `nav` y `process.steps` se puede agregar, borrar (con confirmación de dos clics) y reordenar con ▲▼. Las listas de cantidad fija (`origin.lines`, `manifesto.paragraphs`, `areas.items`) muestran "cantidad fija": su contenido se edita, pero no su número ni su orden, porque el diseño depende de ello. Los campos opcionales (`status`, `maintenance`) se borran dejándolos vacíos.
- **Respaldos y restauración:** cada guardado copia la versión anterior a `admin/.backups/` (se conservan 20 y la carpeta está en `.gitignore`). Se restaura desde el selector; restaurar también respalda el estado actual.
- **Descartar cambios** y aviso si cierras la pestaña con cambios sin guardar.
- **Control de versiones:** si `profile.json` cambió en el disco desde que abriste el panel (por ejemplo, editado a mano o por un `git pull`), el guardado responde 409 y no pisa nada.

*Seguridad:* el servidor escucha solo en 127.0.0.1; rechaza cualquier `Host` que no sea localhost (contra DNS rebinding); las escrituras exigen la cabecera `X-Requested-With` y un `Origin` propio (así una página ajena no puede escribir); nunca sirve carpetas que empiezan con punto (`.git`, `.backups`), `node_modules` ni `server.js`; los nombres de respaldo se validan con una expresión estricta; el cuerpo de las peticiones se limita a 1 MB. Los textos del JSON se escapan al pintarse (no se interpreta HTML).

*Dos detalles:* el primer guardado reescribe `profile.json` con formato estándar de 2 espacios, así que el diff de git de ese primer cambio será más grande de lo que cambió el contenido. Las claves que el esquema no conoce se conservan.

## 4. Problemas encontrados

| Problema | Causa | Solución |
|---|---|---|
| Las paradas de la barra no recibían posición y el clic no navegaba | `index.html` no tiene `<!DOCTYPE html>`, así que el navegador usa modo quirks y `documentElement.clientHeight` devuelve la altura de toda la página | Usar `document.scrollingElement` y `window.innerHeight`. Se aplicó también a la barra de progreso original, que daba `NaN`. **No** se agregó el doctype porque podría alterar el diseño de todo el sitio |
| Los textos del mapa se montaban sobre las figuras | La zona clicable estaba alineada al fondo y tapaba la parte baja de la constelación | Alinear el texto al inicio con `padding-top:12rem` y ajustar alto y ancho de la zona |
| Al renderizar desde el JSON, el mapa de áreas salía corrido un lugar (Branding mostraba "Diseño Digital") y el aviso de mantenimiento no aparecía | `script.js` inserta un `<canvas>` como primer hijo de `.area-map` y la lista lo contaba como un elemento | `profile.js` solo trata como elementos de la lista los hijos que tienen atributos `data-profile*` |
| Los respaldos hechos en el mismo segundo se ordenaban mal (`X.json` quedaba después de `X-1.json`), así que "el más antiguo" y la poda de los 20 podían equivocarse | La coma y el guion se comparan distinto al ordenar nombres alfabéticamente | Los nombres tienen ancho fijo: fecha, hora, milisegundos y un contador (`profile-20261001-145945-020-00.json`), por lo que ordenar por nombre es ordenar por tiempo |
| Las tarjetas de las listas decían "Elemento 2" en vez de su título | Los títulos se calculaban antes de que el formulario estuviera dentro de la página | Se calculan después de montar el formulario |
| Los archivos mezclan finales de línea (LF y CRLF) | Edición desde distintos editores en Windows | Los parches se hicieron con scripts que tratan ambos; `git diff --stat` confirma que no hay reescrituras completas |

## 5. Cómo se verificó

- Servidor local con `npx http-server` y Chrome automatizado (`puppeteer-core`).
- Comprobado en `extras.js`: hora local, metadatos, botón de sonido (activar/silenciar), Konami y 5 clics en el logo, transición entre páginas (clase `leave` al salir y `arrive` al llegar) y filtros (HTML 5/6, CSS 4/6, JavaScript 4/6 proyectos visibles; "Todos" restaura 6/6).
- Panel: API con 39 comprobaciones (lectura, guardado válido, validación, conflicto 409, respaldos, restauración, seguridad y archivos estáticos) y panel en Chrome con 50 (formulario, validación en vivo, vista previa sin guardar, agregar/mover/borrar, listas fijas, campo opcional, Ctrl+S, restaurar, descartar, conflicto y poda a 20 respaldos). Después de las pruebas, `profile.json` quedó idéntico al original.
- Perfil en JSON: 76 elementos comparados entre la página con el JSON bloqueado (texto original del HTML) y la renderizada desde `profile.json`, con 0 diferencias. También se probó cambiar el JSON (título, correo en los dos enlaces `mailto`, año del footer, un quinto paso de proceso, una etiqueta de la nav), el inglés encima del texto renderizado y el aviso de "En mantenimiento" de Diseño Digital.
- Comprobado: loader llega a `ignite done`, las 6 paradas tienen posición, el clic en "Proceso" deja esa sección arriba, la nav cambia de activa, el mapa se activa en 1400 px y se desactiva en 390 px, y no hay errores de JavaScript.
- Revisión visual con capturas del loader, la nav activa y el mapa en hover.
- Solo falla `favicon.ico` (404), que ya faltaba antes de estos cambios.

## 6. Pendientes y decisiones abiertas

- Sacar el video base64 de `index.html` (~2 MB) a un `.mp4` aparte. Es la causa real de la carga lenta, el loader solo la disimula.
- Revisar el sonido con oídos humanos: se verificó que el botón cambia de estado, pero no se puede comprobar cómo suena. Volumen y notas se ajustan en `extras.js` (`master`, `ting()`).
- Probar el toggle ES/EN con los textos nuevos.
- Confirmar que `og:image` se ve bien al compartir el link (se puede revisar con el depurador de vista previa de Facebook o LinkedIn una vez publicado).
- Probar en un celular real: el mapa se desactiva por ancho, pero no se probó con pantalla táctil.
- Panel, siguientes entregas: (2) migrar `projects.js` a `projects.json`, pintar `experiencias.html` desde ahí y agregar su CRUD; (3) lo mismo para branding, motion, lab y digital. Sin esas migraciones el panel solo puede administrar el home.
- Si algún día se quiere editar desde fuera de tu computador, habría que cambiar el guardado (por ejemplo a la API de GitHub con un token) o alojar el servidor.
- Extender el mismo mecanismo a las páginas de área (hero, proceso, contacto de cada una) y a los proyectos, leyendo `projects.js`.
- Agregar redes y CV a `profile.json` cuando estén los datos.
- Decidir si se agrega `<!DOCTYPE html>` y se revisa el diseño en modo estándar.
