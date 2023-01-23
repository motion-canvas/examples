import * as THREE from 'three';
import normalFragment from '../shaders/normal.fragment.glsl?raw';
import normalVertex from '../shaders/normal.vertex.glsl?raw';
import {Scene, Camera, WebGLRenderer, Float32BufferAttribute} from 'three';
import {useScene} from '@motion-canvas/core/lib/utils';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';

import normalTexture from '../images/frames/normals.png';
import colorTexture from '../images/frames/colors.png';
import {createLight} from './createLight';

const textureLoader = new THREE.TextureLoader();
const texturePromise = textureLoader.loadAsync(normalTexture);
const textureColorPromise = textureLoader.loadAsync(colorTexture);

const normalMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: normalVertex,
  fragmentShader: normalFragment,
  transparent: true,
  side: THREE.DoubleSide,
});

const threeScene = new THREE.Scene();
const light = createLight();

const lightOrbit = new THREE.Group();
const lightOffset = new THREE.Group();
lightOrbit.position.set(200, 0, 0);
lightOffset.position.set(-200, 0, 0);
lightOffset.add(light.mesh);
lightOrbit.add(lightOffset);
threeScene.add(lightOrbit);

const boxGeo = new THREE.PlaneGeometry(1, 1, 2, 2);
const normals = <Float32BufferAttribute>boxGeo.attributes.normal;
normals.setXYZ(2, 0.5, 1, 0);
normals.setXYZ(8, 1, 0.5, 0);
normals.setXYZ(6, 0.5, 0, 0);
normals.setXYZ(0, 0, 0.5, 0);

boxGeo.setIndex([0, 4, 2, 2, 4, 8, 8, 4, 6, 6, 4, 0]);

const box = new THREE.Mesh(boxGeo, normalMaterial);

const camera = new THREE.OrthographicCamera();
threeScene.add(camera);

const orbit = createSignal(0);

const apply = createComputed(() => {
  lightOrbit.rotation.set(0, 0, (orbit() / 180) * Math.PI);
});

async function setup() {
  orbit.reset();

  box.position.set(-220, 0, 0);
  box.scale.setScalar(240);
  box.rotation.set(0, 0, Math.PI / 3);

  light.setup();
  light.mesh.scale.setScalar(1920);
  light.mesh.position.set(-745, 0, 0);

  camera.position.set(0, 0, 10);

  const texture = await texturePromise;
  const textureColor = await textureColorPromise;
  texture.minFilter =
    texture.magFilter =
    textureColor.minFilter =
    textureColor.magFilter =
      THREE.NearestFilter;
  light.material.uniforms.normals.value = texture;
  light.material.uniforms.colors.value = textureColor;

  useScene().LifecycleEvents.onBeginRender.subscribe(apply);
}

function render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);
}

export const quad = light.mesh;

export const intensity = light.intensity;
export const distance = light.distance;
export const angleFrom = light.angleFrom;
export const angleTo = light.angleTo;
export const normalColor = light.normalColor;
export const normalIntensity = light.normalIntensity;
export const lightTint = light.lightTint;
export const volume = light.volume;
export const color = light.color;

export {threeScene, camera, setup, render, orbit};
