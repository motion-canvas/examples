import type {Scene} from '@motion-canvas/core/lib/Scene';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {waitUntil} from '@motion-canvas/core/lib/flow';
import {Code} from '@motion-canvas/core/lib/components/code';
import {Origin} from '@motion-canvas/core/lib/types';
import {useRef} from '@motion-canvas/core/lib/utils';
import {ANIMATE} from '@motion-canvas/core/lib/symbols';
import {all, delay} from '@motion-canvas/core/lib/flow';

export default function* explanation(scene: Scene): ThreadGenerator {
  yield* scene.transition();

  const code = useRef<Code>();

  scene.add(
    <Code
      ref={code}
      language={'tsx'}
      origin={Origin.Left}
      x={-400}
      text={`
import {bootstrap} from '@app/bootstrap';

import first from './scenes/first.scene';
import second from './scenes/second.scene';

bootstrap({
  name: 'showcase',
  scenes: [first, second],
});
        `}
    />,
  );

  yield* waitUntil('init');
  yield* code.value.selectLines(6, 9).animate();
  yield* waitUntil('init_scenes');
  yield* code.value.selectWord(8, 10, 15).animate();

  yield* waitUntil('scene');
  yield* all(
    code.value.x(-880, 0.6),
    code.value.opacity(ANIMATE).key(0, 0.3).back(0.3).run(),
    delay(0.3, () =>
      code.value
        .text(
          `
export default function* first(scene: Scene) {
  yield* scene.transition();
  
  scene.canFinish();
}
    `,
        )
        .clearSelection()
        .apply(),
    ),
  );

  yield* waitUntil('scene_root');
  yield* code.value.selectWord(1, 31, 12).animate();

  yield* waitUntil('before');
  yield* code.value.animateClearSelection();

  yield* waitUntil('object_show');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  
  scene.add(
    <Surface>
      <LinearLayout axis={Axis.Horizontal}>
        <Icon type={IconType.Object}/>
        <Text>Example</Text>
      </LinearLayout>
    </Surface>
  );
  
  scene.canFinish();
}
  `);
  code.value.selectLines(4, 11).apply();
  yield* code.value.animate();
  yield* waitUntil('Surface');
  code.value.selectLines(5, 10).apply();
  yield* waitUntil('Layout');
  code.value.selectLines(6, 9).apply();
  yield* waitUntil('Icon');
  yield* code.value.selectWord(7, 8).animate();
  yield* waitUntil('Text');
  yield* code.value.selectWord(8, 8).animate();

  yield* waitUntil('Automatically');
  yield* code.value.animateClearSelection();

  yield* waitUntil('reusable');
  yield* code.value.selectLines(5, 10).animate();

  yield* waitUntil('reusable_extract');
  code.value.text(`
const Object = (config: {children: string}) => (
  <Surface>
    <LinearLayout axis={Axis.Horizontal}>
      <Icon type={IconType.Object}/>
      <Text>{config.children}</Text>
    </LinearLayout>
  </Surface>
);

export default function* first(scene: Scene) {
  yield* scene.transition();
  scene.add(<Object>Example</Object>);
  scene.canFinish();
}
  `);
  code.value.selectLines(2, 7).apply();

  yield* waitUntil('reusable_fn');
  code.value.selectLines(1, 8).apply();

  yield* waitUntil('reusable_show');
  yield* code.value.selectWord(12, 12, 24).animate();

  yield* waitUntil('anyway');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  scene.add(<ColorPicker/>);
  scene.canFinish();
}
  `);
  code.value.clearSelection().apply();

  yield* waitUntil('picker_add');
  yield* code.value.selectWord(3, 12, 14).animate();

  yield* waitUntil('picker_add_end');
  yield* code.value.animateClearSelection();

  yield* waitUntil('picker_ref');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  scene.canFinish();
}
  `);
  code.value.selectWord(3, 2).apply();
  yield* code.value.animate();

  yield* waitUntil('picker_ref_2');
  yield* code.value.selectWord(4, 25, 12).animate();

  yield* waitUntil('the_way');
  yield* code.value.animateClearSelection();

  yield* waitUntil('yield');
  code.value
    .text(
      `
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield;
  scene.canFinish();
}
  `,
    )
    .selectWord(5, 2)
    .apply();
  yield* code.value.animate();

  yield* waitUntil('picker_red');
  code.value
    .text(
      `
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield;
  picker.value.previewColor('#ff6470');
  scene.canFinish();
}
  `,
    )
    .selectWord(6, 2)
    .apply();
  yield* code.value.animate();

  yield* waitUntil('picker_red_show');
  yield* code.value.selectWord(6, 28, 9).animate();

  yield* waitUntil('yield_2');
  code.value
    .text(
      `
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield;
  picker.value.previewColor('#ff6470');
  yield;
  scene.canFinish();
}
  `,
    )
    .selectWord(7, 2)
    .apply();
  yield* code.value.animate();
  yield* waitUntil('picker_blue');
  code.value
    .text(
      `
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield;
  picker.value.previewColor('#ff6470');
  yield;
  picker.value.previewColor('#68abdf');
  scene.canFinish();
}
  `,
    )
    .selectWord(8, 2)
    .apply();
  yield* code.value.animate();

  yield* waitUntil('so_on');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield;
  picker.value.previewColor('#ff6470');
  yield;
  picker.value.previewColor('#68abdf');
  yield;
  picker.value.previewColor('#99c47a');
  scene.canFinish();
}
  `);
  code.value.clearSelection().apply();

  yield* waitUntil('nest');
  yield* code.value.selectLines(5, 10).animate();

  yield* waitUntil('nest_extract');
  code.value.text(`
export default function* first(scene: Scene) {
  yield* scene.transition();
  const picker = useRef<ColorPicker>();
  scene.add(<ColorPicker ref={picker}/>);
  yield* animate(picker);
  scene.canFinish();
}

function *animate(picker: Reference<ColorPicker>) {
  yield;
  picker.value.previewColor('#ff6470');
  yield;
  picker.value.previewColor('#68abdf');
  yield;
  picker.value.previewColor('#99c47a');
}
  `);
  code.value.selectLines(10, 15).apply();

  yield* waitUntil('nest_call');
  yield* code.value.selectWord(5, 2).animate();

  yield* waitUntil('nest_start');
  code.value.selectWord(5, 2, 6).apply();

  yield* waitUntil('nest_right');
  code.value.selectWord(5, 9, 15).apply();

  yield* waitUntil('nest_star');
  code.value.selectWord(5, 2, 6).apply();

  yield* waitUntil('nest_another');
  yield* code.value.selectLines(9, 16).animate();

  yield* waitUntil('nest_seq');
  yield* code.value.selectWord(10, 2).animate();
  yield* waitUntil('nest_seq_2');
  yield* code.value.selectWord(12, 2).animate();
  yield* waitUntil('nest_seq_3');
  yield* code.value.selectWord(14, 2).animate();

  yield* waitUntil('nest_end');
  yield* code.value.animateClearSelection();

  yield* waitUntil('next');
  scene.canFinish();
}
