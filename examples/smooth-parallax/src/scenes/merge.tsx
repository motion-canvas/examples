import {makeScene2D} from '@motion-canvas/2d';
import {Circle, Img, Node, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {
  brightness,
  contrast,
  hue,
  saturate,
} from '@motion-canvas/2d/lib/partials';
import {
  all,
  delay,
  loop,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {zoomOutTransition} from '@motion-canvas/core/lib/transitions';
import {
  easeInExpo,
  easeInOutCubic,
  easeInOutSine,
  easeOutExpo,
  linear,
  map,
  TimingFunction,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {BBox, PossibleVector2, Vector2} from '@motion-canvas/core/lib/types';
import {createRef, finishScene} from '@motion-canvas/core/lib/utils';
import {
  BGColor,
  createParallax,
  createUpscale,
  Parallax,
  ParallaxProps,
  Upscale,
} from '../components';
import {WhiteLabel} from '../styles';

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const upscale = yield* createUpscale(30);
  const parallax = yield* createParallax(30);
  const upscaleCard = createRef<Rect>();
  const parallaxCard = createRef<Rect>();

  view.add(
    <>
      <Rect
        ref={parallaxCard}
        offsetX={1}
        x={-80}
        width={480}
        height={270}
        layout
      >
        {parallax}
      </Rect>
      <Rect
        ref={upscaleCard}
        offsetX={-1}
        x={80}
        width={480}
        height={270}
        layout
      >
        {upscale}
      </Rect>
    </>,
  );

  yield* zoomOutTransition(new BBox(1040, 405, 480, 270));

  yield* waitUntil('reconcile');
  yield* all(
    upscaleCard().position.x(0, 0.3, easeInExpo),
    parallaxCard().position.x(0, 0.3, easeInExpo),
  );
  const time = createSignal(0);
  const strength = createSignal(0);
  const shakePosition = createSignal(() => {
    return Math.sin(time() * 100) * strength();
  });
  upscaleCard().position.y(shakePosition);
  parallaxCard().position.y(shakePosition);

  yield time(10, 10, linear);
  yield* all(
    upscaleCard().scale(
      [0.6, 1.4],
      0.6,
      easeOutExpo,
      Vector2.createArcLerp(false, 2),
    ),
    parallaxCard().scale(
      [0.6, 1.4],
      0.6,
      easeOutExpo,
      Vector2.createArcLerp(false, 2),
    ),
    strength(5, 0.3),
  );

  const camera = createSignal(0);
  const mask = createRef<Circle>();
  const ratios = [0.1, 0.5, 1, 2, 3];

  function createStage(text: string, props: ParallaxProps = {}) {
    const parallax = createRef<Parallax>();
    const background = createRef<Rect>();
    const light = createRef<Circle>();
    const dim = createSignal(0);

    const card = (
      <Rect width={480} height={270} radius={8} clip>
        <Rect
          ref={background}
          fill={BGColor}
          width={480 * 2}
          height={270 * 2}
          x={-240}
          y={-135}
          filters={() => [
            hue(50),
            saturate(map(1, 0, dim())),
            contrast(map(1, 0.5, dim())),
            brightness(map(1, 0.5, dim())),
          ]}
          cache
        >
          <Parallax
            ref={parallax}
            ratios={ratios}
            upscale={30}
            camera={camera}
            x={() => camera() + 240}
            y={135}
            {...props}
          >
            <Circle
              antialiased={false}
              ref={light}
              startAngle={-15}
              endAngle={15}
              closed
              x={150}
              y={-180}
              size={960}
              rotation={120}
              fill={'#fff'}
              opacity={0.3}
            />
          </Parallax>
        </Rect>
      </Rect>
    ) as Rect;
    const label = (
      <Txt
        {...WhiteLabel}
        bottomLeft={card.topLeft}
        opacity={() => map(1, 0.32, dim())}
        lineHeight={60}
      >
        {text}
      </Txt>
    ) as Txt;

    light().moveTo(2);

    return {card, parallax, background, light, label, dim};
  }

  const scene = createStage('1. SCENE', {camera: 0});
  scene.card.position.x(-560);
  const layers = createStage('2. PARALLAX');
  const source = createStage('3. UPSCALING', {light: true});
  source.card.position.x(560);
  source.light().remove();
  const result = createRef<Rect>();

  view.add(
    <Circle ref={mask} size={0} scale={0.5} clip fill={'#242424'}>
      {scene.label}
      {layers.label}
      {source.label}
      {scene.card}
      {layers.card}
      <Rect
        ref={result}
        position={source.card.position}
        filters={source.background().filters}
        width={480}
        height={270}
        radius={8}
        clip
      >
        <Upscale
          smoothing={false}
          factor={30}
          width={480}
          height={270}
          src={source.background()}
        />
      </Rect>
    </Circle>,
  );
  yield* waitUntil('explode');
  yield* all(
    mask().scale(1, 0.6, easeOutExpo),
    mask().size(view.size().magnitude, 0.6, easeOutExpo),
    mask().fill('#141414', 0.6),
  );
  yield loop(Infinity, () =>
    camera(120, 4, easeInOutSine).to(0, 4, easeInOutSine),
  );

  yield* waitUntil('parallax_select');
  yield* all(scene.dim(1, 0.3), source.dim(1, 0.3));
  yield* waitUntil('result_select');
  yield* all(layers.dim(1, 0.3), source.dim(0, 0.3));

  yield* waitUntil('selection_reset');
  yield* all(layers.dim(0, 0.3), scene.dim(0, 0.3));

  yield* waitUntil('swap_order');
  yield delay(0.3, () => {
    source.label.text('2. UPSCALING');
    layers.label.text('3. PARALLAX');
    layers.light().opacity(0);
    (layers.parallax().layers[2].children()[0] as Img).src(
      (source.parallax().layers[2].children()[0] as Img).src(),
    );
  });
  yield* all(
    moveArc(layers.card, source.card.position(), 0.6),
    moveArc(source.card, layers.card.position(), 0.6),
    source.parallax().camera(0, 0.6),
  );

  yield* waitUntil('upscale_select');
  yield* all(scene.dim(1, 0.3), layers.dim(1, 0.3));
  yield* waitUntil('result_select_again');
  yield* all(layers.dim(0, 0.3), source.dim(1, 0.3));
  yield* waitUntil('selection_reset_again');
  yield* all(source.dim(0, 0.3), scene.dim(0, 0.3));

  yield* waitUntil('next');
  finishScene();
  yield* waitFor(1);
});

function* moveArc(
  node: Node,
  target: PossibleVector2,
  duration: number,
  timingFunction: TimingFunction = easeInOutCubic,
) {
  const from = node.position();
  const to = new Vector2(target);
  const distance = to.sub(from).scale(0.5);
  const center = from.add(distance);
  const fromRadians = distance.flipped.radians;
  const toRadians = distance.radians;
  const length = distance.magnitude;

  yield* tween(
    duration,
    value => {
      const offset = Vector2.fromRadians(
        map(fromRadians, toRadians, timingFunction(value)),
      ).scale(length);
      node.position(center.add(offset));
    },
    () => node.position(target),
  );
}
