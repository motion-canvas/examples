import {makeScene2D} from '@motion-canvas/2d';
import {Img, Layout, Txt} from '@motion-canvas/2d/lib/components';
import {
  all,
  delay,
  noop,
  sequence, waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import {applyViewStyles, WhiteLabel} from '../styles';

import icon from '../images/icons/layers.svg';
import * as layers from '../three/layers';

import {Three} from '../components';
import {
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  linear,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {invert} from '@motion-canvas/2d/lib/partials';
import {finishScene} from '@motion-canvas/core/lib/utils';

export default makeScene2D(function* (view) {
  applyViewStyles(view);
  yield layers.setup();
  yield view.add(
    <>
      <Three
        quality={2}
        width={1920}
        height={1080}
        zoom={1080}
        camera={layers.camera}
        scene={layers.threeScene}
      />
      <Layout offsetX={-1} offsetY={-1} x={-940} y={-520} layout>
        <Img
          filters={[invert(1)]}
          opacity={0.54}
          width={40}
          height={40}
          margin={20}
          src={icon}
        />
        <Txt paddingRight={40} {...WhiteLabel} lineHeight={80} cache>
          Parallax Pass
        </Txt>
      </Layout>
    </>,
  );

  yield* sequence(
    0.1,
    ...layers.layers.map(layer =>
      tween(0.3, value => {
        layer.scale.set(
          easeOutCubic(value, 0, 240),
          easeOutCubic(value, 0, 135),
          1,
        );
      }),
    ),
  );

  yield* waitUntil('upscale');
  yield delay(0.3, layers.parallax(1, 16, linear));
  yield* all(
    delay(
      0.0,
      tween(0.6, value => {
        layers.orbit.rotation.set(
          easeInOutCubic(value, 0, -0.1),
          easeInOutCubic(value, 0, -0.3),
          0,
          'YXZ',
        );
      }),
    ),
    ...layers.layers.map((layer, index) =>
      tween(0.6, value => {
        layer.scale.set(
          easeInOutCubic(value, 240, 480),
          easeInOutCubic(value, 135, 270),
          1,
        );
        layer.position.set(
          easeInOutCubic(value, (index - 2) * 260, 0),
          easeInOutCubic(value, 0, 40),
          easeInOutCubic(value, 0, 80 + (index - 2) * 120),
        );
      }),
    ),
  );

  yield* waitUntil('composite');
  yield* all(
    tween(0.6, value => {
      layers.orbit.rotation.set(
        easeInOutCubic(value, -0.1, 0),
        easeInOutCubic(value, -0.3, 0),
        0,
        'YXZ',
      );
    }),
    ...layers.layers.map((layer, index) =>
      tween(0.6, value => {
        layer.scale.set(
          easeInOutCubic(value, 480, 480 * 2),
          easeInOutCubic(value, 270, 270 * 2),
          1,
        );
        layer.position.set(
          0,
          easeInOutCubic(value, 40, 0),
          easeInOutCubic(value, 80 + (index - 2) * 120, 0),
        );
      }),
    ),
  );

  yield* waitUntil('but');
  yield* all(
    tween(0.6, value => {
      layers.orbit.rotation.set(
        easeInOutCubic(value, 0, -0.1),
        easeInOutCubic(value, 0, -0.3),
        0,
        'YXZ',
      );
    }),
    ...layers.layers.map((layer, index) =>
      tween(0.6, value => {
        layer.scale.set(
          easeInOutCubic(value, 480 * 2, 480),
          easeInOutCubic(value, 270 * 2, 270),
          1,
        );
        layer.position.set(
          0,
          easeInOutCubic(value, 0, 0),
          easeInOutCubic(value, 0, 80 + (index - 2) * 120),
        );
      }),
    ),
  );

  yield* waitUntil('single_layer');
  yield* all(
    delay(
      0.6,
      tween(0.6, value => {
        layers.orbit.rotation.set(
          easeInOutCubic(value, -0.1, 0),
          easeInOutCubic(value, -0.3, 0),
          0,
          'YXZ',
        );
      }),
    ),
    sequence(
      0.1,
      ...layers.layers
        .map((layer, index) => {
          if (index === 2) {
            return noop();
          }
          return tween(0.6, value => {
            layer.position.set(
              0,
              easeInCubic(value, 0, -1080),
              80 + (index - 2) * 120,
              // easeInOutCubic(value, 0, (index - 2) * 80),
            );
          });
        })
        .reverse(),
    ),
  );

  yield* waitUntil('next');
  finishScene();
  yield* waitFor(1);
});
