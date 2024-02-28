import {Layout, makeScene2D, Rect, RectProps} from '@motion-canvas/2d';
import {
  all,
  createRefArray,
  easeOutCubic,
  sequence,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import jeff from '../image/jeff.png';
import {animate, Atlas} from '../nodes';

const theme = {
  window: '#39835d',
  bgDark: '#0c0f0d',
  radius: 8,
};

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);

  const tiles = createRefArray<Rect>();

  view.add(
    <Layout layout direction={'column'} gap={40}>
      <Layout gap={40}>
        <Animation ref={tiles} index={0} length={8} />
        <Animation ref={tiles} index={6} length={5} space={480} />
      </Layout>
      <Layout gap={40}>
        <Animation ref={tiles} index={2} length={6} />
        <Animation ref={tiles} index={8} length={3} space={160} />
      </Layout>
    </Layout>,
  );

  tiles.map(t => t.opacity(0).scale(0.9));
  yield* waitTransition();
  yield* sequence(
    0.1,
    ...tiles.map(t =>
      all(t.opacity(1, 0.5, easeOutCubic), t.scale(1, 0.5, easeOutCubic)),
    ),
  );

  yield* waitUntil('next');
});

function Animation({
  index,
  length,
  space = 0,
  ...props
}: RectProps & {
  index: number;
  length: number;
  space?: number;
}) {
  const padding = 60;
  return (
    <Rect
      fill={theme.window}
      size={360}
      radius={theme.radius}
      alignItems={'end'}
      clip
      {...props}
    >
      <Atlas
        layout={false}
        ref={animate(index * 8, length)}
        src={jeff}
        size={240}
        grid={[8, 10]}
      />
      <Rect
        fill={'black'}
        grow={1}
        opacity={0.16}
        height={padding}
        marginRight={space}
      />
    </Rect>
  );
}
