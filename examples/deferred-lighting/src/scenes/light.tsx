import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {Circle, Layout, Txt, Img, Rect} from '@motion-canvas/2d/lib/components';
import {all, delay, sequence, waitUntil} from '@motion-canvas/core/lib/flow';
import {ArcVector, Mesh, Slider, Three, Vector, Vertex} from '../components';

import * as light from '../three/light';
import {makeRef, createRef, makeRefs} from '@motion-canvas/core/lib/utils';
import {Color, Direction, Vector2} from '@motion-canvas/core/lib/types';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';
import {
  clamp,
  clampRemap,
  easeInOutCubic,
  easeOutCubic,
  linear,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import lightIcon from '../images/icons/point_light.svg';
import normals from '../images/frames/normals.png';
import {applyViewStyles, Colors, WhiteLabel} from '../styles';
import {createSampler, Sampler} from '../Sample';
import {Vector3} from 'three';
import {Gradient} from '@motion-canvas/2d/lib/partials';

// const theme = '#e91e63';
// const theme = '#00bcd4';
const theme = Colors.FUNCTION;

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  yield light.setup();

  const three = createRef<Three>();
  const circle = createRef<Circle>();
  const orbit = createRef<Layout>();
  const intensityParam = makeRefs<typeof Parameter>();
  const distanceParam = makeRefs<typeof Parameter>();
  const angleParam = makeRefs<typeof Parameter>();
  const direction = createRef<Vector>();
  const directionLength = createRef<Txt>();
  const positionLabel = createRef<Txt>();
  const arcVector = createRef<ArcVector>();
  const arcLength = createRef<Txt>();
  const mesh = createRef<Mesh>();

  function Parameter({
    refs,
    children,
    value = 0,
  }: {
    refs: {group: Layout; slider: Slider; text: Txt};
    children: string;
    value?: number;
  }) {
    const result = (
      <Layout ref={makeRef(refs, 'group')} direction="column" opacity={0}>
        <Layout paddingBottom={8}>
          <Txt grow={1} {...WhiteLabel}>
            {children}
          </Txt>
          <Txt ref={makeRef(refs, 'text')} {...WhiteLabel} fill={theme} />
        </Layout>
        <Slider
          ref={makeRef(refs, 'slider')}
          value={value}
          color={theme}
          highlight={1}
        />
      </Layout>
    );

    refs.text.text(() => refs.slider.value().toFixed(2));

    return result;
  }

  view.fontFamily('JetBrains Mono');
  view.fontSize(36);

  const size = light.quad.scale.x / 2;
  const radius = createSignal(0);
  const lightCircle = createRef<Circle>();
  const origin = createRef<Circle>();
  const code = createRef<Layout>();
  const code2 = createRef<Layout>();
  const codeIn = createRef<Layout>();
  const codeIn2 = createRef<Layout>();
  const codeOut = createRef<Layout>();
  const dotValue = createRef<Txt>();

  // const lightColor = '#ffeb3b';
  const lightColor = Colors.FUNCTION;
  yield view.add(
    <>
      <Three
        ref={three}
        opacity={0}
        quality={1 / 24}
        width={1920}
        height={1080}
        zoom={1080}
        camera={light.camera}
        scene={light.threeScene}
        onRender={light.render}
      />
      <Mesh
        opacity={0}
        ref={mesh}
        triangles={[
          [0, 1, 2],
          [2, 3, 0],
        ]}
      >
        <Vertex x={() => -radius()} y={() => radius()} />
        <Vertex x={() => radius()} y={() => radius()} />
        <Vertex x={() => radius()} y={() => -radius()} />
        <Vertex x={() => -radius()} y={() => -radius()} />
      </Mesh>

      <Layout x={-240} ref={orbit}>
        <Circle ref={origin} opacity={0} width={30} height={30} fill={theme}>
          <Txt {...WhiteLabel} opacity={1} y={60}>
            (0, 0)
          </Txt>
        </Circle>
        <Circle
          ref={circle}
          width={0}
          height={0}
          stroke={theme}
          lineWidth={8}
          shadowColor="rgba(0, 0, 0, 0.32)"
          shadowBlur={8}
          shadowOffsetY={2}
        >
          <Txt ref={positionLabel} y={-60} opacity={0} {...WhiteLabel} />
        </Circle>
        <ArcVector
          lineDash={[0, 16]}
          ref={arcVector}
          arrowSize={24}
          lineWidth={8}
          stroke={theme}
          from={0}
          to={-90}
          end={0}
          startOffset={30}
          endOffset={30}
          counter
        >
          <Txt
            {...WhiteLabel}
            fontWeight={700}
            opacity={0}
            ref={arcLength}
            y={-40}
          />
        </ArcVector>
        <Vector
          ref={direction}
          toX={200}
          toY={200}
          lineWidth={8}
          arrowSize={24}
          stroke={theme}
          startOffset={30}
          endOffset={30}
          end={0}
        >
          <Txt {...WhiteLabel} opacity={0} ref={directionLength} y={-40} />
        </Vector>
      </Layout>
      <Layout
        direction="column"
        justifyContent="center"
        x={500}
        width={480}
        height={600}
        layout
        gap={64}
      >
        <Parameter refs={intensityParam}>intensity</Parameter>
        <Parameter refs={distanceParam}>radialFalloff</Parameter>
        <Parameter refs={angleParam}>angularFalloff</Parameter>
      </Layout>
      <Circle
        ref={lightCircle}
        position={mesh().position}
        width={() => radius() * 2}
        height={() => radius() * 2}
        stroke={lightColor}
        lineWidth={8}
      >
        <Vector
          to={() => Vector2.fromRadians((60 / 180) * Math.PI).scale(radius())}
          endArrow={false}
          lineWidth={8}
          startOffset={() =>
            linear(clampRemap(0, size / 3, 0, 1, radius()), 0, 60)
          }
          stroke={lightColor}
        />
        <Vector
          to={() => Vector2.fromRadians((-60 / 180) * Math.PI).scale(radius())}
          endArrow={false}
          startOffset={() =>
            linear(clampRemap(0, size / 3, 0, 1, radius()), 0, 60)
          }
          lineWidth={8}
          stroke={lightColor}
        />
        <Img
          src={lightIcon}
          width={() => linear(clampRemap(0, size / 3, 0, 1, radius()), 0, 96)}
        />
      </Circle>
      <Layout
        opacity={0}
        direction="column"
        layout
        x={-960 + 80}
        y={1080 / 2 - 80}
        offsetX={-1}
        offsetY={1}
        {...WhiteLabel}
        ref={code}
      >
        <Layout>
          <Txt fill={Colors.KEYWORD}>float</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;radialFalloff</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.FUNCTION}>pow</Txt>
          <Txt fill={Colors.COMMENT}>(</Txt>
          <Txt fill={Colors.NUMBER}>1.0</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;-&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>distance</Txt>
          <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
          <Txt fill={Colors.NUMBER}>2.0</Txt>
          <Txt fill={Colors.COMMENT}>);</Txt>
        </Layout>
        <Layout>
          <Txt fill={Colors.KEYWORD}>float</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;angularFalloff</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.FUNCTION}>smoothstep</Txt>
          <Txt fill={Colors.COMMENT}>(</Txt>
          <Txt fill={Colors.TEXT}>maxAngle</Txt>
          <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>minAngle</Txt>
          <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
          <Txt fill={Colors.TEXT}>angle</Txt>
          <Txt fill={Colors.COMMENT}>);</Txt>
        </Layout>
      </Layout>
      <Layout
        layout
        x={-960 + 80}
        y={1080 / 2 - 80}
        offsetX={-1}
        offsetY={1}
        {...WhiteLabel}
        ref={code2}
        opacity={0}
      >
        <Layout ref={codeIn} opacity={0} width={0} clip>
          <Txt fill={Colors.KEYWORD}>float</Txt>
          <Txt fill={Colors.TEXT}>&nbsp;normalFalloff</Txt>
          <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
          <Txt fill={Colors.FUNCTION}>clamp</Txt>
          <Txt fill={Colors.COMMENT}>(</Txt>
        </Layout>
        <Txt fill={Colors.FUNCTION}>dot</Txt>
        <Txt fill={Colors.COMMENT}>(</Txt>
        <Txt fill={Colors.TEXT}>dirToLight</Txt>
        <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
        <Txt fill={Colors.TEXT}>normalVector</Txt>
        <Txt fill={Colors.COMMENT}>)</Txt>
        <Layout>
          <Layout ref={codeOut}>
            <Txt fill={Colors.COMMENT}>&nbsp;=&nbsp;</Txt>
            <Txt ref={dotValue} fill={Colors.NUMBER}>
              0.0
            </Txt>
            <Txt fill={Colors.COMMENT}>;</Txt>
          </Layout>
          <Layout ref={codeIn2} opacity={0}>
            <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
            <Txt fill={Colors.NUMBER}>0.0</Txt>
            <Txt fill={Colors.COMMENT}>,&nbsp;</Txt>
            <Txt fill={Colors.NUMBER}>1.0</Txt>
            <Txt fill={Colors.COMMENT}>);</Txt>
          </Layout>
        </Layout>
      </Layout>
    </>,
  );

  positionLabel().text(() => {
    const position = circle()
      .position()
      .scale(1 / radius());
    return `(${position.x.toFixed(2)}, ${(-position.y).toFixed(2)})`;
  });
  directionLength().text(() => (direction().length() / radius()).toFixed(2));
  direction().to(() => circle().position());

  orbit().position(light.quad.position);

  const intensity = createComputed(() => {
    const position = 1 - direction().length() / radius() + light.distance();

    return clamp(0, 1, position * position);
  });

  const angle = createComputed(() => {
    const position = circle().absolutePosition().sub(orbit().absolutePosition())
      .normalized.safe;
    return (Math.acos(position.x) * 180) / Math.PI;
  });

  arcVector().radius(() => direction().length());
  arcVector().to(() => -angle());
  arcLength().text(() => `${angle().toFixed(0)}°`);
  arcLength().position(() => arcVector().center().addX(60));

  const angleValue = createComputed(() => {
    const to = light.angleFrom() / 2;
    const from = light.angleTo() / 2;
    const value = angle();

    if (value < from) {
      return 1;
    }

    if (value >= to) {
      return 0;
    }

    const x = (value - from) / (to - from);

    return 1 - x * x * (3 - 2 * x);
  });

  circle().fill(() =>
    Color.lerp('#141414', '#fff', intensity() * angleValue()),
  );
  intensityParam.slider.value(light.intensity);
  distanceParam.slider.value(intensity);
  angleParam.slider.value(angleValue);

  yield* slideTransition(Direction.Left);
  yield* waitUntil('point_light');
  yield* radius(size / 3, 0.5, easeOutCubic);

  yield* waitUntil('mesh');
  yield* all(mesh().opacity(1, 0.3));
  yield* waitUntil('hide_light');
  yield* all(lightCircle().opacity(0, 0.3));

  yield* waitUntil('move_square');
  yield* all(mesh().position.x(light.quad.position.x, 0.5), radius(size, 0.5));
  three().opacity(1);

  yield* waitUntil('intensity');
  light.intensity(0.1);
  yield* all(intensityParam.group.opacity(1, 0.3), mesh().opacity(0, 0.3));
  yield* light.intensity(0.5, 1);
  yield* light.intensity(0.25, 0.6);
  yield* light.intensity(0.5, 0.6);
  yield* intensityParam.slider.highlight(0, 0.3);

  yield* waitUntil('radial');
  yield* all(light.distance(0, 1), light.intensity(1, 1));

  yield* waitUntil('the_further');
  yield* all(
    circle().size.x(100, 0.3),
    circle().size.y(100, 0.3),
    distanceParam.group.opacity(1, 0.3),
  );

  yield* circle().position.x(light.quad.scale.x / 2.4, 1.75);
  yield* circle().position.x(light.quad.scale.x / 4, 1.25);

  yield* waitUntil('limit_angle');
  yield* all(
    light.angleFrom(120, 1),
    light.angleTo(0, 1),
    distanceParam.slider.highlight(0, 0),
  );

  yield* angleParam.group.opacity(1, 0.3);
  yield* orbit().rotation(60, 2);
  yield orbit().rotation(0, 2);

  yield* waitUntil('origin');
  yield* all(origin().opacity(1, 0.3));

  yield* waitUntil('fragment_position');
  yield* all(
    circle().size.x(30, 0.6),
    circle().size.y(30, 0.6),
    circle().fill(theme, 0.6),
    circle().lineWidth(0, 0.6),
    circle().position.y(-300, 0.6),
    circle().position.x(460, 0.6),
    angleParam.slider.highlight(0, 0.6),
    delay(0.3, positionLabel().opacity(1, 0.3)),
  );

  yield* waitUntil('distance');
  yield* all(direction().end(1, 0.3), directionLength().opacity(1, 0.3));

  yield* waitUntil('angle');
  yield* all(arcVector().end(1, 0.3), arcLength().opacity(1, 0.3));
  yield* waitUntil('show_code');
  yield* sequence(
    0.6,
    ...code()
      .opacity(1)
      .children()
      .map(node => node.opacity(0).opacity(1, 0.3)),
  );

  yield* waitUntil('move');
  yield all(circle().position.x(720, 3), circle().position.y(-160, 3));

  yield* waitUntil('zoom_in');
  yield* all(
    orbit().opacity(0, 0.3),
    light.intensity(1, 0.3),
    // radius(4320 / 2, 0.6),
    code().opacity(0, 0.3),
    tween(0.6, value =>
      light.quad.scale.setScalar(easeInOutCubic(value, 1920, 4320)),
    ),
    sequence(
      0.05,
      intensityParam.group.opacity(0, 0.3),
      distanceParam.group.opacity(0, 0.3),
      angleParam.group.opacity(0, 0.3),
    ),
  );

  yield* light.normalColor(1, 2);
  yield* waitUntil('normal_intensity');
  yield* all(light.normalIntensity(1, 0.3), light.normalColor(1, 0.3));

  yield* waitUntil('show_normal');
  const sampler: Sampler = yield createSampler(normals);
  const fragment = createRef<Rect>();
  const normal = createRef<Vector>();
  const lightDir = createRef<Vector>();
  const projection = createRef<Vector>();
  const projected = createRef<Vector>();
  const normalSize = createSignal(320);
  const normalScale = createSignal(1);
  const componentXSize = createSignal(0);
  const componentYSize = createSignal(0);

  const normalColor = createComputed(() => {
    const position = fragment()
      .position()
      .addX(960)
      .addY(540)
      .scale(1 / 24);

    return sampler.getColorAtPoint(position);
  });

  const normalVector = createComputed(() => {
    const color = normalColor();
    return new Vector2(
      color.get('rgb.r') / 255 - 0.5,
      -(color.get('rgb.g') / 255 - 0.5),
    ).normalized.scale(normalScale());
  });

  const lightDirVector = createComputed(
    () =>
      lightCircle().absolutePosition().sub(fragment().absolutePosition())
        .normalized,
  );

  const dotResult = createComputed(() => {
    return normalVector().dot(lightDirVector());
  });

  const gradient = new Gradient({
    from: new Vector2(600, 0),
    to: new Vector2(-400, 0),
    stops: [
      {offset: 0, color: '#571602'},
      {offset: 1, color: lightColor},
    ],
  });

  yield view.add(
    <>
      <Rect ref={fragment} x={204} width={0} height={0}>
        <Vector
          arrowSize={24}
          toY={() => normalVector().scale(320).y}
          stroke={Colors.green}
          end={componentYSize}
          lineWidth={8}
        />
        <Vector
          endArrow={false}
          toX={() => normalVector().scale(320).x}
          fromX={() => normalVector().scale(320).x}
          fromY={() => normalVector().scale(320).y}
          stroke={'rgba(255, 255, 255, 0.24)'}
          lineWidth={8}
          end={componentXSize}
          lineDash={[16, 16]}
        />
        <Vector
          arrowSize={24}
          toX={() => normalVector().scale(320).x}
          stroke={Colors.red}
          lineWidth={8}
          end={componentXSize}
        />
        <Vector
          endArrow={false}
          fromY={() => normalVector().scale(320).y}
          fromX={() => normalVector().scale(320).x}
          toY={() => normalVector().scale(320).y}
          stroke={'rgba(255, 255, 255, 0.24)'}
          lineWidth={8}
          end={componentYSize}
          lineDash={[16, 16]}
        />
        <Vector
          ref={projection}
          arrowSize={24}
          from={() => lightDirVector().scale(normalSize())}
          to={() => {
            const normalDir = normalVector();
            const dot = dotResult();
            return normalDir.scale(dot * normalSize());
          }}
          end={0}
          stroke={'rgba(255, 255, 255, 0.24)'}
          lineWidth={8}
          lineDash={[16, 16]}
          endArrow={false}
        />
        <Vector
          ref={normal}
          arrowSize={24}
          to={() => normalVector().scale(320)}
          stroke={normalColor}
          lineWidth={8}
          end={0}
        />
        <Vector
          ref={lightDir}
          arrowSize={24}
          to={() =>
            lightCircle()
              .absolutePosition()
              .transformAsPoint(lightDir().worldToParent())
          }
          stroke={gradient}
          endOffset={30}
          lineWidth={8}
          end={0}
        />
        <Vector
          ref={projected}
          arrowSize={24}
          to={() => {
            const normalDir = normalVector();
            const dot = dotResult();
            return normalDir.scale(dot * normalSize());
          }}
          stroke={'#fff'}
          lineWidth={8}
          end={0}
          // lineDash={[16, 16]}
        />
      </Rect>
    </>,
  );

  yield* all(
    normal().end(1, 0.3),
    fragment().size.x(24, 0.3),
    fragment().size.y(24, 0.3),
  );

  view.add(origin());
  view.add(circle());
  const lightPosition = lightCircle().absolutePosition();
  const fragmentPosition = fragment().absolutePosition();
  origin().opacity(0).absolutePosition(lightPosition);
  circle().opacity(0).position(fragment().position());
  positionLabel()
    .text(`(${fragmentPosition.x}, ${fragmentPosition.y})`)
    .position.y(60);
  (origin().children()[0] as Txt)
    .text(`(${lightPosition.x}, ${lightPosition.y})`)
    .shadowColor('#141414')
    .shadowBlur(12)
    .shadowOffset.x(3);

  yield* waitUntil('show_light_pos');
  yield* origin().opacity(1, 0.3);

  yield* waitUntil('show_light_dir');
  yield* all(lightDir().end(1, 0.3), circle().opacity(1, 0.3));
  yield* waitUntil('normalize');
  yield* all(
    lightDir().to(() => lightDirVector().scale(normalSize()), 0.5),
    lightDir().endOffset(0, 0.5),
    origin().opacity(0, 0.3),
    circle().opacity(0, 0.3),
    gradient.to(new Vector2(500, 0), 0.5),
  );

  yield* waitUntil('dot_product');
  lightCircle().position(() => {
    light.orbit();
    const position = new Vector3();
    light.quad.getWorldPosition(position);
    return new Vector2(position.x, -position.y);
  });
  dotValue().text(() => dotResult().toFixed(2));
  yield* all(code2().opacity(1, 0.3), light.orbit(-180, 3));

  yield* waitUntil('projection');
  yield* all(projection().end(1, 0.5), projected().end(1, 0.5));

  yield* all(light.orbit(-52.3, 3));

  yield* waitUntil('perpendicular');
  yield* all(light.orbit(-142.2, 3));

  yield* waitUntil('negative');
  yield* all(light.orbit(-180, 3));

  yield* waitUntil('factor');
  codeIn2().margin.left(-codeOut().size.x());
  yield* all(
    codeIn().size.x(null, 0.5),
    codeIn().opacity(1, 0.5),
    codeIn2().opacity(1, 0.5),
    codeOut().opacity(0, 0.5),
  );

  yield* waitUntil('hide_vectors');
  yield* all(normalSize(0, 0.3), code2().opacity(0, 0.3));

  const red = createRef<Layout>();
  const redSlider = createRef<Slider>();
  const green = createRef<Layout>();
  const greenSlider = createRef<Slider>();
  const blue = createRef<Layout>();
  const blueSlider = createRef<Slider>();

  yield view.add(
    <>
      <Layout
        direction="column"
        justifyContent="center"
        x={-480}
        width={480}
        layout
        gap={48}
      >
        <Layout ref={red} direction="column" opacity={0}>
          <Txt {...WhiteLabel} fill={Colors.red} paddingBottom={8}>
            Red
          </Txt>
          <Slider
            ref={redSlider}
            value={() => normalVector().x / 2 + 0.5}
            color={Colors.red}
          />
        </Layout>
        <Layout ref={green} direction="column" opacity={0}>
          <Txt {...WhiteLabel} fill={Colors.green} paddingBottom={8}>
            Green
          </Txt>
          <Slider
            ref={greenSlider}
            value={() => -normalVector().y / 2 + 0.5}
            color={Colors.green}
          />
        </Layout>
        <Layout ref={blue} direction="column" opacity={0}>
          <Txt {...WhiteLabel} fill={Colors.blue} paddingBottom={8}>
            Blue
          </Txt>
          <Slider
            value={light.normalIntensity}
            ref={blueSlider}
            color={Colors.blue}
          />
        </Layout>
      </Layout>
    </>,
  );

  yield* waitUntil('component_x');
  yield* all(componentXSize(1, 0.3), red().opacity(1, 0.3));
  yield* waitUntil('component_y');
  yield* all(componentYSize(1, 0.3), green().opacity(1, 0.3));

  yield* waitUntil('blue');
  yield* all(blue().opacity(1, 0.3));

  yield* waitUntil('hide_normals');
  redSlider().value.save();
  greenSlider().value.save();
  yield* all(normalScale(0, 0.3));

  yield* waitUntil('normals_zero');
  yield* all(light.normalIntensity(0, 2), blueSlider().highlight(1, 0.3));
  yield* waitUntil('normals_one');
  yield* all(light.normalIntensity(1, 2));
  yield* blueSlider().highlight(0, 0.3);

  yield* waitUntil('zoom_out');
  yield* all(
    red().opacity(0, 0.3),
    green().opacity(0, 0.3),
    blue().opacity(0, 0.3),
  );
});
