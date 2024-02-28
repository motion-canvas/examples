import {
  CODE,
  Code,
  Curve,
  insert,
  Layout,
  LayoutProps,
  Line,
  lines,
  makeScene2D,
  Ray,
  Rect,
  RectProps,
  remove,
  replace,
  Txt,
  word,
} from '@motion-canvas/2d';
import {
  all,
  Color,
  createRef,
  createRefMap,
  DEFAULT,
  delay,
  easeInOutCubic,
  finishScene,
  makeRef,
  makeRefs,
  noop,
  sequence,
  Vector2,
  waitFor,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import jeff from '../image/jeff.png';
import {animate, Atlas, ATxt, CSCode} from '../nodes';
import {Theme} from '../styles';

const theme = {
  ...Theme,
  window: '#1195cb',
  game: '#023348',
  event: '#cc2b2b',
  music: '#0880b4',
  component: '#45811b',
  buttons: '#0f0e0c',
  selection: '#0d7eae',
};

interface PartialGraphNode {
  key?: string;
  label: string;
  children?: Record<string, PartialGraphNode>;
  animation?: [number, number];
}

interface GraphNode {
  key: string;
  label: string;
  children?: GraphNode[];
  animation?: [number, number];
  parent?: GraphNode;
}

const ROOT: PartialGraphNode = {
  key: 'root',
  label: 'isGrounded',
  children: {
    air: {
      label: 'isDoubleJump',
      children: {
        jumpSwitch: {
          label: 'isMoving',
          children: {
            jump: {
              label: 'jump',
              animation: [3, 2],
            },
            runJump: {
              label: 'run jump',
              animation: [9, 2],
            },
          },
        },
        doubleJump: {
          label: 'double jump',
          animation: [6, 5],
        },
      },
    },
    ground: {
      label: 'isMoving',
      children: {
        idleSwitch: {
          label: 'idleTransition',
          children: {
            idle: {
              label: 'idle',
              animation: [2, 6],
            },
            runToIdle: {
              label: 'run to idle',
              animation: [1, 2],
            },
            jumpToIdle: {
              label: 'jump to idle',
              animation: [4, 2],
            },
          },
        },
        run: {
          label: 'run',
          animation: [0, 8],
        },
      },
    },
  },
};

const NODES: GraphNode[] = [];
const queue: any[] = [ROOT];
while (queue.length > 0) {
  const node = queue.shift();
  NODES.push(node);
  if (node.children) {
    let children = [];
    for (const [key, value] of Object.entries(node.children)) {
      const child = value as GraphNode;
      children.push(child);
      child.key = key;
      child.parent = node;
      queue.push(child);
    }
    node.children = children;
  }
}

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);

  const refs = createRefMap<Rect>();
  const atlases = createRefMap<Atlas>();
  const arrows = createRefMap<Curve>();
  const values = createRefMap<Rect>();
  let queue: GraphNode[] = [NODES[0]];
  let row = 0;
  while (queue.length > 0) {
    const nodes = queue;
    queue = [];
    let column = 0;
    for (const node of nodes) {
      if (node.children) {
        queue.push(...node.children);
      }

      let offset = 120;
      let ratio = (column - (nodes.length - 1) / 2) / 5;
      if (row === 1) {
        offset = 60;
        ratio = column === 0 ? -0.2 : 0.2;
      }
      if (row === 2) {
        offset = 40;
      }
      if (row === 3) {
        offset = 60;
      }

      view.add(
        <Rect
          ref={refs[node.key]}
          x={ratio * view.width()}
          y={row * (120 + 140) - view.height() / 2 + offset + 40}
          fill={theme.bg}
          radius={node.animation ? theme.radius : 40}
          layout
          scale={0.9}
          opacity={0}
          strokeFirst
          stroke={theme.window}
          direction={'column'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          {node.animation ? (
            <Atlas
              ref={atlases[node.key]}
              src={jeff}
              gridX={8}
              gridY={10}
              size={120}
              margin={20}
              index={node.animation[0] * 8}
            />
          ) : (
            <ATxt
              text={node.label}
              width={260}
              textAlign={'center'}
              margin={20}
            />
          )}
        </Rect>,
      );

      if (node.parent) {
        const parent = refs[node.parent.key]();
        const child = refs[node.key]();
        const index = node.parent.children!.indexOf(node);
        let offset = 60;
        if (row === 3) {
          offset = 100;
        }
        view.add(
          <>
            <Line
              ref={arrows[node.key]}
              lineWidth={8}
              stroke={theme.stroke}
              radius={8}
              startOffset={10}
              endOffset={10}
              endArrow
              end={0}
              points={[
                parent.bottom,
                () => parent.bottom().addY(offset),
                () => [child.top().x, parent.bottom().y + offset],
                child.top,
              ]}
            />
            <Rect
              ref={values[node.key]}
              position={() => [child.top().x, parent.bottom().y + offset - 50]}
              layout
              scale={0}
              fill={theme.stroke}
              zIndex={1}
              size={50}
              radius={30}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <ATxt fontSize={32} fill={theme.buttons}>
                {index.toString()}
              </ATxt>
            </Rect>
          </>,
        );
      }

      column++;
    }
    row++;
  }

  view.add(
    <Ray
      ref={arrows.entry}
      lineWidth={8}
      stroke={theme.window}
      endArrow
      end={0}
      endOffset={20}
      from={() => refs.root().top().addY(-80)}
      to={refs.root().top}
    />,
  );

  yield* waitTransition(0.7);

  yield* waitUntil('show');
  yield* sequence(
    0.1,
    ...NODES.map(({key}) =>
      all(
        refs[key]().opacity(1, 0.6),
        refs[key]().scale(1, 0.6),
        values[key]()?.scale(1, 0.6) ?? noop(),
        arrows[key]()?.end(1, 0.6) ?? noop(),
      ),
    ),
  );

  function* fill(key: string) {
    const arrow = arrows[key]();
    const value = values[key]();
    const node = refs[key]();
    const clone = arrow.clone({
      end: 0,
      stroke: theme.window,
    });
    arrow.parent().add(clone);
    yield* all(
      clone.end(1, 0.6),
      delay(
        0.3,
        value.fill(theme.window, 0.3, easeInOutCubic, Color.createLerp('rgb')),
      ),
      delay(0.3, node.lineWidth(16, 0.3)),
    );
    arrow.stroke(theme.window);
    arrow.moveToTop();
    clone.remove().dispose();
  }

  yield* waitUntil('from_top');
  yield* all(arrows.entry().end(1, 0.3), refs.root().lineWidth(16, 0.3));

  yield* waitUntil('is_moving');
  yield* fill('ground');

  yield* waitUntil('rest');
  yield* fill('idleSwitch');
  yield fill('idle');
  yield* waitFor(0.5);
  animate(2 * 8, 6)(atlases.idle());

  yield* waitUntil('close');
  arrows.mapRefs(a => {
    if (a instanceof Line) {
      a.points(a.parsedPoints());
    }
  });
  values.mapRefs(v => v?.position.save());
  const node = refs.root().clone();
  refs.root().opacity(0);
  view.add(node);

  const panels = makeRefs<typeof SO>();
  view.add(
    <SO
      refs={panels}
      name="Root"
      parameter="isGrounded"
      branches={['airSwitchNode', 'groundSwitchNode']}
    />,
  );
  panels.paramBox.fill(null);
  panels.paramLabel.opacity(0);
  const txt = node.childAs<Txt>(0);
  const position = panels.root
    .worldToLocal()
    .transformPoint(panels.param.absolutePosition());
  node.size.save();
  node.layout(false).clip(true).zIndex(2);
  txt.remove();
  const root = panels.root;
  root.position(new Vector2(position).flipped);
  node.add(root);

  yield sequence(
    0.1,
    arrows.entry()?.start(1, 0.6),
    ...NODES.map(({key}) =>
      all(
        refs[key]()?.opacity(0, 0.6) ?? noop(),
        refs[key]()?.scale(0.9, 0.6) ?? noop(),
        values[key]()?.scale(0, 0.6) ?? noop(),
        arrows[key]()?.start(1, 0.6) ?? noop(),
      ),
    ),
  );
  yield* waitUntil('zoom_so');

  const lerp = Vector2.createArcLerp(true, 1);
  yield* all(
    node.position(0, 0.6, easeInOutCubic, lerp),
    node.size(panels.root.size(), 0.6, easeInOutCubic, lerp),
    node.radius(theme.radius, 0.6),
    panels.paramBox.fill(theme.bgDark, 0.6),
    panels.paramLabel.opacity(1, 0.6),
    root.position(0, 0.6, easeInOutCubic, lerp),
    delay(0.3, node.lineWidth(0, 0.3)),
  );

  root.reparent(view);
  node.remove();

  yield* waitUntil('branches');
  yield* highlight(panels.branches);
  yield* waitUntil('param');
  yield* all(highlight(panels.paramBox), unhighlight(panels.branches));
  yield* waitUntil('code');

  const code = createRef<Code>();
  view.add(
    <CSCode
      ref={code}
      offset={-1}
      position={view.size().scale(-0.5).add(80)}
    />,
  );
  const topEdge = code().y();
  code().y(-root.height() / 2);

  const className = code().createSignal('SwitchNode');
  const fields = code().createSignal(`\
  public string name;
  public ReanimatorNode[] branches;
`);
  const body = code().createSignal(`\
    int index = state.Get(name);
    int cyclic = index % branches.Length;

    return branches[cyclic].Resolve(state);
`);
  code().code(CODE`\
public class ${className} : ReanimatorNode {
${fields}  
  public override AnimationFrame Resolve(Params state) {
${body}  }
}
`);

  const x = code().x();
  yield* all(
    unhighlight(panels.paramBox),
    root.x(480, 0.6),
    code().x(-view.width()).x(x, 0.6),
  );

  yield* waitUntil('resolve_method');
  yield* code().selection(lines(4, 9), 0.6);
  yield* waitUntil('retrieve_value');
  yield* code().selection(lines(5), 0.3);
  yield* waitUntil('index_branches');
  yield* code().selection(word(8, 11, 16), 0.3);
  yield* waitUntil('recursive_call');
  yield* code().selection(word(8, 28, 14), 0.3);

  yield* waitUntil('logic_in_data');
  yield* code().selection(lines(1, 2), 0.3);
  yield* waitUntil('resolve_method_again');
  yield* code().selection(lines(4, 9), 0.3);
  yield* waitUntil('same_logic');
  yield fields.edit()`\
  public ${replace('string name', 'ReanimatorNode airSwitch')};
  public ReanimatorNode${replace('[] branches', ' groundSwitch')};
`;
  yield* body.edit()`\
    ${replace(
      'int index = ',
      'return ',
    )}state.Get(${replace('name', '"isGrounded"')})${replace(
    `;
    int cyclic = index % branches.Length;

    return branches[cyclic]`,
    `) == 0
      ? airSwitch`,
  )}.Resolve(state);${insert(`
      : groundSwitch.Resolve(state);`)}
`;

  yield* waitUntil('is_grounded_equals');
  yield* code().selection(lines(5), 0.3);
  yield* waitUntil('air_node');
  yield* code().selection(lines(6), 0.3);
  yield* waitUntil('ground_node');
  yield* code().selection(lines(7), 0.3);
  yield* waitUntil('class_name');
  yield* code().selection(word(0, 13, 10), 0.3);
  yield* waitUntil('resolve_method_again_2');
  yield* code().selection(lines(4, 8), 0.3);

  yield* waitUntil('ground_so');
  const grounded = makeRefs<typeof SO>();
  view.add(
    <SO
      refs={grounded}
      name="Grounded"
      parameter="isMoving"
      branches={['idleSwitchNode', 'runAnimationNode']}
      x={root.x()}
    />,
  );
  grounded.root.moveBelow(root);
  yield* all(
    grounded.root.y(250 + 10, 0.6),
    root.y(-250 - 10, 0.6),
    code().selection(DEFAULT, 0.6),
  );

  yield* waitUntil('ground_so_param');
  yield* highlight(grounded.paramBox);
  yield* waitUntil('ground_so_branches');
  yield* all(unhighlight(grounded.paramBox), highlight(grounded.branches));
  yield* waitUntil('separate_classes');

  yield code().y(topEdge, 0.6);
  yield className('RootSwitchNode', 0.6);
  yield unhighlight(grounded.branches);
  yield* code().code.append()`\

public class GroundSwitchNode : ReanimatorNode {
  public ReanimatorNode idleSwitch;
  public ReanimatorNode runAnimation;
  
  public override AnimationFrame Resolve(Params state) {
    return state.Get("isMoving") == 0
      ? idleSwitch.Resolve(state)
      : runAnimation.Resolve(state);
  }
}`;

  yield* waitUntil('stateless');
  yield* code().selection([lines(1, 2), lines(12, 13)], 0.6);

  yield* waitUntil('static');
  yield;
  code().moveOffset(Vector2.left);
  yield sequence(
    0.1,
    all(root.scale(0.9, 0.6), root.opacity(0, 0.6)),
    all(grounded.root.scale(0.9, 0.6), grounded.root.opacity(0, 0.6)),
  );
  yield code().selection(DEFAULT, 0.6);
  yield* code().code(
    `\ 
public static class RootSwitchNode {
  public static AnimationFrame Resolve(Params state) {
    return state.Get("isGrounded")) == 0
      ? AirSwitchNode.Resolve(state);
      : GroundSwitchNode.Resolve(state);
  }
}

public static class GroundSwitchNode {
  public static AnimationFrame Resolve(Params state) {
    return state.Get("isMoving") == 0
      ? IdleSwitchNode.Resolve(state)
      : RunAnimationNode.Resolve(state); 
    }
  }
}`,
    0.6,
  );

  yield* waitUntil('functions');

  yield* code().code(
    `\
AnimationFrame ResolveRoot(Params state) {
  return state.Get("isGrounded")) == 0
    ? ResolveAir(state);
    : ResolveGround(state);
}

AnimationFrame ResolveGround(Params state) {
  return state.Get("isMoving") == 0
    ? ResolveIdle(state)
    : ResolveRunAnimation(state); 
  }
}`,
    0.6,
  );

  yield* waitUntil('parameters');
  yield* code().selection([word(1, 9, 23), word(7, 9, 21)], 0.6);
  yield* waitUntil('collision');
  yield code().selection(lines(13, 22), 0.6);
  const collision = code().createSignal('');
  code().code([...code().code().fragments, collision]);
  yield* collision(
    `\


// ...

void FixedUpdate() {
  state.Set("isGrounded", CheckCollision());
}`,
    0.6,
  );

  yield* waitUntil('string');
  yield* code().selection(code().findAllRanges('"isGrounded"'), 0.3);
  yield* waitUntil('struct');

  const struct = createRef<Code>();
  view.add(
    <CSCode
      ref={struct}
      offsetX={-1}
      x={view.width() / 2}
      code={`\
public struct Params {
  bool isGrounded;
  bool isDoubleJump;
  bool isMoving;
  int frame;
  IdleTransition idleTransition;
}`}
    />,
  );

  yield struct().x(200, 0.6),
    yield code().selection([word(1, 9), lines(16)], 0.6);
  yield code().code.edit()`\
AnimationFrame ResolveRoot(Params state) {
  return state.${remove('Get("')}isGrounded${remove('")) == 0')}
    ? ResolveAir(state);
    : ResolveGround(state);
}

AnimationFrame ResolveGround(Params state) {
  return state.${remove('Get("')}isMoving${remove('") == 0')}
    ? ResolveIdle(state)
    : ResolveRunAnimation(state); 
  } 
}

// ...

void FixedUpdate() {
  state.${remove(
    'Set("',
  )}isGrounded${replace('",', ' =')} CheckCollision()${remove(')')};
}`;

  yield* waitUntil('each_field');
  yield* all(
    code().selection(code().findAllRanges('isGrounded'), 0.6),
    struct().selection(lines(1), 0.6),
  );

  yield* waitUntil('hope');
  yield* all(code().selection(DEFAULT, 0.6), struct().selection(DEFAULT, 0.6));

  yield* waitUntil('actual_data');
  yield* code().selection(code().findAllRanges('Params state'), 0.6);
  yield* waitUntil('sos');
  struct().moveToBottom();
  yield* all(
    struct().opacity(0, 0.6),
    root.opacity(1, 0.6),
    root.scale(1, 0.6),
    grounded.root.opacity(1, 0.6),
    grounded.root.scale(1, 0.6),
    code().selection([], 0.6),
  );

  yield* waitUntil('expressed');
  yield* all(
    struct().opacity(1, 0.6),
    root.opacity(0, 0.6),
    root.scale(0.9, 0.6),
    grounded.root.opacity(0, 0.6),
    grounded.root.scale(0.9, 0.6),
    code().selection(DEFAULT, 0.6),
  );

  yield* waitUntil('next');
  finishScene();
  yield* all(
    code().opacity(0, 0.6),
    struct().opacity(0, 0.6),
    view.fill(null, 0.6),
  );
});

function* highlight(rect: Rect) {
  yield* rect.stroke(theme.window).lineWidth(0).lineWidth(8, 0.3);
}

function* unhighlight(rect: Rect) {
  yield* rect.lineWidth(0, 0.3);
}

function SO({
  refs,
  name,
  parameter,
  branches,
  ...props
}: RectProps & {
  name: string;
  parameter: string;
  branches: string[];
  refs: {
    root: Rect;
    paramBox: Rect;
    branches: Rect;
    param: Txt;
    paramLabel: Txt;
  };
}) {
  return (
    <Rect
      layout
      padding={20}
      gap={20}
      width={640}
      radius={theme.radius}
      fill={theme.bg}
      direction={'column'}
      {...props}
      ref={makeRef(refs, 'root')}
    >
      <Layout gap={20} margin={20}>
        <ATxt
          fontSize={32}
          fill={'#EA4D4D'}
          textAlign={'center'}
          width={40}
          text={'{}'}
        />
        <ATxt>{name} (Switch Node)</ATxt>
      </Layout>
      <Field ref={makeRef(refs, 'paramLabel')} label="parameter">
        <Rect
          ref={makeRef(refs, 'paramBox')}
          radius={theme.radius}
          offset={Vector2.left}
          fill={theme.bgDark}
          grow={1}
        >
          <ATxt ref={makeRef(refs, 'param')} margin={[10, 20]}>
            {parameter}
          </ATxt>
        </Rect>
      </Field>
      <Field label="branches">
        <Layout grow={1} justifyContent={'end'}>
          <Rect fill={theme.bgDark} radius={theme.radius}>
            <ATxt width={160} textAlign={'right'} margin={[10, 20]}>
              {branches.length.toString()}
            </ATxt>
          </Rect>
        </Layout>
      </Field>
      <Rect
        ref={makeRef(refs, 'branches')}
        direction={'column'}
        gap={20}
        fill={theme.bgDark}
        padding={[20, 20, 20, 0]}
        radius={theme.radius}
      >
        {branches.map(branch => (
          <Field label="0">
            <Rect fill={theme.bg} radius={theme.radius} grow={1}>
              <ATxt margin={[10, 20]}>{branch}</ATxt>
            </Rect>
          </Field>
        ))}
      </Rect>
    </Rect>
  );
}

function Field({
  label,
  children,
  ref,
  ...props
}: LayoutProps & {label: string}) {
  return (
    <Layout gap={20} alignItems={'center'} minHeight={60} {...props}>
      <ATxt ref={ref} width={200} textAlign={'right'}>
        {label}
      </ATxt>
      {children}
    </Layout>
  );
}
