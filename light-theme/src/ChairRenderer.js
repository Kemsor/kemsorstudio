import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A volumetric director's chair: every rail, leg and canvas panel has real depth.
export function createChairRenderer(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 8, 18);
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 30);
  camera.position.set(0, 2.75, 7.7);
  camera.lookAt(0, 1.48, 0);
  const chair = new THREE.Group();
  chair.scale.set(1.16, 1.03, 1.1);
  scene.add(chair);
  const grain = document.createElement('canvas');
  grain.width = 128; grain.height = 512;
  const ctx = grain.getContext('2d');
  ctx.fillStyle = '#321b10'; ctx.fillRect(0, 0, 128, 512);
  for (let x = 0; x < 128; x++) {
    ctx.strokeStyle = `rgba(${x % 3 ? '20,8,2' : '188,127,65'},${.08 + (Math.sin(x * 5.3) + 1) * .11})`;
    ctx.beginPath();
    for (let y = 0; y < 512; y += 8) { const dx = x + Math.sin(y / 53 + x) * 2; if (!y) ctx.moveTo(dx, y); else ctx.lineTo(dx, y); }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(grain);
  texture.colorSpace = THREE.SRGBColorSpace;
  const wood = new THREE.MeshStandardMaterial({ map: texture, roughness: .36, metalness: .05 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc4994f, metalness: .82, roughness: .26 });
  const canvas = new THREE.MeshStandardMaterial({ color: 0x570b20, roughness: .9, side: THREE.DoubleSide });
  const seam = new THREE.MeshStandardMaterial({ color: 0xbb3c4f, roughness: .9 });
  const add = (geometry, material, parent = chair) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const rail = (a, b, width = .105, depth = .10, material = wood) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = add(new RoundedBoxGeometry(width, start.distanceTo(end), depth, 2, .018), material);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    return mesh;
  };
  const bolt = (x, y, z) => {
    const mesh = add(new THREE.CylinderGeometry(.045, .045, .035, 20), brass);
    mesh.rotation.x = Math.PI / 2; mesh.position.set(x, y, z);
  };
  // Crossed folding legs on both front and rear faces.
  for (const z of [-.43, .43]) {
    rail([-.72, .06, z], [.64, 1.22, z], .13, .105);
    rail([.72, .06, z + .075], [-.64, 1.22, z + .075], .13, .105);
    bolt(0, .66, z + .14);
    for (const x of [-.67, .67]) bolt(x, 1.16, z + .12);
  }
  for (const x of [-.67, .67]) {
    rail([x, 1.19, -.56], [x, 1.19, .56], .14, .12);
    rail([x, 1.18, -.46], [x, 2.43, -.51], .095, .095);
    rail([x, 1.2, .43], [x, 1.69, .43], .095, .095);
    rail([x, 1.69, -.56], [x, 1.69, .57], .16, .1);
    rail([x, .17, -.42], [x, .17, .45], .07, .07);
    const cap = add(new THREE.CylinderGeometry(.06, .06, .035, 20), brass);
    cap.position.set(x, 2.43, -.51);
    for (const z of [-.42, .42]) {
      const plate = add(new RoundedBoxGeometry(.15, .12, .035, 2, .01), brass);
      plate.position.set(x, 1.16, z + .075);
    }
  }
  const seatGeometry = new THREE.PlaneGeometry(1.25, .98, 24, 20);
  const positions = seatGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getY(i);
    positions.setXYZ(i, x, 1.21 - .09 * Math.cos(x / 1.25 * Math.PI), z);
  }
  seatGeometry.computeVertexNormals(); add(seatGeometry, canvas);
  const backGeometry = new THREE.PlaneGeometry(1.27, .55, 24, 12);
  const back = backGeometry.attributes.position;
  for (let i = 0; i < back.count; i++) {
    const x = back.getX(i), y = back.getY(i);
    back.setXYZ(i, x, y + 2.12, -.5 - .055 * Math.cos(x / 1.27 * Math.PI));
  }
  backGeometry.computeVertexNormals(); add(backGeometry, canvas);
  seam.dispose();
  rail([-.61, 1.15, .49], [.61, 1.15, .49], .05, .04, brass);

  scene.add(new THREE.HemisphereLight(0xffedd2, 0x302222, 1.15));
  const key = new THREE.SpotLight(0xffdfb0, 80, 20, .55, .65, 1.5);
  key.position.set(-3, 6, 5); key.target.position.set(0, 1, 0);
  key.castShadow = true; key.shadow.mapSize.set(512, 512); key.shadow.bias = -.0005;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffc879, 2); rim.position.set(3, 4, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .65); fill.position.set(3, 2, 4); scene.add(fill);
  const floor = add(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x010101, roughness: 1 }), scene);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.025; floor.castShadow = false;
  let angle = Math.PI;
  const render = () => { chair.rotation.y = .32 + angle; renderer.render(scene, camera); };
  const resize = () => {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); render();
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  return {
    setRotation(degrees) { const next = degrees * Math.PI / 180; if (Math.abs(next - angle) < .001) return; angle = next; render(); },
    dispose() {
      observer.disconnect();
      const geometries = new Set(), materials = new Set();
      scene.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) materials.add(obj.material); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    }
  };
}
