import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  delay,
  loop,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Direction, Vector2} from '@motion-canvas/core/lib/types';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {createRef, useScene} from '@motion-canvas/core/lib/utils';
import {Circle, Line, Rect, Text, Node} from '@motion-canvas/2d/lib/components';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {cancel} from '@motion-canvas/core/lib/threading';

export default makeScene2D(function* (view) {
  const code = createRef<CodeBlock>();

  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());

  const scale = 75;
  const textStyle = {
    fontWeight: 700,
    fontFamily: 'JetBrains Mono',
    fontSize: 32,
    offsetY: -1,
    padding: 10,
    cache: true,
  };

  const preview = createRef<Node>();
  const areaLabel = createRef<Text>();
  const radiusLabel = createRef<Text>();
  const circle = createRef<Circle>();
  const radiusLine = createRef<Line>();

  view.add(
    <Node x={400} ref={preview}>
      <Circle
        ref={circle}
        scale={0}
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        fill={'#e13238'}
      />
      <Line
        ref={radiusLine}
        points={[Vector2.zero, () => Vector2.right.scale(radius() * scale)]}
        lineDash={[10, 10]}
        startArrow
        endArrow
        endOffset={8}
        lineWidth={8}
        arrowSize={16}
        end={0}
        stroke={'#242424'}
      />
      <Text
        ref={radiusLabel}
        fill={'#242424'}
        x={() => (radius() * scale) / 2}
        {...textStyle}
      />
      <Text ref={areaLabel} fill={'#e13238'} {...textStyle} />
    </Node>,
  );

  yield view.add(
    <>
      <Rect
        // layout
        offset={-1}
        x={-960 + 80}
        y={-540 + 80}
        height={1080 - 160}
        width={960}
        clip
      >
        <CodeBlock
          selection={[
            [
              [0, 0],
              [8, 100],
            ],
          ]}
          ref={code}
          fontSize={24}
          lineHeight={36}
          offsetX={-1}
          x={-960 / 2}
          fontFamily={'JetBrains Mono'}
          code={`export default makeScene2D(function* (view) {

});`}
        />
      </Rect>
    </>,
  );
  yield* slideTransition(Direction.Bottom, 1);
  yield* waitUntil('signal');
  yield* code().selection(lines(1), 0.3);
  yield* code().edit(0.8)`export default makeScene2D(function* (view) {
${insert(`  const radius = createSignal(3);`)}
});`;

  yield* waitUntil('name_radius');
  yield* code().selection(word(1, 7, 5), 0.3);
  yield* waitUntil('name_3');
  yield* code().selection(word(1, 30, 1), 0.3);

  yield* waitUntil('area_signal');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);${insert(`
  const area = createSignal();`)}
});`;

  yield* waitUntil('callback');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(${insert(`() => Math.PI * radius() * radius()`)});
});`;

  yield* waitUntil('invoke');
  yield* code().selection(word(2, 44, 8), 0.3);

  yield* waitUntil('of_course');
  yield* code().selection(lines(0, Infinity), 0.3);

  yield* waitUntil('text');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());${insert(`
      
  view.add(
    <>
      <Text
        text={'Hello!'}
        // style
      />
    </>,
  );`)}
});`;

  yield* areaLabel().text('Hello!', 0.3);

  yield* waitUntil('hardcoded');
  yield* code().selection(word(7, 14, 8), 0.3);

  yield* waitUntil('text_callback');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
      
  view.add(
    <>
      <Text
        text={${edit(`'Hello!'`, `() => \`A = \${area().toFixed(2)}\``)}}
        // style
      />
    </>,
  );
});`;
  yield areaLabel().text(() => `A = ${area().toFixed(2)}`, 0.6);

  yield* waitUntil('text_animate');
  const task = yield delay(
    0.6,
    loop(Infinity, () => radius(4, 2).to(3, 2)),
  );
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
      
  view.add(
    <>
      <Text
        text={() => \`A = \${area().toFixed(2)}\`}
        // style
      />
    </>,
  );${insert(`

  yield* radius(4, 1).to(3, 1);`)}
});`;

  yield* waitUntil('circle');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());${insert(`
  const scale = 100;`)}
      
  view.add(
    <>${insert(`
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />`)}
      <Text
        text={() => \`A = \${area().toFixed(2)}\`}
        // style
      />
    </>,
  );

  yield* radius(4, 1).to(3, 1);
});`;
  yield* circle().scale(1, 1.2);

  yield* waitUntil('offset');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
  const scale = 100;
      
  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />
      <Text
        text={() => \`A = \${area().toFixed(2)}\`}${insert(`
        y={() => radius() * scale}`)}
        // style
      />
    </>,
  );

  yield* radius(4, 1).to(3, 1);
});`;
  yield* waitFor(0.15);
  yield* areaLabel().position.y(() => radius() * scale, 0.3);

  yield* waitUntil('line');
  code().moveOffset(new Vector2(-1, 0.55));
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
  const scale = 100;
      
  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />
      <Text
        text={() => \`A = \${area().toFixed(2)}\`}
        y={() => radius() * scale}
        // style
      />${insert(`
      <Line
        points={[
          Vector2.zero, 
          () => Vector2.right.scale(radius() * scale)
        ]}
        // style
      />`)}
    </>,
  );

  yield* radius(4, 1).to(3, 1);
});`;
  yield radiusLine().end(1, 0.3);

  yield* waitUntil('radius');
  code().moveOffset(new Vector2(-1, 1));
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
  const scale = 100;
      
  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />
      <Text
        text={() => \`A = \${area().toFixed(2)}\`}
        y={() => radius() * scale}
        // style
      />
      <Line
        points={[
          Vector2.zero, 
          () => Vector2.right.scale(radius() * scale)
        ]}
        // style
      />${insert(`
      <Text
        text={() => \`r = \${radius().toFixed(2)}\`}
        x={() => (radius() * scale) / 2}
        // style
      />`)}
    </>,
  );

  yield* radius(4, 1).to(3, 1);
});`;
  yield radiusLabel().text(() => `r = ${radius().toFixed(2)}`, 0.3);

  yield* waitUntil('setup_once');
  yield* all(code().position.y(610, 0.6), code().selection(lines(6, 29), 0.6));

  yield* waitUntil('animate_one');
  yield* all(
    code().position.y(452.69999999999993, 0.6),
    code().selection(lines(32), 0.6),
  );

  yield* waitUntil('area_ref');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
  const scale = 100;${insert(`
  const areaLabel = createRef<Text>();`)}
      
  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />
      <Text${insert(`
        ref={areaLabel}`)}
        text={() => \`A = \${area().toFixed(2)}\`}
        y={() => radius() * scale}
        // style
      />
      <Line
        points={[
          Vector2.zero, 
          () => Vector2.right.scale(radius() * scale)
        ]}
        // style
      />
      <Text
        text={() => \`r = \${radius().toFixed(2)}\`}
        x={() => (radius() * scale) / 2}
        // style
      />
    </>,
  );

  yield* radius(4, 1).to(3, 1);
});`;

  yield* waitUntil('area_change');
  yield* code().edit(1.2)`export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());
  const scale = 100;
  const areaLabel = createRef<Text>();
      
  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        // style
      />
      <Text
        ref={areaLabel}
        text={() => \`A = \${area().toFixed(2)}\`}
        y={() => radius() * scale}
        // style
      />
      <Line
        points={[
          Vector2.zero, 
          () => Vector2.right.scale(radius() * scale)
        ]}
        // style
      />
      <Text
        text={() => \`r = \${radius().toFixed(2)}\`}
        x={() => (radius() * scale) / 2}
        // style
      />
    </>,
  );

  yield* radius(4, 1).to(3, 1);${insert(`
  yield* areaLabel().text('Hello again!', 0.3);`)}
});`;

  yield* waitUntil('update_loop');
  cancel(task);
  yield* areaLabel().text('Hello again!', 0.3);

  yield* waitUntil('next');
  useScene().enterCanTransitionOut();
});
