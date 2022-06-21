import type {Scene} from '@motion-canvas/core/lib/Scene';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Code} from '@motion-canvas/core/lib/components/code';
import {Origin} from '@motion-canvas/core/lib/types';
import {Align} from '@motion-canvas/core/lib/components/Align';
import {useRef} from '@motion-canvas/core/lib/utils';

export default function* explanation2(scene: Scene): ThreadGenerator {
  yield* scene.transition();

  const code = useRef<Code>();

  scene.add(
    <Align origin={Origin.Left}>
      <Code
        language="tsx"
        ref={code}
        origin={Origin.Left}
        x={80}
        text={`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  
  yield* waitFor(3);
  
  scene.canFinish();
}
        `}
      />
    </Align>,
  );

  yield* waitUntil('wait_for');
  yield* code.value.selectWord(6, 2).animate();

  yield* waitUntil('show');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  
  yield* showCircle(picker.value);
  
  scene.canFinish();
}
  `);
  yield* code.value.animate();

  yield* waitUntil('tween');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  
  yield* tween(0.6, value => {
    picker.value.preview.height(
      easeInOutCubic(value, 200, 540)
    )
  });
  
  scene.canFinish();
}
  `);
  yield* code.value.selectLines(6, 10).animate();

  yield* waitUntil('tween_duration');
  yield* code.value.selectWord(6, 15, 3).animate();
  yield* waitUntil('tween_update');
  yield* code.value.selectRange(6, 20, 10, 3).animate();
  yield* waitUntil('tween_argument');
  yield* code.value.selectWord(6, 20, 5).animate();

  yield* waitUntil('tween_picker');
  yield* code.value.selectLines(7, 9).animate();

  yield* waitUntil('tween_end');
  yield* code.value.animateClearSelection();

  yield* waitUntil('tween_prop');
  yield* code.value.selectLines(6, 10).animate();

  yield* waitUntil('prop');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  
  yield* picker.value.preview.height(540, 0.6);
  
  scene.canFinish();
}
  `);
  code.value.selectWord(6, 2).apply();
  yield* code.value.animate();

  yield* waitUntil('prop_duration');
  code.value.selectWord(6, 42, 3).apply();
  yield* waitUntil('prop_setter');
  code.value.selectWord(6, 29, 17).apply();

  yield* waitUntil('prop_end');
  yield* code.value.animateClearSelection();

  yield* waitUntil('pinned');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(
    <ColorPicker ref={picker}/>,
    <PinnedLabel target={picker}>
      Picker label
    </PinnedLabel>,
  );
  
  yield* picker.value.preview.height(540, 0.6);
  
  scene.canFinish();
}
  `);
  code.value.selectLines(6, 8).apply();
  yield* code.value.animate();
  yield* waitUntil('pinned_target');
  code.value.selectWord(6, 17, 15).apply();

  yield* waitUntil('pinned_end');
  yield* code.value.animateClearSelection();

  yield* waitUntil('wait_until');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(
    <ColorPicker ref={picker}/>,
    <PinnedLabel target={picker}>
      Picker label
    </PinnedLabel>,
  );
  
  yield* waitUntil('event');
  yield* picker.value.preview.height(540, 0.6);
  
  scene.canFinish();
}
  `);
  code.value.selectWord(11, 2).apply();
  yield* code.value.animate();

  yield* waitUntil('next');
  scene.canFinish();
}
