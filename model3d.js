/* Visor 3D de Marso Studio.
   Uso en el HTML:
     <figure class="model3d" data-model="ruta/modelo.glb" data-exposure="1" data-ambient="0.4">
       <div class="model3d-stage">
         <img class="model3d-poster" src="poster.jpg" alt="...">
         <button class="model3d-load" type="button">Explorar en 3D</button>
       </div>
       <figcaption>...</figcaption>
     </figure>
   El modelo solo se descarga cuando alguien toca el botón. Si el .glb trae una cámara,
   el visor arranca desde ese encuadre y limita el giro alrededor de él (para piezas de pared).
   Necesita el importmap de three.js en el <head> de la página. */
// three.js is only downloaded when someone asks for the 3D view
let THREE, GLTFLoader, DRACOLoader, OrbitControls, RoomEnvironment, MeshoptDecoder;
function loadThree() {
  return Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/environments/RoomEnvironment.js'),
    import('three/addons/libs/meshopt_decoder.module.js')
  ]).then((m) => {
    THREE = m[0]; GLTFLoader = m[1].GLTFLoader; DRACOLoader = m[2].DRACOLoader;
    OrbitControls = m[3].OrbitControls; RoomEnvironment = m[4].RoomEnvironment; MeshoptDecoder = m[5].MeshoptDecoder;
  });
}

const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/gltf/';
const en = () => document.documentElement.lang === 'en';
const T = {
  loading: () => en() ? 'Loading model' : 'Cargando modelo',
  hint: () => en() ? 'Drag to orbit · scroll or pinch to zoom' : 'Arrastra para girar · rueda o pellizca para acercar',
  error: () => en() ? 'The 3D model could not load. Showing the image instead.' : 'No se pudo cargar el modelo 3D. Te dejo la imagen.',
  reset: () => en() ? 'Reset view' : 'Volver al encuadre'
};

function setup(figure) {
  const stage = figure.querySelector('.model3d-stage');
  const button = figure.querySelector('.model3d-load');
  if (!stage || !button) return;
  button.addEventListener('click', () => {
    button.disabled = true;
    figure.classList.add('is-loading');
    loadThree().then(() => start(figure, stage, button)).catch((err) => {
      console.warn('[model3d]', err);
      figure.classList.remove('is-loading');
      button.disabled = false;
      const msg = document.createElement('p');
      msg.className = 'model3d-status'; msg.setAttribute('data-i18n-skip', ''); msg.textContent = T.error();
      stage.appendChild(msg);
    });
  });
}

function start(figure, stage, button) {
  const status = document.createElement('p');
  status.className = 'model3d-status';
  status.setAttribute('role', 'status');
  status.setAttribute('data-i18n-skip', '');
  status.textContent = T.loading() + '…';
  stage.appendChild(status);
  button.disabled = true;
  figure.classList.add('is-loading');

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = parseFloat(figure.dataset.exposure || '1');
  renderer.domElement.className = 'model3d-canvas';
  renderer.domElement.setAttribute('aria-label', figure.querySelector('.model3d-poster')?.alt || '3D');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;

  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  // soft studio reflections so metallic and glossy materials read like in Blender
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = parseFloat(figure.dataset.env || '0.5');

  let home = null;
  loader.load(figure.dataset.model, (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    root.updateMatrixWorld(true);
    // glTF lights come in Blender's watts converted to candela; scale them to taste and add a soft fill
    const lightScale = parseFloat(figure.dataset.lights || '1');
    root.traverse((o) => {
      if (o.isLight) o.intensity *= lightScale;
      // decals and stickers sit right on top of walls: nudge them forward so they don't flicker or hide
      if (o.isMesh && o.material && (o.material.transparent || o.material.alphaTest > 0)) {
        o.material.polygonOffset = true; o.material.polygonOffsetFactor = -2; o.material.polygonOffsetUnits = -2;
      }
    });
    scene.add(new THREE.HemisphereLight(0xfff2dd, 0x1a1012, parseFloat(figure.dataset.ambient || '0.4')));
    const keyPower = parseFloat(figure.dataset.key || '0');
    if (keyPower > 0) {
      // a key light that rides with the camera, so the side you are looking at is always lit
      const key = new THREE.DirectionalLight(0xfff4e6, keyPower);
      key.position.set(0.6, 0.8, 1); camera.add(key); scene.add(camera);
    }

    const box = new THREE.Box3().setFromObject(root);
    const focus = figure.dataset.focus && root.getObjectByName(figure.dataset.focus);
    const target = focus ? new THREE.Box3().setFromObject(focus).getCenter(new THREE.Vector3()) : box.getCenter(new THREE.Vector3());

    const src = gltf.cameras && gltf.cameras[0];
    if (src) {
      src.updateMatrixWorld(true);
      camera.position.copy(src.getWorldPosition(new THREE.Vector3()));
      camera.fov = parseFloat(figure.dataset.fov) || src.fov || 40;
      // push the target onto the camera's line of sight so the first view matches the render
      const dir = src.getWorldDirection(new THREE.Vector3());
      const dist = camera.position.distanceTo(target);
      target.copy(camera.position).addScaledVector(dir, dist);
    } else {
      const size = box.getSize(new THREE.Vector3()).length();
      camera.fov = parseFloat(figure.dataset.fov) || 35;
      camera.position.copy(target).add(new THREE.Vector3(size * 0.5, size * 0.05, size * 1.35));
    }
    controls.target.copy(target);
    camera.lookAt(target);
    const dist = camera.position.distanceTo(target);
    controls.minDistance = dist * 0.35;
    controls.maxDistance = dist * 1.1;
    controls.update();
    // keep the viewer in front of the piece: limited orbit around the starting angle
    const az = controls.getAzimuthalAngle(), po = controls.getPolarAngle();
    if (figure.dataset.orbit === 'full') {
      // free-standing pieces (characters): walk all the way around, without going under the floor
      controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI * 0.62;
      controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = 0.8;
      renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });
    } else {
      const spread = parseFloat(figure.dataset.orbit || '0.85');
      controls.minAzimuthAngle = az - spread; controls.maxAzimuthAngle = az + spread;
      controls.minPolarAngle = Math.max(0.05, po - spread * 0.7); controls.maxPolarAngle = Math.min(Math.PI - 0.05, po + spread * 0.7);
    }
    home = { pos: camera.position.clone(), target: target.clone() };

    stage.appendChild(renderer.domElement);
    resize();
    figure.classList.remove('is-loading');
    figure.classList.add('is-live');
    status.textContent = T.hint();
    status.classList.add('is-hint');

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'model3d-reset';
    reset.setAttribute('data-i18n-skip', '');
    reset.textContent = T.reset();
    reset.addEventListener('click', () => { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); });
    stage.appendChild(reset);
    renderer.setAnimationLoop(tick);
  }, (e) => {
    if (e.total) status.textContent = T.loading() + ' · ' + Math.round(e.loaded / e.total * 100) + '%';
  }, (err) => {
    console.warn('[model3d]', err);
    figure.classList.remove('is-loading');
    status.textContent = T.error();
    renderer.dispose();
  });

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(stage);
  function tick() { if (!visible) return; controls.update(); renderer.render(scene, camera); }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
}

document.querySelectorAll('.model3d[data-model]').forEach(setup);
