import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, waitUntil} from '@motion-canvas/core/lib/flow';
import {Three} from '../components';
import {Vector2} from '@motion-canvas/core/lib/types';
import {easeInExpo, easeOutExpo} from '@motion-canvas/core/lib/tweening';
import {createRef, useScene} from '@motion-canvas/core/lib/utils';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {Circle, Layout, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {applyViewStyles, BlackLabel, Colors, WhiteLabel} from '../styles';
import {createShadow, createShadowMaterial} from '../three/createShadow';
import * as THREE from 'three';
import {createLight} from '../three/createLight';
import normals from '../images/frames/box_normal.png';
import normalFragment from '../shaders/normalSmooth.fragment.glsl?raw';
import normalVertex from '../shaders/normalSmooth.vertex.glsl?raw';

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
const unshadowMaterial2 = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
  stencilWrite: true,
  stencilFunc: THREE.EqualStencilFunc,
  stencilRef: 1,
});
const unshadowMaterial3 = new THREE.MeshBasicMaterial({
  color: 0x808080,
  side: THREE.DoubleSide,
  stencilWrite: true,
  stencilFunc: THREE.EqualStencilFunc,
  stencilRef: 2,
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
  const sceneRect = createRef<Rect>();

  const sceneLabel = createRef<Txt>();
  const outputRect = createRef<Rect>();
  const stencilRect = createRef<Rect>();
  const selection = createRef<Rect>();
  const stencilLabelA = createRef<Txt>();

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
        ref={sceneRect}
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
        <Txt
          layout={false}
          ref={sceneLabel}
          {...WhiteLabel}
          offsetX={-1}
          offsetY={-1}
          x={() => sceneRect().size.x() / -2 + 20}
          y={() => sceneRect().size.y() / -2 + 10}
          cache
        >
          ORIGINAL SPRITES
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
            ref={stencilLabelA}
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

  const lightX = createSignal(-32);
  const lightY = createSignal(24);
  const shadow = createShadowMaterial();
  const stencilShadow = createShadowMaterial();
  stencilShadow.material.colorWrite = true;
  stencilShadow.material.blending = THREE.AdditiveBlending;
  stencilShadow.material.stencilWrite = true;
  stencilShadow.material.stencilFunc = THREE.AlwaysStencilFunc;
  stencilShadow.material.stencilZPass = THREE.IncrementStencilOp;

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

  useScene().lifecycleEvents.onBeginRender.subscribe(() => {
    shadow.material.uniforms.lightWS.value.x = lightX();
    shadow.material.uniforms.lightWS.value.y = lightY();
    stencilShadow.material.uniforms.lightWS.value.x = lightX();
    stencilShadow.material.uniforms.lightWS.value.y = lightY();
    pointLight.mesh.position.setX(lightX()).setY(lightY());
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

  yield* waitUntil('first_bit_highlight');
  yield* select(sceneRect());
  yield* waitUntil('first_bit_highlight_2');
  sceneLabel().text('SHADOW CASTERS');
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowB.material = shadow.material;
    renderer.render(shadowB, camera);
    shadowA.material = shadow.material;
    renderer.render(shadowA, camera);
    renderer.render(globalLight.mesh, camera);
  };

  yield* waitUntil('first_bit');
  yield* select(stencilRect());
  yield* waitUntil('first_bit_render');
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
    shadowB.material = stencilShadow.material;
    renderer.render(shadowB, camera);
    shadowA.material = stencilShadow.material;
    renderer.render(shadowA, camera);
  };

  yield* waitUntil('show_circle');
  const circle = createRef<Circle>();
  const circleText = createRef<Txt>();
  threeStencilA().add(
    <Circle
      ref={circle}
      width={0}
      height={0}
      x={120}
      y={100}
      fill={'red'}
      stroke={Colors.FUNCTION}
      lineWidth={8}
    >
      <Txt
        ref={circleText}
        {...BlackLabel}
        fontSize={48}
        opacity={0}
        fill={Colors.FUNCTION}
      >
        1
      </Txt>
    </Circle>,
  );
  circle().fill(() => {
    return `#${threeStencilA()
      .getColorAtPoint(
        circle().position().mul(new Vector2(1, -1)).addX(400).addY(225),
      )
      .getHexString()}`;
  });
  circleText().text(() => {
    const color = threeStencilA().getColorAtPoint(
      circle().position().mul(new Vector2(1, -1)).addX(400).addY(225),
    );
    return color.r > 0.7 ? '2' : color.r < 0.3 ? '0' : '1';
  });
  yield* all(
    circle().size.x(100, 0.3),
    circle().size.y(100, 0.3),
    delay(0.1, circleText().opacity(1, 0.2)),
  );

  yield* waitUntil('move_1');
  yield* circle().position(new Vector2(120, 40), 0.5);

  yield* waitUntil('move_0');
  yield* circle().position(new Vector2(120, -40), 0.5);

  yield* waitUntil('orignal_sprite');
  yield all(circle().size(0, 0.3, easeInExpo), circleText().opacity(0, 0.3));
  yield* select(sceneRect());
  sceneLabel().text('ORIGINAL SPRITES');
  three().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(clearColor);
    renderer.clear();
    shadowB.material = basicMaterial;
    renderer.render(shadowB, camera);
    shadowA.material = basicMaterial;
    renderer.render(shadowA, camera);
    renderer.render(globalLight.mesh, camera);
  };

  yield* waitUntil('decrementing');
  yield* select(stencilRect());
  threeStencilA().onRender = renderer => {
    renderer.autoClear = false;
    renderer.setClearColor(0);
    renderer.clear();
    shadowB.material = stencilShadow.material;
    renderer.render(shadowB, camera);
    shadowA.material = stencilShadow.material;
    renderer.render(shadowA, camera);
    shadowB.material = unshadowMaterial2;
    renderer.render(shadowB, camera);
    shadowA.material = unshadowMaterial2;
    renderer.render(shadowA, camera);
    shadowB.material = unshadowMaterial3;
    renderer.render(shadowB, camera);
    shadowA.material = unshadowMaterial3;
    renderer.render(shadowA, camera);
  };

  yield* waitUntil('show_circle_2');
  circle().position.y(40);
  yield* all(
    circle().size.x(100, 0.3),
    circle().size.y(100, 0.3),
    delay(0.1, circleText().opacity(1, 0.2)),
  );

  yield* waitUntil('go_1_b');
  yield* circle().position.y(80, 0.5);

  yield* waitUntil('render_light');
  yield all(circle().size(0, 0.3, easeInExpo), circleText().opacity(0, 0.3));
  yield* select(outputRect());
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

  yield* waitUntil('notice_that');
  yield* select(null);
  yield* lightX(4, 3);
  yield lightX(-32, 3);

  yield* waitUntil('next');
});
