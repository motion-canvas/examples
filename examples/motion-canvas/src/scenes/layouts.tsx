import {makeScene2D} from '@motion-canvas/2d';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Layout, Rect, Text} from '@motion-canvas/2d/lib/components';
import {createRef, makeRef, useScene} from '@motion-canvas/core/lib/utils';
import {map} from '@motion-canvas/core/lib/tweening';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {Direction, Spacing} from '@motion-canvas/core/lib/types';
import {slideTransition} from '@motion-canvas/core/lib/transitions';

export default makeScene2D(function* (view) {
  const label = createRef<Text>();
  const size = createSignal(1);
  const rects: Rect[] = [];
  const animate = (from: number, to: number) => () => map(from, to, size());

  view.add(
    <>
      <Layout
        width={1920}
        height={1080}
        direction={'column'}
        gap={28}
        layout
        padding={20}
      >
        <Layout grow={1} gap={28}>
          <Rect ref={makeRef(rects, 0)} grow={animate(3, 1)} />
          <Rect ref={makeRef(rects, 1)} grow={1} />
          <Rect ref={makeRef(rects, 2)} grow={1} />
        </Layout>
        <Layout grow={animate(1, 2)} gap={28}>
          <Rect ref={makeRef(rects, 3)} grow={1} />
          <Rect ref={makeRef(rects, 4)} grow={animate(2, 4)} />
          <Rect ref={makeRef(rects, 5)} grow={1} />
        </Layout>
        <Layout grow={1} gap={28}>
          <Rect ref={makeRef(rects, 6)} grow={2} />
          <Rect ref={makeRef(rects, 7)} grow={animate(3, 2)} />
        </Layout>
      </Layout>
      <Text
        ref={label}
        fontSize={120}
        lineHeight={120}
        fontFamily={'JetBrains Mono'}
        fill={'rgba(255, 255, 255, 0.6)'}
      />
    </>,
  );

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    rect.lineWidth(8);
    rect.stroke(i === 4 ? '#99C47A' : '#242424');
    rect.radius(new Spacing(8));
  }

  yield* slideTransition(Direction.Bottom, 1);

  yield label().text('LAYOUTS', 2);
  yield size(0, 2).to(1, 2);

  yield* waitUntil('next');
  useScene().enterCanTransitionOut();
  yield* label().position.y(-320, 1);
});
