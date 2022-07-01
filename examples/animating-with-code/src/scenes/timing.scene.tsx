import {waitUntil} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {LinearLayout, Surface} from '@motion-canvas/core/lib/components';
import {LayeredLayout} from '@motion-canvas/core/lib/components/LayeredLayout';
import {Center, Origin} from '@motion-canvas/core/lib/types';
import {Command, Keyframe, Timeline, Mouse} from '../components';
import {useAnimator, useRef} from '@motion-canvas/core/lib/utils';
import {Group} from 'konva/lib/Group';
import {PinnedLabel} from '@motion-canvas/core/lib/components/PinnedLabel';
import {LayoutText} from '@motion-canvas/core/lib/components/LayoutText';
import {all} from '@motion-canvas/core/lib/flow';
import {easeInOutCubic, rectArcTween} from '@motion-canvas/core/lib/tweening';
import {Rect} from 'konva/lib/shapes/Rect';
import {makeKonvaScene} from '@motion-canvas/core/lib/scenes';

export default makeKonvaScene(function* timing(scene) {
  const timeline = useRef<Timeline>();
  const keys: Record<number, Rect> = {};
  const declarative = useRef<Surface>();
  const imperative = useRef<Surface>();
  const declarativeLabel = useRef<LayoutText>();
  const imperativeLabel = useRef<LayoutText>();
  const mouse = useRef<Mouse>();
  const slideKeys = useRef<Group>();
  const slideCommand = useRef<Rect>();

  scene.add(
    <Surface ref={imperative} background={'#242424'} y={160}>
      <LayeredLayout origin={Origin.Top}>
        <Timeline ref={timeline} width={1280} height={120} />
        <LinearLayout
          origin={Origin.TopLeft}
          direction={Center.Horizontal}
          x={-600}
          y={-5}
        >
          <Command value={10} />
          <Command ref={slideCommand} value={30} />
          <Command value={60} />
          <Command value={80} />
        </LinearLayout>
      </LayeredLayout>
    </Surface>,
    <Surface ref={declarative} background={'#242424'} y={-160}>
      <LayeredLayout origin={Origin.Top}>
        <Timeline ref={timeline} width={1280} height={120} />
        <Group y={20} x={-600}>
          <Keyframe value={10} visible ref={keys} />
          <Group ref={slideKeys}>
            <Keyframe value={30} visible ref={keys} />
            <Keyframe value={60} visible ref={keys} />
            <Keyframe value={80} visible ref={keys} />
          </Group>
        </Group>
      </LayeredLayout>
    </Surface>,
    <Mouse ref={mouse} x={-1060} />,
    <PinnedLabel ref={imperativeLabel} target={imperative}>
      IMPERATIVE
    </PinnedLabel>,
    <PinnedLabel ref={declarativeLabel} target={declarative}>
      DECLARATIVE
    </PinnedLabel>,
  );

  const selected = Object.values(keys).slice(1);
  yield* scene.transition(slideTransition());

  yield* waitUntil('declarative');
  imperative.value.cache();
  yield* all(
    imperative.value.opacity(0.3, 0.3),
    imperativeLabel.value.opacity(0.3, 0.3),
  );

  yield* waitUntil('declarative_mouse');
  yield* mouse.value.position(
    {x: -360, y: -300},
    0.5,
    easeInOutCubic,
    rectArcTween,
  );

  yield* waitUntil('declarative_select');
  mouse.value.startSelecting();
  mouse.value.press(0.95);
  yield* mouse.value.position({x: 540, y: 0}, 0.7);
  mouse.value.stopSelecting();
  selected.forEach(key => key.strokeWidth(4));
  mouse.value.press(1);

  yield* waitUntil('declarative_drag');
  const keyPosition = keys[30].getAbsolutePosition(scene);
  yield* mouse.value.position(
    {
      x: keyPosition.x,
      y: keyPosition.y + 20,
    },
    0.5,
    easeInOutCubic,
    rectArcTween,
  );

  mouse.value.press(0.95);
  const slide = useAnimator(0, value => {
    mouse.value.x(keyPosition.x + value);
    slideKeys.value.x(value);
  });
  yield* slide().key(100, 1).key(-100, 1).back(1).run();
  selected.forEach(key => key.strokeWidth(0));
  mouse.value.press(1);

  yield* waitUntil('imperative');
  declarative.value.cache();
  yield* all(
    imperative.value.opacity(1, 0.3),
    imperativeLabel.value.opacity(1, 0.3),
    declarative.value.opacity(0.3, 0.3),
    declarativeLabel.value.opacity(0.3, 0.3),
  );
  imperative.value.clearCache();

  yield* waitUntil('imperative_move');
  const commandPosition = slideCommand.value.getAbsolutePosition(scene);
  commandPosition.x += 160;
  commandPosition.y += 10;
  const commandWidth = slideCommand.value.width();
  yield* mouse.value.position(commandPosition, 1);

  slideCommand.value.strokeWidth(4);
  mouse.value.press(0.95);

  const slide2 = useAnimator(0, value => {
    mouse.value.x(commandPosition.x + value);
    slideCommand.value.width(commandWidth + value);
  });
  yield* slide2().key(100, 1).key(-100, 1).back(1).run();
  mouse.value.press(1);

  slideCommand.value.strokeWidth(0);

  yield* waitUntil('next');
  scene.canFinish();
});
