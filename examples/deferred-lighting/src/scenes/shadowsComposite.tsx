import {makeScene2D} from '@motion-canvas/2d';
import {all, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {Three} from '../components';

import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {easeInExpo, easeOutExpo} from '@motion-canvas/core/lib/tweening';
import {range, createRef, useScene} from '@motion-canvas/core/lib/utils';
import {Img, Layout, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {applyViewStyles, Colors, WhiteLabel} from '../styles';
import lightIcon from '../images/icons/point_light.svg';
import {createShadow, createShadowMaterial} from '../three/createShadow';
import * as THREE from 'three';
import {createLight} from '../three/createLight';
import normals from '../images/frames/box_normal.png';
import normalFragment from '../shaders/normalSmooth.fragment.glsl?raw';
import normalVertex from '../shaders/normalSmooth.vertex.glsl?raw';
import {Vector2} from '@motion-canvas/core/lib/types';

const loader = new THREE.TextureLoader();
const texturePromise = loader.loadAsync(normals);

const camera = new THREE.OrthographicCamera();
camera.position.setZ(10);
const normalMap = new THREE.WebGLRenderTarget(80, 45);
const colorMap = new THREE.WebGLRenderTarget(80, 45);

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
const clearColor = 0x444444;
const basicMaterial = new THREE.MeshBasicMaterial({
  color: 0x777777,
  side: THREE.DoubleSide,
});

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const texture = yield texturePromise;
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  normalMaterial.uniforms.map = {value: texture};

  const three = createRef<Three>();
  const threeStencilA = createRef<Three>();
  const threeOut = createRef<Three>();
  const threeRect = createRef<Rect>();
  const light = createRef<Img>();

  const sceneLabel = createRef<Txt>();
  const outputRect = createRef<Rect>();
  const stencilRect = createRef<Rect>();
  const selection = createRef<Rect>();
  const stencilLabel = createRef<Txt>();

  let outputStencil = (_: THREE.WebGLRenderer) => {
    // do nothing
  };

  yield view.add(
    <>
      <Rect
        ref={selection}
        stroke={Colors.FUNCTION}
        width={800}
        height={450}
        radius={8}
      />
      <Rect
        ref={threeRect}
        fill={'#242424'}
        width={800}
        height={450}
        radius={8}
        clip
        x={-400 - 20}
        y={225 + 20}
      >
        <Three
          ref={three}
          width={800}
          height={450}
          quality={1 / 10}
          camera={camera}
          onRender={renderer => renderer.clear()}
          zoom={45}
        />
        <Img ref={light} width={48} src={lightIcon} opacity={0} />
        <Txt
          layout={false}
          ref={sceneLabel}
          {...WhiteLabel}
          offsetX={-1}
          offsetY={-1}
          x={() => threeRect().size.x() / -2 + 20}
          y={() => threeRect().size.y() / -2 + 10}
          cache
        >
          SCENE
        </Txt>
      </Rect>

      <Rect
        ref={outputRect}
        width={800}
        height={450}
        radius={8}
        clip
        x={400 + 20}
        y={-225 - 20}
      >
        <Three
          ref={threeOut}
          width={800}
          height={450}
          quality={1 / 10}
          camera={camera}
          onRender={renderer => renderer.clear()}
          zoom={45}
        >
          <Txt
            layout={false}
            {...WhiteLabel}
            offsetX={-1}
            offsetY={-1}
            x={-800 / 2 + 20}
            y={-450 / 2 + 10}
            cache
          >
            RESULT
          </Txt>
        </Three>
      </Rect>

      <Rect
        ref={stencilRect}
        width={800}
        height={450}
        radius={8}
        clip
        x={400 + 20}
        y={225 + 20}
      >
        <Three
          ref={threeStencilA}
          width={800}
          height={450}
          quality={1 / 10}
          camera={camera}
          onRender={renderer => renderer.clear()}
          zoom={45}
        >
          <Txt
            ref={stencilLabel}
            layout={false}
            {...WhiteLabel}
            offsetX={-1}
            offsetY={-1}
            x={-800 / 2 + 20}
            y={-450 / 2 + 10}
          >
            STENCIL
          </Txt>
        </Three>
      </Rect>
    </>,
  );

  function* select(node: Layout) {
    yield* selection().lineWidth(0, 0.3, easeInExpo);
    if (node) {
      selection().position(node.position()).size(node.size());
      yield selection().lineWidth(8, 0.3, easeOutExpo);
    }
  }

  const lightPos = Vector2.createSignal([4, 24]);
  const shadow = createShadowMaterial();
  const pointLight = createLight();
  pointLight.setup();
  pointLight.intensity(1);
  pointLight.distance(0);
  pointLight.normalIntensity(1);
  pointLight.color(1);
  pointLight.mesh.scale.setScalar(80 * 4);
  pointLight.material.uniforms.normals.value = normalMap.texture;
  pointLight.material.uniforms.colors.value = colorMap.texture;
  pointLight.material.stencilRef = 1;
  pointLight.material.stencilFunc = THREE.NotEqualStencilFunc;
  pointLight.material.stencilWrite = true;

  const globalLight = createLight();
  globalLight.setup();
  globalLight.intensity(1);
  globalLight.mesh.scale.setScalar(80);
  globalLight.material.stencilRef = 1;
  globalLight.material.stencilFunc = THREE.EqualStencilFunc;
  globalLight.material.stencilWrite = true;
  globalLight.lightTint('#777');

  const stencilLight = createLight();
  stencilLight.setup();
  stencilLight.intensity(1);
  stencilLight.mesh.scale.setScalar(80);
  stencilLight.material.stencilRef = 1;
  stencilLight.material.stencilFunc = THREE.EqualStencilFunc;
  stencilLight.material.stencilWrite = true;
  stencilLight.lightTint('#fff');

  const shadowA = createShadow();
  shadowA.scale.setScalar(5.9);
  shadowA.position.set(14, -6, 0);
  shadowA.material = shadow.material;

  const shadowB = createShadow();
  shadowB.scale.setScalar(10.4);
  shadowB.position.set(-14, -6.5, 0);
  shadowB.material = shadow.material;

  light()
    .position.x(() => lightPos.x() * 10)
    .position.y(() => -lightPos.y() * 10);

  useScene().lifecycleEvents.onBeginRender.subscribe(() => {
    shadow.material.uniforms.lightWS.value.x = lightPos.x();
    shadow.material.uniforms.lightWS.value.y = lightPos.y();
    pointLight.mesh.position.setX(lightPos.x()).setY(lightPos.y());
  });

  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = basicMaterial;
    shadowB.material = basicMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
  };

  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
  };

  threeOut().onRender = renderer => {
    renderer.autoClear = false;

    renderer.setRenderTarget(colorMap);
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = basicMaterial;
    shadowB.material = basicMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);

    renderer.setRenderTarget(normalMap);
    renderer.setClearColor(0x0000000);
    renderer.clear();
    shadowA.material = normalMaterial;
    shadowB.material = normalMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);

    renderer.setRenderTarget(null);
    renderer.clear();
    outputStencil(renderer);
    renderer.render(pointLight.mesh, camera);
  };

  yield* slideTransition();

  yield* waitUntil('highlight_stencil');
  yield* select(stencilRect());

  yield* waitUntil('bits');
  for (let i = 7; i >= 0; i--) {
    stencilLabel().text(
      'STENCIL ' +
        range(8)
          .map(index => (index === i ? '1' : '0'))
          .join(''),
    );
    yield* waitFor(0.3);
  }
  stencilLabel().text('STENCIL');

  yield* waitUntil('use_mesh_highlight');
  yield* select(threeRect());
  yield* waitUntil('use_mesh');
  light().opacity(0);
  sceneLabel().text('SHADOW CASTERS');
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    renderer.render(globalLight.mesh, camera);
  };

  yield* waitUntil('set_first_highlight');
  yield* select(stencilRect());
  yield* waitUntil('set_first');
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    renderer.render(stencilLight.mesh, camera);
  };

  yield* waitUntil('first_not_set_highlight');
  yield* select(outputRect());

  yield* waitUntil('first_not_set');
  outputStencil = renderer => {
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
  };

  yield* waitUntil('this_works');
  yield* select(null);
  yield* all(lightPos.x(-32, 1.5));
  yield* all(lightPos.x(4, 1.5));

  yield* waitUntil('but_insides');
  const highlight = createRef<Rect>();
  threeOut().add(
    <Rect
      ref={highlight}
      width={200}
      height={200}
      x={-140}
      y={65}
      stroke={Colors.FUNCTION}
      lineWidth={0}
      radius={8}
    />,
  );
  yield* highlight().lineWidth(4, 0.3);

  yield* waitUntil('to_fix_this');
  highlight().lineWidth(0);
  sceneLabel().text('ORIGINAL SPRITES');
  outputStencil = () => {
    // do nothing
  };
  threeStencilA().onRender = renderer => {
    renderer.setClearColor(0);
    renderer.clear();
  };
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = basicMaterial;
    shadowB.material = basicMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
  };

  yield* waitUntil('lets_use');
  yield* select(threeRect());

  yield* waitUntil('start_with_shadow_highlgiht');
  yield* select(stencilRect());

  yield* waitUntil('start_with_shadow');
  sceneLabel().text('SHADOW CASTERS');
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    renderer.render(globalLight.mesh, camera);
  };
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    renderer.render(stencilLight.mesh, camera);
  };

  yield* waitUntil('cut_out_sprites');
  sceneLabel().text('ORIGINAL SPRITES');
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowA.material = basicMaterial;
    shadowB.material = basicMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
  };
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    shadowA.material = unshadowMaterial;
    shadowB.material = unshadowMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    renderer.render(stencilLight.mesh, camera);
  };

  yield* waitUntil('then_render_light');
  yield* select(outputRect());
  outputStencil = renderer => {
    shadowA.material = shadow.material;
    shadowB.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
    shadowA.material = unshadowMaterial;
    shadowB.material = unshadowMaterial;
    renderer.render(shadowA, camera);
    renderer.render(shadowB, camera);
  };

  yield* waitUntil('its_better');
  yield* select(null);

  yield* waitUntil('still_problem');
  yield* all(lightPos.x(-32, 1));

  yield* waitUntil('keep');
  const highlight2 = createRef<Rect>();
  threeStencilA().add(
    <Rect
      ref={highlight2}
      width={120}
      height={120}
      x={140}
      y={55}
      stroke={Colors.FUNCTION}
      lineWidth={0}
      radius={8}
    />,
  );
  yield* highlight2().lineWidth(4, 0.3);

  yield* waitUntil('ideally');
  outputStencil = renderer => {
    shadowA.material = shadow.material;
    renderer.render(shadowA, camera);
    shadowA.material = unshadowMaterial;
    renderer.render(shadowA, camera);

    shadowB.material = shadow.material;
    renderer.render(shadowB, camera);
    shadowB.material = unshadowMaterial;
    renderer.render(shadowB, camera);
  };
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();

    shadowA.material = shadow.material;
    renderer.render(shadowA, camera);
    shadowA.material = unshadowMaterial;
    renderer.render(shadowA, camera);

    shadowB.material = shadow.material;
    renderer.render(shadowB, camera);
    shadowB.material = unshadowMaterial;
    renderer.render(shadowB, camera);

    renderer.render(stencilLight.mesh, camera);
  };

  yield* waitUntil('fortunately');
  yield* highlight2().lineWidth(0, 0.3);

  yield* waitUntil('next');
});
