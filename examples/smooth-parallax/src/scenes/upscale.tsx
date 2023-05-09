import {makeScene2D} from '@motion-canvas/2d';
import {
  Grid,
  Img,
  Layout,
  Line,
  Node,
  Ray,
  Rect,
  RectProps,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {all, delay, waitUntil} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import frameImg from '../images/upscaling/frame.png';
import {createRef} from '@motion-canvas/core/lib/utils';
import {
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  linear,
} from '@motion-canvas/core/lib/tweening';
import {Origin, Vector2} from '@motion-canvas/core/lib/types';
import {WhiteLabel} from '../styles';
import {Upscale} from '../components';

const OutlineColor = '#F16264';

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const frame = createRef<Rect>();
  const nativeGrid = createRef<Grid>();
  const zoom = 64;

  view.add(
    <>
      <Rect
        ref={frame}
        size={0}
        clip
        radius={8}
        lineWidth={() => 16 / frame().scale.x()}
        stroke={OutlineColor}
      >
        <Img smoothing={false} src={frameImg} width={() => frame().width()} />
        <Grid
          opacity={0}
          ref={nativeGrid}
          width={240}
          height={140}
          y={0.5}
          spacing={1}
          lineWidth={() => 4 / zoom}
        />
      </Rect>
    </>,
  );

  yield* slideTransition();

  yield* waitUntil('native_show');
  yield* frame().size([240, 135], 0.3, easeOutCubic, Vector2.arcLerp);

  const square = (v: number) => easeInOutCubic(v * v);
  const root = (v: number) => easeInOutCubic(Math.sqrt(v));

  yield* waitUntil('native_zoom');
  yield* all(
    frame().scale(zoom, 0.6, square),
    frame().position([14 * zoom, 44 * zoom], 0.6, square),
  );

  yield* waitUntil('native_grid');
  yield* nativeGrid().opacity(1, 0.6);
  yield* waitUntil('native_zoom_out');
  yield* all(
    frame().scale(1, 0.6, root),
    frame().position(0, 0.6, root),
    nativeGrid().opacity(0, 0.3),
  );

  yield* waitUntil('native_upscale');
  const rawImage = (yield (
    <Img
      smoothing={false}
      src={frameImg}
      width={1920 / 2}
      x={960 / 2}
      y={540 / 2}
    />
  )) as Img;
  const screen = (
    <Upscale
      smoothing={false}
      width={1920 / 2}
      height={1080 / 2}
      scale={0.25}
      clip
      radius={() => 8 / screen.scale.x()}
      lineWidth={() => 16 / screen.scale.x()}
      stroke={OutlineColor}
      src={<Node>{rawImage}</Node>}
    />
  ) as Upscale;
  const arrow = (
    <Ray
      from={frame().position}
      to={screen.position}
      lineWidth={8}
      stroke={OutlineColor}
      endArrow
      startOffset={240 / 2 + 20}
      endOffset={() => (screen.width() * screen.scale.x()) / 2 + 20}
      layout
    />
  ) as Ray;
  const label = (
    <Txt
      {...WhiteLabel}
      fill={OutlineColor}
      lineHeight={60}
      opacity={0}
      offsetY={1}
      position={() => arrow.getPointAtPercentage(0.5).position}
    >
      x4
    </Txt>
  ) as Txt;
  view.add([label, arrow, screen]);
  yield* all(
    frame().position.x(-620, 0.6),
    screen.position.x(320, 0.6),
    screen.scale(1, 0.6),
    delay(0.3, label.opacity(1, 0.3)),
  );

  rawImage.moveOffset(new Vector2(-32 / 240, -91 / 135));

  yield* waitUntil('screen_zoom');
  arrow.to.save();
  yield* all(
    screen.scale(zoom / 2, 0.6, square),
    screen.position([33 * zoom, 90 * zoom], 0.6, square),
  );
  yield* waitUntil('screen_integer');
  frame().remove();
  arrow.remove();
  label.remove();
  const txtScale = createRef<Rect>();

  view.add(
    <Layout
      size={'100%'}
      layout
      justifyContent={'end'}
      alignItems={'start'}
      padding={[92, 96]}
      zIndex={1}
    >
      <Rect
        ref={txtScale}
        opacity={0}
        fill={'#242424'}
        width={256}
        justifyContent={'center'}
        radius={8}
      >
        <Txt
          {...WhiteLabel}
          fontSize={48}
          lineHeight={128}
          text={() => `x${(rawImage.scale.x() * 4).toFixed(2)}`}
        />
      </Rect>
    </Layout>,
  );
  yield* txtScale().opacity(1, 0.3);

  yield* waitUntil('screen_grid_show');
  const screenGrid = (
    <Grid
      x={64}
      y={64}
      width={1920 + 128}
      height={1080 + 128}
      spacing={128 / 4}
      lineWidth={4}
      stroke={'black'}
      opacity={0}
    />
  ) as Grid;
  view.add(screenGrid);
  yield* screenGrid.opacity(0.32, 0.3);

  yield* waitUntil('screen_grid_square');
  const squarePixel = (
    <Line
      lineWidth={8}
      stroke={'#242424'}
      lineJoin={'round'}
      lineCap={'round'}
      radius={8}
      closed
      end={0}
      x={-64}
      y={-64}
      points={[0, [128, 0], 128, [0, 128]]}
    />
  ) as Line;
  view.add(squarePixel);
  yield* squarePixel.end(1, 0.3);

  yield* waitUntil('screen_grid_square_hide');
  yield* squarePixel.opacity(0, 0.3);
  yield* waitUntil('screen_grid_scale');
  yield* rawImage.scale(1.1, 1.2);
  yield* waitUntil('screen_grid_rect');
  squarePixel
    .opacity(1)
    .position([-224, 224])
    .points([0, [128 + 32, 0], [128 + 32, 128], [0, 128]])
    .end(0);
  yield* squarePixel.end(1, 0.3);

  yield* waitUntil('overlay_hide');
  yield* all(
    txtScale().opacity(0, 0.3),
    squarePixel.opacity(0, 0.3),
    screenGrid.opacity(0, 0.3),
    rawImage.scale(1, 0.3),
  );
  yield* waitUntil('screen_zoom_out');
  yield* all(screen.scale(0.5, 0.6, root), screen.position(0, 0.6, root));
  screen.remove();

  const createFrame = (props: RectProps = {}, text = '', top = true) => {
    const image = (
      <Rect
        width={480}
        height={270}
        radius={8}
        clip
        lineWidth={16}
        stroke={OutlineColor}
        {...props}
      >
        <Img src={frameImg} smoothing={false} width={480} />
      </Rect>
    ) as Rect;
    const label = (
      <Txt
        {...WhiteLabel}
        fill={OutlineColor}
        lineHeight={top ? 60 : 80}
        offset={[-1, top ? 1 : -1]}
        text={text}
        opacity={image.opacity}
        position={() =>
          image
            .position()
            .add(image.getOriginDelta(top ? Origin.TopLeft : Origin.BottomLeft))
        }
      />
    ) as Txt;
    view.add([image, label]);
    return {image, label};
  };

  const gameplay = createFrame();
  yield* waitUntil('gameplay_red');
  yield* gameplay.label.text('480x270 [GAMEPLAY]', 0.3);

  yield* waitUntil('cutscene_show');
  const cutscene = createFrame();
  cutscene.image.moveToBottom();
  (cutscene.image.children()[0] as Img).width(960).position([64, -24]);
  yield* all(
    gameplay.image.position.x(480 - 120, 0.6),
    cutscene.image.position.x(-480 + 120, 0.6),
  );
  yield* waitUntil('cutscene_res');
  yield* cutscene.label.text('240x135 [CUTSCENES]', 0.3);
  yield* waitUntil('screen_res');
  const fullHD = createFrame(
    {x: 480 - 120, y: 270 - 60},
    '1920x1080 [FULL HD]',
    false,
  );
  const fourK = createFrame(
    {x: -480 + 120, y: 270 - 60},
    '3840x2160 [4K UHD]',
    false,
  );

  const createConnection = (
    text: string,
    from: Node,
    to: Node,
    vertical = false,
  ) => {
    const ray = createRef<Ray>();
    const txt = createRef<Txt>();

    view.add(
      <Ray
        ref={ray}
        lineWidth={8}
        stroke={OutlineColor}
        arrowSize={20}
        from={from.position}
        to={to.position}
        startOffset={(vertical ? 270 : 480) / 2 + 20}
        endOffset={(vertical ? 270 : 480) / 2 + 20}
        endArrow
        layout
        alignItems={vertical ? 'center' : 'end'}
        justifyContent={vertical ? 'start' : 'center'}
        end={0}
      >
        <Txt
          opacity={() =>
            ray().offsetArcLength() > 0
              ? ray().arcLength() / ray().offsetArcLength()
              : 0
          }
          ref={txt}
          padding={[0, 20]}
          {...WhiteLabel}
          lineHeight={60}
          fill={OutlineColor}
        >
          {text}
        </Txt>
      </Ray>,
    );

    return {txt: txt(), ray: ray()};
  };

  const cutsceneArrow = createConnection('x2', cutscene.image, gameplay.image);
  const gameplayArrow = createConnection(
    'x4',
    gameplay.image,
    fullHD.image,
    true,
  );
  const fullHDArrow = createConnection('x2', fullHD.image, fourK.image);

  yield* all(
    gameplay.image.position.y(-270 + 60, 0.6),
    cutscene.image.position.y(-270 + 60, 0.6),
    fullHD.image.opacity(0).opacity(1, 0.6),
    fourK.image.opacity(0).opacity(1, 0.6),
  );

  yield* cutsceneArrow.ray.end(1, 0.3, easeInCubic);
  yield* gameplayArrow.ray.end(1, 0.1, linear);
  yield* fullHDArrow.ray.end(1, 0.3, easeOutCubic);

  yield* waitUntil('next');
});
