import {makeScene2D} from '@motion-canvas/2d';
import {
  Circle,
  Grid,
  Img,
  Line,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {all, waitUntil} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Color, Direction, Vector2} from '@motion-canvas/core/lib/types';
import {createRef, useDuration} from '@motion-canvas/core/lib/utils';
import {Gradient} from '@motion-canvas/2d/lib/partials';
import {WhiteLabel} from '../styles';
import {Upscale} from '../components';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {
  easeInOutCubic,
  easeOutCubic,
  map,
} from '@motion-canvas/core/lib/tweening';
import spriteImg from '../images/upscaling/sprite.png';

export default makeScene2D(function* (view) {
  view.fill('#141414');
  const light = createRef<Circle>();
  const lightAngle = createSignal(60);
  const lightBrightness = createSignal(0);
  const native = createRef<Node>();
  const scene = createRef<Rect>();
  const screen = createRef<Rect>();

  const lightPos = Vector2.createSignal([8, -6]);
  const shadowTangent = createSignal(() =>
    Vector2.fromRadians(
      lightPos().radians + Math.acos(2 / lightPos().magnitude),
    ).scale(2),
  );
  const inversedShadowTangent = createSignal(() =>
    Vector2.fromRadians(
      lightPos().radians - Math.acos(2 / lightPos().magnitude),
    ).scale(2),
  );
  const grid = createRef<Grid>();
  const sprite = createRef<Img>();

  view.add(
    <>
      <Rect ref={scene} x={-480} width={640} radius={8} height={360} clip>
        <Node ref={native} scale={40} x={-8 * 40} y={-4.5 * 40}>
          <Rect fill={'#242424'} width={16} height={11} x={8} y={5}>
            <Circle
              ref={light}
              position={lightPos}
              size={36}
              startAngle={() => -lightAngle()}
              endAngle={lightAngle}
              rotation={() => lightPos().flipped.degrees}
              closed
              fill={
                new Gradient({
                  type: 'radial',
                  from: 0,
                  to: 0,
                  toRadius: () => map(0, 16, lightBrightness()),
                  stops: [
                    {offset: 0, color: '#F16264'},
                    {offset: 1, color: new Color('#F16264').alpha(0)},
                  ],
                })
              }
            />
            <Circle fill={'#242424'} size={4} antialiased={false}>
              <Line
                antialiased={false}
                points={() => [
                  shadowTangent(),
                  inversedShadowTangent(),
                  lightPos()
                    .sub(inversedShadowTangent())
                    .scale(-10)
                    .add(inversedShadowTangent()),
                  lightPos()
                    .sub(shadowTangent())
                    .scale(-10)
                    .add(shadowTangent()),
                ]}
                fill={'#242424'}
              />
            </Circle>
            <Img
              antialiased={false}
              ref={sprite}
              scale={0}
              src={spriteImg}
              width={6}
              smoothing={false}
            />
          </Rect>
        </Node>
        <Grid
          ref={grid}
          opacity={0}
          y={20}
          width={640}
          height={400}
          spacing={40}
          lineWidth={2}
          stroke={'#fff3'}
        />
      </Rect>
      <Rect ref={screen} x={480} width={640} radius={8} clip height={360}>
        <Upscale
          smoothing={false}
          src={native()}
          width={16}
          height={9}
          scale={40}
        />
      </Rect>
      <Circle
        size={320 * 1.5}
        endAngle={125}
        startAngle={55}
        lineCap={'round'}
        y={screen().topLeft().y - 160}
        lineWidth={8}
        stroke={'#666'}
      />
      <Circle
        size={320 * 1.5}
        endAngle={305}
        startAngle={235}
        lineCap={'round'}
        y={screen().bottomLeft().y + 160}
        lineWidth={8}
        stroke={'#666'}
      />
      <Txt {...WhiteLabel} lineHeight={60} bottomLeft={scene().topLeft}>
        SCENE
      </Txt>
      <Txt {...WhiteLabel} lineHeight={60}>
        UPSCALE
      </Txt>
      <Txt {...WhiteLabel} lineHeight={60} bottomLeft={screen().topLeft}>
        SCREEN
      </Txt>
    </>,
  );

  yield* slideTransition(Direction.Bottom);

  yield* waitUntil('light_show');
  yield* lightBrightness(1.5, 0.6);

  const duration = useDuration('light_anim');
  yield* all(
    lightPos([7, 2], duration, easeInOutCubic),
    lightAngle(30, duration),
    lightBrightness(1, duration),
  );
  yield* lightBrightness(0, 0.3);
  yield* sprite().scale(1, 0.3, easeOutCubic);

  yield* waitUntil('grid_show');
  yield* grid().opacity(1, 0.3);

  yield* waitUntil('sprite_move');
  const angle = createSignal(0);
  const distance = createSignal(0);
  sprite().position(() => Vector2.fromDegrees(angle()).scale(distance()));
  yield angle(360, 4);
  yield* distance(2, 2).to(0, 2);

  yield* waitUntil('sprite_scale');
  yield* all(sprite().scale.x(1.5, 0.3), sprite().position(0.01, 0.1));
  yield* waitUntil('sprite_rotate');
  yield* sprite().rotation(45, 0.3);

  yield* waitUntil('next');
});
