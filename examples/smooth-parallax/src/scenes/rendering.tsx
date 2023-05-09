import {makeScene2D} from '@motion-canvas/2d';
import {
  Circle,
  Grid,
  Img,
  Layout,
  Node,
  Ray,
  Rect,
  Txt,
  View2D,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  delay,
  loop,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Color, Direction, Vector2} from '@motion-canvas/core/lib/types';
import {Container, Parallax, BGColor, Upscale} from '../components';
import {BlackLabel, WhiteLabel} from '../styles';
import {createRef, makeRef, range} from '@motion-canvas/core/lib/utils';
import {
  clampRemap,
  easeInCubic,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  map,
  remap,
} from '@motion-canvas/core/lib/tweening';
import {createSignal} from '@motion-canvas/core/lib/signals';
import checker from '../images/grid.svg';
import {
  brightness,
  contrast,
  hue,
  Pattern,
  saturate,
  sepia,
} from '@motion-canvas/2d/lib/partials';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
const checkerImage = new Image();
checkerImage.src = checker;

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const parallax = createRef<Parallax>();
  const buffer = createRef<Rect>();
  const parallaxCard = createRef<Rect>();
  const colorTex = createRef<Rect>();
  const normalTex = createRef<Rect>();
  const gizmo = createRef<Rect>();
  const grid = createRef<Grid>();
  const camera = createSignal(50);
  const parallaxOffset = createSignal(0);
  const viewport = createRef<Node>();
  const scene = createRef<Rect>();

  yield view.add(
    <Node ref={viewport}>
      <Container ref={buffer} x={540} label="G-BUFFER">
        <Rect
          ref={colorTex}
          width={480}
          height={270}
          radius={8}
          clip
          fill={'#141414'}
          layout
        >
          <Txt {...WhiteLabel} lineHeight={60} padding={[10, 20]}>
            COLOR
          </Txt>
        </Rect>
        <Rect
          ref={normalTex}
          width={480}
          height={270}
          radius={8}
          fill={'#141414'}
        >
          <Txt {...WhiteLabel} lineHeight={60} padding={[10, 20]}>
            NORMAL
          </Txt>
        </Rect>
      </Container>
      <Rect
        ref={scene}
        x={-320}
        width={960}
        height={700}
        radius={8}
        fill={'black'}
        clip
      >
        <Rect ref={parallaxCard} width={960} height={700} fill={BGColor}>
          <Parallax
            ref={parallax}
            ratios={[0.3, 0.7, 1, 2.7]}
            upscale={50}
            x={camera}
            camera={() => camera() * parallaxOffset()}
          />
          <Grid
            ref={grid}
            opacity={0}
            width={960 + 200}
            height={700 + 200}
            spacing={50}
            stroke={'#fff'}
            lineWidth={() => 2 / viewport().scale.x()}
            y={25}
          />
        </Rect>
        <Txt
          {...WhiteLabel}
          lineHeight={100}
          shadowBlur={8}
          shadowColor={'rgba(0, 0, 0, 0.16)'}
          fill={'white'}
          topLeft={() => scene().size().scale(-0.5).addX(40)}
        >
          SCENE
        </Txt>
        <Rect
          ref={gizmo}
          width={50 * 16}
          height={50 * 9}
          lineWidth={8}
          radius={8}
          stroke={'#fff'}
        >
          <Rect size={() => 8 / viewport().scale.x()} fill={'#fff'} />
        </Rect>
        <Ray
          lineWidth={() => 8}
          stroke={'white'}
          lineCap={'square'}
          to={gizmo().position}
        />
      </Rect>
    </Node>,
  );

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('layers_show');
  const layers = parallax().layers;
  yield* all(...layers.slice(1).map(l => l.opacity(0, 0.3)));
  for (let i = 1; i < layers.length; i++) {
    yield* waitFor(0.3);
    yield* all(layers[i - 1].opacity(0, 0.3), layers[i].opacity(1, 0.3));
  }
  yield* waitFor(0.3);
  yield* all(...layers.map(l => l.opacity(1, 0.3)));

  yield* waitUntil('texture_zoom');
  const zoom = colorTex().clone();
  const zoomLabel = zoom.children()[0] as Txt;
  const zoomGrid = (
    <Rect
      width={1920}
      height={1080}
      opacity={0}
      layout={false}
      fill={
        new Pattern({
          image: checkerImage,
          repetition: 'repeat',
        })
      }
    />
  ) as Rect;
  zoom.insert(zoomGrid);
  view.add(zoom);
  zoom.absolutePosition(colorTex().absolutePosition());
  zoom.size(colorTex().size());
  const layerTexs = createRef<Layout>();
  const texs: Rect[] = [];
  const squares: Rect[] = [];
  const layerSquare = createRef<Node>();

  zoom.add(
    <Layout ref={layerTexs} opacity={0} layout={false}>
      {parallax().images.map((src, index) => (
        <Rect ref={makeRef(texs, index)} width={960} height={540} y={30} clip>
          <Img smoothing={false} src={src} width={((1920 / 2) * 44) / 16} />
        </Rect>
      ))}
      <Rect
        width={1920 * 4}
        height={1080 * 4}
        ref={layerSquare}
        opacity={0}
        fill={'#141414'}
      >
        {range(16).map(index => (
          <Rect
            ref={makeRef(squares, index)}
            x={(((index % 4) - 0.5) * 1920) / 2}
            y={((Math.floor(index / 4) - 0.5) * 1080) / 2}
            width={960}
            height={540}
            fill={
              (index + (Math.floor(index / 4) % 2 ? 1 : 0)) % 2
                ? '#242424'
                : '#141414'
            }
            lineWidth={8}
          >
            <Txt opacity={0} {...WhiteLabel} fontSize={112}>
              {(index + 1).toString()}
            </Txt>
          </Rect>
        ))}
      </Rect>
    </Layout>,
  );
  zoomLabel.moveToTop();

  yield* all(
    zoom.position(0, 0.6, easeInOutCubic, Vector2.createArcLerp(false, 2)),
    zoom.size(
      view.size(),
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(false, 2),
    ),
    zoom.radius(0, 0.6),
    // zoom.fill('#242424', 0.6),
    zoomLabel.padding([20, 40], 0.6),
    zoomLabel.text('COLOR TEXTURE', 0.6),
    delay(0.3, layerTexs().opacity(1, 0.3)),
  );

  yield* waitUntil('texture_pack');
  yield* sequence(
    0.1,
    ...texs.map((t, index) =>
      t.position(
        [
          (((index % 2) - 0.5) * 1920) / 2,
          ((Math.floor(index / 2) - 0.5) * 1080) / 2,
        ],
        0.6,
      ),
    ),
  );
  yield* waitUntil('astortion');
  yield* all(
    layerTexs().scale(0.5, 0.6),
    layerTexs().position([-480, -270], 0.6),
    layerSquare().opacity(1, 0.6),
  );
  yield* waitUntil('astortion_16');
  yield* sequence(0.1, ...squares.map(s => s.children()[0].opacity(1, 0.3)));
  yield* waitUntil('astortion_close');
  yield* all(
    layerTexs().scale(1, 0.6),
    layerTexs().position(0, 0.6),
    layerSquare().opacity(0, 0.5),
  );

  yield* waitUntil('opacity_show');
  yield* all(zoomGrid.opacity(1, 0.3), zoomLabel.fill(BlackLabel.fill, 0.3));

  yield* waitUntil('texture_zoom_out');
  zoomGrid.scale(() => zoom.height() / 1080);
  yield* all(
    ...texs.map(t => t.opacity(0, 0.6)),
    zoomGrid.opacity(0, 0.6),
    zoom.absolutePosition(
      colorTex().absolutePosition(),
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(false, 2),
    ),
    zoom.size(
      colorTex().size(),
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(false, 2),
    ),
    zoom.radius(8, 0.6),
    zoomLabel.text('COLOR', 0.6),
    zoomLabel.padding([10, 20], 0.6),
    zoomLabel.fill(WhiteLabel.fill, 0.3),
    layerTexs().position(0, 0.6),
    layerTexs().scale(0.25, 0.6),
    layerSquare().opacity(0, 0.6),
  );
  colorTex().parent().insert(zoom, 1);
  colorTex().remove();

  yield* waitUntil('highlight_last');
  yield* all(
    // parallaxCard().fill('#242424', 0.3),
    ...layers.slice(1).map(l => l.opacity(0, 0.3)),
  );
  yield* waitUntil('last_offset');
  yield* parallaxOffset(1, 0.3);
  yield* waitUntil('last_grid');
  grid().position.x(() => (layers[0].position.x() + camera()) % 50);
  // grid().absolutePosition(() => layers[0].absolutePosition().addY(25));
  yield* grid().opacity(0.24, 0.3);
  yield* waitUntil('last_align');

  function getOffset(index: number) {
    const ratio = parallax().ratios()[index];
    const layer = camera() * (ratio - 1);
    const relative = -camera() - layer;
    const round = Math.round(relative / 50) * 50;

    return round - relative;
  }
  yield* gizmo().position.x(getOffset(0), 0.3);

  yield* cameraSnapping(view);
  yield* waitUntil('zoom_in');
  // yield* all(
  //   viewport().scale(9.6, 0.6, v => easeInOutCubic(v * v)),
  //   viewport().position([1608 * 2, 0], 0.6, v => easeInOutCubic(v * v)),
  // );
  const arrowZoom = createSignal(1);
  const sceneZoom = parallaxCard().reactiveClone();
  (sceneZoom.children()[1] as Grid).lineWidth(() => 2 / arrowZoom());
  sceneZoom.add(
    <>
      <Ray
        arrowSize={() => clampRemap(1, 5, 0, 4, arrowZoom())}
        lineWidth={() => 8 / arrowZoom()}
        stroke={'white'}
        endArrow
        lineCap={'square'}
        to={gizmo().position}
      />
      <Rect
        size={() => 8 / arrowZoom()}
        // fill={'white'}
        position={gizmo().position}
      />
    </>,
  );
  const mask = createRef<Circle>();
  view.add(
    <Circle
      ref={mask}
      size={120}
      scale={arrowZoom}
      clip
      x={-320}
      shadowColor={() =>
        new Color('black').alpha(remap(1, 5, 0, 0.16, arrowZoom()))
      }
      shadowOffsetY={8}
      shadowBlur={40}
    >
      {sceneZoom}
    </Circle>,
  );
  yield* all(
    arrowZoom(5, 0.6),
    // mask().size(620, 0.6, easeOutCubic),
  );

  yield* waitUntil('zoom_out');
  yield* all(arrowZoom(1, 0.6));
  mask().remove();
  yield* waitUntil('viewport_show');
  const rect = (
    <Rect
      layout={false}
      width={480}
      height={270}
      lineWidth={8}
      radius={8}
      stroke={'#fff'}
      opacity={0}
    />
  ) as Rect;
  zoom.clip(false).add(rect);
  const normalLayers = layerTexs().reactiveClone();
  normalTex().add(normalLayers);
  normalTex().add(rect.reactiveClone());
  normalLayers.filters([
    contrast(0),
    sepia(1),
    saturate(10),
    hue(29),
    brightness(0.75),
  ]);
  yield* all(
    rect.opacity(1, 0.3),
    zoomLabel.opacity(0, 0.3),
    normalTex().children()[0].opacity(0, 0.3),
  );
  yield* waitUntil('viewport_move');
  function getPosition(index: number): [number, number] {
    return [(index % 2) * 240 - 120, Math.floor(index / 2) * 135 - 67.5];
  }
  yield* all(rect.size([240, 135], 0.3), rect.position(getPosition(0), 0.3));
  yield* waitUntil('render');
  texs.forEach((t, index) =>
    t.children()[0].position.x(() => {
      const cam = (camera() / 5) * 6;
      const position = cam * parallax().ratios()[index];
      return Math.round(position / 60) * 60;
    }),
  );
  yield* texs[0].opacity(1, 0.3);

  yield* waitUntil('render_loop');
  for (let i = 1; i < 4; i++) {
    // yield all(layers[i - 1].opacity(0, 0.3), layers[i].opacity(1, 0.3));
    layers[i - 1].opacity(0);
    layers[i].opacity(1);
    // yield* grid().opacity(0, 0.15);
    grid().position.x(() => (layers[i].position.x() + camera()) % 50);
    // yield* grid().opacity(0.24, 0.15);
    yield* waitFor(0.3);
    yield* gizmo().position.x(getOffset(i), 0.3);
    yield* waitFor(0.3);
    yield* rect.position(getPosition(i), 0.3);
    yield* waitFor(0.3);
    yield* texs[i].opacity(1, 0.3);
    yield* waitFor(1);
  }

  yield* performance(view);

  rect.opacity(0);
  gizmo().position(0);
  layers.forEach(l => l.opacity(1));
  parallaxCard().fill(BGColor);
  grid().opacity(0);

  yield* waitUntil('next');
  yield* buffer().position.y(-900, 0.3, easeInCubic);
});

function* cameraSnapping(view: View2D): ThreadGenerator {
  const offset = createSignal(0);
  const light = (
    <Node>
      <Circle
        antialiased={false}
        startAngle={-20}
        endAngle={20}
        closed
        x={() => offset()}
        y={-180 + 270 / 2}
        size={960}
        rotation={100}
        fill={'#666'}
      />
    </Node>
  );
  const light2 = (
    <Node>
      <Circle
        antialiased={false}
        startAngle={-20}
        endAngle={20}
        closed
        x={() => Math.floor(offset() / 30) * 30}
        y={-180 + 270 / 2}
        size={960}
        rotation={100}
        fill={'#666'}
      />
    </Node>
  );

  const scene = createRef<Rect>();
  const snap = createRef<Rect>();
  const nosnap = createRef<Rect>();
  const show = createSignal(0);
  // const bg = '#235a7a';
  const bg = '#242424';
  view.add(
    <>
      <Circle
        size={() => view.size().magnitude * show()}
        fill={() => Color.lerp('#242424', '#141414', show())}
        scale={() => map(0.5, 1, show())}
        clip
      >
        <Rect
          ref={scene}
          y={-135 - 80}
          width={1120}
          height={330}
          fill={bg}
          radius={8}
          clip
        >
          <Circle
            antialiased={false}
            startAngle={-20}
            endAngle={20}
            closed
            y={-180}
            size={960}
            rotation={100}
            fill={'#666'}
          />
          <Rect
            width={480}
            height={270}
            lineWidth={8}
            radius={8}
            stroke={'#fff'}
            x={() => -offset() + 240}
          />
        </Rect>
        <Rect
          ref={nosnap}
          x={-240 - 80}
          y={135 + 80}
          width={480}
          height={270}
          radius={8}
          clip
          fill={bg}
        >
          <Upscale
            smoothing={false}
            src={light}
            width={480}
            height={270}
            factor={30}
          />
        </Rect>
        <Rect
          ref={snap}
          x={240 + 80}
          y={135 + 80}
          width={480}
          height={270}
          radius={8}
          clip
          fill={bg}
        >
          <Upscale
            smoothing={false}
            src={light2}
            width={480}
            height={270}
            factor={30}
          />
        </Rect>
        <Txt {...WhiteLabel} lineHeight={60} bottomLeft={nosnap().topLeft}>
          NO SNAPPING
        </Txt>
        <Txt {...WhiteLabel} lineHeight={60} bottomLeft={snap().topLeft}>
          SNAPPING
        </Txt>
        <Txt {...WhiteLabel} lineHeight={60} bottomLeft={scene().topLeft}>
          SCENE
        </Txt>
      </Circle>
    </>,
  );
  yield loop(Infinity, () => offset(480, 3, easeInOutSine).to(0, 3));
  yield* waitUntil('snapping_show');
  yield* show(1, 0.6, easeOutCubic);
  yield* waitUntil('snapping_hide');
  yield* show(0, 0.6, easeInCubic);
}

function* performance(view: View2D): ThreadGenerator {
  const show = createSignal(0);
  const texture = createRef<Rect>();
  const width = createRef<Ray>();
  const height = createRef<Ray>();
  view.add(
    <>
      <Circle
        size={() => view.size().magnitude * show()}
        fill={() => Color.lerp('#242424', '#141414', show())}
        scale={() => map(0.5, 1, show())}
        clip
      >
        <Rect
          ref={texture}
          layout
          width={320 * 4}
          wrap={'wrap'}
          radius={8}
          clip
        >
          {range(16).map(i => (
            <Rect
              width={320}
              height={180}
              alignItems={'center'}
              justifyContent={'center'}
              fill={
                (i + (Math.floor(i / 4) % 2 ? 1 : 0)) % 2 ? '#242424' : '#333'
              }
            >
              <Txt {...WhiteLabel}>480x270</Txt>
            </Rect>
          ))}
        </Rect>
        <Ray
          ref={width}
          arrowSize={20}
          from={texture().topLeft().addY(-30)}
          to={texture().topRight().addY(-30)}
          lineWidth={8}
          stroke={'#666'}
          endArrow
          startArrow
          layout
          alignItems={'end'}
          justifyContent={'center'}
          end={0}
        >
          <Txt
            opacity={() => width().completion()}
            {...WhiteLabel}
            lineHeight={60}
          >
            1920
          </Txt>
        </Ray>
        <Ray
          ref={height}
          arrowSize={20}
          from={texture().topLeft().addX(-30)}
          to={texture().bottomLeft().addX(-30)}
          lineWidth={8}
          stroke={'#666'}
          endArrow
          startArrow
          layout
          alignItems={'center'}
          justifyContent={'end'}
          end={0}
        >
          <Txt
            opacity={() => height().completion()}
            {...WhiteLabel}
            lineHeight={60}
            padding={20}
          >
            1080
          </Txt>
        </Ray>
      </Circle>
    </>,
  );

  yield* waitUntil('performance_show');
  yield* show(1, 0.6, easeOutCubic);
  yield* waitUntil('size_show');
  yield* all(width().end(1, 0.6), height().end(1, 0.6));
  yield* waitUntil('performance_hide');
  yield show(0, 0.6, easeInCubic);
}
