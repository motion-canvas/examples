import {makeScene2D} from '@motion-canvas/2d';
import {
  Circle,
  CircleProps,
  Img,
  Layout,
  Line,
  LineProps,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {all, delay, loop, waitUntil} from '@motion-canvas/core/lib/flow';
import {zoomInTransition} from '@motion-canvas/core/lib/transitions';
import {BBox} from '@motion-canvas/core/lib/types';
import {
  createRef,
  finishScene,
  makeRef,
  range,
  useDuration,
  usePlayback,
} from '@motion-canvas/core/lib/utils';

import {createSignal} from '@motion-canvas/core/lib/signals';
import {join} from '@motion-canvas/core/lib/threading';
import {
  clamp,
  easeInCubic,
  easeOutCubic,
  linear,
  map,
  remap,
} from '@motion-canvas/core/lib/tweening';
import cameraIcon from '../images/icons/camera2.svg';
import {BlackLabel, Colors, WhiteLabel} from '../styles';
import train from '../videos/train.png';

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const videoClip = createRef<Rect>();
  const video = createRef<Img>();

  view.add(
    <Rect ref={videoClip} size={'100%'} clip>
      <Img
        ref={video}
        // play
        // time={6.7}
        src={train}
        height={'100%'}
      />
    </Rect>,
  );
  video().absolutePosition(view.absolutePosition);
  yield* zoomInTransition(new BBox(100, 435, 480, 270), 0.6);
  yield* waitUntil('hide_video');
  yield* videoClip().position.x(-view.width(), 0.8, linear);
  videoClip().remove();

  const fov = createSignal(0);
  const camera = createRef<Img>();
  const cameraGroup = createRef<Node>();
  const previewGroup = createRef<Node>();
  const preview = createRef<Rect>();
  const rays: Line[] = [];

  view.add(
    <>
      <Node ref={cameraGroup} y={400}>
        <Img ref={camera} rotation={-90} src={cameraIcon} size={80} scale={0} />
        {range(9).map(i => (
          <Line
            arrowSize={20}
            lineCap={'round'}
            ref={makeRef(rays, i)}
            points={[() => [((i - 4) / 8) * fov(), -800], 0]}
            lineWidth={8}
            stroke={'#242424'}
            endOffset={60}
            opacity={0}
          />
        ))}
      </Node>
      <Layout
        ref={previewGroup}
        padding={80}
        size={'100%'}
        layout
        alignItems={'end'}
        justifyContent={'end'}
        direction={'column'}
        opacity={0}
      >
        <Txt textAlign={'center'} {...WhiteLabel} lineHeight={80} width={640}>
          PREVIEW
        </Txt>
        <Rect width={640} height={360} radius={8} fill={'#242424'} clip>
          <Layout ref={preview} layout={false} />
        </Rect>
      </Layout>
    </>,
  );

  yield* waitUntil('show_camera');
  yield* camera().scale(1, 0.3);
  yield* waitUntil('show_ray');
  yield* all(
    rays[0].opacity(1).end(0).endArrow(true).stroke('#666').end(1, 0.6),
    rays[0].lineWidth(0).lineWidth(8, 0.1),
    delay(0.4, rays[0].arrowSize(0, 0.2)),
  );

  yield* waitUntil('expand_angle');
  rays.forEach(ray => ray.opacity(1));
  rays.at(-1).stroke('#666');
  yield* fov(1200, 0.6);

  yield* waitUntil('show_preview');
  yield* all(
    cameraGroup().position.x(-200, 0.6),
    previewGroup().opacity(1, 0.6),
  );

  yield* waitUntil('scan');
  const scanLine = createRef<Rect>();
  const scanRay = createRef<Line>();
  const scan = createSignal(0);
  cameraGroup().add(
    <Line
      lineCap={'round'}
      ref={scanRay}
      points={[() => [(scan() - 0.5) * fov(), -800], 0]}
      lineWidth={8}
      stroke={Colors.blue}
      endOffset={60}
      opacity={0}
    />,
  );
  preview().add(
    <Rect
      ref={scanLine}
      x={() => map(-320, 320, scan())}
      height={360}
      width={8}
      fill={Colors.blue}
      opacity={0}
    />,
  );
  yield* all(scanRay().opacity(1, 0.3), scanLine().opacity(1, 0.3));
  yield* scan(1, 1.2);
  yield* all(scanRay().opacity(0, 0.3), scanLine().opacity(0, 0.3));

  yield* waitUntil('area_grow');
  const areaRay = createRef<Line>();
  const areaLine = createRef<Line>();
  const area = createSignal(200);
  cameraGroup().add(
    <Line
      ref={areaRay}
      points={() => [
        [(fov() / 1600) * area(), -area()],
        [(fov() / -1600) * area(), -area()],
      ]}
      arrowSize={20}
      startArrow
      endArrow
      startOffset={20}
      endOffset={20}
      lineWidth={8}
      stroke={Colors.blue}
      start={0.5}
      end={0.5}
    />,
  );
  preview().add(
    <Line
      ref={areaLine}
      points={[
        [-320, 0],
        [320, 0],
      ]}
      arrowSize={20}
      startArrow
      endArrow
      startOffset={20}
      endOffset={20}
      lineWidth={8}
      stroke={'#666'}
      start={0.5}
      end={0.5}
    />,
  );
  yield* all(
    areaRay().start(0, 0.3),
    areaRay().end(1, 0.3),
    areaLine().start(0, 0.3),
    areaLine().end(1, 0.3),
  );
  yield* area(600, 3.2);

  yield* waitUntil('area_shrink');
  yield* all(
    areaRay().stroke('#666', 0.3),
    areaLine().stroke(Colors.blue, 0.3),
  );
  yield* area(200, useDuration('area_shrink_end'));
  yield* all(
    areaRay().start(0.5, 0.3),
    areaRay().end(0.5, 0.3),
    areaLine().start(0.5, 0.3),
    areaLine().end(0.5, 0.3),
  );

  yield* waitUntil('circle_show');

  function createSpheres(props: CircleProps = {}) {
    const sphere = createRef<Circle>();
    const spherePreview = createRef<Circle>();
    cameraGroup().add(
      <Circle
        ref={sphere}
        scale={0}
        size={225}
        y={-300}
        fill={Colors.blue}
        {...props}
      />,
    );
    preview().add(
      <Circle
        ref={spherePreview}
        fill={Colors.blue}
        scale={sphere().scale}
        opacity={sphere().opacity}
        size={() =>
          sphere()
            .size()
            .scale(640 / ((fov() / 800) * -sphere().position.y()))
        }
        x={() =>
          sphere().position.x() *
          (640 / ((fov() / 800) * -sphere().position.y()))
        }
        {...props}
      />,
    );

    return [sphere, spherePreview];
  }
  const [sphere, spherePreview] = createSpheres();

  yield* all(sphere().scale(1, 0.3));
  yield* waitUntil('circle_move');
  yield* all(sphere().position.y(-600, 2.4));
  yield* waitUntil('circle_move_back');
  yield* all(sphere().position.y(-300, 2.4));

  yield* waitUntil('ratio_show');
  const cameraRatio = createRatios(
    cameraGroup(),
    () => (fov() / 1600) * sphere().position.y(),
    () => sphere().width() / -2,
    () => remap(-300, -600, 1, 3, sphere().position.y()).toFixed(2),
    () => '2.00',
    sphere().position.y,
  );
  yield* cameraRatio.show();

  yield* waitUntil('ratio_preview');
  const previewRatio = createRatios(
    preview(),
    () => -330,
    () => spherePreview().width() / -2,
    () => remap(-300, -600, 1, 3, sphere().position.y()).toFixed(2),
    () => '2.00',
    () => 0,
  );
  yield* previewRatio.show();

  yield* waitUntil('ratio_move');
  yield* sphere().position.y(-600, 5);

  yield* waitUntil('ratio_hide');
  yield* all(previewRatio.hide(), cameraRatio.hide(), sphere().size(0, 0.6));

  yield* waitUntil('movement');
  const [frontSphere, frontSpherePreview] = createSpheres({
    fill: '#666',
  });
  preview().add(
    <Node cache>
      {frontSpherePreview()}
      <Circle
        stroke={'#444'}
        lineDash={() => [(Math.PI / 16) * (spherePreview().width() - 8)]}
        lineCap={'round'}
        lineWidth={8}
        compositeOperation={'source-atop'}
        position={spherePreview().position}
        size={() => spherePreview().size().sub(8)}
      />
    </Node>,
  );
  sphere().fill('#444');
  spherePreview().fill('#444');
  frontSphere().size(140);
  frontSphere().position.x(sphere().position.x);
  yield* all(sphere().size(140, 0.3), frontSphere().scale(1, 0.3));

  yield* waitUntil('movement_move');
  const vector = createRef<Line>();
  const frontVector = createRef<Line>();
  const vectorPreview = createRef<Line>();
  const frontVectorPreview = createRef<Line>();
  cameraGroup().add(
    <>
      <Line
        arrowSize={20}
        ref={vector}
        lineWidth={8}
        stroke={Colors.blue}
        endArrow
        points={[[0, sphere().position.y()], sphere().position]}
      />
      <Line
        arrowSize={20}
        ref={frontVector}
        lineWidth={8}
        stroke={Colors.red}
        endArrow
        points={[[0, frontSphere().position.y()], frontSphere().position]}
      />
    </>,
  );
  preview().add(
    <>
      <Line
        arrowSize={20}
        ref={frontVectorPreview}
        lineWidth={8}
        stroke={Colors.red}
        endArrow
        points={[0, frontSpherePreview().position]}
        // end={0}
      />
      <Line
        arrowSize={20}
        ref={vectorPreview}
        lineWidth={8}
        stroke={Colors.blue}
        endArrow
        points={[0, spherePreview().position]}
        // end={0}
      />
    </>,
  );
  const vectors = [
    vector(),
    frontVector(),
    vectorPreview(),
    frontVectorPreview(),
  ];
  yield* all(sphere().position.x(-225, 2.4));
  yield* waitUntil('movement_preview');
  yield* all(
    vectorPreview().position.y(20, 0.6),
    frontVectorPreview().position.y(-20, 0.6),
  );

  yield* waitUntil('vector_hide');
  yield* all(...vectors.map(v => v.start(1, 0.3)));
  yield* sphere().position.x(225, 2).to(-225, 2);

  yield* waitUntil('camera_move');
  const cameraMove = yield loop(Infinity, () =>
    all(
      cameraGroup().position.x(-650, 3).to(-200, 3),
      sphere().position.x(225, 3).to(-225, 3),
    ),
  );
  yield* waitUntil('vector_show');
  const speed = createSignal(0);
  let lastPosition = sphere().position.x();
  yield loop(Infinity, () => {
    speed(
      (sphere().position.x() - lastPosition) / usePlayback().framesToSeconds(1),
    );
    lastPosition = sphere().position.x();
  });
  vector().points([
    sphere().position,
    () => [sphere().position.x() + speed() * 0.4, sphere().position.y()],
  ]);
  frontVector().points([
    frontSphere().position,
    () => [
      frontSphere().position.x() + speed() * 0.4,
      frontSphere().position.y(),
    ],
  ]);
  vectorPreview().points([
    spherePreview().position,
    () => [
      spherePreview().position.x() +
        (speed() * 0.4 * 640) / ((fov() / 800) * -sphere().position.y()),
      spherePreview().position.y(),
    ],
  ]);
  frontVectorPreview().points([
    frontSpherePreview().position,
    () => [
      frontSpherePreview().position.x() +
        (speed() * 0.4 * 640) / ((fov() / 800) * -frontSphere().position.y()),
      frontSpherePreview().position.y(),
    ],
  ]);
  yield* all(...vectors.slice(0, 2).map(v => v.start(0).end(0).end(1, 0.3)));
  yield* waitUntil('vector_preview');
  yield* all(
    ...vectors.slice(2).map(v => v.start(0).end(0).end(1, 0.3)),
    (preview().parent() as Rect).ripple(),
  );

  yield* waitUntil('next');
  finishScene();
  yield* join(cameraMove);
});

function createRatios(
  parent: Node,
  from: () => number,
  to: () => number,
  fromText: () => string,
  toText: () => string,
  y: () => number,
) {
  const ratioLeft = createRef<Line>();
  const labelLeft = createRef<Txt>();
  const ratioCenter = createRef<Line>();
  const labelCenter = createRef<Txt>();
  const ratioRight = createRef<Line>();
  const labelRight = createRef<Txt>();

  const common: LineProps = {
    stroke: Colors.blue,
    layout: true,
    justifyContent: 'center',
    alignItems: 'end',
    lineCap: 'round',
    startOffset: 10,
    endOffset: 10,
  };

  parent.add(
    <>
      <Line
        ref={ratioLeft}
        lineWidth={() => clamp(0, 8, ratioLeft().arcLength())}
        points={() => [
          [from(), y()],
          [to(), y()],
        ]}
        {...common}
        start={1}
        startOffset={20}
      >
        <Txt
          ref={labelLeft}
          {...BlackLabel}
          fill={Colors.blue}
          lineHeight={60}
          opacity={0}
          text={fromText}
        />
      </Line>
      <Line
        ref={ratioRight}
        lineWidth={() => clamp(0, 8, ratioRight().arcLength())}
        points={() => [
          [-to(), y()],
          [-from(), y()],
        ]}
        {...common}
        end={0}
        endOffset={20}
      >
        <Txt
          ref={labelRight}
          {...BlackLabel}
          fill={Colors.blue}
          lineHeight={60}
          opacity={0}
          text={fromText}
        />
      </Line>
      <Line
        ref={ratioCenter}
        lineWidth={() => clamp(0, 8, ratioCenter().arcLength())}
        points={() => [
          [to(), y()],
          [-to(), y()],
        ]}
        {...common}
        stroke={'#141414'}
        start={0.5}
        end={0.5}
      >
        <Txt
          ref={labelCenter}
          opacity={0}
          {...BlackLabel}
          lineHeight={60}
          text={toText}
        />
      </Line>
    </>,
  );

  return {
    show: function* () {
      yield* all(
        ratioCenter().start(0, 0.3, easeInCubic),
        ratioCenter().end(1, 0.3, easeInCubic),
        labelCenter().opacity(1, 0.3),
      );
      yield* all(
        ratioLeft().start(0, 0.3, easeOutCubic),
        labelLeft().opacity(1, 0.3),
        ratioRight().end(1, 0.3, easeOutCubic),
        labelRight().opacity(1, 0.3),
      );
    },
    hide: function* () {
      yield* all(
        ratioLeft().start(1, 0.3, easeInCubic),
        labelLeft().opacity(0, 0.3),
        ratioRight().end(0, 0.3, easeInCubic),
        labelRight().opacity(0, 0.3),
        labelCenter().opacity(0, 0.3),
      );
      yield* all(
        ratioCenter().start(0.5, 0.3, easeOutCubic),
        ratioCenter().end(0.5, 0.3, easeOutCubic),
      );
    },
  };
}
