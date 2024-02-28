import {
  Circle,
  makeScene2D,
  Node,
  Path,
  Polygon,
  Rect,
} from '@motion-canvas/2d';
import {
  all,
  BBox,
  Color,
  createRef,
  createRefArray,
  createSignal,
  delay,
  easeInCubic,
  easeOutCubic,
  finishScene,
  join,
  linear,
  loop,
  map,
  Matrix2D,
  sequence,
  spawn,
  useTransition,
  Vector2,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {Tetrahedron} from '../nodes';
import shader from '../shaders/background.glsl';
import {CodeColors, DataColors} from '../styles';

import spectrum from '../svg/spectrum.svg?raw';
const container = document.createElement('div');
container.innerHTML = spectrum;
const spectrumSVG = container.querySelector('svg')!;

export default makeScene2D(function* (view) {
  const data = createRef<Node>();
  const code = createRef<Node>();

  const order = createSignal(0);
  const edge = createSignal(0);
  const morph = createSignal(0);
  const backgroundSd = createSignal(1200);
  const shape = createSignal(0);
  const dataLine = createSignal(160);
  const codeLine = createSignal(80);
  const blur = createSignal(1920);

  const codeFill = Color.createSignal(CodeColors.bg);
  const codeStroke = Color.createSignal(CodeColors.stroke);
  const codeBg = Color.createSignal(CodeColors.bg);
  const dataFill = Color.createSignal(DataColors.bg);
  const dataStroke = Color.createSignal(DataColors.stroke);
  const dataBg = Color.createSignal(DataColors.bg);

  view.add(
    <>
      <Node x={view.width() / -2}>
        <Node ref={data} y={-40} />
      </Node>
      <Node
        x={view.width() / 2}
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

  let corners = [
    [0, 300],
    [0, 300],
    [0, 300],
    [8, 320],
    [7, 340],
    [6, 350],
    [5, 370],
    [4, 400],
    [3, 500],
  ];
  let index = 0;
  const icons = createRefArray<Node>();
  for (const group of spectrumSVG.children) {
    if (!(group instanceof SVGGElement)) {
      continue;
    }

    const parent = <Node ref={icons} position={view.size().scale(-0.5)} />;
    const childFill = Color.createSignal('white');
    view.add(parent);

    if (index === 2) {
      parent.position([-520, 50]);
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
        if (child instanceof SVGRectElement) {
          const width = parseFloat(child.getAttribute('width'));
          const height = parseFloat(child.getAttribute('height'));
          const x = parseFloat(child.getAttribute('x')) + width / 2;
          const y = parseFloat(child.getAttribute('y')) + height / 2;
          parent.add(
            <Rect x={x} y={y} width={width} height={height} fill={childFill} />,
          );
        } else {
          parent.add(<Path data={child.getAttribute('d')} fill={childFill} />);
        }
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
      parent.position(parent.position().add(bbox.center));
      for (const child of parent.children()) {
        child.position(child.position().sub(bbox.center));
      }
    }

    let [corner, size] = corners[index++];
    const progress = parent.x() / view.width() + 0.5;
    const fill = Color.lerp(DataColors.bg, CodeColors.bg, progress)
      .brighten(0.2)
      .saturate(0.4);

    childFill(
      Color.lerp(DataColors.main, CodeColors.main, progress).brighten(1),
    );

    const backdrop = createRef<Node>();
    parent.add(
      corner === 0 ? (
        <Circle ref={backdrop} zIndex={-1} size={size} fill={fill} />
      ) : (
        <Polygon
          ref={backdrop}
          radius={80}
          zIndex={-1}
          sides={corner}
          size={size}
          fill={fill}
        />
      ),
    );
    parent.scale(0);

    yield loop(() =>
      backdrop().rotation(0).rotation(360, map(32, 8, progress), linear),
    );
  }

  yield loop(() =>
    all(
      data().y(40, 2).back(2),
      dataLine(80, 2).back(2),
      codeLine(160, 2).back(2),
    ),
  );

  const transition = useTransition(() => {}, undefined, true);
  yield* waitFor(0.6);
  transition();

  yield* waitUntil('data');
  yield* sequence(
    0.1,
    ...icons.slice(0, 3).map(icon => icon.scale(1, 0.6, easeOutCubic)),
  );

  yield* waitUntil('code');
  yield* sequence(
    1,
    ...icons.slice(3).map(icon => icon.scale(1, 0.6, easeOutCubic)),
  );

  yield* waitUntil('next');
  backgroundSd(820);
  const task = yield all(
    code().parent().x(view.width(), 0.6, easeInCubic),
    data().parent().x(-view.width(), 0.6, easeInCubic),
    backgroundSd(540, 0.6, easeInCubic),
    ...icons.map(i =>
      delay(Math.abs(i.x() / view.width()) / 1.5, i.scale(0, 0.3, easeInCubic)),
    ),
  );
  finishScene();
  yield* join(task);
});
