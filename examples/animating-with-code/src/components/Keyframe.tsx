import {Rect} from 'konva/lib/shapes/Rect';
import {makeRef} from '@motion-canvas/core/lib/utils';
import {colors} from '../misc/keyframes';

export const Keyframe = (config: {
  size?: number;
  value: number;
  ref: Record<number, Rect>;
  visible?: boolean;
}) => (
  <Rect
    ref={makeRef(config.ref, config.value)}
    fill={colors[config.value]}
    stroke={'white'}
    strokeWidth={0}
    x={(config.size ?? 12) * config.value}
    scaleX={config.visible ? 1 : 0}
    scaleY={config.visible ? 1 : 0}
    width={32}
    height={32}
    cornerRadius={8}
    rotation={45}
  />
);
