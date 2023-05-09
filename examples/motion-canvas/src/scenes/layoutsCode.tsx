import {makeScene2D} from '@motion-canvas/2d';
import {Rect, Line} from '@motion-canvas/2d/lib/components';
import {all, loop, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createRef, makeRef} from '@motion-canvas/core/lib/utils';

import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Direction, Vector2} from '@motion-canvas/core/lib/types';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {createSignal} from '@motion-canvas/core/lib/signals';

export default makeScene2D(function* (view) {
  const label = createRef<Rect>();
  const code = createRef<CodeBlock>();
  const position = Vector2.createSignal(0);
  const rotate = createSignal(0);
  const parentY = createSignal(0);

  const axes: Line[] = [];
  const bg = createRef<Rect>();
  const codeBlock = createRef<Rect>();
  const circle = createRef<Rect>();

  view.add(
    <>
      <Rect
        ref={bg}
        rotation={rotate}
        x={400}
        y={parentY}
        width={320}
        height={320}
        fill={'#242424'}
        radius={8}
      >
        <Rect
          ref={circle}
          radius={120}
          width={240}
          height={240}
          position={position}
          fill={'#fafafa'}
        />
        <Line
          ref={makeRef(axes, 0)}
          lineWidth={8}
          stroke={'#ff6470'}
          endArrow
          points={[Vector2.zero, () => Vector2.right.scale(position.x())]}
        />
        <Line
          ref={makeRef(axes, 1)}
          lineWidth={8}
          stroke={'#99C47A'}
          endArrow
          points={[() => Vector2.right.scale(position.x()), position]}
        />
      </Rect>
    </>,
  );

  yield view.add(
    <>
      <Rect
        // layout
        offset={-1}
        ref={codeBlock}
        x={-960 + 80}
        y={-540 + 80}
        height={1080 - 160}
        width={960}
        clip
      >
        <CodeBlock
          ref={code}
          fontSize={24}
          lineHeight={36}
          offsetX={-1}
          x={-960 / 2}
          fontFamily={'JetBrains Mono'}
          code={() => `export default makeScene2D(function* (view) {
  view.add(
    <Rect 
      width={320} 
      height={320}
      y={${parentY().toFixed(0)}}
      rotation={${rotate().toFixed(0)}}
      // style
    >
      <Circle 
        x={${position.x().toFixed(0)}}
        y={${position.y().toFixed(0)}}
        width={240} 
        height={240}
        // style
      />
    </Rect>
  );
});`}
        />
      </Rect>
    </>,
  );

  yield* slideTransition(Direction.Bottom, 1);

  yield* waitUntil('select');
  yield* code().selection(lines(10, 11), 0.3);

  yield* waitUntil('move_x');
  yield* position.x(200, 1);

  yield* waitUntil('move_y');
  yield* position.y(200, 1);

  yield* waitUntil('rotate');
  yield code().selection(lines(5, 6), 0.6);
  yield* waitFor(0.3);
  yield* all(rotate(180 + 45, 3), parentY(100, 3));

  yield* waitUntil('morph');
  circle().reparent(view);
  axes.forEach(line => line.reparent(view));
  circle().rotation(0);

  yield code().edit(1.2)`export default makeScene2D(function* (view) {
  view.add(${edit(
    `
    <Rect 
      width={320} 
      height={320}
      y={${parentY().toFixed(0)}}
      rotation={${rotate().toFixed(0)}}
      // style
    >
      <Circle 
        x={${position.x().toFixed(0)}}
        y={${position.y().toFixed(0)}}
        width={240} 
        height={240}
        // style
      />
    </Rect>`,
    `
    <Rect
      width={null}
      height={640}
      direction={'column'}
      padding={20}
      gap={20}
      layout
      // style
    >
      <Rect width={480} gap={20}>
        <Rect width={360} height={200} />
        <Rect grow={1} />
      </Rect>
      <Rect width={480} grow={1} />
    </Rect>`,
  )}
  );
});`;

  const speed = 0.6;
  yield* all(
    ...axes.map(line => line.start(1, speed)),
    bg().rotation(180, speed),
    bg().position.y(0, speed),
    bg().size([520, 640], speed),
    circle().position([1300 - 960, 340 - 540], speed),
    circle().size([360, 200], speed),
    circle().radius(8, speed),
  );

  const layout = createRef<Rect>();
  view.add(
    <Rect
      ref={layout}
      opacity={0}
      x={400}
      fill={'#242424'}
      height={640}
      layout
      direction={'column'}
      gap={20}
      radius={8}
      padding={20}
    >
      <Rect width={480} gap={20}>
        <Rect
          ref={label}
          width={360}
          height={200}
          fill={'#fafafa'}
          radius={8}
        />
        <Rect grow={1} fill={'#141414'} radius={8} />
      </Rect>
      <Rect width={480} grow={1} fill={'#141414'} radius={8} />
    </Rect>,
  );

  yield* layout().opacity(1, 0.3);
  bg().remove();

  yield* waitUntil('layout_prop');
  yield* code().selection(lines(8), 0.3);

  yield* waitUntil('css');
  yield* code().selection(lines(5, 7), 0.6);

  yield* waitUntil('however');
  yield* code().selection(lines(0, Infinity), 0.32);

  yield* waitUntil('box');
  yield* code().edit(1)`export default makeScene2D(function* (view) {
  ${insert(`const box = createRef<Rect>();
  `)}view.add(
    <Rect
      width={null}
      height={640}
      direction={'column'}
      padding={20}
      gap={20}
      layout
      // style
    >
      <Rect width={480} gap={20}>
        <Rect${insert(' ref={box}')} width={360} height={200} />
        <Rect grow={1} />
      </Rect>
      <Rect width={480} grow={1} />
    </Rect>
  );
});`;

  yield* waitUntil('animate');
  yield* code().edit(1)`export default makeScene2D(function* (view) {
  const box = createRef<Rect>();
  view.add(
    <Rect
      width={null}
      height={640}
      direction={'column'}
      padding={20}
      gap={20}
      layout
      // style
    >
      <Rect width={480} gap={20}>
        <Rect ref={box} width={360} height={200} />
        <Rect grow={1} />
      </Rect>
      <Rect width={480} grow={1} />
    </Rect>
  );${insert(`
  
  yield* box().size(['50%', 320], 1).to(80, 1);`)}
});`;

  yield* waitUntil('50%');
  yield* code().selection(word(20, 21, 5), 0.3);

  yield* waitUntil('height');
  yield* code().selection(word(20, 28, 3), 0.3);
  yield* label().size(['50%', 320], 1);

  yield* waitUntil('second');
  yield* code().selection(word(20, 40, 2), 0.3);
  yield* label().size(80, 1);

  yield* waitUntil('translation');
  yield code().selection(lines(0, Infinity), 0.6);
  yield loop(Infinity, () =>
    label().size([360, 200], 1).to(['50%', 320], 1).to(80, 1),
  );

  yield* waitUntil('next');
});
