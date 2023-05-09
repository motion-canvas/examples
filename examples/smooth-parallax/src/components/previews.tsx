import {createRef} from '@motion-canvas/core/lib/utils';
import {Img, Rect} from '@motion-canvas/2d/lib/components';
import upscale from '../images/upscaling/background.png';
import {all, loop} from '@motion-canvas/core/lib/flow';
import {easeInOutQuart, linear} from '@motion-canvas/core/lib/tweening';
import React from 'react';
import {Upscale} from './Upscale';
import {Parallax} from './Parallax';
import {createSignal} from '@motion-canvas/core/lib/signals';

export function* createUpscale(scale: number) {
  const bar = createRef<Rect>();
  const upscaleImg = createRef<Img>();
  const upscaling: Node = yield (
    <Rect fill={'black'} width={160} height={90}>
      <Img
        ref={upscaleImg}
        src={upscale}
        width={16 * scale}
        x={8 * scale}
        y={4.5 * scale}
      />
      <Rect
        ref={bar}
        antialiased={false}
        width={8 * scale}
        height={2 * scale}
        y={4 * scale}
        x={8 * scale}
        rotation={20}
        fill={() => upscaleImg().getPixelColor([4, 8])}
      />
    </Rect>
  );

  yield loop(Infinity, function* () {
    bar().save();
    yield* all(
      bar().rotation(-12, 1.4, easeInOutQuart),
      bar().position.y(2 * scale, 1.4, easeInOutQuart),
      bar().size.x(12 * scale, 1.4, easeInOutQuart),
    );
    yield* all(
      bar().size.y(scale, 1.4, easeInOutQuart),
      bar().position.y(4.5 * scale, 1.4, easeInOutQuart),
      bar().rotation(0, 1.4, easeInOutQuart),
    );
    yield* bar().restore(1.4, easeInOutQuart);
  });

  return (
    <Upscale
      factor={scale}
      width={16 * scale}
      height={9 * scale}
      smoothing={false}
      radius={8}
      clip
      src={upscaling}
    />
  );
}

export const BGColor = '#a2cee7';
export function* createParallax(scale: number) {
  const parallax = createSignal(0);
  const speed = -60;
  const duration = 60;

  yield parallax(speed * duration, duration, linear);

  return (
    <Rect radius={8} clip>
      <Rect size={[16 * scale, 9 * scale]} fill={BGColor} cache>
        <Parallax x={() => parallax()} camera={parallax} upscale={scale} />
      </Rect>
    </Rect>
  );
}
