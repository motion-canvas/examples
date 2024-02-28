import {
  Circle,
  Code,
  CODE,
  Layout,
  Line,
  lines,
  makeScene2D,
  Node,
  Path,
  Rect,
  Txt,
} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createRefArray,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  Vector2,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import {Paper, RSCode, Tetrahedron} from '../nodes';
import {Theme} from '../styles';
import assetTiles from '../svg/asset-tiles.svg?raw';
import executable from '../svg/executable.svg?raw';

const container = document.createElement('div');
container.innerHTML = assetTiles;
const assetSVG = container.querySelector('svg')!;
container.innerHTML = executable;
const executableSVG = container.querySelector('svg')!;

const theme = {
  ...Theme,
  main: '#2ac2a5',
  bg: '#1a2422',
  bgDark: '#0a0f0e',
  stroke: '#5c6664',
};

export default makeScene2D(function* (view) {
  const rects = createRefArray<Rect>();
  const wrapper = <Node position={view.size().div(-2)} />;
  view.fill(theme.bgDark);
  view.add(wrapper);

  for (const rect of assetSVG.children) {
    if (rect instanceof SVGRectElement) {
      const width = parseFloat(rect.getAttribute('width'));
      const height = parseFloat(rect.getAttribute('height'));
      const x = parseFloat(rect.getAttribute('x')) + width / 2;
      const y = parseFloat(rect.getAttribute('y')) + height / 2;

      const flip = x > 1100;
      const Klass = width > 100 && height > 100 ? Paper : Rect;

      wrapper.add(
        <Klass
          flip={flip}
          ref={rects}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={theme.bg}
          radius={8}
          scale={0}
        />,
      );
    } else {
      const parent = rects.at(-1);
      parent.add(
        <Path
          position={parent.position().scale(-1)}
          data={rect.getAttribute('d')}
          fill={theme.stroke}
        />,
      );
    }
  }

  const tetra = createRef<Tetrahedron>();
  const mainRect = rects[5];
  mainRect.add(
    <Tetrahedron
      y={16}
      ref={tetra}
      lineWidth={8}
      stroke={theme.stroke}
      radius={2}
      orbit={-90}
    />,
  );

  rects.reverse();
  yield* waitTransition(2.1);
  yield* sequence(0.02, ...rects.map(rect => rect.scale(1, 0.4, easeOutCubic)));

  yield* waitUntil('zoom_mesh');

  const code = createRef<Code>();
  const data = Code.createSignal(
    Tetrahedron.indices
      .flatMap(face =>
        face.map(i => {
          const vertex = tetra().vertices()[i];
          return `[${[vertex.x, vertex.y, vertex.z]
            .map(v => v.toFixed(2).padStart(5, ' '))
            .join(`, `)}]`;
        }),
      )
      .map(line => '  ' + line)
      .join(',\n') + ',',
  );

  view.add(
    <RSCode
      x={-view.width()}
      offsetX={-1}
      ref={code}
      code={CODE`[\n${data}\n];`}
    />,
  );

  rects.reverse();
  tetra().reparent(view);
  yield* all(
    tetra().orbit(-196, 1.2),
    tetra().radius(10, 1.2),
    tetra().position([380, 60], 1.2),
    sequence(0.02, ...rects.map(rect => rect.scale(0, 0.4, easeInCubic))),
  );

  yield* waitUntil('show_code');
  yield* code().x(view.width() / -2 + 160, 0.6, easeOutCubic);

  yield* waitUntil('highlight_face');
  const triangle = createRef<Line>();
  const vertices = createRefArray<Circle>();
  tetra().add(
    <Line
      ref={triangle}
      lineWidth={8}
      lineCap={'round'}
      lineJoin={'round'}
      stroke={theme.main}
      end={0}
      points={() => [
        tetra().projectedVertices()[0],
        tetra().projectedVertices()[1],
        tetra().projectedVertices()[3],
        tetra().projectedVertices()[0],
      ]}
    />,
  );
  tetra().add(
    [0, 1, 3].map((i, index) => (
      <Circle
        ref={vertices}
        position={() => tetra().projectedVertices()[i]}
        size={8}
        lineWidth={8}
        fill={theme.bgDark}
        stroke={() => (triangle().end() > index / 3 ? theme.main : '#666')}
      />
    )),
  );

  yield* all(triangle().end(1, 0.6), code().selection(lines(4, 6), 0.6));

  yield* waitUntil('vertex_1');
  yield* all(vertices[0].size(32, 0.3), code().selection(lines(4), 0.3));

  yield* waitUntil('vertex_2');
  yield* all(
    vertices[0].size(8, 0.3),
    vertices[1].size(32, 0.3),
    code().selection(lines(5), 0.3),
  );

  yield* waitUntil('vertex_3');
  yield* all(
    vertices[1].size(8, 0.3),
    vertices[2].size(32, 0.3),
    code().selection(lines(6), 0.3),
  );

  yield* waitUntil('structure');
  yield* all(
    code().code.prepend(0.4)`const MESH: [[f32; 3]; 12] = `,
    code().selection(lines(0), 0.4),
    vertices[2].size(8, 0.3),
    triangle().end(0, 0.3),
  );
  vertices.forEach(v => v.remove());
  triangle().remove();

  yield* waitUntil('reference');
  yield code().selection(lines(4, 17), 0.6);
  yield code().code.append(
    `

fn render_mesh(matrix: &Mat4) {
  for chunk in MESH.chunks(3) {
    let v0 = chunk[0];
    let v1 = chunk[1];
    let v2 = chunk[2];
    // Just an example. You probably 
    // wouldn't render a mesh like this.
    draw_face(
      matrix.transform(v0), 
      matrix.transform(v1),
      matrix.transform(v2),
    );
  }
}`,
    0.6,
  );
  yield* data(`  // vertices`, 0.6);

  yield* waitUntil('highlight');
  yield* code().selection(code().findAllRanges('MESH'), 0.4);

  const exec = createRefArray<Rect>();
  const label = createRef<Txt>();

  for (const rect of executableSVG.children) {
    if (rect instanceof SVGRectElement) {
      const width = parseFloat(rect.getAttribute('width'));
      const height = parseFloat(rect.getAttribute('height'));
      const x = parseFloat(rect.getAttribute('x')) + width / 2;
      const y = parseFloat(rect.getAttribute('y')) + height / 2;

      wrapper.add(
        <Rect ref={exec} x={x} y={y} width={width} height={height} radius={8}>
          <Circle
            scale={0}
            size={Vector2.magnitude(width, height)}
            fill={theme.bgDark}
          />
        </Rect>,
      );
    } else if (rect instanceof SVGTextElement) {
      const parent = exec.at(-1);
      const x = parseFloat(rect.getAttribute('x')) - parent.x();
      const y = parseFloat(rect.getAttribute('y')) - parent.y() - 10;
      parent.add(
        <Txt
          ref={label}
          offsetX={-1}
          height={40}
          lineHeight={48}
          fontFamily={'JetBrains Mono'}
          fontWeight={700}
          fontSize={28}
          fill={'rgba(255, 255, 255, 0.6)'}
          x={x}
          y={y}
        />,
      );
    } else if (rect instanceof SVGPathElement) {
      const parent = exec.at(-1);
      parent.add(
        <Path
          position={parent.position().scale(-1)}
          data={rect.getAttribute('d')}
          fill={'#666'}
        />,
      );
    } else {
    }
  }
  const execBox = exec[0];
  const codeBox = exec[1];
  const dataBox = exec[2];
  const codeIcon = exec[3];

  const execSize = execBox.size();
  execBox.size('100%');
  codeIcon.reparent(dataBox);
  codeIcon.opacity(0);
  const targetData = codeBox.position();
  const targetCode = dataBox.position();
  tetra().reparent(wrapper);
  code().reparent(wrapper);
  code().moveOffset(Vector2.zero);

  codeBox.position(tetra().position());
  dataBox.position(code().position());
  tetra().reparent(codeBox);
  code().reparent(dataBox);

  yield* waitUntil('compile');

  yield* all(
    execBox.size(execSize, 0.6, easeInCubic),
    execBox.fill(theme.bg, 0.3, easeInCubic),
    tetra().radius(2, 0.6, easeInCubic),
    tetra().orbit(-90, 0.6, easeInCubic),
    codeBox.position(targetData, 0.6, easeInCubic, Vector2.createArcLerp(true)),
    code().scale(0.2, 0.6, easeInCubic, Vector2.createArcLerp(true, 2)),
    code().opacity(0, 0.6, easeInCubic),
    codeIcon.opacity(1, 0.6, easeInCubic),
    dataBox.position(
      targetCode,
      0.6,
      easeInCubic,
      Vector2.createArcLerp(true, 2),
    ),
  );
  codeBox.clip(true);
  dataBox.clip(true);
  // exec[0].childAs<Circle>(0).fill(DataColors.stroke);
  // exec[1].childAs<Circle>(0).fill(CodeColors.stroke);
  yield* all(
    // tetra().stroke(theme.stroke, 0.3, easeOutCubic),
    // ...codeIcon
    //   .childrenAs<Path>()
    //   .map(p => p.fill(theme.main, 0.3, easeOutCubic)),
    codeBox.childAs(0).scale(1, 0.3, easeOutCubic),
    dataBox.childAs(0).scale(1, 0.3, easeOutCubic),
    label().text('EXECUTABLE FILE', 0.3, easeOutCubic),
  );

  execBox.childAs(0).remove();
  execBox.layout(true).direction('column').padding(40).gap(40);
  execBox.add(codeBox);
  codeBox.childrenAs<Layout>().forEach(c => c.layout(false));
  codeBox.width(null);
  execBox.add(dataBox);
  dataBox.childrenAs<Layout>().forEach(c => c.layout(false));
  dataBox.width(null);

  yield* waitUntil('next');
  execBox.moveOffset(Vector2.topLeft);
  const target = [80, 370];
  const targetSize = 160;
  tetra().size(300);
  yield* all(
    // bg: '#241a1a',
    // bgDark: '#0f0a0a',
    view.fill('#0f0a0a', 0.6),
    execBox.fill('#241a1a', 0.6),
    codeBox.childAs<Circle>(0).fill('#0f0a0a', 0.6),
    dataBox.childAs<Circle>(0).fill('#0f0a0a', 0.6),
    execBox.position(
      target,
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(true, 2),
    ),
    execBox.size(
      targetSize,
      0.6,
      easeInOutCubic,
      Vector2.createArcLerp(true, 2),
    ),
    execBox.padding(20, 0.6),
    execBox.gap(0, 0.6),
    label().opacity(0, 0.3),
    label().height(0, 0.3),
    codeBox.margin.bottom(-20, 0.3),
    tetra().opacity(0, 0.3),
    codeIcon.opacity(0, 0.3),
  );
});
