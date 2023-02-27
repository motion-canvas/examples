import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all, sequence, loop, waitUntil} from '@motion-canvas/core/lib/flow';
import {
  easeInOutCubic,
  easeOutExpo,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {GBuffer, Three, Vector} from '../components';
import * as normals from '../three/normals';
import {Color, Group, MeshBasicMaterial, Quaternion, Vector3} from 'three';
import {Vector2} from '@motion-canvas/core/lib/types';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';
import {
  makeRef,
  range,
  createRef,
  useScene,
  makeRefs,
  useRandom,
} from '@motion-canvas/core/lib/utils';
import {
  Circle,
  Layout,
  LayoutProps,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {applyViewStyles, Colors, WhiteLabel} from '../styles';

import normalTex from '../images/frames/normals.png';
import normalRTex from '../images/frames/normals_r.png';
import normalGTex from '../images/frames/normals_g.png';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const buffer = makeRefs<typeof GBuffer>();
  const three = createRef<Three>();
  const fragment = createRef<Circle>();
  const normalVector = createRef<Vector>();
  yield view.add(
    <>
      <Three
        ref={three}
        quality={2}
        x={-320}
        width={1280}
        height={1080}
        zoom={1080 / 240}
        background={'#141414'}
        scene={normals.threeScene}
        camera={normals.camera}
      >
        <Circle
          ref={fragment}
          width={0}
          height={0}
          fill={'red'}
          x={120}
          y={-40}
        >
          <Vector
            end={0}
            ref={normalVector}
            arrowSize={36}
            stroke={'white'}
            lineWidth={8}
            toX={200}
          />
        </Circle>
      </Three>
      <GBuffer refs={buffer} x={540} width={520} />
    </>,
  );

  const normalColor = createComputed(() => {
    const position = fragment()
      .position()
      .scale(1 / 240)
      .add(Vector2.one)
      .scale(0.5);
    const color = new Color();
    color.setRGB(position.x, 1 - position.y, 0.5);
    return '#' + color.getHexString();
  });

  normalVector().to(() => {
    return fragment()
      .position()
      .scale((1 / 240) * 240);
  });
  normalVector().stroke(normalColor);
  fragment().fill(normalColor);

  const orbitX = createSignal(0);
  const orbitY = createSignal(0);

  function updateArrowColor(arrow: Group, material: MeshBasicMaterial) {
    const quaterion = new Quaternion();
    const unit = new Vector3(0, 1, 0);
    arrow.getWorldQuaternion(quaterion);
    unit.applyQuaternion(quaterion);
    unit.divideScalar(2);
    unit.addScalar(0.5);
    material.color.setRGB(unit.x, unit.y, unit.z);
  }

  useScene().LifecycleEvents.onBeginRender.subscribe(() => {
    normals.orbit.rotation.set(orbitX(), 0, orbitY(), 'YZX');
    updateArrowColor(normals.arrow, normals.arrowMaterial);
    updateArrowColor(normals.arrowA, normals.arrowMaterialA);
    updateArrowColor(normals.arrowB, normals.arrowMaterialB);
    updateArrowColor(normals.arrowC, normals.arrowMaterialC);
  });

  normals.cube.scale.setScalar(0);
  normals.sphere.visible = false;
  normals.arrows.scale.setScalar(0);
  normals.arrows.add(normals.arrow);
  normals.arrows.rotation.set(Math.PI / 4, 0, Math.PI / 4);
  normals.orbit.rotation.set(0, 0, 0);
  normals.arrow.rotation.set(0, 0, 0);
  normals.arrow.position.set(0, 1, 0);
  normals.arrow.scale.setScalar(1);

  for (const arrow of [normals.arrowA, normals.arrowB, normals.arrowC]) {
    arrow.scale.setScalar(0);
    arrow.rotation.set(Math.PI / 2, 0, 0);
  }

  yield* tween(0.6, value => {
    normals.cube.scale.setScalar(easeOutExpo(value));
    normals.arrows.scale.setScalar(easeOutExpo(value));
  });

  yield* waitUntil('rotate');
  yield* tween(1.6, value => {
    const values = Vector2.arcLerp(
      new Vector2(Math.PI / 4, Math.PI / 4),
      new Vector2(Math.PI / 2, Math.PI / -4),
      easeInOutCubic(value),
    );
    normals.arrows.rotation.set(
      // easeInOutCubic(value, Math.PI / 4, Math.PI / 2),
      values.x,
      0,
      // easeInOutCubic(value, Math.PI / 4, Math.PI / -4),
      values.y,
    );
  });

  const position = new Vector3();
  const rotation = new Quaternion();
  normals.arrow.getWorldPosition(position);
  normals.arrow.getWorldQuaternion(rotation);
  normals.threeScene.add(normals.arrow);
  normals.arrow.position.copy(position);
  normals.arrow.rotation.setFromQuaternion(rotation);
  const euler = normals.arrow.rotation;

  yield* waitUntil('flatten');
  yield* tween(0.6, value => {
    normals.cube.scale.setZ(easeInOutCubic(value, 1, 0.01));
    normals.arrow.rotation.set(
      easeInOutCubic(value, euler.x, Math.PI / 2),
      easeInOutCubic(value, euler.y, 0),
      easeInOutCubic(value, euler.z, 0),
    );
    normals.arrow.position.setZ(easeInOutCubic(value, position.z, 0));
  });

  yield* waitUntil('show_flatten');
  yield* all(orbitX(1.3, 0.6), orbitY(0.3, 0.6));

  yield* waitUntil('normals_up');
  yield* all(
    tween(0.6, value => {
      normals.arrow.position.setX(easeInOutCubic(value, position.x, 1));
    }),
    sequence(
      0.1,
      tween(0.3, value =>
        normals.arrowA.scale.setScalar(easeInOutCubic(value)),
      ),
      tween(0.3, value =>
        normals.arrowB.scale.setScalar(easeInOutCubic(value)),
      ),
      tween(0.3, value =>
        normals.arrowC.scale.setScalar(easeInOutCubic(value)),
      ),
    ),
  );

  yield* waitUntil('instead');
  yield* all(orbitX(0, 0.6), orbitY(0, 0.6));

  yield* waitUntil('adjust_normals');
  yield* tween(0.6, value => {
    normals.arrowA.rotation.set(easeInOutCubic(value, Math.PI / 2, 0), 0, 0);
    normals.arrowB.rotation.set(
      Math.PI / 2,
      0,
      easeInOutCubic(value, 0, Math.PI / 2),
    );
    normals.arrowC.rotation.set(
      easeInOutCubic(value, Math.PI / 2, Math.PI),
      0,
      0,
    );
    normals.arrow.rotation.set(
      Math.PI / 2,
      0,
      easeInOutCubic(value, 0, Math.PI / -2),
    );
  });

  yield* waitUntil('as_3d');
  normals.sphere.visible = true;
  yield* all(
    tween(0.6, value => {
      normals.sphere.material.opacity = easeInOutCubic(value, 0, 0.4);
    }),
    orbitX(1, 0.6),
    orbitY(-0.3, 0.6),
  );

  yield* waitUntil('this_way');
  yield* all(
    orbitX(0, 0.6),
    orbitY(0, 0.6),
    tween(0.6, value => {
      normals.sphere.material.opacity = easeInOutCubic(value, 0.4, 0);
    }),
    sequence(
      0.1,
      tween(0.3, value =>
        normals.arrowA.scale.setScalar(easeInOutCubic(value, 1, 0)),
      ),
      tween(0.3, value =>
        normals.arrowB.scale.setScalar(easeInOutCubic(value, 1, 0)),
      ),
      tween(0.3, value =>
        normals.arrowC.scale.setScalar(easeInOutCubic(value, 1, 0)),
      ),
      tween(0.3, value =>
        normals.arrow.scale.setScalar(easeInOutCubic(value, 1, 0)),
      ),
    ),
  );

  yield* waitUntil('for_any');
  fragment().position([120, -120]);
  yield* all(
    fragment().size.x(30, 0.3),
    fragment().size.y(30, 0.3),
    normalVector().end(1, 0.3),
  );

  yield* waitUntil('move_normal');
  const random = useRandom();
  let angle = Math.PI / 4;
  yield loop(Infinity, function* () {
    angle += random.nextFloat(Math.PI * 0.5, Math.PI * 0.75);
    const distance = random.nextFloat(120, 180);
    yield* fragment().position(Vector2.fromRadians(angle).scale(distance), 2);
  });

  function Axis({
    refs,
    ref,
    color,
    label,
    ...props
  }: {
    refs: {value: Layout; handle: Circle; range: Vector; text: Txt};
    color: string;
    label: string;
  } & LayoutProps) {
    return (
      <Layout ref={makeRef(refs, 'value')} {...props}>
        <Txt
          ref={makeRef(refs, 'text')}
          {...WhiteLabel}
          fill={color}
          x={380}
          y={10}
          offsetY={-1}
        >
          {label}
        </Txt>
        <Vector
          lineWidth={4}
          startArrow
          arrowSize={16}
          fromX={-420}
          toX={420}
          stroke={'#444'}
        >
          {range(5).map(i => (
            <>
              <Rect x={(i - 2) * 140} width={4} height={16} fill={'#444'}>
                <Txt {...WhiteLabel} fill={'#444'} offsetY={-1} y={10}>
                  {(i - 2).toFixed()}
                </Txt>
              </Rect>
            </>
          ))}

          <Vector
            ref={makeRef(refs, 'range')}
            lineWidth={8}
            stroke={color}
            fromX={-140}
            toX={140}
            endArrow={false}
          >
            <Circle
              ref={makeRef(refs, 'handle')}
              width={16}
              height={16}
              fill={color}
            />
          </Vector>
        </Vector>
      </Layout>
    );
  }

  const xAxis = makeRefs<typeof Axis>();
  const yAxis = makeRefs<typeof Axis>();

  yield* waitUntil('packing_start');
  yield view.add(
    <>
      <Axis
        opacity={0}
        refs={xAxis}
        color={Colors.red}
        label="X"
        x={-320}
        y={200}
      />
      <Axis
        opacity={0}
        refs={yAxis}
        color={Colors.green}
        label="Y"
        x={-320}
        y={320}
      />
    </>,
  );

  const scale = createSignal(1);
  const offset = createSignal(0);
  xAxis.handle.position.x(
    () => (fragment().position.x() / 240) * 140 * scale(),
  );
  xAxis.range.from.x(() => (offset() - 140) * scale());
  xAxis.range.to.x(() => (140 + offset()) * scale());
  yAxis.handle.position.x(
    () => (-fragment().position.y() / 240) * 140 * scale(),
  );
  yAxis.range.from.x(() => (offset() - 140) * scale());
  yAxis.range.to.x(() => (140 + offset()) * scale());

  yield* sequence(
    0.3,
    three().position.y(-160, 0.5),
    xAxis.value.opacity(1, 0.3),
    yAxis.value.opacity(1, 0.3),
  );

  yield* waitUntil('add_one');
  yield* offset(140, 0.6);
  yield* waitUntil('divide_two');
  yield* scale(0.5, 0.6);

  yield* waitUntil('red');
  xAxis.text.text('R');
  buffer.normals.text.text('NORMAL(R)');
  yield buffer.normals.value.src(normalRTex);
  yield* waitUntil('green');
  yAxis.text.text('G');
  buffer.normals.text.text('NORMAL(G)');
  yield buffer.normals.value.src(normalGTex);

  yield* waitUntil('next');
  buffer.normals.text.text('NORMAL');
  yield buffer.normals.value.src(normalTex);
  yield* all(
    three().scale(Vector2.zero, 0.6),
    xAxis.value.opacity(0, 0.6),
    yAxis.value.opacity(0, 0.6),
  );
});
