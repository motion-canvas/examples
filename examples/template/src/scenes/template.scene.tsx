import type {Scene} from '@motion-canvas/core/lib/Scene';
import type {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {waitFor} from '@motion-canvas/core/lib/flow';

export default function* timing(scene: Scene): ThreadGenerator {
  yield* scene.transition();
  yield* waitFor(5);
  scene.canFinish();
}
