import type {Scene} from '@motion-canvas/core/lib/Scene';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {surfaceTransition} from '@motion-canvas/core/lib/animations';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Align} from '@motion-canvas/core/lib/components/Align';
import {Circle} from 'konva/lib/shapes/Circle';
import {Arrow, LinearLayout, Surface} from '@motion-canvas/core/lib/components';
import {LayeredLayout} from '@motion-canvas/core/lib/components/LayeredLayout';
import {Center, Origin} from '@motion-canvas/core/lib/types';
import {Command, Timeline} from '../components';
import {Group} from 'konva/lib/Group';
import {Image} from 'konva/lib/shapes/Image';
import {makeRef, useRef} from '@motion-canvas/core/lib/utils';
import {colors, keyframes, resolveKeyframe} from '../misc/keyframes';
import {
  clampRemap,
  easeOutCubic,
  map,
  remap,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {all} from '@motion-canvas/core/lib/flow';

import manim from '../images/manim.png?img';

export default function* imperative(scene: Scene): ThreadGenerator {
  yield* scene.transition(function* (next, previous) {
    previous?.hide();
  });

  const circle = useRef<Circle>();
  const arrows: Record<number, Arrow> = {};
  const surface = useRef<Surface>();
  const arrowGroup = useRef<Group>();
  const code = useRef<Surface>();
  const timeline = useRef<Timeline>();
  const commands = useRef<LinearLayout>();
  const manimImg = useRef<Surface>();

  const OffsetArrow = (config?: {value: number}) => {
    const times = Object.keys(colors);
    const current = times.findIndex(t => parseInt(t) === config.value);
    const next = parseInt(times[current + 1]);

    return (
      <Arrow
        ref={makeRef(arrows, config.value)}
        points={[
          keyframes[config.value].x,
          keyframes[config.value].y,
          keyframes[next].x,
          keyframes[next].y,
        ]}
        stroke={colors[config.value]}
        fill={colors[config.value]}
        strokeWidth={8}
        start={0.02}
        end={0.02}
        endArrow={true}
      />
    );
  };

  scene.add(
    <Circle
      ref={circle}
      width={240}
      height={240}
      fill={'#ccc'}
      position={keyframes[10]}
    />,
    <Group ref={arrowGroup}>
      <OffsetArrow value={10} />
      <OffsetArrow value={30} />
    </Group>,
    <OffsetArrow value={60} />,
    <Align>
      <Surface ref={surface} background={'#242424'} y={360}>
        <LayeredLayout origin={Origin.Top}>
          <Timeline ref={timeline} width={1280} height={120} />
          <LinearLayout
            ref={commands}
            origin={Origin.TopLeft}
            direction={Center.Horizontal}
            x={-600}
            y={-5}
            clipWidth={1}
            clipHeight={120}
            clipX={-480}
            clipY={-20}
          >
            <Command value={10} />
            <Command value={30} />
            <Command value={60} />
            <Command value={80} />
          </LinearLayout>
        </LayeredLayout>
      </Surface>
      <Surface visible={false} ref={code} background={'#242424'} x={-270}>
        <LinearLayout origin={Origin.TopLeft} direction={Center.Horizontal}>
          <LinearLayout origin={Origin.Left} padd={40} margin={[0, 300, 0, 0]}>
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
            <Command value={10} />
            <Command value={30} />
            <Command value={60} />
            <Command value={80} />
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
            <Command value={0} />
          </LinearLayout>
        </LinearLayout>
      </Surface>
      <Surface
        ref={manimImg}
        rescaleChild={false}
        visible={false}
        background={'#171c28'}
      >
        <Image
          origin={Origin.Top}
          image={yield manim}
          width={1920}
          height={1080}
        />
      </Surface>
    </Align>,
  );

  function setTime(value: number) {
    circle.value.position(resolveKeyframe(keyframes, value));
    timeline.value.playhead(value);
    commands.value.clipWidth(remap(0, 80, 0.001, 960, value));

    let previous = 80;
    for (const [frame, arrow] of Object.entries(arrows).reverse()) {
      const time = parseInt(frame);
      arrow.end(clampRemap(time, previous, 0.02, 0.98, value));
      previous = time;
    }
  }

  function animateTime(time: number, speed = 1) {
    const current = timeline.value.playhead();
    return tween((Math.abs(time - current) / 30) * speed, value =>
      setTime(map(current, time, value)),
    );
  }

  circle.value.scale({x: 0.95, y: 0.95});
  yield* circle.value.scale({x: 1, y: 1}, 0.3, easeOutCubic);

  yield* waitUntil('nothing');
  yield* animateTime(10);

  yield* waitUntil('move');
  yield* animateTime(30);

  yield* waitUntil('to 60');
  yield* animateTime(60);

  yield* waitUntil('to 80');
  yield* animateTime(80);

  yield* waitUntil('code');
  yield* all(
    surfaceTransition(surface.value, code.value),
    arrowGroup.value.opacity(0, 0.6),
  );

  yield* waitUntil('manim');
  manimImg.value.show();
  yield* surfaceTransition(code.value, manimImg.value);
  yield* waitUntil('next');
  scene.canFinish();
}
