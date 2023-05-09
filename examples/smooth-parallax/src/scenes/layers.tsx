import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  delay,
  loop,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {
  Direction,
  PossibleVector2,
  Vector2,
} from '@motion-canvas/core/lib/types';
import {BGColor, Parallax} from '../components';
import {createRef, finishScene, range} from '@motion-canvas/core/lib/utils';
import {
  Circle,
  Img,
  Layout,
  Line,
  LineProps,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {Colors, WhiteLabel} from '../styles';
import cameraIcon from '../images/icons/camera2.svg';
import {
  easeInCubic,
  easeInOutSine,
  easeOutCubic,
  map,
} from '@motion-canvas/core/lib/tweening';
import {createSignal, SignalValue} from '@motion-canvas/core/lib/signals';
import {join} from '@motion-canvas/core/lib/threading';

const LayersColors = ['#78a3bb', '#4683a4', '#0b5d88', '#025581'];

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const perspective = createSignal(0);
  const centers = createSignal(0);
  const dRatio = createSignal(0.4);
  const cRatio = createSignal(0.6);

  const parallax = createRef<Parallax>();
  const cameraGroup = createRef<Node>();
  const camera = createRef<Img>();
  const gizmo = createRef<Node>();
  const viewport = createRef<Rect>();
  const cameraLeft = createRef<Line>();
  const cameraRight = createRef<Line>();
  const group = createRef<Node>();
  const layerGroup = createRef<Rect>();

  view.add(
    <Node ref={group}>
      <Rect
        ref={layerGroup}
        width={1920}
        height={330}
        offsetY={-1}
        clip
        y={view.height() / -2}
        fill={BGColor}
      >
        <Parallax
          ref={parallax}
          ratios={() => [dRatio(), cRatio(), 1, 2]}
          upscale={30}
        />
      </Rect>
      <Node y={460} ref={cameraGroup}>
        <Node ref={gizmo}>
          <Img
            rotation={-90}
            src={cameraIcon}
            size={80}
            ref={camera}
            scale={0}
          />
          <Line
            ref={cameraLeft}
            stroke={'#666'}
            lineWidth={8}
            radius={8}
            lineDash={[20, 20]}
            lineDashOffset={10}
            startOffset={60}
            end={0}
            points={[
              0,
              () => [map(8 * -30, 0, perspective()), 0],
              () => [map(8 * -30, -680, perspective()), -680],
            ]}
          />
          <Line
            ref={cameraRight}
            stroke={'#666'}
            lineWidth={8}
            radius={8}
            lineDash={[20, 20]}
            lineDashOffset={10}
            startOffset={60}
            end={0}
            points={[
              0,
              () => [map(8 * 30, 0, perspective()), 0],
              () => [map(8 * 30, 680, perspective()), -680],
            ]}
          />
          <Rect
            ref={viewport}
            width={16 * 30}
            height={9 * 30}
            y={-835}
            stroke={'white'}
            lineWidth={8}
            radius={8}
            opacity={0}
          >
            <Circle size={20} fill={'white'} />
          </Rect>
        </Node>
      </Node>
    </Node>,
  );
  const layers = parallax().layers;

  yield* slideTransition(Direction.Top);

  yield* waitUntil('camera_show');
  yield* all(
    camera().scale(1, 0.3, easeOutCubic),
    cameraLeft().end(1, 0.3, easeInCubic),
    cameraRight().end(1, 0.3, easeInCubic),
  );
  yield* viewport().opacity(1, 0.3, easeOutCubic);

  yield* waitUntil('separate');
  yield* all(
    cameraGroup().opacity(0, 0.3),
    layerGroup().height(1080, 0.6),
    ...layers.map((layer, index) =>
      layer.position.y(((index - 1.5) * (1080 - 330)) / 4, 0.6),
    ),
  );
  yield* waitUntil('merge');
  yield* all(
    delay(0.3, cameraGroup().opacity(1, 0.3)),
    ...layers.map(layer => layer.position.y(0, 0.6)),
    layerGroup().height(330, 0.6),
  );

  yield* waitUntil('plot');
  const lines = range(layers.length).map(
    index =>
      (
        <Rect
          width={4000}
          height={8}
          fill={'#242424'}
          scaleX={0}
          y={() => -240 / parallax().ratios()[index]}
        >
          <Circle size={() => map(0, 16, centers())} fill={'#666'} />
        </Rect>
      ) as Rect,
  );
  cameraGroup().insert(lines);

  yield* all(
    ...layers.slice(1).map(layer => layer.opacity(0, 0.3)),
    lines[0].scale.x(1, 0.3),
  );
  yield* waitFor(0.6);
  for (let i = 1; i < layers.length; i++) {
    yield* all(
      layers[i - 1].opacity(0, 0.3),
      layers[i].opacity(1, 0.3),
      lines[i].scale.x(1, 0.3),
    );
    yield* waitFor(0.6);
  }
  yield* all(...layers.map(layer => layer.opacity(1, 0.3)));

  yield* waitUntil('centers_show');
  yield* centers(1, 0.3);

  yield* waitUntil('camera_move');
  yield* gizmo().position.x((-16 * 30) / 4, 0.6);

  yield* waitUntil('camera_perspective');
  yield* all(
    perspective(1, 0.6),
    ...lines.map((line, index) =>
      line.position.x(
        -gizmo().position.x() * (1 / parallax().ratios()[index] - 1),
        0.6,
      ),
    ),
  );
  yield* waitUntil('camera_ray');
  const ray = (
    <Line
      lineWidth={8}
      endArrow
      arrowSize={20}
      stroke={'#4683a4'}
      startOffset={60}
      end={0}
      points={[
        () => Vector2.lerp(Vector2.zero, gizmo().position(), perspective()),
        () => [
          map(
            0,
            -gizmo().position.x() * (1 / parallax().ratios()[0] - 1),
            perspective(),
          ),
          lines[0].position.y(),
        ],
      ]}
    />
  ) as Line;
  cameraGroup().add(ray);
  yield* ray.end(1, 0.6);
  yield* waitUntil('camera_ray_hide');
  const offsetVectors = lines.map(
    (line, index) =>
      (
        <Line
          lineWidth={8}
          stroke={LayersColors[index]}
          endArrow
          arrowSize={20}
          end={0}
          points={[[gizmo().position.x(), line.position.y()], line.position]}
        />
      ) as Line,
  );
  cameraGroup().add(offsetVectors);
  yield* all(
    ray.arrowSize(0, 0.6),
    ray.stroke('#242424', 0.6),
    moveToBottom(ray),
  );

  yield* waitUntil('background');
  yield* all(...offsetVectors.slice(0, 2).map(v => v.end(1, 0.6)));
  yield* waitUntil('foreground');
  yield* all(...offsetVectors.slice(2).map(v => v.end(1, 0.6)));
  yield* waitUntil('hide_offset');
  yield* all(...offsetVectors.map(v => v.start(1, 0.6)));

  yield* waitUntil('central_select');
  const pivot = (
    <Circle
      size={0}
      lineWidth={8}
      stroke={LayersColors[2]}
      position={lines[2].position}
    />
  ) as Circle;
  cameraGroup().add(pivot);
  yield* pivot.size(40, 0.3, easeOutCubic);

  yield* waitUntil('offset');
  offsetVectors.forEach((v, index) =>
    v
      .start(0)
      .points([
        () => [
          map(
            0,
            -gizmo().position.x() * (1 / parallax().ratios()[index] - 1),
            perspective(),
          ),
          lines[index].position.y(),
        ],
        lines[index].position,
      ]),
  );
  yield* all(
    ...lines.map(l => l.position.x(lines[2].position.x(), 0.6)),
    parallax().camera(() => -gizmo().position.x(), 0.6),
  );
  yield* waitUntil('offset_hide');
  yield* all(
    gizmo()
      .position.x(-gizmo().position.x(), 2, easeInOutSine)
      .to(gizmo().position.x(), 2),
  );
  yield* waitUntil('camera_ortho');
  yield* all(
    perspective(0, 0.6),
    ...lines.map((line, index) =>
      line.position.x(
        () => -gizmo().position.x() * (parallax().ratios()[index] - 1),
        0.6,
      ),
    ),
  );
  yield* all(
    gizmo()
      .position.x(-gizmo().position.x(), 2.4, easeInOutSine)
      .to(gizmo().position.x(), 2.4),
  );

  // yield* all(...offsetVectors.map(v => v.start(1, 0.3)));
  yield* waitUntil('reset_layers');
  yield* all(
    pivot.size(0, 0.6),
    pivot.stroke('#666', 0.6),
    perspective(1, 0.6),
    parallax().camera(0, 0.6),
    ...lines.map((line, index) =>
      line.position.x(
        -gizmo().position.x() * (1 / parallax().ratios()[index] - 1),
        0.6,
      ),
    ),
  );
  offsetVectors.forEach(v => v.opacity(0));

  yield* waitUntil('calculation');
  const layerTriangle = (
    <Line
      arrowSize={20}
      lineWidth={8}
      stroke={LayersColors[0]}
      lineCap={'round'}
      lineJoin={'round'}
      endArrow
      end={0}
      points={[
        lines[0].position(),
        [gizmo().position.x(), lines[0].position.y()],
        gizmo().position(),
        lines[0].position(),
      ]}
    />
  ) as Line;
  cameraGroup().add(layerTriangle);
  yield* layerTriangle.end(
    layerTriangle.distanceToPercentage(
      lines[0].position.x() - gizmo().position.x(),
    ),
    0.3,
  );
  yield* waitUntil('triangle');

  yield* all(layerTriangle.end(1, 0.6), layerTriangle.arrowSize(0, 0.6));
  const centralTriangle = layerTriangle.clone();
  layerTriangle.moveToBottom();
  cameraGroup().add(centralTriangle);
  layerTriangle.stroke('#242424');
  yield* all(
    centralTriangle.points(
      [
        lines[0].position(),
        [lines[2].position.x(), lines[0].position.y()],
        lines[2].position(),
        lines[0].position(),
      ],
      0.6,
    ),
  );
  yield* waitUntil('triangle_central');
  yield* all(
    moveToBottom(centralTriangle),
    centralTriangle.stroke('#242424', 0.3),
  );

  yield* waitUntil('txt_offset');
  const txt = createRef<Rect>();
  const txtOffset = createRef<Txt>();
  const txtCameraDiv = createRef<Layout>();
  const txtEq = createRef<Txt>();
  const txtD2 = createRef<Layout>();
  const txtD1 = createRef<Txt>();
  const txtCameraMul = createRef<Layout>();

  view.add(
    <Rect
      layout
      ref={txt}
      {...WhiteLabel}
      fill={'#141414'}
      gap={16.8}
      padding={[30, 40]}
      radius={8}
      offset={[1, 1]}
      opacity={0}
      x={1920 / 2 - 30}
      y={1080 / -2 + 300}
    >
      <Txt ref={txtOffset} fill={Colors.NUMBER}>
        offset
      </Txt>
      <Layout
        ref={txtCameraDiv}
        gap={16.8}
        justifyContent={'center'}
        opacity={0}
      >
        <Txt fill={Colors.TEXT}>/</Txt>
        <Txt fill={Colors.KEYWORD}>camera</Txt>
      </Layout>
      <Txt ref={txtEq} fill={Colors.TEXT} opacity={0}>
        =
      </Txt>
      <Txt ref={txtD1} fill={Colors.STRING} opacity={0}>
        d1
      </Txt>
      <Layout ref={txtD2} gap={16.8} opacity={0}>
        <Txt fill={Colors.TEXT}>/</Txt>
        <Txt fill={Colors.FUNCTION}>d2</Txt>
      </Layout>
      <Layout
        ref={txtCameraMul}
        opacity={0}
        gap={16.8}
        width={0}
        justifyContent={'center'}
      >
        <Txt fill={Colors.TEXT}>*</Txt>
        <Txt fill={Colors.KEYWORD}>camera</Txt>
      </Layout>
    </Rect>,
  );
  yield txt().opacity(1, 0.3);
  const offset = yield* drawLine(
    cameraGroup(),
    [lines[0].position.x(), lines[0].position.y()],
    [0, lines[0].position.y()],
    {stroke: Colors.NUMBER, y: 4},
  );
  yield* waitUntil('txt_camera');
  yield txtCameraDiv().opacity(1, 0.3);
  const cameraOffset = yield* drawLine(
    cameraGroup(),
    lines[0].position(),
    [gizmo().position.x(), lines[0].position.y()],
    {stroke: Colors.KEYWORD, y: -4},
  );
  yield* waitUntil('txt_eq');
  yield txtEq().opacity(1, 0.3);
  yield* waitUntil('txt_l1');
  yield txtD1().opacity(1, 0.3);
  const centralDistance = yield* drawLine(
    cameraGroup(),
    [0, lines[0].position.y() + 4],
    [0, lines[2].position.y()],
    {stroke: Colors.STRING},
  );
  yield* waitUntil('txt_l2');
  yield txtD2().opacity(1, 0.3);
  const cameraDistance = yield* drawLine(
    cameraGroup(),
    [gizmo().position.x(), lines[0].position.y() - 4],
    gizmo().position(),
    {stroke: Colors.FUNCTION},
  );

  yield* waitUntil('solve');
  yield* all(
    txtCameraDiv().width(0, 0.5),
    txtCameraDiv().opacity(0, 0.2),
    txtCameraDiv().margin([0, -8.4], 0.5),
    txtCameraMul().width(null, 0.5),
    delay(0.3, txtCameraMul().opacity(1, 0.2)),
  );

  yield* waitUntil('txt_ratio');
  yield* all(
    txtCameraMul().opacity(0.32, 0.3),
    txtOffset().opacity(0.32, 0.3),
    txtEq().opacity(0.32, 0.3),
  );

  yield* waitUntil('math_hide');
  const math = [cameraOffset, cameraDistance, centralDistance, offset];
  yield* all(
    ...math.map(v => v.start(1, 0.3)),
    centralTriangle.opacity(0, 0.3),
    layerTriangle.opacity(0, 0.3),
    ray.opacity(0, 0.3),
  );
  math.forEach(v => v.remove());
  yield* waitUntil('preview_layer');

  const previewDistance = createSignal(-240);
  const preview = createSignal(
    () => (previewDistance() + 240) / previewDistance(),
  );
  const previewLayer = createRef<Rect>();
  const label = createRef<Txt>();

  cameraGroup().add(
    <Rect width={'100%'} clip height={1340}>
      <Rect
        ref={previewLayer}
        width={0}
        height={8}
        opacity={0}
        fill={Colors.blue}
        y={previewDistance}
        x={() => gizmo().position.x() * preview()}
      >
        <Circle size={16} fill={Colors.blue} />
      </Rect>
      <Txt
        ref={label}
        opacity={0}
        {...WhiteLabel}
        fill={Colors.blue}
        offset={[-1, -1]}
        x={-1920 / 2 + 20}
        y={() => previewLayer().position.y() + 30}
        text={() => `d1 / d2 = ${preview().toFixed(2)}`}
      />
    </Rect>,
  );
  yield* all(
    perspective(0, 0.6),
    ...lines.map((l, index) =>
      l.position.x(
        () => -gizmo().position.x() * (parallax().ratios()[index] - 1),
        0.6,
      ),
    ),
    parallax().camera(() => -gizmo().position.x(), 0.6),
    previewLayer().width(1920, 0.6),
    previewLayer().opacity(1, 0.3),
  );
  previewLayer().width(4000);
  yield* waitUntil('preview_ratio');
  yield* all(label().opacity(1, 0.3), txt().opacity(0, 0.3));
  yield* waitUntil('preview_foreground');

  yield* previewDistance(-80, 2);
  yield* waitUntil('preview_background');
  yield* previewDistance(-600, 3);
  yield* waitUntil('preview_infinity');
  yield* previewDistance(-1000, 2);

  yield* waitUntil('practice_ortho');
  previewLayer().opacity(0);
  lines.forEach(l => l.position.y.save());
  label()
    .position.y(() => lines[0].position.y() + 30)
    .opacity(0)
    .text(() => `d1 / d2 = ${(1 - dRatio()).toFixed(2)}`);
  yield* all(
    label().opacity(1, 0.6),
    lines[0].fill(Colors.blue, 0.6),
    (lines[0].children()[0] as Circle).fill(Colors.blue, 0.6),
    parallax().camera(() => -gizmo().position.x(), 0.6),
  );
  yield* dRatio(0, 1.2);

  yield* waitUntil('practice_move');
  yield* gizmo().position.x(240, 2).to(-240, 2).to(0, 1.5);

  yield* waitUntil('negative_values');
  yield* all(cRatio(0.4, 0.6), dRatio(-0.4, 0.6));
  yield* waitUntil('negative_move');
  const parallaxTask = yield loop(Infinity, () =>
    gizmo().position.x(240, 3).to(-240, 3),
  );
  yield* waitUntil('zoom_in');
  yield* all(
    group().scale(4, 0.3),
    group().position(() => [-gizmo().position.x() * 4, 4 * 375], 0.3),
    gizmo().opacity(0, 0.3),
  );

  layerGroup().moveOffset(Vector2.zero);
  layerGroup().height(270).clip(true);

  yield* waitUntil('next');
  finishScene();
  yield* join(parallaxTask);
});

function* drawLine(
  parent: Node,
  from: SignalValue<PossibleVector2>,
  to: SignalValue<PossibleVector2>,
  props: LineProps = {},
) {
  const line = (
    <Line
      end={0}
      lineWidth={8}
      lineCap={'round'}
      points={[from, to]}
      {...props}
    />
  ) as Line;
  parent.add(line);
  yield* line.end(1, 0.3);
  return line;
}

function* moveToBottom(node: Node, duration = 0.3) {
  const clone = node.reactiveClone();
  node.parent()?.add(clone);
  node.moveToBottom();
  yield* clone.opacity(0, duration);
  clone.remove();
  clone.dispose();
}
