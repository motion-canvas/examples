import {Color, Vector3, Vector4} from 'three';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';
import {useScene} from '@motion-canvas/core/lib/utils';
import {Color as MCColor} from '@motion-canvas/core/lib/types';
import * as THREE from 'three';

import lightFragment from '../shaders/light.fragment.glsl?raw';
import lightVertex from '../shaders/light.vertex.glsl?raw';

export function createLightMaterial() {
  const intensity = createSignal(1);
  const distance = createSignal(1.415);
  const angleFrom = createSignal(361);
  const angleTo = createSignal(360);
  const normalColor = createSignal(0);
  const normalIntensity = createSignal(0);
  const color = createSignal(0);
  const volume = createSignal(0);
  const lightTint = MCColor.createSignal('#ffffff');

  const material = new THREE.ShaderMaterial({
    uniforms: {
      intensity: {value: 1},
      distance: {value: 1},
      angleRange: {value: new Vector3(-1, -1, 0)},
      normalVisibility: {value: new Vector4()},
      lightTint: {value: null},
      normals: {value: null},
      colors: {value: null},
    },
    vertexShader: lightVertex,
    fragmentShader: lightFragment,
    transparent: true,
    depthTest: false,
  });

  const update = createComputed(() => {
    material.uniforms.intensity.value = intensity();
    material.uniforms.distance.value = distance();
    material.uniforms.angleRange.value.x = (angleFrom() * Math.PI) / 360;
    material.uniforms.angleRange.value.y = (angleTo() * Math.PI) / 360;
    material.uniforms.normalVisibility.value.x = normalColor();
    material.uniforms.normalVisibility.value.y = normalIntensity();
    material.uniforms.normalVisibility.value.z = color();
    material.uniforms.normalVisibility.value.w = volume();
    material.uniforms.lightTint.value = new Color(
      new MCColor(lightTint()).serialize(),
    );
  });

  function setup() {
    intensity.reset();
    distance.reset();
    angleFrom.reset();
    angleTo.reset();
    normalColor.reset();
    normalIntensity.reset();
    lightTint.reset();
    volume.reset();
    color.reset();

    useScene().LifecycleEvents.onBeginRender.subscribe(update);
  }

  return {
    material,
    setup,
    intensity,
    distance,
    angleFrom,
    angleTo,
    normalColor,
    normalIntensity,
    lightTint,
    volume,
    color,
  };
}

export function createLight() {
  const material = createLightMaterial();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material.material);

  return {
    mesh,
    ...material,
  };
}
