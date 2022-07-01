import {waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {slideTransition} from '@motion-canvas/core/lib/transitions';
import {Align} from '@motion-canvas/core/lib/components/Align';
import {LinearLayout, Surface} from '@motion-canvas/core/lib/components';

import {Rect} from 'konva/lib/shapes/Rect';
import {Group} from 'konva/lib/Group';
import {Node} from 'konva/lib/Node';
import {LayeredLayout} from '@motion-canvas/core/lib/components/LayeredLayout';
import {Grid} from '@motion-canvas/core/lib/components/Grid';
import {makeRef, useRef} from '@motion-canvas/core/lib/utils';
import {all, loop} from '@motion-canvas/core/lib/flow';
import {
  easeInCubic,
  easeInOutCubic,
  tween,
} from '@motion-canvas/core/lib/tweening';
import {Code} from '@motion-canvas/core/lib/components/code';
import {Origin} from '@motion-canvas/core/lib/types';
import {LayoutText} from '@motion-canvas/core/lib/components/LayoutText';
import {Icon} from '@motion-canvas/core/lib/components/Icon';

import members from '../misc/members.json';
import {makeKonvaScene} from '@motion-canvas/core/lib/scenes';

const colors = {
  10: '#FF424D',
  60: '#3baad9',
  80: '#0c0c0c',
};

function Tile(config: {
  offset: number;
  code: string;
  children: Node | Node[];
  ref: {group: Group; show: (value: number) => void};
}) {
  const surface = useRef<Surface>();
  const group = useRef<Group>();

  config.ref.show = value => {
    surface.value.setMask({
      width: easeInOutCubic(value, 560, 1760),
      height: 920,
      radius: 8,
      color: '#242424',
    });
    surface.value.x(easeInOutCubic(value, config.offset, 0));
    group.value.x(easeInOutCubic(value, 0, 380));
  };

  return (
    <Group ref={makeRef(config.ref, 'group')}>
      <Surface
        x={config.offset}
        rescaleChild={false}
        ref={surface}
        background={'#242424'}
        shadow
      >
        <LayeredLayout>
          <Rect width={1760} height={920} />
          <Group ref={group}>
            {config.children}
            <Code
              fontSize={36}
              origin={Origin.Left}
              x={-1030}
              text={config.code}
            />
          </Group>
        </LayeredLayout>
      </Surface>
    </Group>
  );
}

export default makeKonvaScene(function* programming(scene) {
  const loops = useRef<typeof Tile>();
  const functions = useRef<typeof Tile>();
  const external = useRef<typeof Tile>();
  const names: Record<number, LayoutText> = {};

  const ripples: Record<string, Surface> = {};
  const pixel = useRef<Rect>();

  scene.add(
    <Align>
      <Tile
        offset={-600}
        code={`
for (let i = 0; i < 64; i++) {
  const x = i % 8;
  const y = Math.floor(i / 8);
  pixel.position(x * 48, y * 48);
  waitFor(0.2);
}
      `}
        ref={loops}
      >
        <Surface background={'#fff'}>
          <LayeredLayout>
            <Grid
              width={384}
              height={384}
              fill={'rgba(0, 0, 0, 0.16)'}
              gridSize={48}
              checker
            />
            <Rect ref={pixel} width={48} height={48} fill={colors[80]} />
          </LayeredLayout>
        </Surface>
      </Tile>
      <Tile
        offset={0}
        code={`
function ripple(node) {
  // do ripple
}

ripple(icon);
ripple(square);
ripple(object);
      `}
        ref={functions}
      >
        <Surface ref={makeRef(ripples, 'a')} background={colors[60]} y={200}>
          <LayoutText
            text={'OBJECT'}
            padd={[30, 80]}
            fill={'white'}
            fontVariant={'700'}
          />
        </Surface>
        <Surface
          ref={makeRef(ripples, 'b')}
          background={colors[60]}
          x={50}
          y={-10}
        >
          <Rect width={100} height={100} />
        </Surface>
        <Surface
          ref={makeRef(ripples, 'c')}
          background={colors[60]}
          radius={50}
          x={-50}
          y={-200}
        >
          <LayeredLayout>
            <Rect width={100} height={100} />
            <Group>
              <Icon
                fill={'white'}
                y={5}
                x={2}
                width={24}
                height={24}
                scaleX={3}
                scaleY={3}
              />
            </Group>
          </LayeredLayout>
        </Surface>
      </Tile>
      <Tile
        offset={600}
        code={`
import names from './data.csv';

for (const name of names) {
  list.addLine(name);
}
      `}
        ref={external}
      >
        <LinearLayout>
          <Surface background={colors[10]} margin={[0, 0, 20]}>
            <LayoutText
              text={'TOP SUPPORTERS'}
              fill={'white'}
              fontVariant={'700'}
              padd={[30, 80]}
            />
          </Surface>
          {members.slice(0, 5).map((member, index) => (
            <LayoutText
              ref={makeRef(names, index)}
              origin={Origin.Left}
              text={member}
              padd={[20, 20]}
              fill={'white'}
            />
          ))}
        </LinearLayout>
      </Tile>
    </Align>,
  );
  loops.show(0);
  functions.show(0);
  external.show(0);

  yield loop(Infinity, function* () {
    yield* ripples.c.ripple();
    yield* ripples.b.ripple();
    yield* ripples.a.ripple();
  });
  yield loop(Infinity, function* () {
    for (let i = 0; i < 64; i++) {
      const x = i % 8;
      const y = Math.floor(i / 8);
      pixel.value.x(x * 48 - 168);
      pixel.value.y(y * 48 - 168);
      yield* waitFor(0.2);
    }
  });
  yield loop(Infinity, function* (index) {
    for (let i = 0; i < 5; i++) {
      yield* names[i].text(members[(index * 5 + i) % members.length], 0.4);
    }
    yield* waitFor(0.4);
  });

  yield* scene.transition(slideTransition());

  yield* waitUntil('loops');
  functions.group.moveToTop();
  loops.group.moveToTop();
  yield* all(
    tween(0.6, value => {
      loops.show(value);
      const scale = easeInCubic(value, 1, 0.8);
      functions.group.scaleX(scale).scaleY(scale);
      external.group.scaleX(scale).scaleY(scale);
    }),
  );

  yield* waitUntil('functions');
  functions.show(1);
  yield* all(
    loops.group.y(loops.group.y() + 1080, 0.4, easeInCubic),
    functions.group.scale({x: 1, y: 1}, 0.6),
  );

  yield* waitUntil('external');
  external.show(1);
  yield* all(
    functions.group.y(loops.group.y() + 1080, 0.4, easeInCubic),
    external.group.scale({x: 1, y: 1}, 0.6),
  );

  yield* waitUntil('end');
  yield* external.group.y(loops.group.y() + 1080, 0.4, easeInCubic);

  yield* waitUntil('next');
  scene.canFinish();
});
