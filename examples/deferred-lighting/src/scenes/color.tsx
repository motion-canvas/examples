import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, waitUntil} from '@motion-canvas/core/lib/flow';
import {GBuffer, Vector} from '../components';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Direction} from '@motion-canvas/core/lib/types';
import {Img, Layout, Rect, Txt} from '@motion-canvas/2d/lib/components';
import color from '../images/frames/colors.png';
import wireframe from '../images/frames/wireframe.png';
import ball from '../images/frames/ball.png';
import ballPalette from '../images/frames/ball_palette.png';
import ballLookup from '../images/frames/ball_lookup.png';
import table from '../images/frames/table.png';
import {applyViewStyles, WhiteLabel} from '../styles';
import {createRef, makeRefs} from '@motion-canvas/core/lib/utils';

import pointLight from '../images/icons/point_light.svg';
import {brightness, invert} from '@motion-canvas/2d/lib/partials';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const scene = createRef<Rect>();
  const buffer = makeRefs<typeof GBuffer>();
  const ballTex = createRef<Img>();
  const ballAlpha = createRef<Img>();
  const ballArrow = createRef<Vector>();
  const tableTex = createRef<Img>();
  const tableArrow = createRef<Vector>();
  const textures = createRef<Layout>();
  const lights = createRef<Layout>();

  yield view.add(
    <>
      <Rect
        ref={scene}
        width={960}
        height={540}
        radius={8}
        fill={'#242424'}
        clip
      >
        <Img width={960} height={540} src={color} smoothing={false} />
        <Img
          filters={[invert(1)]}
          width={960}
          height={540}
          src={wireframe}
          smoothing={false}
        />
        <Layout ref={lights} opacity={0}>
          <Img width={96} src={pointLight} x={-320} />
          <Img width={96} src={pointLight} x={320} y={-120} />
        </Layout>
        <Txt offsetX={-1} offsetY={-1} x={-450} y={-250} {...WhiteLabel}>
          SCENE
        </Txt>
      </Rect>
      <GBuffer refs={buffer} x={540} opacity={0} width={520} hidden />
      <Layout ref={textures}>
        <Img
          ref={ballTex}
          src={ball}
          opacity={0}
          width={216}
          fill={'#285eb000'}
          smoothing={false}
          x={-172}
          y={296}
        />
        <Vector
          ref={ballArrow}
          arrowSize={24}
          fromX={-172}
          fromY={-24}
          toX={-172}
          toY={160}
          lineWidth={8}
          stroke={'white'}
          end={0}
        />
        <Img
          ref={tableTex}
          src={table}
          opacity={0}
          width={216}
          smoothing={false}
          x={-468}
          y={296}
          radius={8}
          clip
        />
        <Vector
          arrowSize={24}
          ref={tableArrow}
          fromX={-468}
          fromY={48}
          toX={-468}
          toY={160}
          lineWidth={8}
          stroke={'white'}
          end={0}
        />
      </Layout>
    </>,
  );

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('buffer_show');
  yield* all(
    scene().position.x(-320, 0.5),
    delay(0.2, buffer.value.opacity(1, 0.3)),
  );

  yield* waitUntil('first_texture');
  yield* all(
    buffer.color.value.alpha(1, 0.3),
    buffer.color.text.text('COLOR', 0.3),
  );

  yield* waitUntil('texture_show');
  yield* all(
    scene().position.y(-160, 0.5),
    ballTex().opacity(1, 0.5),
    tableTex().opacity(1, 0.5),
  );

  yield* waitUntil('color_sample');
  yield* all(ballArrow().end(1, 0.3), tableArrow().end(1, 0.3));

  yield* waitUntil('notice_that');
  yield* all(
    ballArrow().start(1, 0.3),
    tableArrow().start(1, 0.3),
    tableTex().opacity(0, 0.3),
  );
  yield* waitUntil('alpha');
  yield textures().add(
    <Img
      src={ball}
      ref={ballAlpha}
      opacity={0}
      width={216}
      smoothing={false}
      filters={[brightness(100000)]}
      fill="#000000"
      position={tableTex().position()}
    />,
  );

  yield* all(ballTex().fill('#285eb0', 0.3), ballAlpha().opacity(1, 0.3));
  yield* waitUntil('discard');
  yield* all(ballTex().fill('#285eb000', 0.5), ballAlpha().opacity(0, 0.5));

  const pallete = createRef<Img>();
  const lookup = createRef<Img>();
  const lookupArrow = createRef<Vector>();
  yield* waitUntil('palette');
  yield textures().add(
    <>
      <Img
        src={ballPalette}
        ref={pallete}
        opacity={0}
        width={40 * 12}
        smoothing={false}
        fill="#000000"
        position={tableTex().position()}
        clip
        radius={9}
      />
      <Img
        src={ballLookup}
        ref={lookup}
        opacity={0}
        width={216}
        smoothing={false}
        position={ballTex().position}
      >
        <Vector
          ref={lookupArrow}
          toX={-216}
          fromX={-126}
          end={0}
          lineWidth={8}
          arrowSize={24}
          stroke={'white'}
        />
      </Img>
    </>,
  );
  yield* all(
    lookup().opacity(1, 0.3),
    pallete().opacity(1, 0.3),
    ballTex().position.x(0, 0.3),
  );

  yield* waitUntil('resolve_lookup');
  yield* lookupArrow().end(1, 0.3);

  yield* waitUntil('at_this_step');
  yield* all(scene().position.y(0, 0.5), textures().opacity(0, 0.3));

  yield* waitUntil('second_texture');
  yield* all(
    buffer.normals.value.alpha(1, 0.3),
    buffer.normals.text.text('NORMAL', 0.3),
  );

  yield* waitUntil('no_lights');
  yield* lights().opacity(1, 0.3);

  yield* waitUntil('next');
  yield* scene().opacity(0, 0.3);
});
