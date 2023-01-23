import * as THREE from 'three';
import normalFragment from '../shaders/normalSmooth.fragment.glsl?raw';
import normalVertex from '../shaders/normalSmooth.vertex.glsl?raw';
import {useScene} from '@motion-canvas/core/lib/utils';
import {createComputed} from '@motion-canvas/core/lib/signals';
import {Float32BufferAttribute} from 'three';

const threeScene = new THREE.Scene();

const normalMaterial = new THREE.ShaderMaterial({
  fragmentShader: normalFragment,
  vertexShader: normalVertex,
});

const plane = new THREE.PlaneGeometry();
let normals = <Float32BufferAttribute>plane.attributes.normal;
for (let i = 0; i < normals.count; i++) {
  normals.setXYZ(i, 0.5, 1, 1);
}
const ground = new THREE.Mesh(plane, normalMaterial);
threeScene.add(ground);

const circleGeo = new THREE.CircleGeometry(1, 32);
const positions = <Float32BufferAttribute>circleGeo.attributes.position;
normals = <Float32BufferAttribute>circleGeo.attributes.normal;
for (let i = 0; i < normals.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  normals.setXYZ(i, (x + 1) / 2, (y + 1) / 2, 1);
}

const circle = new THREE.Mesh(circleGeo, normalMaterial);
circle.renderOrder = 1;
threeScene.add(circle);

const camera = new THREE.OrthographicCamera();
const orbit = new THREE.Group();
orbit.add(camera);
threeScene.add(orbit);

const apply = createComputed(() => {});

async function setup() {
  circle.scale.setScalar(108);
  circle.position.set(144, -24 * 2.25, 0);
  ground.scale.set(1200, 200, 1);
  ground.position.set(-48, -200, 0);
  ground.rotation.set(0, 0, 0.06);

  orbit.position.set(0, 0, 0);
  orbit.rotation.set(0, 0, 0);
  camera.rotation.set(0, 0, 0);
  camera.position.set(0, 0, 10);

  useScene().LifecycleEvents.onBeginRender.subscribe(apply);
}

export {threeScene, camera, setup, orbit};
