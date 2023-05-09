import {makeScene2D} from '@motion-canvas/2d';
import {
  Circle,
  Grid,
  Img,
  Layout,
  Line,
  Node,
  Ray,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  delay,
  loop,
  noop,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {Color, Vector2} from '@motion-canvas/core/lib/types';
import {Container, Parallax, BGColor} from '../components';
import {Colors, WhiteLabel} from '../styles';
import {
  DEG2RAD,
  createRef,
  makeRef,
  range,
  useDuration,
  useThread,
  finishScene,
} from '@motion-canvas/core/lib/utils';
import {
  clamp,
  easeInOutSine,
  easeOutCubic,
  map,
} from '@motion-canvas/core/lib/tweening';
import {createSignal} from '@motion-canvas/core/lib/signals';
import checker from '../images/grid.svg';
const checkerImage = new Image();
checkerImage.src = checker;

import layerA from '../images/layers/a-foreground.png';
import layerB from '../images/layers/b-light.png';
import layerC from '../images/layers/c-background.png';
import layerD from '../images/layers/d-light.png';
import {Group, PerspectiveCamera, Vector4} from 'three';

const layers = [layerD, layerC, layerB, layerA];

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const rect = createRef<Rect>();
  const parallax = createRef<Parallax>();
  const buffer = createRef<Rect>();
  const parallaxCard = createRef<Rect>();
  const colorTex = createRef<Rect>();
  const layerTexs = createRef<Layout>();
  const texs: Rect[] = [];
  const colorLabel = createRef<Txt>();
  const gizmo = createRef<Rect>();
  const grid = createRef<Grid>();
  const grid2 = createRef<Grid>();
  const camera = createSignal(50);
  const viewport = createRef<Node>();
  const lightA = createRef<Circle>();
  const lightB = createRef<Circle>();
  const scene = createRef<Rect>();

  yield view.add(
    <Node ref={viewport}>
      <Container ref={buffer} y={760} x={540} label="LIGHT BUFFER">
        <Rect
          ref={colorTex}
          width={480}
          height={270}
          radius={8}
          fill={'#141414'}
          layout
        >
          <Layout ref={layerTexs} layout={false}>
            {layers.map((src, index) => (
              <Rect
                ref={makeRef(texs, index)}
                opacity={0}
                width={240}
                height={135}
                clip
                x={((index % 2) - 0.5) * 240}
                y={(Math.floor(index / 2) - 0.5) * 135}
              >
                <Img
                  smoothing={false}
                  src={src}
                  width={(240 / 16) * 44}
                  x={() => {
                    const cam = (camera() / 50) * 15;
                    const position = cam * parallax().ratios()[index];
                    return Math.round(position / 15) * 15;
                  }}
                />
              </Rect>
            ))}
          </Layout>
          <Rect
            ref={rect}
            opacity={0}
            layout={false}
            width={480}
            height={270}
            lineWidth={8}
            radius={8}
            stroke={'#fff'}
          ></Rect>
          <Txt
            ref={colorLabel}
            {...WhiteLabel}
            lineHeight={60}
            padding={[10, 20]}
          >
            SHADED COLOR
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
            camera={() => camera()}
          >
            <Circle
              ref={lightA}
              antialiased={false}
              startAngle={-15}
              endAngle={15}
              closed
              x={250}
              y={-300}
              size={1600}
              rotation={120}
              fill={'#fff'}
              opacity={0.3}
            />
            <Circle
              ref={lightB}
              antialiased={false}
              startAngle={-30}
              endAngle={30}
              closed
              x={-300}
              y={-400}
              size={1600}
              rotation={90}
              fill={'#fff'}
              opacity={0.3}
            />
          </Parallax>
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
          <Grid
            ref={grid2}
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
  lightB().moveTo(2).opacity(0);
  lightA().moveTo(2).opacity(0);
  grid().position.x(() => (parallax().layers[0].position.x() + camera()) % 50);

  function getOffset(index: number) {
    const ratio = parallax().ratios()[index];
    const layer = camera() * (ratio - 1);
    const relative = -camera() - layer;
    const round = Math.round(relative / 50) * 50;
    return round - relative;
  }

  function getPosition(index: number): [number, number] {
    return [(index % 2) * 240 - 120, Math.floor(index / 2) * 135 - 67.5];
  }

  yield* all(
    buffer().position.y(0, 0.3, easeOutCubic),
    lightA().opacity(0.3, 0.6),
    lightB().opacity(0.3, 0.6),
  );
  yield* waitUntil('background_select');
  yield* all(
    ...parallax().layers.map(l => l.opacity(0, 0.3)),
    lightA().opacity(0, 0.3),
    grid().opacity(0.24, 0.3),
    colorLabel().opacity(0, 0.3),
    rect().opacity(1, 0.3),
  );
  yield* waitUntil('camera_move');
  yield* gizmo().position.x(getOffset(0), 0.3);
  yield* waitUntil('viewport_adjust');
  yield* all(
    rect().position(getPosition(0), 0.3),
    rect().size([240, 135], 0.3),
  );
  yield* waitUntil('layer_render');
  yield* texs[0].opacity(1, 0.3);

  yield* waitUntil('render_loop');
  const lights = [lightB(), null, lightA()];
  for (let i = 1; i < 4; i++) {
    grid2().position.x(
      () => (parallax().layers[i].position.x() + camera()) % 50,
    );
    const tasks = [];
    if (i === 1) {
      tasks.push(lightB().opacity(0, 0.24));
    }
    if (i === 2) {
      tasks.push(lightA().opacity(0.3, 0.24));
    }
    if (i === 3) {
      tasks.push(lightA().opacity(0, 0.24));
    }

    yield* all(
      ...tasks,
      gizmo().position.x(getOffset(i), 0.3),
      rect().position(getPosition(i), 0.3),
      lights[i - 1]?.opacity(0, 0.3) ?? noop(),
      lights[i]?.opacity(0.3, 0.3) ?? noop(),
      grid().opacity(0, 0.3),
      grid2().opacity(0.24, 0.3),
    );
    let g = grid();
    grid(grid2());
    grid2(g);

    yield* texs[i].opacity(1, 0.3);
  }
  yield* waitFor(0.3);
  yield* all(
    rect().opacity(0, 0.3),
    ...lights.map(l => l?.opacity(0.3, 0.3) ?? noop()),
    gizmo().position.x(0, 0.3),
  );

  const orbit = new Group();
  const perspective = new PerspectiveCamera(90, 16 / 9, 1, 1000);
  orbit.add(perspective);
  perspective.translateZ(10);
  const position = Vector2.createSignal(0);
  const rotation = createSignal(0);
  const spread = createSignal(0);
  const distance = createSignal(10);

  function apply() {
    orbit.rotation.set(0, rotation() * DEG2RAD, 0);
    perspective.position.set(position().x, position().y, distance());
    orbit.updateWorldMatrix(true, true);
    perspective.updateProjectionMatrix();
  }

  function project(x: number, y: number, z: number) {
    const vector = new Vector4(x, y, z);
    vector
      .applyMatrix4(perspective.matrixWorldInverse)
      .applyMatrix4(perspective.projectionMatrix);
    vector.divideScalar(vector.w);

    return new Vector2(vector.x, vector.y).mul([800, 450]);
  }

  const size = new Vector2(((10 / 9) * 16) / 2, 10 / 2);
  const lines: Line[] = [];
  view.add(
    range(4).map(index => {
      return (
        <Line
          ref={makeRef(lines, index)}
          x={-320}
          lineWidth={8}
          stroke={'#666'}
          lineCap={'round'}
          lineJoin={'round'}
          end={0}
          points={() => {
            apply();
            const z = map(0, -spread(), 1 - (index + 1) / 4);
            return [
              project(-size.x, -size.y, z),
              project(-size.x, size.y, z),
              project(size.x, size.y, z),
              project(size.x, -size.y, z),
              project(-size.x, -size.y, z),
              project(size.x, size.y, z),
            ];
          }}
        />
      );
    }),
  );
  lines.forEach(l => l.lineWidth(() => clamp(0, 8, l.arcLength())));

  yield* waitUntil('final_step');
  yield* scene().position.y(-900, 0.6);

  yield* waitUntil('mesh_show');
  yield* all(
    lines[0].opacity(1).fill(null).end(1, 0.6),
    delay(0.3, lines[0].fill('#24242466', 0.3)),
  );

  yield* waitUntil('spread');
  yield delay(
    0.1,
    sequence(
      0.2,
      ...lines.map(l => all(l.end(1, 1), delay(0.5, l.fill('#24242466', 0.5)))),
    ),
  );
  yield* all(
    spread(20, 1.8),
    rotation(50, 1.8),
    distance(14, 1.8),
    position([8, 0], 1.8),
  );

  yield* waitUntil('uv_show');
  rect().position(getPosition(0));
  rect().stroke(Colors.red);
  yield* all(rect().opacity(1, 0.3), lines[0].stroke(Colors.red, 0.3));
  const duration = useDuration('uv_length') - 0.9;
  for (let i = 1; i < 4; i++) {
    yield* waitFor(duration / 4);
    yield* all(
      rect().opacity(1, 0.3),
      lines[i - 1].stroke('#666', 0.3),
      lines[i].stroke(Colors.red, 0.3),
      rect().position(getPosition(i), 0.3),
    );
  }
  yield* waitFor(duration / 4);
  yield* all(rect().opacity(0, 0.3), lines.at(-1).stroke('#666', 0.3));

  yield* waitUntil('merge');
  yield* all(
    spread(0, 0.6),
    rotation(0, 0.6),
    distance(10, 0.6),
    position(0, 0.6),
  );

  const mask = createRef<Circle>();
  const images: Img[] = [];
  view.add(
    <Circle ref={mask} clip x={-320}>
      <Rect width={800} height={450} fill={BGColor}>
        {layers.map((src, index) => (
          <Rect
            ref={makeRef(images, index)}
            width={800}
            height={450}
            ratio={16 / 9}
            clip
          >
            <Img
              smoothing={false}
              src={src}
              width={(800 / 16) * 44}
              x={() => {
                const position = camera() * parallax().ratios()[index];
                return Math.round(position / 50) * 50;
              }}
            />
          </Rect>
        ))}
      </Rect>
    </Circle>,
  );
  yield* waitUntil('merge_render');
  yield* all(
    mask().size(960, 0.6, easeOutCubic),
    ...lines.map(l => l.opacity(0, 0.6)),
  );
  mask().clip(false);

  yield* waitUntil('parallax_enable');
  yield* camera(-100, 1.5, easeInOutSine);
  const parallaxTask = yield loop(Infinity, () =>
    camera(100, 2, easeInOutSine).to(-100, 2),
  );
  const thread = useThread().children.find(t => t.runner === parallaxTask);

  yield* waitUntil('offsets_show');
  parallax().layers.forEach(l => l.opacity(1).filters.saturate(0));
  parallaxCard().fill(new Color(BGColor).saturate(-1));
  lights.forEach(l => l?.opacity(0.3));
  grid().opacity(0);
  gizmo().position(0);

  yield* all(
    scene().position.y(-190 + 80, 0.6),
    mask().position.y(315 - 80, 0.6),
  );
  yield* waitUntil('example');
  thread.pause(true);
  yield* waitUntil('layer_select');
  grid().position.x(() => (parallax().layers[2].position.x() + camera()) % 50);
  yield* all(
    ...images.map((img, index) => (index === 2 ? noop() : img.opacity(0, 0.3))),
    ...parallax().layers.map((l, index) =>
      index === 2 ? noop() : l.opacity(0, 0.3),
    ),
    lightB().opacity(0, 0.3),
    grid().opacity(0.24, 0.3),
  );
  yield* waitUntil('scene_camera_offset');
  yield* gizmo().position.x(() => getOffset(2), 0.3);
  yield* waitUntil('result_camera_offset');
  yield* images[2].position.x(() => getOffset(2), 0.3);
  images.forEach((img, index) => img.position.x(() => getOffset(index)));

  yield* waitUntil('parallax_resume');
  thread.pause(false);
  yield* waitUntil('parallax_pause_again');
  thread.pause(true);
  yield* waitUntil('camera_expand');
  yield* all(gizmo().size(gizmo().size().add(100), 0.3));
  yield* waitUntil('layers_expand');
  yield* all(...images.map(img => img.size(img.size().add(100), 0.3)));

  yield* waitUntil('expand_resume');
  thread.pause(false);
  yield* waitUntil('show_layers');
  const clipRect = createRef<Rect>();
  mask().add(
    <Rect
      ref={clipRect}
      width={800 + 200}
      height={450 + 200}
      fill={'#141414'}
      opacity={0}
      cache
    >
      <Rect
        width={800}
        height={450}
        fill={'white'}
        compositeOperation={'destination-out'}
      />
    </Rect>,
  );
  yield* all(
    ...images.map(img => img.opacity(1, 0.3)),
    scene().position.y(-900, 0.6),
    mask().position.y(0, 0.6),
  );
  scene().remove();

  yield* waitUntil('screen_show');
  yield* clipRect().opacity(1, 0.6);

  yield* waitUntil('expand_textures');
  yield* all(
    colorTex().ripple(),
    ...texs.map(t => t.scale(t.size().div(t.size().add(30)), 0.6)),
    ...texs.map(t => t.size(t.size().add(30), 0.6)),
  );

  yield* waitUntil('next');
  finishScene();
  yield* waitFor(10);
});
