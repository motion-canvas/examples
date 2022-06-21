import {Vector2d} from 'konva/lib/types';
import {Animator, remap} from '@motion-canvas/core/lib/tweening';
export type Keyframes<T> = Record<number, T>;

export const keyframes: Keyframes<Vector2d> = {
  10: {x: -620, y: -300},
  30: {x: -220, y: 60},
  60: {x: 240, y: -300},
  80: {x: 620, y: 60},
};

export const colors: Keyframes<string> = {
  10: '#ff6470',
  30: '#ffc66d',
  60: '#68ABDF',
  80: '#99C47A',
};

export function resolveKeyframe<T>(keyframes: Keyframes<T>, time: number): T {
  const entries = Object.entries(keyframes);
  for (let i = 0; i < entries.length; i++) {
    const keyTime = parseFloat(entries[i][0]);
    const keyValue = entries[i][1];
    if (time < keyTime || i === entries.length - 1) {
      return keyValue;
    }

    const nextTime = parseFloat(entries[i + 1][0]);
    if (time > nextTime) {
      continue;
    }

    const nextValue = entries[i + 1][1];
    const normalizedTime = remap(keyTime, nextTime, 0, 1, time);

    return Animator.inferTweenFunction<T>(nextValue)(
      keyValue,
      nextValue,
      normalizedTime,
    );
  }
}
