import {makeScene2D} from '@motion-canvas/2d';
import {all, waitUntil} from '@motion-canvas/core/lib/flow';
import {Frame, GBuffer, LBuffer} from '../components';
import {Vector2} from '@motion-canvas/core/lib/types';
import {Layout, Rect, Txt, TxtProps} from '@motion-canvas/2d/lib/components';
import color from '../images/frames/colors.png';
import lightBoth from '../images/lights/both.png';
import lightLeft from '../images/lights/left.png';
import lightRight from '../images/lights/right.png';
import {applyViewStyles, WhiteLabel} from '../styles';
import {createRef, makeRefs} from '@motion-canvas/core/lib/utils';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const gbuffer = makeRefs<typeof GBuffer>();
  const lbuffer = makeRefs<typeof LBuffer>();

  const frames = createRef<Layout>();
  const finalLight = makeRefs<typeof Frame>();
  const colorA = makeRefs<typeof Frame>();
  const colorB = makeRefs<typeof Frame>();
  const colorLeft = makeRefs<typeof Frame>();
  const colorRight = makeRefs<typeof Frame>();

  const colorLeftBG = createRef<Rect>();
  const colorRightBG = createRef<Rect>();
  const fullLightBG = createRef<Rect>();
  const multiply = createRef<Txt>();
  const multiply2 = createRef<Txt>();
  const equal = createRef<Txt>();
  const addition = createRef<Txt>();
  const multiplyABG = createRef<Rect>();
  const multiplyBBG = createRef<Rect>();

  function Sign(props: TxtProps) {
    return (
      <Txt
        {...WhiteLabel}
        fontSize={28 * 4}
        fontWeight={500}
        opacity={0}
        {...props}
      />
    );
  }

  yield view.add(
    <>
      <GBuffer refs={gbuffer} width={520} />
      <Rect
        opacity={0}
        ref={fullLightBG}
        fill={'#242424'}
        width={440 + 80}
        height={327.5}
        radius={8}
      />
      <Rect
        ref={multiplyABG}
        opacity={0}
        fill={'#242424'}
        radius={8}
        width={440 * 2 + 200 + 80}
        height={(440 * 9) / 16 + 80}
        y={440 / 2}
        x={-320}
      />
      <Rect
        ref={multiplyBBG}
        opacity={0}
        fill={'#242424'}
        radius={8}
        width={440 * 2 + 200 + 80}
        height={(440 * 9) / 16 + 80}
        y={-440 / 2}
        x={-320}
      />
      <Rect ref={colorLeftBG} fill={'black'} radius={8} />
      <Rect ref={colorRightBG} fill={'black'} radius={8} />

      <Frame
        opacity={0}
        name="LIGHT"
        refs={colorRight}
        src={lightLeft}
        compositeOperation="lighter"
        width={440}
      />
      <Sign opacity={0} ref={multiply2}>
        ×
      </Sign>
      <Frame
        fill={'#242424'}
        opacity={0}
        name="COLOR"
        refs={colorB}
        src={color}
        width={440}
      />

      <Frame
        opacity={0}
        name=""
        refs={colorLeft}
        src={lightRight}
        width={440}
        compositeOperation="lighter"
      />
      <Sign ref={addition}>+</Sign>
      <Layout ref={frames}>
        <LBuffer
          refs={lbuffer}
          width={520}
          offsetY={1}
          y={163.75}
          x={600 + 40}
          opacity={0}
        />
        <Frame
          opacity={0}
          name="LIGHT"
          refs={finalLight}
          src={lightBoth}
          fill={'#242424'}
          width={440}
          x={320}
        />
        <Sign ref={multiply}>×</Sign>
        <Frame name="COLOR" refs={colorA} src={color} width={440} />

        <Sign x={320} ref={equal}>
          =
        </Sign>
      </Layout>
    </>,
  );

  colorLeftBG().position(colorLeft.value.position);
  colorLeftBG().size(colorLeft.value.size);
  colorLeftBG().opacity(colorLeft.value.opacity);
  colorRightBG().position(colorRight.value.position);
  colorRightBG().size(colorRight.value.size);
  colorRightBG().opacity(colorRight.value.opacity);

  frames().absolutePosition(gbuffer.color.value.absolutePosition());
  gbuffer.color.value.opacity(0);

  yield* waitUntil('move');
  yield* all(
    gbuffer.value.opacity(0, 0.5),
    gbuffer.value.scale(Vector2.fromScalar(0.87), 0.5),
    colorA.value.fill('#242424', 0.5),
    frames().position.y(0, 0.5),
  );

  yield* waitUntil('multiply');
  yield* all(
    colorA.value.position.x(-220 - 80 - 20, 0.5),
    finalLight.value.opacity(1, 0.5),
    multiply().opacity(1, 0.5),
  );

  yield* waitUntil('save_to_buffer');
  yield* all(
    colorA.value.position.x(-220 - 80 - 340, 0.5),
    multiply().position.x(-320, 0.5),
    finalLight.value.position.x(0, 0.5),
    lbuffer.value.opacity(1, 0.5),
    equal().opacity(1, 0.5),
  );

  yield* waitUntil('additive');
  finalLight.value.opacity(0);
  finalLight.value.opacity(0);
  colorLeft.value.opacity(1);
  colorLeft.value.fill('#000');
  colorRight.value.opacity(1);
  yield* all(
    colorLeft.value.position.y(220, 0.5),
    colorRight.value.position.y(-220, 0.5),
    addition().opacity(1, 0.5),
    colorRight.text.text('LIGHT A', 0.5),
    colorLeft.text.text('LIGHT B', 0.5),
    fullLightBG().opacity(1, 0.5),
    fullLightBG().size.y((440 * 9) / 16 + 440 + 80, 0.5),
  );

  yield* waitUntil('instead');
  yield* all(fullLightBG().opacity(0, 0.3));

  yield* waitUntil('distribute');
  yield* all(
    colorB.value
      .opacity(1)
      .position(colorA.value.position())
      .position.y(-220, 0.5),
    colorB.value.opacity(1, 0.2),
    colorA.value.position.y(220, 0.5),
    multiply2().position(multiply().position()).position.y(-220, 0.5),
    multiply2().opacity(1, 0.2),
    multiply().position.y(220, 0.5),
  );

  yield* waitUntil('multiply_each');
  yield* all(
    colorA.value.position.x(0, 0.5),
    colorA.text.text('', 0.5),
    multiply().opacity(0, 0.2),
    colorB.value.position.x(0, 0.5),
    colorB.text.text('', 0.5),
    multiply2().opacity(0, 0.2),
  );
  colorLeft.text.text('');
  colorLeft.value.compositeOperation('source-over');
  colorRight.text.text('');
  colorRight.value.compositeOperation('source-over');
  yield* all(
    colorA.value.compositeOperation('multiply', 0.5),
    colorB.value.compositeOperation('multiply', 0.5),
  );

  yield* waitUntil('add_all');
  yield* all(
    addition().opacity(0, 0.3),
    colorA.value.position.y(0, 0.5),
    colorB.value.position.y(0, 0.5),
    colorLeft.value.position.y(0, 0.5),
    colorRight.value.position.y(0, 0.5),
  );
  colorB.value.opacity(0);
  yield* all(colorLeft.value.compositeOperation('lighter', 0.5));

  yield* waitUntil('next');
});
