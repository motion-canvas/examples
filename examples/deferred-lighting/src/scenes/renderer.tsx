import {makeScene2D} from '@motion-canvas/2d';
import {
  Image,
  Layout,
  Rect,
  RectProps,
  Text,
} from '@motion-canvas/2d/lib/components';
import {all, delay, waitUntil} from '@motion-canvas/core/lib/flow';
import {BlackLabel, Colors, WhiteLabel} from '../styles';

import layers from '../images/icons/layers.svg';
import flare from '../images/icons/flare.svg';
import desktop from '../images/icons/desktop.svg';
import functions from '../images/icons/functions.svg';
import {
  useContext,
  createRef,
  makeRef,
  makeRefs,
} from '@motion-canvas/core/lib/utils';
import {createSignal, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {Color, Origin, Vector2} from '@motion-canvas/core/lib/types';
import {
  easeInCubic,
  easeInOutCubic,
  linear,
} from '@motion-canvas/core/lib/tweening';
import {invert} from '@motion-canvas/2d/lib/partials';

export default makeScene2D(function* (view) {
  useContext(ctx => ctx.clearRect(-1920 / 2, -1080 / 2, 1920, 1080));

  function Pass({
    name,
    src,
    refs,
    ref,
    ...props
  }: {
    name: string;
    src: string;
    refs?: {
      value: Rect;
      theme: SimpleSignal<number>;
    };
  } & RectProps) {
    const theme = createSignal(0);
    if (refs) {
      refs.theme = theme;
    }

    return (
      <Rect
        layout
        fill={() => Color.lerp(Colors.surfaceLight, 'rgba(0, 0, 0, 0)', theme())}
        radius={8}
        ref={refs ? makeRef(refs, 'value'): ref}
        {...props}
      >
        <Image
          filters={[invert(theme)]}
          opacity={() => linear(theme(), 0.87, 0.54)}
          width={40}
          height={40}
          margin={20}
          src={src}
        />
        <Text
          paddingRight={40}
          {...BlackLabel}
          fill={() => Color.lerp(BlackLabel.fill, WhiteLabel.fill, theme())}
          lineHeight={80}
          cache
        >
          {name}
        </Text>
      </Rect>
    );
  }

  const renderer = createRef<Rect>();
  const passes = createRef<Layout>();
  const parallaxClone = createRef<Rect>();
  const background = createRef<Rect>();
  const parallax = makeRefs<typeof Pass>();

  yield view.add(
    <>
      <Rect
        ref={background}
        width={1920}
        height={1080}
        fill={'#141414'}
        y={-1080}
      />
      <Rect
        ref={renderer}
        direction="column"
        layout
        fill="#242424"
        radius={8}
        height={0}
        clip
      >
        <Text
          cache
          paddingLeft={40}
          paddingRight={40}
          paddingTop={20}
          {...WhiteLabel}
        >
          PIXEL ART RENDERER
        </Text>
        <Layout
          ref={passes}
          direction="column"
          gap={20}
          paddingLeft={40}
          paddingRight={40}
          marginBottom={40}
          marginTop={20}
          clip
        >
          <Pass name="Simulation Pass" src={functions} />
          <Pass ref={parallaxClone} name="Parallax Pass" src={layers} />
          <Pass name="Post Effects Pass" src={flare} />
          <Pass name="HUD Pass" src={desktop} />
        </Layout>
      </Rect>
      <Pass opacity={0} refs={parallax} name="Parallax Pass" src={layers} />
    </>,
  );

  yield* waitUntil('passes');
  yield* all(renderer().size.y(null, 0.6));

  parallax.value.size(parallaxClone().size());
  parallax.value.absolutePosition(parallaxClone().absolutePosition());
  parallax.value.opacity(1);
  parallaxClone().opacity(0);

  yield* waitUntil('parallax');
  yield* all(
    renderer().scale(Vector2.fromScalar(0.87), 0.6, easeInCubic),
    renderer().opacity(0, 0.6, easeInCubic),
    delay(0.2, parallax.value.ripple()),
  );

  yield* waitUntil('move');
  yield* all(
    background().position.y(0, 0.4),
    parallax.value.position(
      view
        .getOriginDelta(Origin.TopLeft)
        .sub(parallax.value.getOriginDelta(Origin.TopLeft))
        .add(Vector2.fromScalar(20)),
      0.4,
      easeInOutCubic,
      Vector2.arcLerp,
    ),
    parallax.theme(1, 0.4),
  );

  yield* waitUntil('next');
});
