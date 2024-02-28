import {Line, Rect, RectProps} from '@motion-canvas/2d';
import {createRefArray} from '@motion-canvas/core';

export function Paper({
  children,
  flip,
  ...props
}: RectProps & {flip?: boolean}) {
  const lines = createRefArray<Line>();
  const paper = (
    <Rect radius={8} {...props} cache>
      <Line
        compositeOperation={'destination-out'}
        layout={false}
        ref={lines}
        points={[
          [0, 40],
          [flip ? -40 : 40, 40],
          [flip ? -40 : 40, 0],
        ]}
        lineWidth={8}
        stroke={'white'}
        radius={8}
      />
      <Line
        compositeOperation={'destination-out'}
        layout={false}
        ref={lines}
        points={[[0, 40], 0, [flip ? -40 : 40, 0]]}
        fill={'white'}
        closed
      />
      {children}
    </Rect>
  ) as Rect;

  lines.forEach(l =>
    l.position(flip ? paper.size().mul([0.5, -0.5]) : paper.size().scale(-0.5)),
  );

  return paper;
}
