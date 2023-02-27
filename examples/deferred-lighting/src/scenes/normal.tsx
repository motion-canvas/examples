import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, waitUntil} from '@motion-canvas/core/lib/flow';
import {GBuffer, Vector} from '../components';
import {Img, Rect, Txt} from '@motion-canvas/2d/lib/components';
import color from '../images/frames/colors.png';
import wireframe from '../images/frames/wireframe.png';
import {applyViewStyles, WhiteLabel} from '../styles';
import {createRef, makeRefs} from '@motion-canvas/core/lib/utils';

import ballNormalTex from '../images/frames/ball_normal.png';
import {invert} from '@motion-canvas/2d/lib/partials';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const scene = createRef<Rect>();
  const ballNormal = createRef<Img>();
  const buffer = makeRefs<typeof GBuffer>();

  yield view.add(
    <>
      <Rect
        ref={scene}
        width={960}
        height={540}
        radius={8}
        fill={'#242424'}
        x={-320}
        opacity={0}
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
        <Txt offsetX={-1} offsetY={-1} x={-450} y={-250} {...WhiteLabel}>
          SCENE
        </Txt>
      </Rect>
      <GBuffer refs={buffer} x={540} width={520} />
      <Img
        ref={ballNormal}
        src={ballNormalTex}
        width={216}
        opacity={0}
        smoothing={false}
        x={-176}
        y={296}
      />
    </>,
  );

  yield* scene().opacity(1, 0.3);

  yield* waitUntil('texture_show');
  const vector = createRef<Vector>();
  view.add(
    <Vector
      ref={vector}
      stroke={'white'}
      arrowSize={24}
      lineWidth={8}
      from={() => scene().position().addX(144).addY(138)}
      to={() => ballNormal().position().addY(-132)}
      end={0}
    />,
  );
  yield* all(
    scene().position.y(-160, 0.5),
    delay(0.2, ballNormal().opacity(1, 0.3)),
    vector().end(1, 0.5),
  );

  yield* waitUntil('next');
  yield* all(
    scene().opacity(0, 0.3),
    vector().start(1, 0.3),
    ballNormal().opacity(0, 0.3),
    buffer.value.position.x(0, 0.5),
  );
});
