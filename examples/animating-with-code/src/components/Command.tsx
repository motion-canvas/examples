import {Reference} from '@motion-canvas/core/lib/utils';
import {Rect} from 'konva/lib/shapes/Rect';
import {Origin} from '@motion-canvas/core/lib/types';
import {map} from '@motion-canvas/core/lib/tweening';
import {colors} from '../misc/keyframes';

export const Command = (config: {
  ref?: Reference<Rect>;
  value: number;
  size?: number;
}) => {
  const times = Object.keys(colors);
  const current = times.findIndex(t => parseInt(t) === config.value);
  const previous = current > 0 ? parseInt(times[current - 1]) : 0;
  return (
    <Rect
      ref={config.ref}
      origin={Origin.Left}
      margin={[15, 10]}
      stroke={'white'}
      strokeWidth={0}
      width={
        config.value === 0
          ? map(100, 340, Math.random())
          : (config.value - previous) * (config.size ?? 12) - 20
      }
      height={20}
      fill={
        current > 0 ? colors[previous] : config.value === 0 ? '#444' : 'white'
      }
      cornerRadius={20}
    />
  );
};
