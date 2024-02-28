import {Layout, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {
  all,
  Color,
  createRef,
  createRefArray,
  createRefMap,
  easeOutCubic,
  finishScene,
  join,
  loop,
  range,
  run,
  useRandom,
  waitUntil,
} from '@motion-canvas/core';
import {ATxt} from '../nodes';

const theme = {
  bg: '#241a1a',
  bgDark: '#0f0a0a',
  code: '#e71720',
  data: '#f58f29',
  radius: 8,
};

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);
  const labels = createRefMap<Txt>();
  const gameSize = createRef<Rect>();
  const gameFile = createRef<Rect>();
  const pcSize = createRef<Rect>();
  const root = createRef<Layout>();

  view.add(
    <Layout
      ref={root}
      layout
      width={'100%'}
      gap={20}
      padding={80}
      direction={'column'}
      alignItems={'stretch'}
    >
      <Layout ref={gameSize} width={160} gap={20} direction={'column'}>
        <Layout justifyContent={'space-between'}>
          <ATxt ref={labels.game} />
          <ATxt ref={labels.gameSize} opacity={0} />
        </Layout>
        <Rect
          ref={gameFile}
          height={160}
          radius={theme.radius}
          fill={theme.bg}
          padding={20}
        >
          <Rect fill={theme.bgDark} size={'100%'} radius={theme.radius} />
        </Rect>
      </Layout>
      <Layout gap={20} direction={'column'} width={`${(16 / 113) * 100}%`}>
        <Rect
          ref={pcSize}
          height={160}
          width={0}
          radius={theme.radius}
          fill={theme.bg}
        />
        <Layout justifyContent={'space-between'}>
          <ATxt ref={labels.pc} opacity={0}>
            PC
          </ATxt>
          <ATxt ref={labels.pcSize} opacity={0}>
            16 GB
          </ATxt>
        </Layout>
      </Layout>
    </Layout>,
  );

  yield loop(() => {
    labels
      .gameSize()
      .text(
        `${Math.round((gameSize().width() / (view.width() - 160)) * 120)} GB`,
      );
  });

  yield* waitUntil('show_size');
  yield* labels.gameSize().opacity(1, 0.3);
  yield* waitUntil('expand_size');
  yield* all(
    gameSize().width(null, 2),
    labels.game().text('Red Dead Redemption 2', 2),
  );

  yield* waitUntil('show_pc');
  yield* all(
    labels.pc().opacity(1, 0.6),
    labels.pcSize().opacity(1, 0.6),
    pcSize().width(null, 1, easeOutCubic),
  );

  yield* waitUntil('split_data');
  const parts = createRefArray<Rect>();
  const firstPart = gameFile().childAs<Rect>(0);
  gameFile().add(
    range(63).map(i => (
      <Rect
        ref={parts}
        size={'100%'}
        radius={i === 62 ? [0, 8, 8, 0] : 0}
        fill={theme.bgDark}
      />
    )),
  );
  firstPart.radius([8, 0, 0, 8]);
  yield* all(gameFile().gap(8, 0.6));

  yield* waitUntil('load');

  const ramParts = createRefArray<Rect>();
  pcSize().add(
    range(8).map(i => (
      <Rect
        ref={ramParts}
        height={'100%'}
        width={firstPart.width()}
        radius={i === 0 ? [8, 0, 0, 8] : i === 7 ? [0, 8, 8, 0] : 0}
      />
    )),
  );
  pcSize().padding(20).gap(8);
  parts.unshift(firstPart);

  yield* all(parts[0].fill(theme.code, 0.1), ramParts[0].fill(theme.code, 0.1));

  const task = yield run(function* () {
    let event = 0;
    let free = [1, 2, 3, 4, 5, 6, 7];
    const allocated: [number, number][] = [];
    const random = useRandom();
    for (let i = 1; i < 64; i++) {
      if (free.length === 0) {
        if (event === 0) {
          yield* waitUntil(`unload_${event}`);
        }

        let remove = event === 0 ? 4 : random.nextInt(1, allocated.length - 3);
        while (remove > 0) {
          remove--;
          const removeIndex = random.nextInt(0, allocated.length - 1);
          const alloc = allocated[removeIndex];
          allocated.splice(removeIndex, 1);
          yield* all(
            parts[alloc[0]].fill(theme.bgDark, 0.16),
            ramParts[alloc[1]].fill(theme.bg, 0.16),
          );
          free.push(alloc[1]);
        }

        if (event === 0) {
          yield* waitUntil(`load_${event}`);
        }
        event++;
      }

      const next = free.shift();
      allocated.push([i, next]);
      const color = Color.lerp(theme.code, theme.data, i / 63);
      yield* all(parts[i].fill(color, 0.16), ramParts[next].fill(color, 0.16));
    }
  });

  yield* waitUntil('next');
  finishScene();
  yield* join(task);
});
