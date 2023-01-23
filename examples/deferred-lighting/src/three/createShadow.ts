import * as THREE from 'three';

import shadowFragment from '../shaders/shadow.fragment.glsl?raw';
import shadowVertex from '../shaders/shadow.vertex.glsl?raw';
import {Vector3} from 'three';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';

export interface ShadowProps {
  lightX?: number;
  lightY?: number;
  strength?: number;
}

export function createShadowMaterial(props: ShadowProps = {}) {
  const material = new THREE.ShaderMaterial({
    fragmentShader: shadowFragment,
    vertexShader: shadowVertex,
    side: THREE.DoubleSide,
    uniforms: {
      lightWS: {value: new Vector3(-960, 0, 0)},
      strength: {value: 1},
    },
    depthTest: false,
    transparent: true,
    colorWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilZPass: THREE.ReplaceStencilOp,
  });

  const strength = createSignal(props.strength ?? 1);

  const update = createComputed(() => {
    material.uniforms.strength.value = strength();
  });

  const setup = () => {
    strength.reset();
  };

  return {material, update, setup, strength};
}

export function createShadow() {
  const geometry = new THREE.BufferGeometry();

  // prettier-ignore
  const vertices = new Float32Array([
    1, 1, 0,
    1, 1, 0,
    1, -1, 0,
    1, -1, 0,
    -1, -1, 0,
    -1, -1, 0,
    -1, 1, 0,
    -1, 1, 0,
  ]);

  // prettier-ignore
  const normals = new Float32Array([
    0, 1, 0,
    1, 0, 0,
    1, 0, 0,
    0, -1, 0,
    0, -1, 0,
    -1, 0, 0,
    -1, 0, 0,
    0, 1, 0,
  ]);

  // prettier-ignore
  geometry.setIndex([
    0, 2, 4,
    0, 1, 2,
    2, 3, 4,
    4, 6, 0,
    4, 5, 6,
    6, 7, 0,
  ]);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  return new THREE.Mesh(geometry);
}
