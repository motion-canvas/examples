import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all, sequence, waitUntil} from '@motion-canvas/core/lib/flow';
import {Mesh, Vector, Vertex} from '../components';
import {createRef} from '@motion-canvas/core/lib/utils';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';
import {Img, Layout, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {Direction, Vector2} from '@motion-canvas/core/lib/types';

import lightIcon from '../images/icons/point_light.svg';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {applyViewStyles, Colors, WhiteLabel} from '../styles';
import {clampRemap} from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  const box = createRef<Rect>();
  const mesh = createRef<Mesh>();
  const light = createRef<Img>();

  const size = 160;
  const wireframe = createSignal(0);
  yield view.add(
    <>
      <Layout ref={light} x={600} y={-300}>
        <Img width={96} src={lightIcon} />
      </Layout>
      <Mesh
        ref={mesh}
        fill="#242424"
        lineJoin="round"
        lineWidth={() => wireframe() * 8}
        triangles={[
          [0, 1, 2],
          [2, 3, 4],
          [4, 5, 6],
          [6, 7, 0],
          [0, 2, 4],
          [4, 6, 0],
        ]}
      >
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={-size}
          y={size}
          tangentX={-1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={-size}
          y={size}
          tangentY={1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={size}
          y={size}
          tangentY={1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={size}
          y={size}
          tangentX={1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={size}
          y={-size}
          tangentX={1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={size}
          y={-size}
          tangentY={-1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={-size}
          y={-size}
          tangentY={-1}
        />
        <Vertex
          width={() => wireframe() * 30}
          height={() => wireframe() * 30}
          x={-size}
          y={-size}
          tangentX={-1}
        />
      </Mesh>
      <Rect
        ref={box}
        width={size * 2}
        height={size * 2}
        fill="#242424"
        opacity={0}
      />
    </>,
  );

  const shadowStrength = createSignal(0);
  const offset = createSignal(0);
  const rays = createSignal(0);
  const dots = createSignal(0);
  const rayScale = createSignal(-240);
  const correctRays = createSignal(1);
  for (const vertex of mesh().vertices()) {
    const dot = createComputed(() => {
      const dirToLight = light().position().sub(base).normalized;
      return tangent.dot(dirToLight);
    });
    const base = vertex.position();
    const tangent = vertex.tangent();
    vertex.position(() => {
      const offsetStrength = offset();
      const dirToLight = light().position().sub(base).normalized;

      return dot() < 0
        ? base
            .add(dirToLight.scale(-300 * shadowStrength()))
            .add(tangent.scale(offsetStrength))
        : base.add(tangent.scale(offsetStrength));
    });

    vertex.add(
      <Txt
        position={() =>
          tangent.x !== 0
            ? new Vector2((tangent.x * vertex.tangentScale()) / 2, 40)
            : new Vector2(60, (tangent.y * vertex.tangentScale()) / 2)
        }
        opacity={() =>
          dots() * clampRemap(120, 240, 0, 1, vertex.tangentScale())
        }
        {...WhiteLabel}
        text={() => dot().toFixed(2)}
      />,
    );

    vertex.add(
      <Vector
        to={() =>
          vertex.position().sub(light().position()).normalized.scale(rayScale())
        }
        stroke={Colors.FUNCTION}
        // endArrow={false}
        end={() => {
          let value = rays();
          if (dot() > 0) {
            value *= correctRays();
          }
          return value;
        }}
        arrowSize={24}
        lineWidth={8}
      />,
    );
  }
  yield light().children()[0].moveToTop();

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('vertex');
  yield* shadowStrength(4, 0.6);
  yield* light().position.y(300, 4);
  yield* light().position.y(-300, 4);
  yield* shadowStrength(0, 0.6);

  yield* waitUntil('start_with_mesh');
  yield* wireframe(1, 0.3);

  yield* waitUntil('double_vertices');
  yield* offset(50, 0.6);

  yield* waitUntil('show_normals');
  yield* sequence(
    0.04,
    ...mesh()
      .vertices()
      .map(vertex => vertex.tangentScale(240, 0.3)),
  );
  yield* waitUntil('collapse');
  yield* offset(0, 0.6);

  yield* waitUntil('show_light_dir');
  yield* rays(1, 0.3);

  yield* waitUntil('show_dots');
  yield* dots(1, 0.3);

  yield* waitUntil('show_correct_normals');
  yield* all(
    correctRays(0, 0.3),
    ...mesh()
      .vertices()
      .map(vertex => {
        const dirToLight = light().position().sub(vertex.position()).normalized;
        const dot = vertex.tangent().dot(dirToLight);
        return vertex.tangentScale(dot < 0 ? 240 : 0, 0.3);
      }),
  );

  yield* waitUntil('offsetting_them');
  yield* all(
    rayScale(240, 0.6),
    ...mesh()
      .vertices()
      .map(vertex => {
        return vertex.tangentScale(0, 0.6);
      }),
  );

  yield* waitUntil('shadow');
  yield* shadowStrength(4, 0.6);

  yield* waitUntil('hide_mesh');
  yield* wireframe(0, 0.3);

  yield* waitUntil('showcase');
  yield light().position.x(-600, 3);

  yield* waitUntil('next');
});
