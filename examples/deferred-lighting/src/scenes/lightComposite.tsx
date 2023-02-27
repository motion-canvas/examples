import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {Layout, Txt, Rect} from '@motion-canvas/2d/lib/components';
import {all, delay, sequence, waitUntil} from '@motion-canvas/core/lib/flow';
import {LBuffer, Mesh, Slider, Three, Vertex} from '../components';

import * as light from '../three/light';
import {createRef, makeRefs} from '@motion-canvas/core/lib/utils';
import {Vector2} from '@motion-canvas/core/lib/types';

import {applyViewStyles, Colors, WhiteLabel} from '../styles';

// const theme = '#e91e63';
// const theme = '#00bcd4';
const theme = Colors.FUNCTION;

import lightLeft from '../images/lights/leftColor.png';
import shaded from '../images/lights/shaded.png';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  yield light.setup();
  light.intensity(1);
  light.distance(0);
  light.angleFrom(120);
  light.angleTo(0);
  light.normalIntensity(1);
  light.orbit(-180);
  light.quad.scale.setScalar(4320);

  const three = createRef<Rect>();
  const threeView = createRef<Three>();
  const code = createRef<Layout>();
  const buffer = makeRefs<typeof LBuffer>();

  const intensityCode = createRef<Layout>();
  const lightColorCode = createRef<Layout>();
  const shadedColorCode = createRef<Layout>();
  const volumeCode = createRef<Layout>();
  const lightTitle = createRef<Txt>();

  yield view.add(
    <>
      <Layout
        // opacity={0}
        direction="column"
        layout
        x={-960 + 80}
        y={1080 / 2 - 80}
        offsetX={-1}
        offsetY={1}
        {...WhiteLabel}
        ref={code}
      >
        <Layout ref={intensityCode}>
          <Txt fill={Colors.KEYWORD}>float</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;finalIntensity</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>intensity</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>radialFalloff</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>angularFalloff</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>normalFalloff</Txt>
          <Txt fill={Colors.COMMENT}>;</Txt>
        </Layout>
        <Layout ref={lightColorCode} opacity={0} height={0}>
          <Txt fill={Colors.KEYWORD}>vec3</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;lightColor</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>finalIntensity</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>lightTint</Txt>
          <Txt fill={Colors.COMMENT}>;</Txt>
        </Layout>
        <Layout ref={shadedColorCode} opacity={0} height={0}>
          <Txt fill={Colors.KEYWORD}>vec3</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;shadedColor</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>baseColor</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>lightColor</Txt>
          <Txt fill={Colors.COMMENT}>;</Txt>
        </Layout>
        <Layout ref={volumeCode} opacity={0} height={0}>
          <Txt fill={Colors.TEXT}>shadedColor</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;+=&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>lightColor</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;*&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>volumetricIntensity</Txt>
          <Txt fill={Colors.COMMENT}>;</Txt>
        </Layout>
      </Layout>
      <LBuffer refs={buffer} opacity={0} width={720 + 80} x={440} y={-113} />
      <Rect
        ref={three}
        width={1920}
        height={1080}
        fill={'#141414'}
        clip
        // x={-440}
      >
        <Three
          ref={threeView}
          quality={1 / 24}
          width={1920}
          height={1080}
          zoom={1080}
          camera={light.camera}
          scene={light.threeScene}
          onRender={light.render}
        ></Three>
        <Txt
          ref={lightTitle}
          offsetX={-1}
          offsetY={-1}
          {...WhiteLabel}
          x={() => three().size.x() / -2 + 20}
          y={() => three().size.y() / -2 + 10}
          cache
        ></Txt>
      </Rect>
    </>,
  );

  yield* all(
    three().size([720, 405], 0.6),
    three().position.y(-80, 0.6),
    three().fill('#000000', 0.6),
    three().radius(8, 0.6),
    threeView().scale(Vector2.fromScalar(0.375), 0.6),
    light.orbit(0, 0.6),
  );
  yield* lightTitle().text('LIGHT A', 0.3);

  yield* waitUntil('tint');
  yield* all(
    lightColorCode().opacity(1, 0.3),
    lightColorCode().size.y(null, 0.3),
    light.lightTint(Colors.FUNCTION, 0.3),
  );

  yield* waitUntil('color');
  yield* all(
    shadedColorCode().opacity(1, 0.3),
    shadedColorCode().size.y(null, 0.3),
    light.color(1, 0.3),
  );

  yield* waitUntil('add_to_buffer');
  yield buffer.color.value.src(lightLeft);
  yield* all(
    delay(0.2, buffer.value.opacity(1, 0.3)),
    three().position.x(-440, 0.5),
  );

  yield* waitUntil('light_b');
  lightTitle().text('LIGHT B');
  light.orbit(-145);
  light.lightTint('#ffffff');
  light.angleFrom(361);
  light.angleTo(360);
  light.distance(1);
  light.intensity(1);
  light.normalIntensity(0);
  light.color(0);

  yield* waitUntil('repeat');
  yield* sequence(
    0.5,
    light.distance(0, 0.3),
    all(light.angleFrom(120, 0.3), light.angleTo(0, 0.3)),
    light.normalIntensity(1, 0.3),
    light.lightTint(Colors.KEYWORD, 0.3),
    light.color(1, 0.3),
  );
  yield* all(three().position.x(0, 0.5), buffer.value.position.x(0, 0.5));
  yield buffer.color.value.src(shaded);
  yield* all(three().opacity(0, 0.3));

  const param = createRef<Layout>();
  const slider = createRef<Slider>();

  yield* waitUntil('one_more');
  view.add(
    <Layout
      ref={param}
      layout
      direction="column"
      opacity={0}
      width={720 - 40}
      y={40}
    >
      <Layout paddingBottom={8}>
        <Txt grow={1} {...WhiteLabel}>
          volumetricIntensity
        </Txt>
        <Txt
          {...WhiteLabel}
          fill={theme}
          text={() => light.volume().toFixed(2)}
        />
      </Layout>
      <Slider ref={slider} value={light.volume} color={theme} />
    </Layout>,
  );
  lightTitle().text('LIGHT A');
  light.orbit(0);
  light.lightTint(Colors.FUNCTION);
  yield* all(buffer.value.opacity(0, 0.3), three().opacity(1, 0.3));

  yield* waitUntil('show_param');
  yield* all(param().opacity(1, 0.3), three().position.y(-240, 0.3));

  yield* waitUntil('adjust_param');
  yield* all(light.volume(0.4, 1), slider().highlight(1, 0.3));
  yield slider().highlight(0, 0.3);

  yield* waitUntil('add_math');
  yield* all(volumeCode().opacity(1, 0.3), volumeCode().size.y(null, 0.3));

  yield* waitUntil('adjust_param_again');
  yield* all(light.volume(1, 1), slider().highlight(1, 0.3));
  yield slider().highlight(0, 0.3);

  yield* waitUntil('adjust_param_again_2');
  yield* all(light.volume(0.3, 1), slider().highlight(1, 0.3));
  yield slider().highlight(0, 0.3);

  yield* waitUntil('zoom_in');
  const mesh = createRef<Mesh>();
  view.add(
    <Mesh
      ref={mesh}
      opacity={0}
      triangles={[
        [0, 1, 2],
        [2, 3, 0],
      ]}
    >
      <Vertex x={480} y={270} />
      <Vertex x={-480} y={270} />
      <Vertex x={-480} y={-270} />
      <Vertex x={480} y={-270} />
    </Mesh>,
  );
  yield* all(
    three().size.x(960, 0.3),
    three().size.y(540, 0.3),
    three().position.y(0, 0.3),
    threeView().scale(Vector2.fromScalar(0.5), 0.3),
    code().opacity(0, 0.3),
    param().opacity(0, 0.3),
    lightTitle().text('GLOBAL LIGHT', 0.3),
    light.intensity(0, 0.3),
  );

  yield* waitUntil('global_light');
  yield* all(mesh().opacity(1, 0.3));

  light.distance(1);
  light.intensity(0.3);
  light.angleFrom(361);
  light.angleTo(360);
  light.normalIntensity(0);
  light.volume(0);
  light.lightTint('#fff');

  yield* waitUntil('global_light_mul');
  yield* all(mesh().opacity(0, 0.3));
  yield* waitUntil('global_light_intensity');
  yield* all(light.intensity(1, 1));
  yield* all(light.intensity(0.2, 1));

  yield* waitUntil('next');
});
