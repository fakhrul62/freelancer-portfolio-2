import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

function createStars(mobile: boolean) {
  const count = mobile ? 220 : 650;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  let seed = 641;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let index = 0; index < count; index++) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 28;
    positions[offset + 1] = (random() - 0.5) * 18;
    positions[offset + 2] = -6 - random() * 12;
    phases[index] = random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float phase;
      uniform float time;
      varying float vTwinkle;
      void main() {
        vTwinkle = 0.68 + sin(time * 0.85 + phase) * 0.22;
        vec4 position = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (0.5 + fract(phase * 3.7) * 1.0) * (28.0 / -position.z);
        gl_Position = projectionMatrix * position;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      void main() {
        float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
        float glow = 1.0 - smoothstep(0.12, 0.5, distanceFromCenter);
        gl_FragColor = vec4(vec3(0.88, 0.94, 0.79), glow * vTwinkle * 0.7);
      }
    `,
  });
  return { points: new THREE.Points(geometry, material), geometry, material };
}

export function createEarth(canvas: HTMLCanvasElement): { dispose: () => void; setPaused: (value: boolean) => void } {
  const mobile = matchMedia("(max-width: 700px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x080b0a, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  const globe = new THREE.Group();
  scene.add(globe);
  const geometry = new THREE.SphereGeometry(1, mobile ? 64 : 96, mobile ? 48 : 64);
  const light = new THREE.Vector3(-2, 1.8, 3).normalize();
  const stars = createStars(mobile);
  scene.add(stars.points);
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];
  const detailGeometries: THREE.BufferGeometry[] = [];
  const accentMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f879, transparent: true, opacity: 0.95 });
  const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f879, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  materials.push(accentMaterial, haloMaterial);

  // Dhaka: 23.8103 N, 90.4125 E. The marker lives on the globe and turns with it.
  const latitude = THREE.MathUtils.degToRad(90 - 23.8103);
  const longitude = THREE.MathUtils.degToRad(90.4125 + 180);
  const dhakaDirection = new THREE.Vector3(
    -Math.sin(latitude) * Math.cos(longitude),
    Math.cos(latitude),
    Math.sin(latitude) * Math.sin(longitude),
  );
  const markerGeometry = new THREE.SphereGeometry(0.022, 16, 12);
  const haloGeometry = new THREE.RingGeometry(0.038, 0.052, 32);
  detailGeometries.push(markerGeometry, haloGeometry);
  const marker = new THREE.Mesh(markerGeometry, accentMaterial);
  marker.position.copy(dhakaDirection).multiplyScalar(1.018);
  const markerHalo = new THREE.Mesh(haloGeometry, haloMaterial);
  markerHalo.position.copy(dhakaDirection).multiplyScalar(1.021);
  markerHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dhakaDirection);
  globe.add(marker, markerHalo);

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 128 }, (_, index) => {
    const angle = index / 128 * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * 1.16, Math.sin(angle) * 1.16, 0);
  }));
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xd9f879, transparent: true, opacity: 0.3, depthWrite: false });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.set(1.08, 0.2, -0.28);
  scene.add(orbit);
  detailGeometries.push(orbitGeometry);
  materials.push(orbitMaterial);
  const orbitalSystem = new THREE.Group();
  scene.add(orbitalSystem);
  orbitalSystem.add(orbit);
  const outerOrbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  outerOrbit.scale.setScalar(1.3);
  outerOrbit.rotation.set(0.6, -0.3, 0.8);
  orbitalSystem.add(outerOrbit);
  const satellite = new THREE.Mesh(markerGeometry, accentMaterial);
  satellite.scale.setScalar(.65);
  orbitalSystem.add(satellite);
  const cartographyGeometry = new THREE.SphereGeometry(1.012, 24, 12);
  const cartographyMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f879, wireframe: true, transparent: true, opacity: .035, depthWrite: false });
  const cartography = new THREE.Mesh(cartographyGeometry, cartographyMaterial);
  globe.add(cartography);
  detailGeometries.push(cartographyGeometry);
  materials.push(cartographyMaterial);
  let disposed = false;
  let ready = false;
  let paused = false;
  let frame = 0;
  let last = 0;
  let progress = 0;
  let target = 0;
  let velocity = 0;
  let maxScroll = 1;
  let spin = 0;
  let pointerX = 0;
  let pointerY = 0;
  let viewX = 0;
  let viewY = 0;
  let chapterStops = [0, .18, .35, .78, 1];

  function load(name: string, color = false) {
    return new Promise<THREE.Texture>((resolve, reject) => {
      new THREE.TextureLoader().load(`/earth-3d/${name}-${mobile ? "mobile" : "desktop"}.webp`, texture => {
        if (disposed) { texture.dispose(); reject(new Error("Scene disposed")); return; }
        texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        textures.push(texture);
        resolve(texture);
      }, undefined, reject);
    });
  }

  function material(fragmentShader: string, uniforms: THREE.ShaderMaterialParameters["uniforms"], extra: THREE.ShaderMaterialParameters = {}) {
    const result = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, ...extra });
    materials.push(result);
    return result;
  }

  function draw() {
    const narrow = innerWidth <= 700;
    // Each composition is tied to a real chapter, so content and viewport changes
    // keep the camera journey aligned with the page in either scroll direction.
    const shots = narrow
      ? [[.12, -.03, .63, 4.3], [-.45, .15, 1.05, 4.3], [.35, .3, .6, 4.8], [-.3, -.1, .85, 4.6], [0, -2.0, 1.7, 4.5]]
      : [[.95, -.08, 1.12, 4.5], [-1.55, .1, 1.8, 4.4], [1.9, .2, 1.1, 5.3], [-1.8, -.2, 1.6, 5], [.6, -2.9, 2.75, 4.8]];
    let index = 0;
    while (index < chapterStops.length - 2 && progress > chapterStops[index + 1]) index++;
    const fraction = THREE.MathUtils.clamp((progress - chapterStops[index]) / Math.max(.001, chapterStops[index + 1] - chapterStops[index]), 0, 1);
    const blend = fraction * fraction * (3 - 2 * fraction);
    const shot = shots[index].map((value, axis) => THREE.MathUtils.lerp(value, shots[index + 1][axis], blend));
    camera.position.set(viewX * .075, viewY * .05, shot[3]);
    globe.position.set(shot[0], shot[1], 0);
    globe.scale.setScalar(shot[2]);
    orbitalSystem.position.copy(globe.position);
    orbitalSystem.scale.copy(globe.scale);
    orbitalSystem.rotation.z = progress * .9;
    globe.rotation.set(.18 + Math.sin(progress * Math.PI * 2) * .3, 2.9 + progress * Math.PI * 3 + spin, -.16 + progress * .55);
    outerOrbit.rotation.z = spin * .3 + progress;
    satellite.position.set(Math.cos(spin * 3) * 1.5, Math.sin(spin * 3) * .85, Math.sin(spin * 3) * .7);
    markerHalo.scale.setScalar(1 + Math.sin(spin * 20) * .2);
    cartographyMaterial.opacity = .025 + Math.sin(progress * Math.PI) * .045;
    light.set(-2 + progress * 3, 1.8, 3 - Math.sin(progress * Math.PI) * 2).normalize();
    stars.points.rotation.set(viewY * .003, progress * .17 + viewX * .006, progress * -.08);
    renderer.render(scene, camera);
    canvas.dataset.progress = progress.toFixed(5);
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || !ready || paused || document.hidden) return;
    const dt = Math.min((now - last) / 1000 || 1 / 60, 0.05);
    last = now;
    spin += dt * .025;
    viewX = THREE.MathUtils.lerp(viewX, pointerX, 1 - Math.exp(-dt * 3));
    viewY = THREE.MathUtils.lerp(viewY, pointerY, 1 - Math.exp(-dt * 3));
    stars.material.uniforms.time.value = now / 1000;
    // Exact critically damped spring: stable at any refresh rate, in both directions.
    const frequency = 24;
    const delta = progress - target;
    const impulse = velocity + frequency * delta;
    const decay = Math.exp(-frequency * dt);
    progress = target + (delta + impulse * dt) * decay;
    velocity = (velocity - frequency * impulse * dt) * decay;
    if (Math.abs(progress - target) < 0.00001 && Math.abs(velocity) < 0.0001) {
      progress = target;
      velocity = 0;
    }
    draw();
    frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!frame && ready && !disposed && !paused && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function scroll() { target = Math.max(0, Math.min(1, scrollY / maxScroll)); wake(); }
  function pointer(event: PointerEvent) { pointerX = event.clientX / innerWidth * 2 - 1; pointerY = event.clientY / innerHeight * 2 - 1; }
  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    chapterStops = ["departure", "signal", "work", "experience", "contact"].map((id, index) => {
      if (index === 4) return 1;
      const section = document.getElementById(id);
      return section ? Math.min(.98, (section.getBoundingClientRect().top + scrollY) / maxScroll) : index / 4;
    });
    scroll();
    if (paused && ready) draw();
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { resize(); wake(); }
  }
  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener("scroll", scroll);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", pointer);
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", contextLost);
    delete canvas.dataset.ready;
    delete canvas.dataset.progress;
    textures.forEach(texture => texture.dispose());
    materials.forEach(item => item.dispose());
    detailGeometries.forEach(item => item.dispose());
    geometry.dispose();
    stars.geometry.dispose();
    stars.material.dispose();
    renderer.dispose();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(document.body);
  addEventListener("scroll", scroll, { passive: true });
  addEventListener("resize", resize);
  addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  progress = target;

  void Promise.all([load("day", true), load("night", true), load("clouds"), load("ocean")]).then(async ([day, night, clouds, ocean]) => {
    if (disposed) return;
    globe.add(new THREE.Mesh(geometry, material(`
      uniform sampler2D dayMap, nightMap, oceanMap;
      uniform vec3 sunlight;
      varying vec2 vUv;
      varying vec3 vNormal, vPosition;
      void main() {
        vec3 n = normalize(vNormal);
        float incidence = dot(n, sunlight);
        vec3 view = normalize(cameraPosition - vPosition);
        vec3 halfLight = normalize(sunlight + view);
        vec3 day = texture2D(dayMap, vUv).rgb;
        vec3 night = texture2D(nightMap, vUv).rgb;
        float ocean = texture2D(oceanMap, vUv).r;
        float shine = pow(max(dot(n, halfLight), 0.0), 90.0) * ocean * max(incidence, 0.0);
        vec3 color = day * (0.04 + max(incidence, 0.0) * 1.15);
        color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), 0.27);
        color += night * (1.0 - smoothstep(-0.18, 0.12, incidence)) * 1.8;
        color += vec3(0.75, 0.85, 1.0) * shine * 0.4;
        color += vec3(0.04, 0.16, 0.32) * pow(1.0 - max(dot(n, view), 0.0), 4.0) * smoothstep(-0.2, 0.5, incidence);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `, { dayMap: { value: day }, nightMap: { value: night }, oceanMap: { value: ocean }, sunlight: { value: light } })));
    const cloudShell = new THREE.Mesh(geometry, material(`
      uniform sampler2D cloudMap;
      uniform vec3 sunlight;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        float density = texture2D(cloudMap, vUv).r;
        float illumination = 0.035 + max(dot(normalize(vNormal), sunlight), 0.0);
        gl_FragColor = vec4(vec3(illumination), density * 0.85);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `, { cloudMap: { value: clouds }, sunlight: { value: light } }, { transparent: true, depthWrite: false }));
    cloudShell.scale.setScalar(1.006);
    globe.add(cloudShell);
    const atmosphere = new THREE.Mesh(geometry, material(`
      uniform vec3 sunlight;
      varying vec3 vNormal, vPosition;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 view = normalize(cameraPosition - vPosition);
        float rim = pow(clamp(1.0 + dot(n, view), 0.0, 1.0), 7.0);
        float daylight = smoothstep(-0.35, 0.6, dot(n, sunlight));
        gl_FragColor = vec4(vec3(0.42, 0.65, 0.64), rim * daylight * 0.65);
        #include <colorspace_fragment>
      }
    `, { sunlight: { value: light } }, { side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    atmosphere.scale.setScalar(1.045);
    globe.add(atmosphere);
    await renderer.compileAsync(scene, camera);
    if (disposed) return;
    ready = true;
    draw();
    canvas.dataset.ready = "true";
    wake();
  }).catch(dispose);

  return { dispose, setPaused(value: boolean) {
    paused = value;
    if (paused) { cancelAnimationFrame(frame); frame = 0; }
    else wake();
  } };
}
