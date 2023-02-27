import {makeScene2D} from '@motion-canvas/2d';
import {all, chain, delay, loop, waitUntil} from '@motion-canvas/core/lib/flow';
import {Circle, Node, Line, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {
  createRef,
  makeRef,
  range,
  useRandom,
  useScene,
} from '@motion-canvas/core/lib/utils';
import {easeOutCubic, linear} from '@motion-canvas/core/lib/tweening';
import {cancel, join} from '@motion-canvas/core/lib/threading';

const positions = [
  [813, -181],
  [-535, -452],
  [-511, 9],
  [-812, 511],
  [234, 206],
  [514, -142],
  [746, 305],
  [55, 462],
  [-231, -231],
  [452, -465],
  [720, -31],
  [-292, 211],
  [-843, 172],
  [-700, -170],
  [85, -509],
  [-28, 43],
  // [506, -438],
  [509, 124],
];

export default makeScene2D(function* (view) {
  const label = createRef<Txt>();
  const signals: Circle[] = [];
  const random = useRandom(4);
  const lineGroup = createRef<Node>();
  const circleGroup = createRef<Node>();
  const mainLinnGroup = createRef<Node>();

  view.add(
    <>
      <Node ref={lineGroup} />
      <Node ref={circleGroup}>
        {positions.map(([x, y], i) => (
          <Circle
            ref={makeRef(signals, i)}
            width={20}
            height={20}
            fill={'#242424'}
            opacity={0}
            x={x}
            y={y}
          />
        ))}
      </Node>
      <Node ref={mainLinnGroup} />
      <Rect layout fill={'#141414'} padding={[30, 40, 20]} radius={8}>
        <Txt
          ref={label}
          fontSize={120}
          lineHeight={120}
          fontFamily={'JetBrains Mono'}
          fill={'rgba(255, 255, 255, 0.6)'}
        />
      </Rect>
    </>,
  );

  yield signals[0].fill('#68ABDF').opacity(1, 0.1);
  yield delay(1.7, signals[0].fill('#242424', 1));
  yield label().text('SIGNALS', 1, linear);
  let current = 0;
  const task = yield loop(Infinity, function* () {
    const start = signals[current];
    const count = random.nextInt(2, 4);
    const ids = random.intArray(count, 2, signals.length - 2);
    ids[0] = 1;
    const targets = range(count).map(
      n => signals[(current + ids[n]) % signals.length],
    );
    current = (current + ids[0]) % signals.length;

    const lines: Line[] = [];
    lineGroup().add(
      range(count).map(i => (
        <Line
          lineCap={'round'}
          ref={makeRef(lines, i)}
          points={[start.position(), targets[i].position()]}
          lineWidth={8}
          stroke={i == 0 ? '#68ABDF' : '#242424'}
          end={0}
        />
      )),
    );
    mainLinnGroup().add(lines[0]);

    const speed = start.position().sub(targets[0].position()).magnitude / 1500;

    yield all(
      ...lines.slice(1).map((line, i) => {
        const speed =
          start.position().sub(targets[i + 1].position()).magnitude / 1500;

        return chain(
          all(
            line.end(1, speed),
            delay(speed - 0.1, targets[i + 1].opacity(1, 0.1)),
          ),
          line.start(1, speed),
        );
      }),
    );
    yield* all(
      delay(
        speed - 0.1,
        all(targets[0].fill('#68ABDF', 0.1), targets[0].opacity(1, 0.1)),
      ),
      lines[0].end(1, speed, linear),
    );
    yield delay(
      1,
      all(targets[0].fill('#242424', 1), lines[0].opacity(0, 1, linear)),
    );
  });

  yield* waitUntil('next');
  yield* all(
    label().parent().position.y(-1400, 1),
    lineGroup().position.y(-1080, 1),
    mainLinnGroup().position.y(-1080, 1),
    circleGroup().position.y(-1080, 1),
  );
  cancel(task);

  const circle = createRef<Circle>();
  const square = createRef<Rect>();
  const arrow = createRef<Line>();

  view.add(
    <>
      <Circle
        scale={0}
        ref={circle}
        width={240}
        height={240}
        fill={'#68ABDF'}
      />
      <Rect
        ref={square}
        x={480}
        width={240}
        height={240}
        fill={'#ff6470'}
        radius={8}
        scale={0}
      />
      <Line
        ref={arrow}
        position={circle().position}
        stroke={'#666'}
        lineWidth={8}
        endArrow
        startOffset={() => (240 / 2) * circle().scale.x() + 20}
        lineDash={[20, 20]}
        lineDashOffset={() => (240 / 2) * circle().scale.x() + 20}
        endOffset={200}
        end={0}
        radius={480}
        points={[
          [0, 0],
          [480, 480],
          [960, 0],
        ]}
      />
    </>,
  );

  yield* waitUntil('circle');
  yield* circle().scale(1.5, 0.5, easeOutCubic);
  const task2 = yield loop(Infinity, () =>
    all(circle().scale(1, 1).to(1.5, 1), square().rotation(-65, 1).to(-25, 1)),
  );

  yield* waitUntil('square');
  yield all(
    circle().position.x(-480, 0.6),
    square().scale(1.25, 0.6),
    arrow().end(1, 0.6),
  );

  yield* waitUntil('end');
  useScene().enterCanTransitionOut();
  yield* join(task2);
});
