import * as THREE from 'three';
import layerFragment from '../shaders/layer.fragment.glsl?raw';
import layerVertex from '../shaders/layer.vertex.glsl?raw';
import {useScene} from '@motion-canvas/core/lib/utils';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';

import layerTexture from '../images/layer.png';
import {Vector3} from 'three';

const loader = new THREE.TextureLoader();
const texturePromise = loader.loadAsync(layerTexture);

const layerMaterial = new THREE.ShaderMaterial({
  uniforms: {
    map: {value: null},
    layer: {value: new Vector3(1 / 6, 0, 0)},
  },
  vertexShader: layerVertex,
  fragmentShader: layerFragment,
  transparent: true,
  depthTest: false,
});

const threeScene = new THREE.Scene();

const plane = new THREE.PlaneGeometry();
const layers: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
for (let i = 0; i < 5; i++) {
  const material = layerMaterial.clone();
  const mesh = new THREE.Mesh(plane, material);
  material.uniforms.layer.value.y = i;
  mesh.renderOrder = i;
  layers.push(mesh);
}
threeScene.add(...layers);

const camera = new THREE.PerspectiveCamera(90);
const orbit = new THREE.Group();
orbit.add(camera);
threeScene.add(orbit);

const parallax = createSignal(0);

const apply = createComputed(() => {
  for (const layer of layers) {
    layer.material.uniforms.layer.value.z = parallax();
  }
});

async function setup() {
  const texture = await texturePromise;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  parallax.reset();

  for (let i = 0; i < layers.length; i++){
    const layer = layers[i];
    layer.material.uniforms.map.value = texture;
    layer.position.set((i - 2) * 260, 0, 0);
    layer.scale.set(0, 0, 1);
  }
  orbit.position.set(0, 0, 0);
  orbit.rotation.set(0, 0, 0);
  camera.rotation.set(0, 0, 0);
  camera.position.set(0, 0, 540);

  useScene().LifecycleEvents.onBeginRender.subscribe(apply);
}

export {threeScene, camera, layers, setup, orbit, parallax};
