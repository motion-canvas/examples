import type {Scene} from '@motion-canvas/core/lib/Scene';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Surface} from '@motion-canvas/core/lib/components';
import {Keyframe, Timeline} from '../components';
import {makeRef, useAnimator, useRef} from '@motion-canvas/core/lib/utils';
import {LayeredLayout} from '@motion-canvas/core/lib/components/LayeredLayout';
import {Circle} from 'konva/lib/shapes/Circle';
import {Group} from 'konva/lib/Group';
import {Origin} from '@motion-canvas/core/lib/types';
import {easeOutCubic, linear} from '@motion-canvas/core/lib/tweening';
import {all} from '@motion-canvas/core/lib/flow';
import {colors, keyframes, resolveKeyframe} from '../misc/keyframes';
import {showSurfaceVertically} from '@motion-canvas/core/lib/animations';
import {Rect} from 'konva/lib/shapes/Rect';

export default function* declarative(scene: Scene): ThreadGenerator {
  yield* scene.transition();

  const circle = useRef<Circle>();
  const shadows: Record<number, Circle> = {};
  const keys: Record<number, Rect> = {};
  const surface = useRef<Surface>();
  const timeline = useRef<Timeline>();

  const Shadow = (config: {value: number}) => (
    <Circle
      ref={makeRef(shadows, config.value)}
      width={240 - 16}
      height={240 - 16}
      stroke={colors[config.value]}
      strokeWidth={8}
      dash={[(Math.PI * (120 - 8)) / 20]}
      position={keyframes[config.value]}
      visible={false}
    />
  );

  scene.add(
    <Shadow value={10} />,
    <Shadow value={30} />,
    <Shadow value={60} />,
    <Shadow value={80} />,
    <Circle
      ref={circle}
      width={240}
      height={240}
      fill={'#ccc'}
      scaleX={0}
      scaleY={0}
    />,
    <Surface ref={surface} visible={false} background={'#242424'} y={360}>
      <LayeredLayout origin={Origin.Top}>
        <Timeline ref={timeline} width={1280} height={120} />
        <Group y={20} x={-600}>
          <Keyframe value={10} ref={keys} />
          <Keyframe value={30} ref={keys} />
          <Keyframe value={60} ref={keys} />
          <Keyframe value={80} ref={keys} />
        </Group>
      </LayeredLayout>
    </Surface>,
  );

  const play = useAnimator(0, value => {
    timeline.value.playhead(value);
    circle.value.position(resolveKeyframe(keyframes, value));
  });

  function makeKeyframe(value: number): ThreadGenerator {
    circle.value.position(keyframes[value]).scale({x: 0.95, y: 0.95});
    return all(
      circle.value.scale({x: 1, y: 1}, 0.3, easeOutCubic),
      keys[value].scale({x: 1, y: 1}, 0.3, easeOutCubic),
    );
  }

  yield* waitUntil('show');
  yield* all(
    showSurfaceVertically(surface.value),
    circle.value.scale({x: 1, y: 1}, 0.4, easeOutCubic),
  );

  yield* waitUntil('at 10');
  timeline.value.playhead(10);
  yield* waitUntil('here');
  circle.value.position(keyframes[10]);
  yield* makeKeyframe(10);

  yield* waitUntil('at 30');
  timeline.value.playhead(30);
  yield* waitUntil('there');
  circle.value.position(keyframes[30]);
  shadows[10].show();
  yield* makeKeyframe(30);

  yield* waitUntil('at 60');
  timeline.value.playhead(60);
  circle.value.position(keyframes[60]);
  shadows[30].show();
  yield* makeKeyframe(60);

  yield* waitUntil('at 80');
  timeline.value.playhead(80);
  circle.value.position(keyframes[80]);
  shadows[60].show();
  yield* makeKeyframe(80);

  yield* waitUntil('play');
  shadows[80].show();
  yield* play()
    .key(100, 100 / 30, linear)
    .run(2);

  yield* waitUntil('next');
  scene.canFinish();
}
