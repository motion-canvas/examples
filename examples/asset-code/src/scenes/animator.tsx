import {
  Code,
  CodePoint,
  Grid,
  Layout,
  Line,
  makeScene2D,
  Node,
  Ray,
  RayProps,
  Rect,
} from '@motion-canvas/2d';
import {
  all,
  createComputed,
  createRef,
  createRefMap,
  createSignal,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  finishScene,
  loop,
  range,
  useDuration,
  useRandom,
  useThread,
  Vector2,
  waitFor,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import {
  ATxt,
  createMouseRef,
  createPageRef,
  GdCode,
  Mouse,
  Page,
  PlainCode,
  Window, YamlCode,
} from '../nodes';
import {Theme} from '../styles';

const theme = {
  ...Theme,
  window: '#cc812b',
  event: '#cc2b2b',
  music: '#0880b4',
  component: '#45811b',
  buttons: '#0f0e0c',
};

// const theme = {
//   window: '#1195cb',
//   buttons: '#0d0f10',
//   stroke: '#5c6366',
//   bgDark: '#0d0f10',
//   bg: '#1d2224',
//   radius: 8,
// };
// const theme = {
//   window: '#1d8b8d',
//   buttons: '#0d0f10',
//   stroke: '#5c6666',
//   bgDark: '#0d0f10',
//   bg: '#1d2224',
//   radius: 8,
// };

const gdscript = (line: string) => `\
 func _initialize():
   self.root = self.bag.root
   self.update_zoom()
   self.apply_default_camera()
   self.update_camera_speed()
 
 func update_zoom():
   self.scale = self.camera.get_zoom()
 
 func get_pos():
   return self.camera.get_offset()
 
 func set_pos(position):
   self.camera.set_offset(position)
   self.target = position
   self.pos = position
   self.sX = position.x
   self.sY = position.y${line}
 `;

const yaml = (a: Vector2, b: Vector2) => `\
%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!91 &9100000
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: PlayerAnimator
  serializedVersion: 5
  m_AnimatorParameters:
  - m_Name: speed
    m_Type: 1
    m_DefaultFloat: 0
    m_DefaultInt: 0
    m_DefaultBool: 0
    m_Controller: {fileID: 9100000}
  m_AnimatorLayers:
  - serializedVersion: 5
    m_Name: Base Layer
    m_StateMachine: {fileID: 7168948217273249085}
    m_Mask: {fileID: 0}
    m_Motions: []
    m_Behaviours: []
    m_BlendingMode: 0
    m_SyncedLayerIndex: -1
    m_DefaultWeight: 0
    m_IKPass: 0
    m_SyncedLayerAffectsTiming: 0
    m_Controller: {fileID: 9100000}
--- !u!1102 &119421756791919613
AnimatorState:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Blend Tree
  m_Speed: 1
  m_CycleOffset: 0
  m_Transitions:
  - {fileID: 7380338726231086403}
  m_StateMachineBehaviours: []
  m_Position: {x: 50, y: 50, z: 0}
  m_IKOnFeet: 0
  m_WriteDefaultValues: 1
  m_Mirror: 0
  m_SpeedParameterActive: 0
  m_MirrorParameterActive: 0
  m_CycleOffsetParameterActive: 0
  m_TimeParameterActive: 0
  m_Motion: {fileID: 8149319799317669181}
  m_Tag: 
  m_SpeedParameter: 
  m_MirrorParameter: 
  m_CycleOffsetParameter: 
  m_TimeParameter: 
--- !u!206 &1510578230492688263
BlendTree:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: BlendTree
  m_Childs:
  - serializedVersion: 2
    m_Motion: {fileID: -203655887218126122, guid: 0b87f89d01130104cb97229365e5a116,
      type: 3}
    m_Threshold: 0
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: speed
    m_Mirror: 0
  - serializedVersion: 2
    m_Motion: {fileID: -203655887218126122, guid: 6ded57c9e8d0d324bb4341d76a1802df,
      type: 3}
    m_Threshold: 1
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: speed
    m_Mirror: 0
  m_BlendParameter: _slowWalk
  m_BlendParameterY: Blend
  m_MinThreshold: 0
  m_MaxThreshold: 1
  m_UseAutomaticThresholds: 1
  m_NormalizedBlendValues: 0
  m_BlendType: 0
--- !u!1102 &1552177660250630025
AnimatorState:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Idle
  m_Speed: 1
  m_CycleOffset: 0
  m_Transitions:
  - {fileID: 5511037503630015393}
  m_StateMachineBehaviours: []
  m_Position: {x: 50, y: 50, z: 0}
  m_IKOnFeet: 0
  m_WriteDefaultValues: 1
  m_Mirror: 0
  m_SpeedParameterActive: 0
  m_MirrorParameterActive: 0
  m_CycleOffsetParameterActive: 0
  m_TimeParameterActive: 0
  m_Motion: {fileID: -203655887218126122, guid: 0b87f89d01130104cb97229365e5a116,
    type: 3}
  m_Tag: 
  m_SpeedParameter: 
  m_MirrorParameter: 
  m_CycleOffsetParameter: 
  m_TimeParameter: 
--- !u!1101 &5511037503630015393
AnimatorStateTransition:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: 
  m_Conditions:
  - m_ConditionMode: 3
    m_ConditionEvent: speed
    m_EventTreshold: 0.1
  m_DstStateMachine: {fileID: 0}
  m_DstState: {fileID: 119421756791919613}
  m_Solo: 0
  m_Mute: 0
  m_IsExit: 0
  serializedVersion: 3
  m_TransitionDuration: 0.05
  m_TransitionOffset: 0
  m_ExitTime: 0.7580645
  m_HasExitTime: 0
  m_HasFixedDuration: 1
  m_InterruptionSource: 0
  m_OrderedInterruption: 1
  m_CanTransitionToSelf: 1
--- !u!1107 &7168948217273249085
AnimatorStateMachine:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Base Layer
  m_ChildStates:
  - serializedVersion: 1
    m_State: {fileID: 119421756791919613}
    m_Position: {x: ${a.x}, y: ${a.y}, z: 0}
  - serializedVersion: 1
    m_State: {fileID: 1552177660250630025}
    m_Position: {x: ${b.x}, y: ${b.y}, z: 0}
  m_ChildStateMachines: []
  m_AnyStateTransitions: []
  m_EntryTransitions: []
  m_StateMachineTransitions: {}
  m_StateMachineBehaviours: []
  m_AnyStatePosition: {x: 50, y: 20, z: 0}
  m_EntryPosition: {x: 50, y: 120, z: 0}
  m_ExitPosition: {x: 800, y: 120, z: 0}
  m_ParentStateMachinePosition: {x: 800, y: 20, z: 0}
  m_DefaultState: {fileID: 1552177660250630025}
--- !u!1101 &7380338726231086403
AnimatorStateTransition:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: 
  m_Conditions:
  - m_ConditionMode: 4
    m_ConditionEvent: speed
    m_EventTreshold: 0.1
  m_DstStateMachine: {fileID: 0}
  m_DstState: {fileID: 1552177660250630025}
  m_Solo: 0
  m_Mute: 0
  m_IsExit: 0
  serializedVersion: 3
  m_TransitionDuration: 0.2
  m_TransitionOffset: 0
  m_ExitTime: 0.73988444
  m_HasExitTime: 0
  m_HasFixedDuration: 1
  m_InterruptionSource: 0
  m_OrderedInterruption: 1
  m_CanTransitionToSelf: 1
`;

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);

  const page = createPageRef();
  const window = createRef<Window>();
  const states = createRefMap<Rect>();
  const arrows = createRefMap<Line>();
  const mouse = createMouseRef();
  view.add(
    <>
      <Window
        ref={window}
        theme={theme}
        // x={view.width() / -2 + 40 + 984 / 2}
        x={view.width() / -4 + 10}
        height={1080 - 80 - 16}
        scale={0.9}
        opacity={0}
        // width={984}
        width={view.width() / 2 - 60 - 16}
      >
        <Rect fill={theme.bgDark} radius={theme.radius} size={'100%'} clip>
          <Layout layout={false}>
            <Grid spacing={80} stroke={theme.bg} lineWidth={2} size={'100%'} />
            <Grid
              spacing={80}
              position={40}
              stroke={theme.bg}
              lineWidth={4}
              size={'100%'}
            />
            <Node cache>
              <Rect
                ref={states.entry}
                height={60}
                width={320}
                y={-240}
                fill={theme.window}
                radius={theme.radius}
              >
                <ATxt fill={theme.buttons}>Entry</ATxt>
              </Rect>
              <Rect
                ref={states.idle}
                height={80}
                width={400}
                x={120}
                fill={theme.stroke}
                radius={theme.radius}
              >
                <ATxt fill={theme.buttons}>Idle</ATxt>
              </Rect>
              <Rect
                ref={states.tree}
                height={80}
                width={400}
                stroke={theme.window}
                strokeFirst
                x={-120}
                y={200}
                fill={theme.stroke}
                radius={theme.radius}
              >
                <ATxt fill={theme.buttons}>Blend Tree</ATxt>
              </Rect>
              <Mouse refs={mouse} x={240} y={240} fill={theme.bgDark} />
              <Arrow
                ref={arrows.entry}
                zIndex={-1}
                fromNode={states.entry()}
                toNode={states.idle()}
              />
              <Arrow
                ref={arrows.tree}
                zIndex={-1}
                fromNode={states.tree()}
                toNode={states.idle()}
              />
              <Arrow
                ref={arrows.mouse}
                zIndex={-1}
                end={0}
                fromNode={states.idle()}
                toNode={mouse.line}
              />
              <Arrow
                ref={arrows.idle}
                zIndex={-1}
                end={0}
                fromNode={states.idle()}
                toNode={states.tree()}
              />
            </Node>
          </Layout>
        </Rect>
      </Window>
      <Page
        theme={theme}
        refs={page}
        label="Player.controller"
        component={YamlCode}
        width={view.width() / 2 - 60}
        code={() =>
          yaml(
            states.idle().position().rounded,
            states.tree().position().rounded,
          )
        }
      />
    </>,
  );

  states.mapRefs(s => {
    const shadow = new Rect({
      position: s.position,
      size: s.size().add(16),
      fill: 'red',
      compositeOperation: 'destination-out',
    });
    s.parent().add(shadow);
    shadow.moveBelow(s);
  });

  yield* waitTransition(0.7);
  yield* page.scroll(-6054, useDuration('scroll'));

  yield* waitUntil('window');
  yield* all(
    page.rect.x(view.width() / 4 - 10, 0.6),
    window().opacity(1, 0.6),
    window().scale(1, 0.6),
  );

  yield* waitUntil('move');
  yield* mouse.line.position(
    [-80, 200],
    0.4,
    easeInOutCubic,
    Vector2.createArcLerp(false),
  );
  yield* all(
    mouse.size(60, 0.2, easeInCubic),
    states.tree().lineWidth(16, 0.2, easeInCubic),
  );
  yield* all(
    mouse.line.position([40, 240], 0.6),
    states.tree().position([0, 240], 0.6),
  );
  yield* all(
    mouse.size(80, 0.2, easeOutCubic),
    states.tree().lineWidth(0, 0.2, easeOutCubic),
  );

  yield* waitUntil('connect');
  yield* mouse.line.position(
    [220, 0],
    0.4,
    easeInOutCubic,
    Vector2.createArcLerp(false),
  );
  yield* all(mouse.size(60, 0.2, easeInCubic));
  arrows.mouse().end(1);
  yield* mouse.line.position([160, 240], 0.4);
  arrows.mouse().remove();
  arrows.idle().end(1).x(20).stroke(theme.window);
  arrows.tree().x(-20);

  yield* all(
    mouse.size(80, 0.2, easeOutCubic),
    arrows.idle().stroke(theme.stroke, 0.4),
  );

  yield* waitUntil('take_away');
  yield* all(window().filters.saturate(0, 0.6), window().opacity(0.25, 0.6));

  yield* waitUntil('interpreted');
  const inserted = createSignal('');
  const gdSource = () => gdscript(inserted());
  const gdPage = createPageRef();
  const gdWindow = createRef<Window>();
  const gdCode = createRef<Code>();
  view.add(
    <>
      <Window
        ref={gdWindow}
        theme={theme}
        size={window().size()}
        x={view.width() * -0.75}
        direction={'column'}
        radius={theme.radius}
      >
        <Rect
          grow={1}
          radius={[theme.radius, theme.radius, 0, theme.radius]}
          fill={theme.bgDark}
          clip
        >
          <Rect fill={theme.bgDarker}>
            <PlainCode
              fill={'#666'}
              marginTop={16}
              fontWeight={700}
              offset={-1}
              code={range(21)
                .map(i => (i + 10).toString().padStart(3, ' ') + ' ')
                .join('\n')}
            />
          </Rect>
          <GdCode
            ref={gdCode}
            grow={1}
            marginTop={16}
            offset={-1}
            code={gdSource}
          />
          <Rect
            width={8}
            margin={[100, 8, 8]}
            radius={4}
            height={320}
            fill={theme.bgDark}
          />
        </Rect>
        <Rect height={40} shrink={0} marginTop={-1} width={'100%'}>
          <Rect
            height={40}
            width={140}
            radius={[0, 20, 20, 0]}
            fill={theme.window}
          />
          <Rect
            zIndex={-1}
            marginLeft={-20}
            height={40}
            width={140}
            radius={[0, 20, 20, 0]}
            fill={theme.window}
            opacity={0.54}
          />
          <Rect
            zIndex={-2}
            marginLeft={-140}
            height={40}
            grow={1}
            fill={theme.bgDarker}
          />
        </Rect>
      </Window>
      <Page
        theme={theme}
        refs={gdPage}
        label="camera.gd"
        size={page.rect.size()}
        x={view.width() * 0.75}
        component={GdCode}
        code={gdSource}
      />
    </>,
  );

  const selection = createRef<Rect>();
  const cursor = createSignal<CodePoint>([17, 23]);
  const bbox = createComputed(() => gdCode().getPointBBox(cursor()));
  gdCode().add(
    <Rect
      layout={false}
      ref={selection}
      size={() => bbox().size}
      position={() => bbox().center}
      fill={'white'}
      radius={4}
      compositeOperation={'difference'}
    />,
  );

  const time = useThread().time;
  let lastTime = time();
  yield loop(() => {
    const now = time();
    if (now - lastTime > 0.5) {
      selection().opacity(1 - selection().opacity());
      lastTime = now;
    }
  });
  function move() {
    lastTime = time();
    selection().opacity(1);
  }

  yield* all(
    gdPage.rect.x(page.rect.x(), 0.6),
    page.rect.scale(0.9, 0.6),
    page.rect.fill(theme.bgDark, 0.6),
    gdWindow().x(window().x(), 0.6),
    window().scale(0.9, 0.6),
    window().opacity(0.125, 0.6),
  );
  page.rect.remove();
  window().remove();

  yield* waitUntil('editing');
  inserted('\n   ');
  cursor([18, 3]);
  const insert = 'self.angle = position.angle()';
  const random = useRandom();
  for (const char of insert) {
    inserted(inserted() + char);
    const old = cursor();
    cursor([old[0], old[1] + 1]);
    move();
    yield* waitFor(random.nextFloat(0.01, 0.1));
  }
  yield* waitFor(0.3);
  cursor([19, 3]);
  move();

  yield* waitUntil('next');
  finishScene();
  yield* all(
    gdPage.rect.x(view.width() * 0.75, 0.6, easeInCubic),
    gdWindow().x(view.width() * -0.75, 0.6, easeInCubic),
    view.fill(null, 0.6, easeInCubic),
  );
});

function Arrow({
  fromNode,
  toNode,
  ...props
}: RayProps & {fromNode: Node; toNode: Node}) {
  const ray = (
    <Ray
      from={fromNode.position}
      to={toNode.position}
      lineWidth={8}
      stroke={theme.stroke}
      {...props}
    />
  ) as Ray;
  ray.add(
    ray.reactiveClone({
      to: () => Vector2.lerp(fromNode.position(), toNode.position(), 0.57),
      position: 0,
      endArrow: true,
    }),
  );

  return ray;
}
