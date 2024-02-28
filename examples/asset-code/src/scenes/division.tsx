import {Circle, makeScene2D, Node, Path, Rect} from '@motion-canvas/2d';
import {
  all,
  BBox,
  Color,
  createRef,
  createRefArray,
  createSignal,
  easeInCubic,
  easeOutCubic,
  finishScene,
  join,
  linear,
  loop,
  Matrix2D,
  spawn,
  useThread,
  useTransition,
  Vector2,
  waitUntil,
} from '@motion-canvas/core';
import {Tetrahedron} from '../nodes';
import shader from '../shaders/background.glsl';
import {CodeColors, DataColors} from '../styles';

import spectrum from '../svg/data-assets.svg?raw';
const container = document.createElement('div');
container.innerHTML = spectrum;
const spectrumSVG = container.querySelector('svg')!;

export default makeScene2D(function* (view) {
  const data = createRef<Node>();
  const code = createRef<Node>();

  const order = createSignal(0);
  const edge = createSignal(0);
  const morph = createSignal(0);
  const backgroundSd = createSignal(100);
  const shape = createSignal(0);
  const dataLine = createSignal(160);
  const codeLine = createSignal(80);
  const blur = createSignal(0.5);

  const codeFill = Color.createSignal(CodeColors.bg);
  const codeStroke = Color.createSignal(CodeColors.stroke);
  const codeBg = Color.createSignal(CodeColors.bg);
  const dataFill = Color.createSignal(DataColors.bg);
  const dataStroke = Color.createSignal(DataColors.stroke);
  const dataBg = Color.createSignal(DataColors.bg);

  view.add(
    <>
      <Node x={view.width() * -1}>
        <Node ref={data} y={-40} />
      </Node>
      <Node
        x={view.width() * 1}
        ref={node =>
          spawn(loop(() => node.rotation(0).rotation(360, 8, linear)))
        }
      >
        <Node ref={code} />
      </Node>
    </>,
  );

  view.add(
    <Rect
      size={'100%'}
      zIndex={-1}
      shaders={{
        fragment: shader,
        uniforms: {
          background: new Color('#0000'),
          backgroundSd: backgroundSd,
          shape,
          codeFill,
          codeStroke,
          codeBg,
          dataFill,
          dataStroke,
          dataBg,
          order,
          dataRadius: () => dataLine() / 2,
          codeRadius: () => codeLine() / 2,
          dataMatrix: () => new Matrix2D(data().worldToLocal()),
          codeMatrix: () => new Matrix2D(code().worldToLocal()),
          edge,
          morph,
          blur,
        },
      }}
    />,
  );

  let index = 0;
  const icons = createRefArray<Node>();
  const time = useThread().time;
  for (const group of spectrumSVG.children) {
    if (!(group instanceof SVGGElement)) {
      continue;
    }

    const angle = 120 * -index + 120;
    const parent = (
      <Node
        ref={icons}
        position={() => Vector2.fromDegrees(angle - time() * 30).scale(240)}
      />
    );
    const childFill = DataColors.main.brighten(1);
    data().add(parent);

    if (index === 2) {
      parent.add(
        <Tetrahedron
          lineWidth={8}
          stroke={childFill}
          size={240}
          radius={2.8}
          orbit={30}
          y={20}
        />,
      );
    } else {
      for (const child of group.children) {
        parent.add(<Path data={child.getAttribute('d')} fill={childFill} />);
      }

      const points: Vector2[] = [];
      for (const child of parent.children()) {
        const childCache = child.cacheBBox();
        const childMatrix = child.localToParent();
        points.push(
          ...childCache.corners.map(r => r.transformAsPoint(childMatrix)),
        );
      }
      const bbox = BBox.fromPoints(...points);
      for (const child of parent.children()) {
        child.position(child.position().sub(bbox.center));
      }
    }

    index++;
    const fill = DataColors.bg.brighten(0.2).saturate(0.4);
    const backdrop = createRef<Node>();
    parent.add(<Circle ref={backdrop} zIndex={-1} size={300} fill={fill} />);
    parent.scale(0);
  }

  const transition = useTransition(() => {});

  yield loop(() =>
    all(
      data().y(40, 2).back(2),
      dataLine(80, 2).back(2),
      codeLine(160, 2).back(2),
    ),
  );

  yield* all(
    code()
      .parent()
      .x(view.width() / 4, 2, easeOutCubic),
    data()
      .parent()
      .x(view.width() / -4, 2, easeOutCubic),
    backgroundSd(600, 2),
  );
  transition();

  yield* waitUntil('meshes');
  yield icons[2].scale(1, 0.6, easeOutCubic);
  yield* waitUntil('textures');
  yield icons[1].scale(1, 0.6, easeOutCubic);
  yield* waitUntil('audio');
  yield icons[0].scale(1, 0.6, easeOutCubic);

  yield* waitUntil('blur');
  yield* all(blur(1280, 2));
  view.fill(null);
  yield* waitUntil('next');
  const task = yield all(
    code()
      .parent()
      .y(view.height() * 1.5, 1.2, easeInCubic),
    data()
      .parent()
      .y(view.height() * -1.5, 1.2, easeInCubic),
  );
  finishScene();
  yield* join(task);
});
