import {
  Circle,
  Code,
  CODE,
  CodePoint,
  Line,
  makeScene2D,
  Ray,
  Rect,
  word,
} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createRefArray,
  createSignal,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  finishScene,
  join,
  linear,
  loop,
  map,
  range,
  run,
  tween,
  useThread,
  useTransition,
  Vector2,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import * as THREE from 'three';
import {
  createMouseRef,
  Mouse,
  Paper,
  PlainCode,
  RSCode,
  Tetrahedron,
  Three,
  Window,
} from '../nodes';
import {Theme} from '../styles';
import * as gameThree from '../three/game';

const theme = {
  ...Theme,
  window: '#cc812b',
  buttons: '#0f0d0c',
};

export default makeScene2D(function* (view) {
  const tetra = createRef<Tetrahedron>();
  view.add(
    <Tetrahedron
      layout={false}
      y={80}
      ref={tetra}
      lineWidth={8}
      stroke={theme.stroke}
      radius={0}
      orbit={-40}
    />,
  );

  // const theme = {
  //   window: '#701d1d',
  //   buttons: '#100d0d',
  //   bgDark: '#100d0d',
  //   bg: '#1c1717',
  // };
  const window = createRef<Window>();
  const code = createRef<Code>();
  const panels = createRefArray<Rect>();
  const border = createRef<Rect>();
  const status = createRefArray<Rect>();
  view.add(
    <Window
      ref={window}
      theme={{...theme, window: theme.stroke}}
      x={-400}
      width={720}
      scale={0.9}
      opacity={0}
      direction={'column'}
      radius={theme.radius}
    >
      <Rect
        grow={1}
        ref={border}
        radius={[theme.radius, theme.radius, 0, theme.radius]}
        fill={theme.bgDark}
        clip
      >
        <Rect fill={theme.bgDarker} ref={panels}>
          <PlainCode
            fill={'#666'}
            marginTop={16}
            fontWeight={700}
            offset={-1}
            code={range(16)
              .map(i => i.toString().padStart(3, ' ') + ' ')
              .join('\n')}
          />
        </Rect>
        <RSCode
          ref={code}
          grow={1}
          marginTop={16}
          offset={-1}
          code={`\n const MESH: [[f32; 3]; 12] = [\n${
            Tetrahedron.indices
              .flatMap(face =>
                face.map(i => {
                  const vertex = tetra().vertices()[i];
                  return `[${[vertex.x, vertex.y, vertex.z]
                    .map(v => v.toFixed(2).padStart(5, ' '))
                    .join(`, `)}]`;
                }),
              )
              .map(line => '   ' + line)
              .join(',\n') + ','
          }\n ];`}
        />
        <Rect
          width={8}
          margin={[100, 8, 8]}
          radius={4}
          height={320}
          fill={theme.bgDarker}
          ref={panels}
        />
      </Rect>
      <Rect height={40} shrink={0} marginTop={-1} width={'100%'}>
        <Rect
          ref={status}
          height={40}
          width={140}
          radius={[0, 20, 20, 0]}
          fill={theme.stroke}
        />
        <Rect
          zIndex={-1}
          marginLeft={-20}
          height={40}
          width={140}
          radius={[0, 20, 20, 0]}
          fill={theme.stroke}
          opacity={0.54}
          ref={status}
        />
        <Rect
          zIndex={-2}
          marginLeft={-140}
          height={40}
          grow={1}
          fill={theme.bgDarker}
        />
      </Rect>
    </Window>,
  );
  const transition = useTransition(() => {});
  yield* all(
    tetra().radius(10, 0.6, easeOutCubic),
    tetra().orbit(10, 0.6, easeOutCubic),
    view.fill(theme.bgDark, 0.6, easeOutCubic),
  );
  transition();

  yield* waitUntil('code_editor');
  yield all(tetra().orbit(50, 0.6), tetra().x(500, 0.6));
  yield* waitFor(0.3);
  yield* all(
    window().scale(1, 0.3, easeOutCubic),
    window().opacity(1, 0.3, easeOutCubic),
  );

  const cursors: CodePoint[] = [
    [2, 5],
    [5, 5],
    [8, 5],
  ];
  const selection = createRefArray<Rect>();
  code().add(
    cursors.map(() => (
      <Rect
        layout={false}
        ref={selection}
        offset={-1}
        radius={4}
        fill={'white'}
        opacity={0}
        compositeOperation={'difference'}
      />
    )),
  );

  selection.forEach((s, index) => {
    const bbox = () => code().getPointBBox(cursors[index]).expand([0, 2]);
    s.absolutePosition(() =>
      code().localToWorld().transformPoint(bbox().position),
    ).size(bbox().size);
  });

  yield* waitUntil('select');
  for (let i = 0; i < selection.length; i++) {
    selection[i].opacity(1);
    yield* waitFor(0.2);
  }

  yield* waitUntil('edit');
  for (const point of cursors) {
    code().code.replace(word(point[0], point[1], 1), '5');
  }
  yield loop(function* () {
    yield* waitFor(0.5);
    selection.forEach(s => s.opacity(0));
    yield* waitFor(0.5);
    selection.forEach(s => s.opacity(1));
  });
  tetra().v0(tetra().v0().clone().setX(-0.5));

  yield* waitUntil('blender');
  tetra().moveToTop();
  const clone = tetra().reactiveClone({
    size: '100%',
    stroke: null,
  });
  tetra().parent().add(clone);
  clone.reparent(border());
  clone.absolutePosition(tetra().absolutePosition);
  const vertex = createRef<Circle>();
  view.add(
    <Circle
      layout={false}
      ref={vertex}
      size={24}
      fill={theme.bgDark}
      opacity={0}
      zIndex={1}
      stroke={theme.window}
      lineWidth={8}
    />,
  );
  vertex().reparent(border());
  vertex().absolutePosition(() =>
    tetra().localToWorld().transformPoint(tetra().projectedVertices()[0]),
  );
  const box = createRef<Rect>();
  view.add(<Rect ref={box} offset={-1} lineWidth={8} stroke={theme.window} />);
  const mouse = createMouseRef();
  view.add(<Mouse refs={mouse} fill={theme.bgDark} x={200} y={-160} end={0} />);
  yield* all(
    ...panels.map(p => p.opacity(0, 0.3, easeInCubic)),
    ...status.map(s => s.width(0, 0.6)),
    ...status.map(s => s.fill(theme.window, 0.6)),
    code().opacity(0, 0.3, easeInCubic),
    border().radius.left(0, 0.6),
    window().position(0, 0.6),
    window().width(1080, 0.6),
    tetra().position([0, 60], 0.6),
    tetra().radius(8, 0.6),
    mouse.line.end(1, 0.6),
    clone.grid(theme.bgDarker, 0.6),
    window().fill(theme.window, 0.6),
    window().stroke(theme.window, 0.6),
  );
  tetra().size('100%');
  tetra().reparent(border()).moveToBottom();
  tetra().grid(theme.bgDarker);
  clone.remove();
  window().height.save();
  code().remove();
  panels.forEach(p => p.remove());
  status.forEach(p => p.remove());

  yield* waitUntil('drag_start');
  yield* mouse.line.position(
    [-300, -280],
    0.3,
    easeInOutCubic,
    Vector2.arcLerp,
  );
  const from = mouse.line.absolutePosition();
  box().absolutePosition(from);
  box().size(() => mouse.line.absolutePosition().sub(from).div(view.scale()));
  yield* mouse.size(60, 0.3);
  yield* mouse.line.position([100, -80], 0.3, easeInOutCubic);
  box().opacity(0);
  vertex().opacity(1);
  yield* mouse.size(80, 0.3, easeOutCubic);

  yield* waitUntil('drag_move');
  let v0 = tetra().v0().clone();
  const axis = createRef<Line>();
  border().add(
    <Line
      ref={axis}
      layout={false}
      lineWidth={8}
      stroke={'#ef5350'}
      points={() => [
        axis()
          .worldToLocal()
          .transformPoint(tetra().projectPoint(v0.clone().setX(-10))),
        axis()
          .worldToLocal()
          .transformPoint(tetra().projectPoint(v0.clone().setX(10))),
      ]}
    />,
  );

  const x = mouse.line.x();
  tetra().v0(() => {
    const difference = x - mouse.line.x();
    return v0.clone().setX(v0.x - difference / 300);
  });
  yield* waitFor(0.1);
  yield* mouse.line.x(400, 0.6);
  yield* mouse.line.x(250, 1);
  tetra().v0(v0.clone().setX(0));
  axis().opacity(0);

  yield* waitUntil('export');
  mouse.line.reparent(border());
  const paper = createRef<Rect>();
  view.add(
    <Paper ref={paper} fill={theme.bg} width={240} height={320}>
      <Tetrahedron
        lineWidth={8}
        stroke={theme.bgDark}
        radius={2}
        orbit={30}
        y={10}
      />
    </Paper>,
  );
  paper().moveToBottom();
  const arrowBlender = createRef<Ray>();
  view.add(
    <Ray
      ref={arrowBlender}
      from={window().right}
      to={paper().left}
      endArrow
      startOffset={28}
      endOffset={20}
      lineWidth={8}
      stroke={theme.stroke}
    />,
  );
  arrowBlender().moveToBottom();
  yield* all(
    window().x(-540, 0.6),
    window().width(640, 0.6),
    mouse.line.x(180, 0.6),
  );

  const gameWindow = createRef<Window>();
  const three = createRef<Three>();
  const threeBorder = createRef<Rect>();
  view.add(
    <Window
      ref={gameWindow}
      theme={{
        ...theme,
        window: '#1195cb',
      }}
      size={window().size()}
      x={540}
      scale={0.9}
      opacity={0}
    >
      <Rect ref={threeBorder} width={'100%'} radius={theme.radius} clip>
        <Three
          ref={three}
          quality={2}
          size={'100%'}
          background={'#023348'}
          scene={gameThree.threeScene}
          camera={gameThree.camera}
        />
      </Rect>
    </Window>,
  );

  yield loop(function* () {
    yield* tween(2, value => {
      gameThree.mesh.position.set(0, 0, map(0, 3, easeInOutCubic(value)));
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    });
    yield* tween(2, value => {
      gameThree.mesh.position.set(0, 0, map(3, 0, easeInOutCubic(value)));
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    });
  });

  yield loop(() =>
    tween(8, value => {
      gameThree.mesh.rotation.set(0, 0, value * Math.PI * 2 + 3.5);
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    }),
  );

  yield* waitUntil('game');

  function updateBuffer() {
    const buffer = gameThree.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;
    buffer.set(
      [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2].flatMap(i => {
        const v = tetra().vertices()[i];
        return [v.x, v.y, v.z];
      }),
    );
    buffer.needsUpdate = true;
  }
  updateBuffer();

  const gameArrow = createRef<Ray>();
  view.add(
    <Ray
      ref={gameArrow}
      from={paper().right}
      to={gameWindow().left}
      endArrow
      startOffset={20}
      endOffset={28}
      stroke={theme.stroke}
      lineWidth={8}
      end={0}
    />,
  );
  yield* all(
    gameWindow().opacity(1, 0.3, easeOutCubic),
    gameWindow().scale(1, 0.3, easeOutCubic),
    gameArrow().end(1, 0.3, easeOutCubic),
  );

  yield* waitUntil('hot_reload');
  const x2 = mouse.line.x();
  v0 = tetra().v0().clone();
  tetra().v0(() => {
    const difference = x2 - mouse.line.x();
    return v0.clone().setX(v0.x - difference / 300);
  });
  axis().opacity(1);
  yield* waitFor(0.1);
  yield* mouse.line.position([0, 20], 0.6);
  yield* waitFor(0.1);
  axis().opacity(0);
  threeBorder().add(
    <Rect layout={false} size={threeBorder().size()} stroke={'white'} />,
  );
  const reloadStroke = threeBorder().childAs<Rect>(1);
  updateBuffer();
  yield* reloadStroke.lineWidth(16, 0.2, easeOutCubic);
  yield* reloadStroke.lineWidth(0, 0.2, easeInCubic);
  reloadStroke.remove();

  yield* waitUntil('process');
  const processWindow = createRef<Window>();
  const loaders = ['/', '-', '\\', '|'];
  const time = useThread().time;
  const progress = createSignal(0);
  const terminal = createRef<Code>();
  view.add(
    <Window
      ref={processWindow}
      theme={{
        ...theme,
        // window: '#4c8a3b',
        window: theme.stroke,
        buttons: 'black',
      }}
      width={640}
      height={320}
      scale={0.9}
      opacity={0}
    >
      <Rect fill={theme.bgDark} width={'100%'}>
        <PlainCode
          ref={terminal}
          highlighter={null}
          margin={20}
          fill={'rgba(255, 255, 255, 0.6)'}
          code={CODE`reading    [${() => {
            const number = Math.round(progress() * 16);
            return 'X'.repeat(number) + ' '.repeat(16 - number);
          }}] ${() => {
            const current = time();
            const index = Math.floor(current / 0.2) % loaders.length;
            return loaders[index];
          }}`}
        />
      </Rect>
    </Window>,
  );

  const task = yield run(function* () {
    yield* progress(1, 1, linear);
    let previous = terminal().parsed().slice(0, -2);
    progress(0);
    terminal().code(
      CODE`${previous}\noptimizing [${() => {
        const number = Math.round(progress() * 16);
        return 'X'.repeat(number) + ' '.repeat(16 - number);
      }}] ${() => {
        const current = time();
        const index = Math.floor(current / 0.2) % loaders.length;
        return loaders[index];
      }}`,
    );
    yield* progress(1, 3, linear);
    previous = terminal().parsed().slice(0, -2);
    progress(0);
    terminal().code(
      CODE`${previous}\nsaving     [${() => {
        const number = Math.round(progress() * 16);
        return 'X'.repeat(number) + ' '.repeat(16 - number);
      }}] ${() => {
        const current = time();
        const index = Math.floor(current / 0.2) % loaders.length;
        return loaders[index];
      }}`,
    );
    yield* progress(1, 1, linear);
    terminal().code(terminal().parsed().slice(0, -2));
  });
  yield* all(
    processWindow().opacity(1, 0.3, easeOutCubic),
    processWindow().scale(1, 0.3, easeOutCubic),
  );
  paper().remove();
  arrowBlender().remove();
  gameArrow().remove();

  yield* waitUntil('next');
  finishScene();
  // yield* sequence(
  //   0.1,
  //   all(
  //     processWindow().scale(0.9, 0.3, easeInCubic),
  //     processWindow().opacity(0, 0.3, easeInCubic),
  //   ),
  //   all(
  //     gameWindow().scale(0.9, 0.3, easeInCubic),
  //     gameWindow().opacity(0, 0.3, easeInCubic),
  //   ),
  //   all(
  //     window().scale(0.9, 0.3, easeInCubic),
  //     window().opacity(0, 0.3, easeInCubic),
  //   ),
  // );
  yield* join(task);
});
