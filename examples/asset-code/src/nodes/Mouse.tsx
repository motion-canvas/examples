import {Line, LineProps} from '@motion-canvas/2d';
import {
  createSignal,
  makeRef,
  makeRefs,
  SimpleSignal,
  Vector2,
} from '@motion-canvas/core';

export function createMouseRef() {
  return makeRefs<typeof Mouse>();
}

export function Mouse({
  refs,
  ...props
}: LineProps & {
  refs: {
    line: Line;
    size: SimpleSignal<number>;
  };
}) {
  refs.size = createSignal(80);

  return (
    <Line
      closed
      layout={false}
      lineWidth={8}
      stroke={'white'}
      lineJoin={'round'}
      points={() => [
        0,
        [0, refs.size()],
        Vector2.fromDegrees(45 + 22.5).scale((refs.size() / 4) * 3),
        Vector2.fromDegrees(45).scale(refs.size()),
      ]}
      {...props}
      ref={makeRef(refs, 'line')}
    />
  );
}
