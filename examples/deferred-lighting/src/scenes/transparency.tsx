import {makeScene2D} from '@motion-canvas/2d';
import {all, waitUntil} from '@motion-canvas/core/lib/flow';
import {Three, Vector} from '../components';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Direction, Vector2} from '@motion-canvas/core/lib/types';

import * as THREE from 'three';
import normalFragment from '../shaders/normalSmooth.fragment.glsl?raw';
import normalVertex from '../shaders/normalSmooth.vertex.glsl?raw';
import {createLight} from '../three/createLight';

import circleNormalImage from '../images/frames/ball_normal.png';
import {applyViewStyles, Colors} from '../styles';
import {useScene, createRef} from '@motion-canvas/core/lib/utils';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {Layout} from '@motion-canvas/2d/lib/components';
import {Color} from '@motion-canvas/core/lib/types';

const textureLoader = new THREE.TextureLoader();
const circleNormalTexPromise = textureLoader.loadAsync(circleNormalImage);

const normalRT = new THREE.WebGLRenderTarget(80, 45);
const colorRT = new THREE.WebGLRenderTarget(80, 45, {stencilBuffer: true});

const normalMaterial = new THREE.ShaderMaterial({
  fragmentShader: normalFragment,
  vertexShader: normalVertex,
  uniforms: {
    transparency: {value: 0},
  },
  transparent: true,
});
const normalMaterialA = new THREE.ShaderMaterial({
  fragmentShader: normalFragment,
  vertexShader: normalVertex,
  uniforms: {
    transparency: {value: 0.5},
  },
  transparent: true,
});

const circleMaterial = new THREE.MeshBasicMaterial({
  color: Colors.NUMBER,
  stencilWrite: true,
  stencilZPass: THREE.ReplaceStencilOp,
  stencilRef: 1,
});
const circleMaterialA = new THREE.MeshBasicMaterial({
  transparent: true,
  color: Colors.KEYWORD,
  opacity: 0.5,

  stencilWrite: true,
  stencilRef: 1,
});

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const circleNormalTex: THREE.Texture = yield circleNormalTexPromise;
  circleNormalTex.minFilter = circleNormalTex.magFilter = THREE.NearestFilter;
  normalMaterialA.uniforms.map = normalMaterial.uniforms.map = {
    value: circleNormalTex,
  };

  const threeScene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera();
  camera.rotation.set(0, 0, 0);
  camera.position.set(0, 0, 10);

  const orbit = new THREE.Group();
  orbit.add(camera);
  orbit.position.set(0, 0, 0);
  orbit.rotation.set(0, 0, 0);
  threeScene.add(orbit);

  const circleGeo = new THREE.CircleGeometry(1, 32);
  const positions = circleGeo.attributes
    .position as THREE.Float32BufferAttribute;
  const normals = circleGeo.attributes.normal as THREE.Float32BufferAttribute;
  for (let i = 0; i < normals.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    normals.setXYZ(i, (x + 1) / 2, (y + 1) / 2, 1);
  }
  const circle = new THREE.Mesh(circleGeo, circleMaterial as THREE.Material);
  circle.renderOrder = 1;
  circle.scale.setScalar(108);
  circle.position.set(72, -6, 0);
  threeScene.add(circle);
  const circleA = new THREE.Mesh(circleGeo, circleMaterialA as THREE.Material);
  circleA.renderOrder = 1;
  circleA.scale.setScalar(108);
  circleA.position.set(-72, -6, 0);
  threeScene.add(circleA);

  const light = createLight();
  light.setup();
  light.material.uniforms.normals = {value: normalRT.texture};
  light.material.uniforms.colors = {value: colorRT.texture};
  light.material.uniforms.opacity = {value: 1};
  light.mesh.scale.setScalar(4000);
  light.mesh.position.set(-540, 240, 0);
  light.mesh.rotation.set(0, 0, Math.PI / -8);
  light.intensity(0);
  light.normalIntensity(1);
  light.color(1);
  light.distance(0);
  light.volume(1);
  light.angleTo(0);
  light.angleFrom(120);

  const global = createLight();
  global.setup();
  global.material.uniforms.normals = {value: normalRT.texture};
  global.material.uniforms.colors = {value: colorRT.texture};
  global.material.uniforms.opacity = {value: 1};
  global.mesh.scale.setScalar(1920);
  global.normalIntensity(0);
  global.color(1);
  global.distance(1);
  global.intensity(1);

  circleMaterialA.stencilFunc = THREE.AlwaysStencilFunc;

  const opacity = createSignal(0);
  const normalOpacity = createSignal(0.5);
  const circleColor = Color.createSignal(Colors.KEYWORD);
  const circleX = createSignal(-72);
  const circleY = createSignal(-6);
  useScene().lifecycleEvents.onBeginRender.subscribe(() => {
    normalMaterialA.uniforms.transparency.value = normalOpacity();
    circleMaterialA.opacity = opacity();
    circleMaterialA.color = new THREE.Color(circleColor().serialize());
    circleA.position.set(circleX(), circleY(), 0);
  });

  const colorView = createRef<Three>();
  const normalView = createRef<Three>();
  const vector = createRef<Vector>();

  yield view.add(
    <>
      <Three
        ref={colorView}
        quality={1 / 24}
        width={1920}
        height={1080}
        zoom={540}
        camera={camera}
        scene={threeScene}
        onRender={renderer => {
          renderer.autoClear = false;

          circle.material = normalMaterial;
          circleA.material = normalMaterialA;
          renderer.setRenderTarget(normalRT);
          renderer.setClearColor(0, 0);
          renderer.clear();
          renderer.render(threeScene, camera);

          circle.material = circleMaterial;
          circleA.material = circleMaterialA;
          renderer.setRenderTarget(colorRT);
          renderer.setClearColor(0x141414, 1);
          renderer.clear();
          renderer.render(threeScene, camera);

          renderer.setRenderTarget(null);
          renderer.clear();
          renderer.render(global.mesh, camera);
          renderer.render(light.mesh, camera);
        }}
      />
      <Three
        ref={normalView}
        opacity={0}
        quality={1 / 24}
        width={1920}
        height={1080}
        zoom={540}
        camera={camera}
        scene={threeScene}
        onRender={renderer => {
          renderer.autoClear = false;

          circle.material = normalMaterial;
          circleA.material = normalMaterialA;
          renderer.setRenderTarget(null);
          renderer.setClearColor(0x141414, 1);
          renderer.clear();
          renderer.render(threeScene, camera);
        }}
      />
      <Layout y={48} x={-12}>
        <Vector
          ref={vector}
          stroke={'white'}
          end={0}
          lineWidth={8}
          arrowSize={24}
        />
      </Layout>
    </>,
  );

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('show_circle');
  yield* opacity(0.5, 0.5);

  yield* waitUntil('show_lights');
  yield* all(light.intensity(1, 0.5), global.intensity(0, 0.5));

  yield* waitUntil('show_normals');
  vector().to(() => {
    normalOpacity();
    const parent = vector().parent();
    const color = normalView().getColorAtPoint(parent.absolutePosition());
    return new Vector2((color.r - 0.5) * 480, (color.g - 0.5) * 480);
  });
  yield* all(normalView().opacity(1, 0.5), vector().end(1, 0.5));

  yield* waitUntil('blend_normals');
  yield* normalOpacity(1, 1);
  yield* normalOpacity(0, 1);
  yield* normalOpacity(0.5, 1);

  yield* waitUntil('hide_normals');
  yield* all(normalView().opacity(0, 0.3), vector().end(0, 0.3));

  yield* waitUntil('inherit');
  yield* all(normalOpacity(1, 0.5));

  yield* waitUntil('sometimes');
  circleMaterialA.stencilFunc = THREE.EqualStencilFunc;
  circleColor('white');
  opacity(1);
  yield* waitUntil('decals');
  yield* all(circleX(72, 1.25), circleY(24 * 5.25, 1));

  yield* waitUntil('next');
});
