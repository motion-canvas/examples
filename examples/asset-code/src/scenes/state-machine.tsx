import {
  Curve,
  Layout,
  Line,
  LineProps,
  lines,
  makeScene2D,
  Node,
  Rect,
  RectProps,
  Txt,
  word,
} from '@motion-canvas/2d';
import {
  all,
  Center,
  createRef,
  createRefArray,
  createRefMap,
  createSignal,
  DEFAULT,
  delay,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  finishScene,
  linear,
  loop,
  noop,
  Origin,
  PossibleColor,
  PossibleVector2,
  ReferenceReceiver,
  sequence,
  spawn,
  TimingFunction,
  useTransition,
  Vector2,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import jeff from '../image/jeff.png';
import {
  animate,
  Atlas,
  ATxt,
  createPageRef,
  JSCode,
  Page,
  YamlCode,
} from '../nodes';
import {CodeColors, DataColors, Theme} from '../styles';

const theme = {
  ...Theme,
  window: '#cc812b',
  event: '#d73838',
  music: '#0880b4',
  component: '#64811b',
  buttons: '#0f0d0c',
};

const yaml = `\
idle:
  animation: /animations/idle.anim
  transitions:
    - target: walking
      criteria: [speed, greater, 0.1]
    - target: falling
      criteria: [grounded, equals, 0]
walking:
  animation: /animations/walking.anim
  transitions:
    - target: idle
      criteria: [speed, less, 0.1]
    - target: falling
      criteria: [grounded, equals, 0]
falling:
  animation: /animations/falling.anim
  transitions:
    - target: idle
      criteria: [grounded, equals, 1]
`;

const json = `\
{
  "idle": {
    "animation": "/animations/idle.anim",
    "transitions": [
      {
        "target": "walking",
        "criteria": ["speed", "greater", 0.1]
      },
      {
        "target": "falling",
        "criteria": ["grounded", "equals", 0]
      }
    ]
  },
  "walking": {
    "animation": "/animations/walking.anim",
    "transitions": [
      {
        "target": "idle",
        "criteria": ["speed", "less", 0.1]
      },
      {
        "target": "falling",
        "criteria": ["grounded", "equals", 0]
      }
    ]
  },
  "falling": {
    "animation": "/animations/falling.anim",
    "transitions": [
      {
        "target": "idle",
        "criteria": ["grounded", "equals", 1]
      }
    ]
  }
}
`;

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);

  const file = createPageRef();
  const extension = createSignal('yaml');
  view.add(
    <Page
      refs={file}
      width={900}
      height={1080 - 80}
      label={() => `state_machine.${extension()}`}
      theme={theme}
      code={yaml}
      component={YamlCode}
    />,
  );

  const finish = useTransition(() => {}, undefined, true);
  yield* waitFor(2);
  finish();

  yield* waitUntil('language');
  yield* all(file.code.code(json, 0.6), extension('json', 0.3, linear));
  yield* waitFor(0.6);
  yield* all(file.code.code(yaml, 0.6), extension('yaml', 0.3, linear));

  yield* waitUntil('three_states');
  const stateNames = [
    file.code.findFirstRange('idle'),
    file.code.findAllRanges('walking')[1],
    file.code.findAllRanges('falling')[2],
  ];
  yield* file.code.selection(stateNames, 0.6);

  yield* waitUntil('animation_file');
  yield* file.code.selection(word(1, 2), 0.3);

  yield* waitUntil('transitions');
  yield* file.code.selection(lines(2, 6), 0.3);

  yield* waitUntil('criteria');
  yield* file.code.selection(word(4, 16), 0.3);

  yield* waitUntil('target');
  yield* file.code.selection(word(3, 14), 0.3);

  yield* waitUntil('state_machine');
  file.rect.moveOffset(Vector2.topLeft);

  const states = createRefMap<Rect>();
  const arrows = createRefArray<Line>();
  const machine = createRef<Node>();

  yield view.add(
    <Node ref={machine}>
      <State
        ref={states.walking}
        x={160}
        y={200}
        name="walking"
        atlas={animate(0, 8, 0.1)}
      />
      <State
        ref={states.idle}
        x={400}
        y={-200}
        name="idle"
        atlas={animate(16, 6, 0.1)}
      />
      <State
        ref={states.falling}
        x={640}
        y={200}
        name="falling"
        atlas={animate(25, 1, 0.1)}
      />
      <Arrow
        ref={arrows}
        from={states.idle()}
        to={states.walking()}
        fromDirection={Origin.Left}
        toDirection={Origin.Top}
        startArrow
      />
      <Arrow
        ref={arrows}
        to={states.idle()}
        from={states.falling()}
        toDirection={Origin.Right}
        fromDirection={Origin.Top}
        startArrow
      />
      <Arrow
        ref={arrows}
        from={states.walking()}
        to={states.falling()}
        fromDirection={Origin.Right}
        toDirection={Origin.Left}
      />
    </Node>,
  );

  file.rect.moveToTop();
  arrows.forEach(arrow => arrow.end(0));

  yield all(
    file.code.selection(DEFAULT, 0.6),
    file.rect.position(view.size().scale(-0.5).add(40), 0.6),
    file.rect.width(800, 0.6),
    reveal(states.walking(), 0.6, easeInOutCubic),
    reveal(states.falling(), 0.6, easeInOutCubic),
    reveal(states.idle(), 0.6, easeInOutCubic),
  );

  yield* arrows[0].end(1, 0.6, easeInCubic);
  yield* arrows[2].end(1, 0.2, linear);
  yield* arrows[1].end(1, 0.6, easeOutCubic);

  yield* waitUntil('which_states');
  yield* file.code.selection(stateNames, 0.6);

  yield* waitUntil('which_parameters');
  yield* file.code.selection(
    [
      ...file.code.findAllRanges('speed'),
      ...file.code.findAllRanges('grounded'),
    ],
    0.3,
  );

  yield* waitUntil('just_a_file');
  yield* file.code.selection(DEFAULT, 0.6);

  yield* waitUntil('however');
  const codeFile = createPageRef();
  view.add(
    <Page
      refs={codeFile}
      theme={theme}
      offsetX={-1}
      x={-1900}
      width={900}
      height={1080 - 80}
      code={rust}
      label="state_machine.rs"
    />,
  );
  file.rect.moveOffset(Vector2.zero);
  yield* all(
    file.rect.scale(0.9, 0.6),
    file.rect.fill(theme.bgDark, 0.6),
    codeFile.rect.x(view.width() / -2 + 40, 0.6),
    machine().x(70, 0.6),
  );

  yield* waitUntil('load_data');
  yield* codeFile.code.selection([word(1, 13, 16), word(4, 13, 17)], 0.6);
  yield* waitUntil('parse_data');
  yield* codeFile.code.selection(lines(2, 5), 0.3);

  yield* waitUntil('track_state');
  yield* all(
    codeFile.code.selection(lines(3), 0.3),
    states.idle().stroke(theme.window, 0.3),
    states.idle().lineWidth(16, 0.3),
  );

  yield* waitUntil('each_frame');
  yield* codeFile.code.selection(lines(8, 17), 0.3);

  yield* waitUntil('iterate');
  yield* codeFile.code.selection(lines(11, 16), 0.3);

  yield* waitUntil('test_criteria');
  yield* all(
    codeFile.code.selection(lines(12), 0.3),
    arrows[0].stroke(theme.window, 0.3),
  );

  yield* waitUntil('transition');
  yield* all(
    codeFile.code.selection(lines(13), 0.3),
    arrows[0].stroke(theme.stroke, 0.3),
    states.walking().lineWidth(16, 0.3),
    states.idle().lineWidth(0, 0.3),
  );

  yield* waitUntil('simple');
  yield* codeFile.code.selection(DEFAULT, 0.6);

  yield* waitUntil('back_yaml');
  yield* all(
    file.rect.scale(1, 0.6),
    file.rect.fill(theme.bg, 0.6),
    codeFile.rect.x(-2000, 0.6),
    states.walking().lineWidth(0, 0.3),
    machine().x(0, 0.6),
  );

  yield* waitUntil('not_expressive');
  yield* all(
    file.rect.x(-2000, 0.6),
    ...states.mapRefs(state => state.x(state.x() - 400, 0.6)),
  );

  const horizontal = [260, -100];

  yield* waitUntil('own_parameters');
  machine().add(
    <>
      <GraphNode
        ref={states.setParam}
        name="SET PARAM"
        content="was_walking = 1"
        x={-220}
        y={horizontal[0]}
      />
      <State
        ref={states.stop}
        x={660}
        y={horizontal[1]}
        name="stop"
        atlas={animate(8, 1, 0.1)}
      />
      <Arrow
        ref={arrows}
        from={states.falling()}
        to={states.stop()}
        fromDirection={Origin.Right}
        toDirection={Origin.Bottom}
        end={0}
      />
      <Arrow
        ref={arrows}
        from={states.stop()}
        to={states.idle()}
        fromDirection={Origin.Left}
        toDirection={Origin.Right}
        end={0}
      />
      <Arrow
        ref={arrows}
        from={states.stop()}
        to={states.idle()}
        points={[
          states.stop().top,
          () => states.stop().top().addY(-80),
          () => states.idle().top().addY(-80),
          states.idle().top,
        ]}
        end={0}
      />
      <GraphNode
        ref={states.ifParam}
        name="IF"
        content="was_walking > 0"
        x={660}
        y={horizontal[0]}
      />
      <GraphNode
        ref={states.resetParam}
        name="SET PARAM"
        content="was_walking = 0"
        x={240}
        y={horizontal[1] - states.idle().height() + 80}
      />
    </>,
  );

  yield* all(
    states.walking().position([-660, horizontal[0]], 0.6),
    states.idle().position([-220, horizontal[1]], 0.6),
    states.falling().position([220, horizontal[0]], 0.6),
    delay(0.3, reveal(states.stop())),
  );

  yield* waitUntil('show_param');
  yield* reveal(states.setParam());

  yield* waitUntil('show_params');
  yield* all(arrows[3].end(1, 0.6), delay(0.3, reveal(states.ifParam())));

  yield* all(
    arrows[4].end(1, 0.6),
    arrows[5].end(1, 0.6),
    delay(0.3, reveal(states.resetParam())),
  );

  yield* waitUntil('hide_arrows');

  const columns = [-720, -240, 240, 720];
  const rows = [-280 + 80 + 40, 40 - 20 + 80, 40 + 240 + 80];
  const newArrows = createRefArray<Line>();

  machine().add(
    <>
      <Rect
        ref={states.onUpdate}
        layout
        x={columns[0]}
        y={rows[0] - 230}
        fill={theme.bg}
        stroke={theme.event}
        strokeFirst
        radius={theme.radius}
        direction={'column'}
        height={0}
        width={380}
        padding={[0, 20]}
        clip
      >
        <Layout gap={20} alignItems={'center'} justifyContent={'space-between'}>
          <ATxt>ON</ATxt>
          <Rect radius={30} fill={theme.event} padding={[10, 20]}>
            <ATxt fill={theme.buttons}>update</ATxt>
          </Rect>
        </Layout>
      </Rect>
      <GraphNode
        ref={states.ifGrounded}
        name="IF"
        content="grounded == 0"
        x={columns[0]}
        y={rows[0]}
      />
      <GraphNode
        ref={states.ifSpeed}
        name="IF"
        content="speed > 0.1"
        x={columns[1]}
        y={rows[0]}
      />
      <Arrow
        ref={newArrows}
        from={states.onUpdate()}
        to={states.ifGrounded()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.ifGrounded()}
        to={states.falling()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.ifGrounded()}
        to={states.ifSpeed()}
        fromDirection={Origin.Right}
        toDirection={Origin.Left}
      />
      <Arrow
        ref={newArrows}
        from={states.ifSpeed()}
        to={states.setParam()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.ifSpeed()}
        to={states.ifParam()}
        fromDirection={Origin.Right}
        toDirection={Origin.Left}
      />
      <Arrow
        ref={newArrows}
        from={states.setParam()}
        to={states.walking()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.ifParam()}
        to={states.stop()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.ifParam()}
        to={states.idle()}
        fromDirection={Origin.Right}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.stop()}
        to={states.resetParam()}
        fromDirection={Origin.Bottom}
        toDirection={Origin.Top}
      />
      <Arrow
        ref={newArrows}
        from={states.resetParam()}
        to={states.idle()}
        fromDirection={Origin.Right}
        toDirection={Origin.Bottom}
      />
    </>,
  );

  newArrows.map(a => a.end(0));
  arrows.map(a => a.points(a.parsedPoints()).moveToBottom());

  yield sequence(
    0.1,
    sequence(0.1, ...arrows.map(a => a.start(1, 0.6))),
    states.ifParam().position([columns[2], rows[0]], 0.6),
    states.setParam().position([columns[1], rows[1]], 0.6),
    all(
      states.falling().position([columns[0], rows[1]], 0.6),
      transform(states.falling()),
    ),
    all(
      states.walking().position([columns[1], rows[2]], 0.6),
      transform(states.walking()),
    ),
    all(
      states.stop().position([columns[2], rows[1]], 0.6),
      transform(states.stop()),
    ),
    states.resetParam().position([columns[2], rows[2]], 0.6),
    all(
      states.idle().position([columns[3], rows[1]], 0.6),
      transform(states.idle()),
    ),
    reveal(states.onUpdate()),
    reveal(states.ifGrounded()),
    reveal(states.ifSpeed()),
  );

  yield* waitUntil('show_new_arrows');
  yield* sequence(0.05, ...newArrows.map(a => a.end(1, 0.3)));

  yield* waitUntil('invoke_on');
  animatedDash()(states.onUpdate());
  yield* states.onUpdate().lineWidth(16, 0.3, easeOutCubic);
  yield* waitUntil('invoke_on_hide');
  yield* states.onUpdate().lineWidth(0, 0.3, easeInCubic);
  yield* waitUntil('music');
  states.falling().stroke(theme.music);
  yield* all(
    morph(states.falling(), 'PLAY SOUND', theme.music),
    delay(0.3, states.falling().lineWidth(16, 0.3, easeOutCubic)),
  );

  yield* waitUntil('component');
  view.add(
    <>
      <GraphNode
        color={theme.component}
        x={columns[0]}
        y={rows[2]}
        ref={states.component}
        name="GET COMPONENT"
        content="rigidbody"
      />
      <Arrow
        ref={newArrows}
        endArrow={false}
        lineDash={[8, 8]}
        stroke={theme.component}
        from={states.component()}
        to={states.walking()}
        fromDirection={Origin.Right}
        toDirection={Origin.Left}
        end={0}
      />
    </>,
  );
  states.walking().stroke(theme.component);
  yield* all(
    morph(
      states.walking(),
      'ADD VELOCITY',
      theme.bgDark,
      'rgba(255, 255, 255, 0.6)',
      '[0, 20]',
    ),

    states.falling().lineWidth(0, 0.3, easeInCubic),
    delay(
      0.3,
      all(
        states.walking().lineWidth(16, 0.3, easeOutCubic),
        reveal(states.component(), 0.3),
        newArrows.at(-1).end(1, 0.3, easeOutCubic),
      ),
    ),
  );

  yield* waitUntil('trigger');
  states.stop().stroke(theme.event);
  yield* all(
    morph(states.stop(), 'TRIGGER', theme.event, undefined, 'custom_event'),
    states.walking().lineWidth(0, 0.3, easeInCubic),
    delay(0.3, states.stop().lineWidth(16, 0.3, easeOutCubic)),
  );

  yield* waitUntil('trigger_hide');
  yield* states.stop().lineWidth(0, 0.3, easeInCubic);

  yield* waitUntil('python');
  const interpreted = createPageRef();
  view.add(
    <Page
      refs={interpreted}
      label="script.js"
      badge="INTERPRETED"
      theme={theme}
      stroke={DataColors.main}
      strokeFirst
      opacity={0}
      width={view.width() - 80}
      height={1080 - 80}
      component={JSCode}
      lineHeight={'142%'}
      code={python}
    />,
  );
  interpreted.wrapper.opacity(0);
  interpreted.badge.fill(DataColors.main);
  interpreted.badge.opacity(0);

  newArrows.map(a => a.moveToBottom());

  yield* all(
    interpreted.rect.width(900, 0.6),
    interpreted.rect.opacity(1, 0.3, easeInCubic),
    delay(0.3, interpreted.wrapper.opacity(1, 0.3, easeOutCubic)),
    states.onUpdate().x(columns[1], 0.6),
    states.ifGrounded().x(columns[1], 0.6),
    states.falling().x(columns[1], 0.6),
    states.component().x(columns[1], 0.6),
    states.ifSpeed().x(columns[1] / 2, 0.6),
    states.setParam().x(columns[1] / 2, 0.6),
    states.walking().x(columns[1] / 2, 0.6),
    states.ifParam().x(columns[2] / 2, 0.6),
    states.stop().x(columns[2] / 2, 0.6),
    states.resetParam().x(columns[2] / 2, 0.6),
    states.idle().x(columns[2], 0.6),
  );

  newArrows.forEach(a => a.remove());
  states.mapRefs(s => s.remove());

  yield* waitUntil('interpreted');
  yield* interpreted.badge.opacity(1, 0.3);

  yield* waitUntil('compiled');
  const compiled = createPageRef();
  view.add(
    <Page
      refs={compiled}
      theme={theme}
      scale={0.9}
      width={900}
      height={1080 - 80}
      label="component.rs"
      badge="COMPILED"
      lineHeight={'142%'}
      fill={theme.bgDark}
      code={rust2}
    />,
  );
  compiled.badge.fill(CodeColors.main);
  compiled.rect.moveDown();
  yield* all(
    interpreted.rect.x(-450 - 20, 0.6),
    compiled.rect.x(450 + 20, 0.6),
    compiled.rect.scale(1, 0.6, v => easeInCubic(easeInOutCubic(v))),
    compiled.rect.fill(theme.bg, 0.6, v => easeInCubic(easeInOutCubic(v))),
  );

  yield* waitUntil('like_asset');
  animatedDash(16, 24)(interpreted.rect);
  yield* interpreted.rect.lineWidth(16, 0.3);

  yield* waitUntil('next');
  finishScene();
  yield* all(
    interpreted.rect.x(-1900, 0.6, easeInCubic),
    compiled.rect.x(1900, 0.6, easeInCubic),
    view.fill(null, 0.6),
  );
});

/* language=rs */
const rust = `\
impl StateMachine {
  pub fn new(yaml_file: &Path) -> Self {
    StateMachine {
      current: "idle",
      states: parse(yaml_file),
    }
  }
  
  pub fn update(&mut self, params: &Params) {
    let state = self.states.get(self.current);
    
    for transition in &state.transitions {
      if transition.test(&params) {
        self.current = transition.target;
        break;
      }
    }
  }
}
`;

/* language=js */
const python = `\
function update() {
  if (this.grounded) {
    this.playSound('falling');
    return;
  }

  if (this.speed > 0.1) {
    this.wasWalking = true;
    const rb = this.getComponent(Rigidbody);
    rb.velocity.x += 20;
    return;
  }

  if (this.wasWalking) {
    this.trigger('customEvent');
    this.wasWalking = false;
  }

  this.playAnimation('idle');
}
`;

/* language=rust */
const rust2 = `\
fn update(&mut self) {
  if self.grounded {
    self.play_sound("falling");
    return;
  }
  
  if self.speed > 0.1 {
    self.was_walking = true;
    let rb = self.component::<Rigidbody>();
    rb.velocity.x += 20.0;
    return;
  }
  
  if self.was_walking {
    self.trigger::<CustomEvent>();
    self.was_walking = false;
  }
  
  self.play_animation("idle");
}
`;

function Arrow({
  from,
  to,
  fromDirection,
  toDirection,
  ...props
}: LineProps & {
  from: Layout;
  to: Layout;
  fromDirection?: Origin;
  toDirection?: Origin;
}) {
  const fromVertical = fromDirection & Center.Vertical;
  const toVertical = toDirection & Center.Vertical;
  let center = (): PossibleVector2 =>
    Vector2.lerp(
      from.cardinalPoint(fromDirection)(),
      to.cardinalPoint(toDirection)(),
      0.5,
    );

  if (fromVertical !== toVertical) {
    center = fromVertical
      ? () => [
          from.cardinalPoint(fromDirection)().x,
          to.cardinalPoint(toDirection)().y,
        ]
      : () => [
          to.cardinalPoint(toDirection)().x,
          from.cardinalPoint(fromDirection)().y,
        ];
  }

  return (
    <Line
      lineWidth={8}
      stroke={theme.stroke}
      endArrow
      startOffset={20}
      radius={8}
      endOffset={20}
      points={[
        from.cardinalPoint(fromDirection),
        center,
        to.cardinalPoint(toDirection),
      ]}
      {...props}
    />
  );
}

const DASH = [8, 8, 8, 32, 8, 8, 8];
const DASH_OFFSET = DASH.reduce((a, b) => a + b, 0);

function animatedDash(parts = 5, duration = 8) {
  return (node: Curve) => {
    node.lineDash(() => {
      return [node.arcLength() / parts - DASH_OFFSET, ...DASH];
    });
    spawn(
      loop(() =>
        node
          .lineDashOffset(0)
          .lineDashOffset(node.arcLength(), duration, linear),
      ),
    );
  };
}

function State({
  atlas,
  name,
  ref,
  ...props
}: RectProps & {name: string; atlas: ReferenceReceiver<Atlas>}) {
  return (
    <Rect
      ref={node => {
        const rect = node as Rect;
        animatedDash()(rect);
        ref?.(node);
      }}
      layout
      stroke={theme.window}
      fill={theme.bg}
      radius={theme.radius}
      direction={'column'}
      gap={20}
      height={0}
      padding={[0, 20]}
      strokeFirst
      clip
      {...props}
    >
      <Layout direction={'column'} layout>
        <ATxt height={0} />
        <Rect radius={30}>
          <ATxt text={name} />
        </Rect>
      </Layout>
      <Atlas
        fill={theme.bgDark}
        ref={atlas}
        size={240}
        radius={theme.radius}
        gridX={8}
        gridY={10}
        src={jeff}
      />
    </Rect>
  );
}

function* morph(
  rect: Rect,
  text: string,
  color: PossibleColor,
  textColor: PossibleColor = theme.buttons,
  value?: string,
  duration = 0.6,
) {
  yield* all(
    rect.childAs(0).childAs<Txt>(0).text(text, duration, linear),
    rect.childAs(0).childAs<Rect>(1).fill(color, duration),
    rect.childAs(0).childAs(1).childAs<Txt>(0).fill(textColor, duration),
    value === undefined
      ? noop()
      : rect
          .childAs(0)
          .childAs(1)
          .childAs<Txt>(0)
          .text(value, duration, linear),
    rect.childAs<Atlas>(1).margin.left(-120, duration),
    rect.childAs<Atlas>(1).opacity(0, 0.3),
  );
}
function* transform(rect: Rect) {
  const left = rect.childAs<Layout>(0);
  const name = left.childAs<Txt>(0);
  const pill = left.childAs<Rect>(1);
  const atlas = rect.childAs<Atlas>(1);
  left.position.save();
  left.width.save();
  atlas.position.save();
  atlas.size.save();
  rect.size.save();

  rect.layout(false);
  yield* all(
    pill.fill(theme.bgDark, 0.6),
    pill.padding([10, 20], 0.6),
    rect.size([380, 160], 0.6),
    atlas.size(120, 0.6),
    atlas.fill(null, 0.6),
    atlas.position([110, 0], 0.6),
    left.width(left.width() - 20, 0.6),
    left.position([-60, 0], 0.6),
    left.gap(20, 0.6),
    name.text('ANIMATION', 0.6),
    name.height(40, 0.6),
  );
  left.grow(1).width(null);
  rect.direction('row').gap(0).height(null).layout(true);
}

function GraphNode({
  name,
  content,
  color = theme.window,
  ...props
}: RectProps & {name: string; color?: PossibleColor; content: string}) {
  const parts = content.split(' ');
  return (
    <Rect
      layout
      fill={theme.bg}
      radius={theme.radius}
      direction={'column'}
      height={0}
      width={380}
      padding={[0, 20]}
      gap={20}
      clip
      {...props}
    >
      <ATxt text={name} />
      <Layout gap={20} alignItems={'center'}>
        <Rect radius={30} fill={color} padding={[10, 20]} grow={1}>
          <ATxt fill={theme.buttons} text={parts[0]} />
        </Rect>
        {parts[1] && <ATxt text={parts[1]} />}
        {parts[1] && (
          <Rect radius={30} fill={theme.bgDark} padding={[10, 20]}>
            <ATxt text={parts[2]} />
          </Rect>
        )}
      </Layout>
    </Rect>
  );
}

function* reveal(
  rect: Layout,
  time = 0.3,
  timingFunction: TimingFunction = easeOutCubic,
) {
  const padding = rect.padding();
  rect.padding(20).height(null);
  const height = rect.height();
  rect.padding(padding).height(0);

  yield* all(
    rect.height(height, time, timingFunction),
    rect.padding(20, time, timingFunction),
  );

  rect.height(null);
}
