import {Circle, Layout, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {
  all,
  createRef,
  easeInCubic,
  easeOutCubic,
  waitFor,
} from '@motion-canvas/core';
import {ATxt} from '../nodes';

const labels = [
  {text: 'Virtual Memory', color: null},
  {text: 'Just-in-time compilation', color: '#24211d'},
  {text: 'Bevy Editor', color: null},
  {
    text: 'This video simplifies certain topics for the sake of brevity.\nWhen seeing this icon, check out the description for additional information.',
    duration: 0.6,
  },
];

export default makeScene2D(function* (view) {
  const box = createRef<Rect>();
  const circle = createRef<Circle>();
  const index = createRef<Txt>();
  const label = createRef<Txt>();
  view.add(
    <Layout size={'100%'} layout padding={60} alignItems={'start'}>
      <Rect
        ref={box}
        alignItems={'center'}
        radius={40}
        padding={20}
        gap={24}
        paddingRight={40}
      >
        <Circle
          ref={circle}
          alignSelf={'start'}
          fill={'white'}
          cache
          opacity={0.6}
          margin={-4}
          size={48}
          scale={0}
        >
          <Layout layout={false}>
            <ATxt
              layout={false}
              ref={index}
              fontSize={32}
              fill={'white'}
              compositeOperation={'destination-out'}
            >
              1
            </ATxt>
          </Layout>
        </Circle>
        <ATxt
          textWrap={'pre'}
          fill={'white'}
          ref={label}
          opacity={0.6}
          height={null}
          marginBottom={-8}
        />
      </Rect>
    </Layout>,
  );

  let i = 0;
  for (const {text, color, duration = 0.3} of labels) {
    i++;
    index().text(i === 4 ? '?' : i.toString());
    yield* all(
      box().fill(color, 0.3, easeOutCubic),
      circle().scale(1, duration, easeOutCubic),
      label().text(text, duration, easeOutCubic),
    );
    yield* waitFor(1);
    yield* all(
      box().fill(null, 0.3, easeInCubic),
      circle().scale(0, duration, easeInCubic),
      label().text(' ', duration, easeInCubic),
    );
    yield* waitFor(1);
  }
});
