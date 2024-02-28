import {
  Circle,
  ComponentChildren,
  CubicBezier,
  CubicBezierProps,
  Grid,
  Layout,
  LayoutProps,
  lines,
  makeScene2D,
  Node,
  Rect,
  RectProps,
} from '@motion-canvas/2d';
import {
  all,
  clampRemap,
  createRef,
  createRefArray,
  createRefMap,
  easeInCubic,
  easeOutCubic,
  easeOutExpo,
  finishScene,
  linear,
  loop,
  ReferenceReceiver,
  Vector2,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import {ATxt, createPageRef, JSCode, Page} from '../nodes';
import shader from '../shaders/shader-graph.glsl';
import {Theme} from '../styles';

const theme = {
  ...Theme,
  window: '#cc812b',
  event: '#cc2b2b',
  music: '#0880b4',
  component: '#45811b',
  buttons: '#0f0e0c',
};

export default makeScene2D(function* (view) {
  view.fill(theme.bgDarker).cachePadding(320);

  const nodes = createRefArray<Rect>();
  const arrows = createRefArray<CubicBezier>();
  const ports = createRefMap<Circle>();
  const group = createRef<Node>();
  const grid = createRef<Node>();
  const graph = createRef<Node>();

  let spacingX = 400;
  view.add(
    <Node ref={graph}>
      <Node ref={grid}>
        <Grid spacing={80} stroke={theme.bgDark} lineWidth={4} size={'120%'} />
        <Grid
          spacing={80}
          position={40}
          stroke={theme.bgDark}
          lineWidth={2}
          size={'120%'}
        />
      </Node>
      <Node
        position={view.size().scale(-0.5).add(80)}
        x={600}
        ref={group}
        scale={1}
      >
        <GraphNode
          ref={nodes}
          name="UV"
          y={200}
          preview
          index={0}
          outs={<GraphPort name="uv0" out portRef={ports.uv0} />}
        />
        <GraphField
          ref={nodes}
          x={spacingX}
          y={200 + 160}
          value={['0.5', '0.5']}
          portRef={ports.half}
        />
        <GraphNode
          ref={nodes}
          x={spacingX * 2}
          y={200}
          preview
          name="Subtract"
          index={1}
          ins={
            <>
              <GraphPort name="a" portRef={ports.subA} />
              <GraphPort name="b" portRef={ports.subB} />
            </>
          }
          outs={<GraphPort name="out" out portRef={ports.subOut} />}
        />
        <Arrow ref={arrows} from={ports.uv0()} to={ports.subA()} />
        <Arrow ref={arrows} from={ports.half()} to={ports.subB()} />
        <GraphField
          ref={nodes}
          x={spacingX * 3}
          y={200 + 160}
          value={['2.0', '2.0']}
          portRef={ports.two}
        />
        <GraphNode
          ref={nodes}
          name="Multiply"
          x={spacingX * 4}
          y={200}
          preview
          index={2}
          ins={
            <>
              <GraphPort name="a" portRef={ports.mulA} />
              <GraphPort name="b" portRef={ports.mulB} />
            </>
          }
          outs={<GraphPort name="out" out portRef={ports.mulOut} />}
        />
        <Arrow ref={arrows} from={ports.subOut()} to={ports.mulA()} />
        <Arrow ref={arrows} from={ports.two()} to={ports.mulB()} />
        <GraphNode
          ref={nodes}
          name="Length"
          x={spacingX * 5}
          y={100}
          preview
          index={3}
          ins={<GraphPort name="in" portRef={ports.lenIn} />}
          outs={<GraphPort name="out" out portRef={ports.lenOut} />}
        />
        <Arrow ref={arrows} from={ports.mulOut()} to={ports.lenIn()} />
        <GraphNode
          ref={nodes}
          name="One Minus"
          x={spacingX * 6}
          preview
          index={4}
          ins={<GraphPort name="in" portRef={ports.oneIn} />}
          outs={<GraphPort name="out" out portRef={ports.oneOut} />}
        />
        <Arrow ref={arrows} from={ports.lenOut()} to={ports.oneIn()} />
        <GraphField
          ref={nodes}
          x={spacingX * 7}
          y={160}
          value={['3.0', '3.0']}
          portRef={ports.three}
        />
        <GraphNode
          ref={nodes}
          name="Multiply"
          x={spacingX * 8}
          preview
          index={5}
          ins={
            <>
              <GraphPort name="a" portRef={ports.mul2A} />
              <GraphPort name="b" portRef={ports.mul2B} />
            </>
          }
          outs={<GraphPort name="out" out portRef={ports.mul2Out} />}
        />
        <Arrow ref={arrows} from={ports.oneOut()} to={ports.mul2A()} />
        <Arrow ref={arrows} from={ports.three()} to={ports.mul2B()} />
        <GraphNode
          ref={nodes}
          name="UV"
          x={spacingX * 7}
          y={440}
          preview
          index={0}
          outs={<GraphPort name="uv0" out portRef={ports.uv1} />}
        />
        <GraphField
          ref={nodes}
          x={spacingX * 8}
          y={440 + 160}
          value={['time']}
          portRef={ports.time}
        />
        <GraphNode
          ref={nodes}
          name="Simplex Noise"
          x={spacingX * 9}
          y={440}
          preview
          index={6}
          ins={
            <>
              <GraphPort name="in" portRef={ports.noiseIn} />
              <GraphPort name="time" portRef={ports.noiseTime} />
            </>
          }
          outs={<GraphPort name="out" out portRef={ports.noiseOut} />}
        />
        <Arrow ref={arrows} from={ports.uv1()} to={ports.noiseIn()} />
        <Arrow ref={arrows} from={ports.time()} to={ports.noiseTime()} />
        <GraphNode
          ref={nodes}
          name="Subtract"
          x={spacingX * 10}
          y={200}
          preview
          index={7}
          ins={
            <>
              <GraphPort name="a" portRef={ports.sub2A} />
              <GraphPort name="b" portRef={ports.sub2B} />
            </>
          }
          outs={<GraphPort name="out" out portRef={ports.sub2Out} />}
        />
        <Arrow ref={arrows} from={ports.mul2Out()} to={ports.sub2A()} />
        <Arrow ref={arrows} from={ports.noiseOut()} to={ports.sub2B()} />
        <GraphNode
          ref={nodes}
          name="Saturate"
          x={spacingX * 11}
          y={200}
          preview
          index={88}
          ins={<GraphPort name="in" portRef={ports.satIn} />}
          outs={<GraphPort name="out" out portRef={ports.satOut} />}
        />
        <Arrow ref={arrows} from={ports.sub2Out()} to={ports.satIn()} />
        <GraphNode
          ref={nodes}
          name="Output"
          x={spacingX * 12}
          y={200}
          preview
          index={88}
          ins={<GraphPort name="in" portRef={ports.result} />}
        />
        <Arrow ref={arrows} from={ports.satOut()} to={ports.result()} />
      </Node>
    </Node>,
  );

  arrows.map(a =>
    a.end(() => {
      const from = a.localToParent().transformPoint(a.p0()).x;
      const to = a.localToParent().transformPoint(a.p3()).x;
      return clampRemap(from, to, 0, 1, -group().x());
    }),
  );

  nodes.map(n => {
    const y = n.y();
    const time = () => {
      const from = n.x() - view.width() / 2 + 380 + y / 10;
      const to = n.x() + y / 10;
      return clampRemap(from, to, 0, 1, -group().x());
    };
    n.opacity(() => easeOutExpo(time()));
    n.y(() => y + easeOutExpo(time(), 200, 0));
  });

  grid().position(() => {
    const position = group().position();
    return [position.x % 80, position.y % 80];
  });

  const start = group().x();
  yield loop(() => group().x(start).x(-6200, 16, linear));

  yield* waitTransition(0.7);
  yield* waitUntil('video');
  const page = createPageRef();
  view.add(
    <Page
      theme={theme}
      refs={page}
      label="shaderGraph.tsx"
      component={JSCode}
      offsetX={1}
      width={view.width() / 2}
      x={view.width()}
      code={`\
yield* all(
  page.rect.x(rightEdge, 0.6, easeOutCubic),
  graph().opacity(0.32, 0.6, easeOutCubic),
  graph().filters.blur(20, 0.6, easeOutCubic),
);

yield* waitUntil('highlight_page');
yield* page.code.selection(lines(0, 4), 0.3);

yield* waitUntil('highlight_code');
yield* page.code.selection(lines(6, 7), 0.3);

yield* waitUntil('highlight_code_again');
yield* page.code.selection(lines(9, 10), 0.3);

yield* waitUntil('anyway');
yield* all(
  page.rect.x(view.width(), 0.6, easeInCubic),
  graph().opacity(0, 0.6, easeInCubic),
);
`}
    />,
  );

  const rightEdge = view.width() / 2 - 40;
  yield* all(
    page.rect.x(rightEdge, 0.6, easeOutCubic),
    graph().opacity(0.32, 0.6, easeOutCubic),
  );

  yield* waitUntil('highlight_page');
  yield* page.code.selection(lines(0, 4), 0.3);

  yield* waitUntil('highlight_code');
  yield* page.code.selection(lines(6, 7), 0.3);

  yield* waitUntil('highlight_code_again');
  yield* page.code.selection(lines(9, 10), 0.3);

  yield* waitUntil('anyway');
  finishScene();
  yield* all(
    page.rect.x(view.width(), 0.6, easeInCubic),
    graph().opacity(0, 0.6, easeInCubic),
    view.fill(null, 0.6, easeInCubic),
  );
});

function GraphNode({
  preview,
  children,
  index,
  name,
  ins,
  outs,
  ...props
}: RectProps & {
  preview?: boolean;
  index: number;
  name: string;
  ins?: ComponentChildren;
  outs?: ComponentChildren;
}) {
  return (
    <Rect
      layout
      minWidth={280}
      padding={20}
      gap={20}
      offset={-1}
      radius={theme.radius}
      fill={theme.bg}
      clip
      direction={'column'}
      {...props}
    >
      <ATxt text={name.toUpperCase()} />
      <Layout gap={10}>
        <Layout direction={'column'} gap={10}>
          {ins}
        </Layout>
        <Layout grow={1} />
        <Layout direction={'column'} gap={10}>
          {outs}
        </Layout>
      </Layout>
      {children}
      {preview && (
        <Rect
          radius={theme.radius}
          margin={-20}
          marginTop={0}
          size={320}
          shaders={{
            fragment: shader,
            uniforms: {
              index,
            },
          }}
          {...props}
        />
      )}
    </Rect>
  );
}

function GraphPort({
  name,
  out,
  portRef,
  ...props
}: LayoutProps & {
  name: string;
  out?: boolean;
  portRef?: ReferenceReceiver<Circle>;
}) {
  return (
    <Layout
      alignItems={'center'}
      gap={20}
      direction={out ? 'row-reverse' : 'row'}
      {...props}
    >
      <Circle ref={portRef} size={20} fill={theme.window} />
      <ATxt text={name} />
    </Layout>
  );
}

function GraphField({
  value,
  portRef,
  ...props
}: RectProps & {value: any[]; portRef?: ReferenceReceiver<Circle>}) {
  return (
    <Rect
      fill={theme.bg}
      offset={-1}
      padding={20}
      width={320}
      radius={theme.radius}
      layout
      alignItems={'center'}
      gap={20}
      {...props}
    >
      {value.map(v => (
        <Rect fill={theme.bgDark} padding={10} radius={theme.radius} grow={1}>
          <ATxt text={v} />
        </Rect>
      ))}
      <Circle ref={portRef} size={20} fill={theme.window} />
    </Rect>
  );
}

function Arrow({
  from,
  to,
  ...props
}: CubicBezierProps & {from: Node; to: Node}) {
  function toLocal(v: Vector2) {
    return line.worldToLocal().transformPoint(v);
  }

  const midPoint1 = () => {
    return toLocal(
      Vector2.lerp(from.absolutePosition(), to.absolutePosition(), 0.75),
    );
  };

  const midPoint2 = () => {
    return toLocal(
      Vector2.lerp(from.absolutePosition(), to.absolutePosition(), 0.25),
    );
  };

  const line = (
    <CubicBezier
      p0={() => toLocal(from.absolutePosition())}
      p1={() => [midPoint1().x, toLocal(from.absolutePosition()).y]}
      p2={() => [midPoint2().x, toLocal(to.absolutePosition()).y]}
      p3={() => toLocal(to.absolutePosition())}
      lineWidth={8}
      stroke={theme.window}
      {...props}
    />
  );

  return line;
}
