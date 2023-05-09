import {createLight, createLightMaterial} from './createLight';
import * as THREE from 'three';
import {createShadow, createShadowMaterial} from './createShadow';
import {useScene} from '@motion-canvas/core/lib/utils';
import {createComputed} from '@motion-canvas/core/lib/signals';
import {Camera, Scene, WebGLRenderer} from 'three';
import normalFragment from '../shaders/normalSmooth.fragment.glsl?raw';
import normalVertex from '../shaders/normalSmooth.vertex.glsl?raw';

const camera = new THREE.OrthographicCamera();
const normalMap = new THREE.WebGLRenderTarget(80, 45);
const colorMap = new THREE.WebGLRenderTarget(80, 45);

const globalLightScene = new THREE.Scene();
const globalLight = createLight();
globalLightScene.add(globalLight.mesh);
const lightScene = new THREE.Scene();
const light = createLight();
lightScene.add(light.mesh);
const shadowAScene = new THREE.Scene();
const shadowA = createShadow();
shadowAScene.add(shadowA);
const shadowBScene = new THREE.Scene();
const shadowB = createShadow();
shadowBScene.add(shadowB);
const shadowCScene = new THREE.Scene();
const shadowC = createShadow();
shadowCScene.add(shadowC);

import normals from '../images/frames/box_normal.png';
import {Vector2} from '@motion-canvas/core/lib/types';

const loader = new THREE.TextureLoader();
const texturePromise = loader.loadAsync(normals);

const lightPos = Vector2.createSignal(0);

const basicMaterial = new THREE.MeshBasicMaterial({
  color: 0x777777,
  side: THREE.DoubleSide,
});

const mainShadow = createShadowMaterial();
const stencilShadow = createShadowMaterial();
const outputShadow = createShadowMaterial();
const outputLight = createLightMaterial();

const unshadowMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
  colorWrite: false,
  stencilWrite: true,
  stencilRef: 0,
  stencilZPass: THREE.ReplaceStencilOp,
});
const normalMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  fragmentShader: normalFragment,
  vertexShader: normalVertex,
});

const update = createComputed(() => {
  light.mesh.position.setX(lightPos.x()).setY(lightPos.y());
  for (const material of [mainShadow, stencilShadow, outputShadow]) {
    material.update();
    material.material.uniforms.lightWS.value.x = lightPos.x();
    material.material.uniforms.lightWS.value.y = lightPos.y();
  }
});

async function setup() {
  useScene().lifecycleEvents.onBeginRender.subscribe(update);
  light.setup();
  outputLight.setup();
  globalLight.setup();
  const texture = await texturePromise;
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  normalMaterial.uniforms.map = {value: texture};
  for (const material of [mainShadow, stencilShadow, outputShadow]) {
    material.setup();
  }

  lightPos.reset();

  light.mesh.position.setScalar(0);
  light.mesh.scale.setScalar(1920 * 2);
  light.material.uniforms.normals.value = normalMap.texture;
  light.material.uniforms.colors.value = colorMap.texture;

  light.material.stencilRef = 1;
  light.material.stencilFunc = THREE.NotEqualStencilFunc;
  light.material.stencilWrite = true;

  outputLight.material.uniforms.normals.value = normalMap.texture;
  outputLight.material.uniforms.colors.value = colorMap.texture;
  outputLight.material.stencilRef = 1;
  outputLight.material.stencilFunc = THREE.NotEqualStencilFunc;
  outputLight.material.stencilWrite = true;

  globalLight.material.stencilRef = 1;
  globalLight.material.stencilFunc = THREE.EqualStencilFunc;
  globalLight.material.stencilWrite = true;

  globalLight.mesh.scale.setScalar(1920);

  shadowA.renderOrder = 12;
  shadowA.scale.set(80, 240, 1);
  shadowA.position.set(640, -120, 0);
  shadowA.rotation.set(0, 0, -Math.PI / 4);

  shadowB.scale.set(160, 80, 1);
  shadowB.position.set(80, 320, 0);

  shadowC.scale.set(160, 160, 1);
  shadowC.position.set(-560, -200, 0);
  shadowC.rotation.set(0, 0, Math.PI / 7);

  camera.position.set(0, 0, 10);
}

function render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.autoClear = false;

  renderer.setRenderTarget(colorMap);
  renderer.setClearColor(0x444444);
  renderer.clear();
  shadowAScene.overrideMaterial = basicMaterial;
  shadowBScene.overrideMaterial = basicMaterial;
  shadowCScene.overrideMaterial = basicMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);

  renderer.setRenderTarget(normalMap);
  // renderer.setRenderTarget(null);
  renderer.setClearColor(0x0000000);
  renderer.clear();
  shadowAScene.overrideMaterial = normalMaterial;
  shadowBScene.overrideMaterial = normalMaterial;
  shadowCScene.overrideMaterial = normalMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);
  // return;

  renderer.setRenderTarget(null);
  renderer.clear();
  shadowAScene.overrideMaterial = mainShadow.material;
  shadowBScene.overrideMaterial = mainShadow.material;
  shadowCScene.overrideMaterial = mainShadow.material;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);
  shadowAScene.overrideMaterial = unshadowMaterial;
  shadowBScene.overrideMaterial = unshadowMaterial;
  shadowCScene.overrideMaterial = unshadowMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);

  lightScene.overrideMaterial = null;
  renderer.render(lightScene, camera);
}

function renderOutput(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.autoClear = false;

  renderer.setRenderTarget(colorMap);
  renderer.setClearColor(0x444444);
  renderer.clear();
  shadowAScene.overrideMaterial = basicMaterial;
  shadowBScene.overrideMaterial = basicMaterial;
  shadowCScene.overrideMaterial = basicMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);

  renderer.setRenderTarget(normalMap);
  // renderer.setRenderTarget(null);
  renderer.setClearColor(0x0000000);
  renderer.clear();
  shadowAScene.overrideMaterial = normalMaterial;
  shadowBScene.overrideMaterial = normalMaterial;
  shadowCScene.overrideMaterial = normalMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);
  // return;

  renderer.setRenderTarget(null);
  renderer.clear();
  shadowAScene.overrideMaterial = outputShadow.material;
  shadowBScene.overrideMaterial = outputShadow.material;
  shadowCScene.overrideMaterial = outputShadow.material;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);
  shadowAScene.overrideMaterial = unshadowMaterial;
  shadowBScene.overrideMaterial = unshadowMaterial;
  shadowCScene.overrideMaterial = unshadowMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);

  lightScene.overrideMaterial = outputLight.material;
  renderer.render(lightScene, camera);
}

function renderStencil(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.autoClear = false;
  renderer.setClearColor(0x000000);
  renderer.clear();

  shadowAScene.overrideMaterial = stencilShadow.material;
  shadowBScene.overrideMaterial = stencilShadow.material;
  shadowCScene.overrideMaterial = stencilShadow.material;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);
  shadowAScene.overrideMaterial = unshadowMaterial;
  shadowBScene.overrideMaterial = unshadowMaterial;
  shadowCScene.overrideMaterial = unshadowMaterial;
  renderer.render(shadowAScene, camera);
  renderer.render(shadowBScene, camera);
  renderer.render(shadowCScene, camera);

  renderer.render(globalLightScene, camera);
}

export {
  light,
  lightPos,
  setup,
  lightScene,
  mainShadow,
  stencilShadow,
  globalLight,
  outputShadow,
  outputLight,
  camera,
  render,
  renderStencil,
  renderOutput,
};
