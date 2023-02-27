import {makeScene2D} from '@motion-canvas/2d';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Txt} from '@motion-canvas/2d/lib/components';
import {createRef} from '@motion-canvas/core/lib/utils';
import {linear} from '@motion-canvas/core/lib/tweening';
import {Direction} from '@motion-canvas/core/lib/types';
import {slideTransition} from '@motion-canvas/core/lib/transitions';

export default makeScene2D(function* (view) {
  const label = createRef<Txt>();
  yield view.add(
    <>
      <Txt
        ref={label}
        fontSize={120}
        lineHeight={120}
        fontFamily={'JetBrains Mono'}
        fill={'rgba(255, 255, 255, 0.6)'}
      />
    </>,
  );

  yield* slideTransition(Direction.Bottom, 1);
  yield label().text('USER INTERFACE', 1, linear);
  yield* waitUntil('next');
});
