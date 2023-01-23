import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, loop, waitUntil} from '@motion-canvas/core/lib/flow';
import {LBuffer, Three} from '../components';

import * as shadows from '../three/shadows';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Direction} from '@motion-canvas/core/lib/types';
import {easeOutExpo} from '@motion-canvas/core/lib/tweening';
import {createRef, makeRefs} from '@motion-canvas/core/lib/utils';
import {Image, Rect, Text} from '@motion-canvas/2d/lib/components';
import {WhiteLabel} from '../styles';
import lightIcon from '../images/icons/point_light.svg';

export default makeScene2D(function* (view) {
  yield shadows.setup();

  const three = createRef<Three>();
  const threeRect = createRef<Rect>();
  const light = createRef<Image>();

  const buffer = makeRefs<typeof LBuffer>();
  const sceneLabel = createRef<Text>();

  yield view.add(
    <>
      <Rect ref={threeRect} width={1920} height={1080} radius={0} clip>
        <Three
          ref={three}
          width={1920}
          height={1080}
          quality={1 / 24}
          camera={shadows.camera}
          scene={shadows.lightScene}
          onRender={shadows.render}
          zoom={1080}
        />
        <Image ref={light} width={96} src={lightIcon} opacity={0} />
        <Text
          layout={false}
          ref={sceneLabel}
          {...WhiteLabel}
          offsetX={-1}
          opacity={0}
          offsetY={-1}
          x={() => threeRect().size.x() / -2 + 20}
          y={() => threeRect().size.y() / -2 + 10}
          cache
        >
          SCENE
        </Text>
      </Rect>
      <LBuffer refs={buffer} width={720 + 80} x={440} y={-32} opacity={0} />
    </>,
  );

  yield buffer.color.value.remove();

  const outputRect = createRef<Rect>();
  buffer.value.add(
    <Rect ref={outputRect} width={720} height={405} radius={8} clip>
      <Three
        width={720}
        height={405}
        quality={0.1111111111111111}
        camera={shadows.camera}
        scene={shadows.lightScene}
        onRender={shadows.renderOutput}
        zoom={1080}
      >
        <Text
          layout={false}
          {...WhiteLabel}
          offsetX={-1}
          offsetY={-1}
          x={-360 + 20}
          y={-202.5 + 10}
          cache
        >
          SHADED COLOR
        </Text>
      </Three>
    </Rect>,
  );

  const stencilRect = createRef<Rect>();
  const stencilLabel = createRef<Text>();

  buffer.value.add(
    <Rect
      ref={stencilRect}
      width={720}
      height={0}
      marginTop={-20}
      radius={8}
      clip
    >
      <Three
        width={720}
        height={405}
        quality={0.1111111111111111}
        camera={shadows.camera}
        scene={shadows.lightScene}
        onRender={shadows.renderStencil}
        zoom={1080}
      >
        <Text
          ref={stencilLabel}
          layout={false}
          {...WhiteLabel}
          offsetX={-1}
          offsetY={-1}
          x={-360 + 20}
          y={-202.5 + 10}
        >
          STENCIL
        </Text>
      </Three>
    </Rect>,
  );
  shadows.light.intensity(0);
  shadows.light.color(1);
  shadows.light.normalIntensity(1);
  shadows.light.distance(0);
  shadows.outputLight.intensity(0);
  shadows.outputLight.normalIntensity(1);
  shadows.outputLight.distance(0);
  shadows.outputLight.color(1);

  light().position(() => shadows.lightPos().mul(three().scale()));

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('shadows');
  yield* shadows.light.intensity(1, 0.5, easeOutExpo);

  yield* waitUntil('move_light');
  yield* shadows.lightPos.x(320, 1.5);
  yield loop(Infinity, function* () {
    yield* shadows.lightPos.x(-320, 2).to(320, 2);
  });

  yield* waitUntil('zoom_out');
  yield* all(
    three().scale(0.375, 0.3),
    threeRect().size([720, 405], 0.3),
    threeRect().radius(8, 0.3),
    shadows.light.distance(1, 0.3),
    shadows.light.normalIntensity(0, 0.3),
    shadows.mainShadow.strength(0, 0.3),
    light().opacity(1, 0.3),
    sceneLabel().opacity(1, 0.3),
  );
  yield* waitUntil('buffer');
  yield* all(
    threeRect().position.x(-440, 0.5),
    delay(0.2, buffer.value.opacity(1, 0.3)),
  );

  yield* waitUntil('stencil_show');
  shadows.globalLight.intensity(0);
  yield* all(
    buffer.value.position.y(0, 0.3),
    stencilRect().margin.top(0, 0.3),
    stencilRect().size.y(405, 0.3),
  );

  yield* waitUntil('stencil_shadow');
  yield* all(shadows.globalLight.intensity(1, 0.5));

  yield* waitUntil('render_light');
  yield* all(shadows.outputLight.intensity(1, 0.5));

  yield* waitUntil('next');
});
