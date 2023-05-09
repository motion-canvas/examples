import {makeScene2D} from '@motion-canvas/2d';
import {
  Circle,
  Img,
  Line,
  Node,
  Rect,
  RectProps,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  chain,
  delay,
  loop,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {
  easeInCubic,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
} from '@motion-canvas/core/lib/tweening';
import {Container, makeContainer} from '../components';
import {Upscale, createParallax, createUpscale} from '../components';
import {Gradient} from '@motion-canvas/2d/lib/partials';
import previous from '../videos/previous.png';
import {BlackLabel, Colors} from '../styles';
import {
  createRef,
  finishScene,
  makeRef,
  makeRefs,
} from '@motion-canvas/core/lib/utils';

import layers from '../images/icons/layers.svg';
import flare from '../images/icons/flare.svg';
import desktop from '../images/icons/desktop.svg';
import functions from '../images/icons/functions.svg';
import {Color, Vector2} from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const scale = 30;

  const renderer = createRef<Rect>();
  const pass = makeRefs<typeof Pass>();

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
    };
  } & RectProps) {
    return (
      <Rect
        layout
        fill={Colors.surfaceLight}
        radius={8}
        ref={refs ? makeRef(refs, 'value') : ref}
        {...props}
      >
        <Img opacity={0.87} width={40} height={40} margin={20} src={src} />
        <Txt paddingRight={40} {...BlackLabel} lineHeight={80} cache>
          {name}
        </Txt>
      </Rect>
    );
  }

  const lightBrightness = createSignal(0);
  const light = createRef<Circle>();
  const lightBG = '#242424';
  const lightColor = '#ffc859';
  const lights = (
    <Node>
      <Rect fill={lightBG} width={1280} height={1080} scale={scale / 24}>
        <Circle
          ref={light}
          x={380}
          y={-40}
          size={() => lightBrightness() * 1000}
          startAngle={-60}
          endAngle={60}
          rotation={135}
          closed
          fill={
            new Gradient({
              type: 'radial',
              from: 0,
              to: 0,
              toRadius: 320,
              stops: [
                {offset: 0, color: lightColor},
                {
                  offset: 1,
                  color: () => new Color(lightColor).alpha(1),
                },
              ],
            })
          }
        />
        <Circle
          fill={lightBG}
          size={80}
          x={8 * 24}
          y={5 * 24}
          antialiased={false}
        >
          <Line
            points={[
              [30, 25],
              [-25, -30],
              [-300, 140],
              [-160, 245],
            ]}
            fill={lightBG}
          />
        </Circle>
      </Rect>
    </Node>
  );

  const preview = createRef<Rect>();
  const video = createRef<Img>();

  yield view.add(
    <>
      <Rect ref={renderer} layout clip height={0}>
        <Container label="PIXEL ART RENDERER">
          <Pass name="Simulation Pass" src={functions} />
          <Pass refs={pass} name="Parallax Pass" src={layers} />
          <Pass name="Post Effects Pass" src={flare} />
          <Pass name="HUD Pass" src={desktop} />
        </Container>
      </Rect>
      <Rect ref={preview} clip>
        <Img
          ref={video}
          y={200}
          opacity={0}
          src={previous}
          width={1920 - 160}
          // time={196.7}
        />
      </Rect>
    </>,
  );

  yield* waitUntil('show_renderer');
  yield* renderer().height(null, 0.6);
  const clone = pass.value.clone();
  preview().add(clone);
  preview()
    .absolutePosition(pass.value.absolutePosition())
    .size(pass.value.size())
    .radius(clone.radius())
    .fill(clone.fill());
  clone.position(0).size(pass.value.size());

  yield* waitUntil('show_previous');
  // video().play();
  yield* all(
    preview().size(
      [1920 - 160, 1080 - 160],
      0.6,
      easeInOutCubic,
      Vector2.arcLerp,
    ),
    preview().position(0, 0.6),
    preview().fill('#141414', 0.6),
    clone.opacity(0, 0.3),
    delay(
      0.3,
      all(video().opacity(1, 0.3), video().position.y(0, 0.3, easeOutCubic)),
    ),
  );
  clone.remove();
  renderer().remove();

  const lightsPreview = createRef<Upscale>();
  const parallaxCard = makeContainer();
  const upscaleCard = makeContainer();
  const upscaleContainer = createRef<Rect>();
  const upscale = yield* createUpscale(scale);
  const parallax = yield* createParallax(scale);
  view.add(
    <>
      <Container
        refs={parallaxCard}
        x={-620}
        label="PARALLAX SCROLLING"
        fill={null}
        y={80}
        opacity={0}
      >
        {parallax}
      </Container>
      <Container label="DEFERRED LIGHTS" fill={null}>
        <Upscale
          ref={lightsPreview}
          clip
          radius={8}
          factor={scale}
          width={16 * scale}
          height={9 * scale}
          ratio={1}
          smoothing={false}
          src={lights}
        />
      </Container>
      <Container
        refs={upscaleCard}
        x={620}
        fill={null}
        label="UPSCALING"
        y={80}
        opacity={0}
      >
        <Rect
          ref={upscaleContainer}
          width={480}
          height={270}
          radius={8}
          fill={'#242424'}
        >
          {upscale}
        </Rect>
      </Container>
    </>,
  );
  preview().moveToTop();
  const lightClone = lightsPreview().clone({opacity: 0});
  preview().add(lightClone);
  lightClone.absolutePosition(() => lightsPreview().absolutePosition());

  yield* waitUntil('hide_previous');
  yield* all(
    preview().size(
      lightClone.size(),
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(true),
    ),
    preview().absolutePosition(lightsPreview().absolutePosition(), 0.6),
    preview().fill(lightBG, 0.6),
    video().opacity(0, 0.3),
    view.fill('#141414', 0.6),
    video().position.y(80, 0.3, easeInCubic),
    delay(0.3, all(lightClone.opacity(1, 0.3))),
  );
  // video().pause();
  preview().remove();
  yield chain(
    lightBrightness(1, 1.4),
    loop(Infinity, function* () {
      yield* all(
        light().startAngle(-24, 1.4, easeInOutQuart),
        light().endAngle(24, 1.4, easeInOutQuart),
      );
      yield* light()
        .rotation(170, 1.4, easeInOutQuart)
        .to(110, 1.4)
        .to(135, 1.4);
    }),
  );

  parallax.children()[0].opacity(0);
  (parallax as Rect).fill('#242424');
  parallaxCard.label.text('INGREDIENT 1');

  upscale.opacity(0);
  upscaleCard.label.text('INGREDIENT 2');
  yield* waitUntil('ingredients');
  yield* all(
    parallaxCard.rect.position.y(0, 0.3, easeOutCubic),
    parallaxCard.rect.opacity(1, 0.3),
    upscaleCard.rect.position.y(0, 0.3, easeOutCubic),
    upscaleCard.rect.opacity(1, 0.3),
  );

  yield* waitUntil('parallax');
  yield* all(
    parallax.children()[0].opacity(1, 0.3),
    (parallax as Rect).fill(null, 0.3),
    parallaxCard.label.text('PARALLAX SCROLLING', 0.3),
  );

  yield* waitUntil('upscaling');
  yield* all(
    upscaleContainer().fill(null, 0.3),
    upscaleCard.label.text('UPSCALING', 0.3),
    upscale.opacity(1, 0.3),
  );

  yield* waitUntil('next');
  finishScene();
  yield* waitFor(3);
});
