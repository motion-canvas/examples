import {
  Circle,
  Grid,
  Img,
  Layout,
  Line,
  makeScene2D,
  Node,
  Path,
  Ray,
  Rect,
  SVG,
} from '@motion-canvas/2d';
import {
  all,
  Color,
  createComputed,
  createRef,
  createRefArray,
  createRefMap,
  createSignal,
  delay,
  easeInOutCubic,
  easeOutCubic,
  easeOutElastic,
  finishScene,
  linear,
  loop,
  map,
  modify,
  PossibleVector2,
  range,
  sequence,
  SignalValue,
  tween,
  useRandom,
  Vector2,
  waitTransition,
  waitUntil,
} from '@motion-canvas/core';
import * as THREE from 'three';
import jeff from '../image/jeff.png';
import logo from '../image/logo.svg?raw';
import {ATxt, Buttons, Paper, Tetrahedron, Three, Window} from '../nodes';
import {Theme} from '../styles';
import * as gameThree from '../three/game';

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

export default makeScene2D(function* (view) {
  view.fill(theme.bgDark);

  const fields = createSignal(0);
  const fieldsColor = createComputed(() =>
    Color.lerp(theme.bg, theme.game, fields(), 'rgb'),
  );
  const fieldsMargin = createComputed(() => map(0, 80, fields()));
  const fieldsMerge = createComputed(() => map(-30, 0, fields()));
  const fieldsSpace = createComputed(() => map(0, 20, fields()));
  const fieldsRadius = createComputed(() => map(theme.radius, 30, fields()));
  const panels = createRefMap<Rect>();
  const outline = createRef<Line>();
  const ripple = createRef<Circle>();
  const three = createRef<Three>();
  const tetra = createRef<Tetrahedron>();
  const assets = createRefArray<Rect>();

  view.add(
    <Rect
      clip
      ref={panels.window}
      layout
      size={'100%'}
      direction={'column'}
      padding={20}
      cache
    >
      <Line
        layout={false}
        ref={outline}
        // lineWidth={16}
        stroke={theme.game}
        strokeFirst
        closed
        clip
        radius={theme.radius}
      >
        <Circle
          ref={ripple}
          scale={0}
          size={view.size().magnitude}
          fill={theme.bg}
        />
      </Line>
      <Layout ref={panels.appbar} shrink={0} justifyContent={'space-between'}>
        <Layout ref={panels.tabs} shrink={0}>
          <Rect padding={[20, 40]} ref={panels.editorTab} opacity={0}>
            <ATxt>EDITOR</ATxt>
          </Rect>
          <Rect padding={[20, 40]} ref={panels.gameTab} opacity={0}>
            <ATxt>GAME</ATxt>
          </Rect>
        </Layout>
        <Layout
          ref={panels.buttons}
          shrink={0}
          paddingBottom={20}
          paddingRight={10}
          opacity={0}
        >
          <Buttons value={theme.stroke} />
        </Layout>
      </Layout>
      <Layout ref={panels.content} grow={1} gap={20}>
        <Layout ref={panels.left} grow={1} direction={'column'} gap={20}>
          <Rect ref={panels.viewport} grow={1} radius={theme.radius}>
            <Tetrahedron
              ref={tetra}
              width={'100%'}
              height={() => panels.viewport().height()}
              compositeOperation={'source-atop'}
              layout={false}
              radius={8}
              lineWidth={8}
              y={40}
              orbit={50}
              grid={theme.bgDark}
              stroke={theme.stroke}
            />
            <Three
              ref={three}
              quality={2}
              grow={1}
              opacity={0}
              compositeOperation={'source-atop'}
              background={'#023348'}
              scene={gameThree.threeScene}
              camera={gameThree.camera}
            />
          </Rect>
          <Rect
            ref={panels.assets}
            height={320}
            marginBottom={-340}
            radius={theme.radius}
            direction={'column'}
            padding={20}
            gap={20}
          >
            <ATxt>ASSETS</ATxt>
            <Layout grow={1} gap={20}>
              <Paper ref={assets} fill={theme.bg} width={160} height={220}>
                <Tetrahedron
                  layout={false}
                  radius={1}
                  lineWidth={8}
                  y={20}
                  orbit={30}
                  stroke={theme.stroke}
                />
              </Paper>
              <Paper ref={assets} fill={theme.bg} width={160} height={220}>
                <Path
                  layout={false}
                  x={-820}
                  y={-200 + 30 - 4}
                  fill={theme.stroke}
                  data="M776,224L800,192L818,216L848,216L828,189.4L818,202.6L813,196L828,176L864,224L776,224ZM792,216L808,216L800,205.3L792,216ZM792,216L808,216L792,216Z"
                />
              </Paper>
              <Paper ref={assets} fill={theme.bg} width={160} height={220}>
                <Path
                  layout={false}
                  x={-660}
                  y={-400 + 10}
                  fill={theme.stroke}
                  data="M632,440L632,432L656,432L656,416L648,416C642.467,416 637.75,414.05 633.85,410.15C629.95,406.25 628,401.533 628,396C628,392 629.1,388.317 631.3,384.95C633.5,381.583 636.467,379.133 640.2,377.6C640.8,372.6 642.983,368.417 646.75,365.05C650.517,361.683 654.933,360 660,360C665.067,360 669.483,361.683 673.25,365.05C677.017,368.417 679.2,372.6 679.8,377.6C683.533,379.133 686.5,381.583 688.7,384.95C690.9,388.317 692,392 692,396C692,401.533 690.05,406.25 686.15,410.15C682.25,414.05 677.533,416 672,416L664,416L664,432L688,432L688,440L632,440ZM648,408L672,408C675.333,408 678.167,406.833 680.5,404.5C682.833,402.167 684,399.333 684,396C684,393.6 683.317,391.4 681.95,389.4C680.583,387.4 678.8,385.933 676.6,385L672.4,383.2L671.8,378.6C671.4,375.6 670.083,373.083 667.85,371.05C665.617,369.017 663,368 660,368C657,368 654.383,369.017 652.15,371.05C649.917,373.083 648.6,375.6 648.2,378.6L647.6,383.2L643.4,385C641.2,385.933 639.417,387.4 638.05,389.4C636.683,391.4 636,393.6 636,396C636,399.333 637.167,402.167 639.5,404.5C641.833,406.833 644.667,408 648,408Z"
                />
              </Paper>
              <Paper ref={assets} fill={theme.bg} width={160} height={220}>
                <Path
                  layout={false}
                  x={-1340}
                  y={-560 + 10}
                  fill={theme.stroke}
                  data="M1340,554L1328,542L1328,520L1352,520L1352,542L1340,554ZM1358,572L1346,560L1358,548L1380,548L1380,572L1358,572ZM1300,572L1300,548L1322,548L1334,560L1322,572L1300,572ZM1328,600L1328,578L1340,566L1352,578L1352,600L1328,600ZM1340,542.6L1344,538.6L1344,528L1336,528L1336,538.6L1340,542.6ZM1308,564L1318.6,564L1322.6,560L1318.6,556L1308,556L1308,564ZM1336,592L1344,592L1344,581.4L1340,577.4L1336,581.4L1336,592ZM1361.4,564L1372,564L1372,556L1361.4,556L1357.4,560L1361.4,564Z"
                />
              </Paper>
              <Paper ref={assets} fill={theme.bg} width={160} height={220}>
                <Path
                  layout={false}
                  x={-48}
                  y={48 + 10}
                  scale={0.1}
                  fill={theme.stroke}
                  data="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"
                />
              </Paper>
            </Layout>
          </Rect>
        </Layout>
        <Rect
          ref={panels.right}
          shrink={0}
          width={540}
          marginRight={-560}
          padding={20}
          gap={20}
          radius={theme.radius}
          direction={'column'}
        >
          <ATxt>INSPECTOR</ATxt>
          <Layout gap={20}>
            <Rect
              size={60}
              fill={fieldsColor}
              radius={fieldsRadius}
              marginRight={fieldsMerge}
            />
            <Rect height={60} grow={1} fill={theme.bg} radius={theme.radius} />
          </Layout>
          <Layout gap={20} marginLeft={fieldsMargin}>
            <Rect height={60} grow={1} fill={theme.bg} radius={theme.radius} />
            <Rect
              size={60}
              fill={theme.bg}
              radius={fieldsRadius}
              marginLeft={fieldsMerge}
            />
          </Layout>
          <Rect
            height={60}
            fill={theme.bg}
            radius={theme.radius}
            marginLeft={fieldsMargin}
            marginBottom={fieldsSpace}
          />
          <Layout gap={20}>
            <Rect
              size={60}
              fill={fieldsColor}
              radius={fieldsRadius}
              marginRight={fieldsMerge}
            />
            <Rect height={60} grow={1} fill={theme.bg} radius={theme.radius} />
          </Layout>
          <Rect
            height={60}
            fill={theme.bg}
            radius={theme.radius}
            marginLeft={fieldsMargin}
            marginBottom={fieldsSpace}
          />
          <Layout gap={20} marginLeft={fieldsMargin}>
            <Rect
              height={60}
              grow={1}
              fill={theme.bg}
              radius={theme.radius}
              marginRight={fieldsMerge}
            />
            <Rect
              height={60}
              grow={1}
              fill={fieldsColor}
              radius={theme.radius}
            />
          </Layout>
        </Rect>
      </Layout>
    </Rect>,
  );

  assets.slice(1).map(a => a.opacity(0));

  yield loop(function* () {
    yield* tween(2, value => {
      gameThree.mesh.position.set(0, 0, map(0, 3, easeInOutCubic(value)));
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    });
    yield* tween(2, value => {
      gameThree.mesh.position.set(0, 0, map(3, 0, easeInOutCubic(value)));
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    });
  });

  yield loop(() =>
    tween(8, value => {
      gameThree.mesh.rotation.set(0, 0, value * Math.PI * 2);
      gameThree.threeScene.updateWorldMatrix(true, true);
      three().rerender();
    }),
  );

  function updateBuffer() {
    const buffer = gameThree.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;
    buffer.set(
      [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2].flatMap(i => {
        const v = tetra().vertices()[i];
        return [v.x, v.y, v.z];
      }),
    );
    buffer.needsUpdate = true;
  }
  updateBuffer();

  const currentTab = createSignal(panels.editorTab());

  const points = (collapse = false) => {
    const viewport = panels.viewport();
    const tab = currentTab();

    return [
      fromTo(viewport, outline(), viewport.topRight()),
      fromTo(viewport, outline(), viewport.bottomRight()),
      fromTo(viewport, outline(), viewport.bottomLeft()),
      fromTo(viewport, outline(), viewport.topLeft()),
      fromTo(tab, outline(), tab.bottomLeft()),
      fromTo(tab, outline(), collapse ? tab.bottomLeft() : tab.topLeft()),
      fromTo(tab, outline(), collapse ? tab.bottomRight() : tab.topRight()),
      fromTo(tab, outline(), tab.bottomRight()),
    ];
  };

  outline().points(points);

  function* switchTab(tab: Rect) {
    outline().points(outline().parsedPoints());
    currentTab(tab);
    yield* outline().points(points, 0.3);
  }

  yield* waitTransition(0.64);

  const bevy = new Node({scale: 3});
  view.insert(bevy);
  const svg = createRef<SVG>();
  const offsets = [-100, -100, -100, -18, 25, 65, 111];
  view.add(<SVG ref={svg} svg={logo} />);
  const paths = svg()
    .wrapper.children()
    .map((node, i) => {
      const path = node as Path;
      const group = <Node x={offsets[i]} y={20} />;
      bevy.add(group);
      const clone = new Path({
        scale: path.scale(),
        position: path.position(),
        data: path.data(),
        fill: '#fff',
      });
      bevy.add(clone);
      clone.reparent(group);
      group.y(40);

      return group;
    });

  svg().remove().dispose();

  const title = paths.slice(3);
  const scale = createSignal(0);
  const birds = [paths[0], paths[2], paths[1]];
  birds[0].childAs<Path>(0).fill('#787878');
  birds[1]
    .childAs<Path>(0)
    .fill('#B2B2B2')
    .stroke('#141414')
    .lineWidth(() => 16 / scale())
    .strokeFirst(true);
  birds[2]
    .childAs<Path>(0)
    .stroke('#141414')
    .lineWidth(() => 16 / scale())
    .strokeFirst(true);
  birds[0].scale(scale);
  birds[1].rotation(30).scale(scale);
  birds[2].moveUp().rotation(60).scale(scale);
  title.forEach(node => node.scale(0).rotation(30));

  const delta = 0.05;
  const duration = 0.4;
  yield* waitUntil('bevy_logo');

  yield all(
    scale(1, duration, easeOutCubic),
    ...birds.map(node => node.y(20, duration, easeOutCubic)),
  );

  yield* sequence(
    delta,
    all(
      birds[1].rotation(0, duration * 6, easeOutElastic),
      birds[2].rotation(0, duration * 6, easeOutElastic),
    ),
    ...title.map(node =>
      all(
        node.scale(1, duration, easeOutCubic),
        node.rotation(0, duration, easeOutCubic),
        node.y(20, duration, easeOutCubic),
      ),
    ),
  );

  yield* waitUntil('editor');
  yield* all(
    ripple().scale(1, 1, easeOutCubic),
    delay(0.5, panels.editorTab().opacity(1, 0.3)),
    delay(0.5, panels.buttons().opacity(1, 0.3)),
  );
  bevy.remove();

  yield* waitUntil('assets');
  yield* all(panels.assets().margin.bottom(0, 0.6));

  yield* waitUntil('player');
  yield* all(
    switchTab(panels.gameTab()),
    panels.gameTab().opacity(1, 0.3),
    three().opacity(1, 0.3),
    ripple().fill(theme.game, 0.3, easeInOutCubic, Color.createLerp('rgb')),
  );
  tetra().remove();

  yield* waitUntil('scenes');
  yield* all(
    assets[1].opacity(1, 0.3, easeOutCubic),
    assets[1].margin.top(20).margin.top(0, 0.3, easeOutCubic),
  );

  yield* waitUntil('prefabs');
  yield* all(
    assets[2].opacity(1, 0.3, easeOutCubic),
    assets[2].margin.top(20).margin.top(0, 0.3, easeOutCubic),
  );

  yield* waitUntil('settings');
  yield* all(
    assets[3].opacity(1, 0.3, easeOutCubic),
    assets[3].margin.top(20).margin.top(0, 0.3, easeOutCubic),
  );

  yield* waitUntil('custom');
  yield* all(
    assets[4].opacity(1, 0.3, easeOutCubic),
    assets[4].margin.top(20).margin.top(0, 0.3, easeOutCubic),
  );

  yield* waitUntil('inspector');
  const selection = createRef<Line>();
  assets[4].parent().add(
    <Line
      ref={selection}
      layout={false}
      radius={theme.radius}
      points={() => {
        return [
          assets[4].topRight(),
          assets[4].bottomRight(),
          assets[4].bottomLeft(),
          assets[4].topLeft().addY(40),
          assets[4].topLeft().addX(40),
        ];
      }}
      closed
      fill={theme.bgDark}
      stroke={theme.selection}
      strokeFirst
      lineWidth={0}
      zIndex={-1}
    />,
  );
  yield* all(
    panels.right().margin.right(0, 0.6),
    delay(0.15, selection().lineWidth(16, 0.3)),
  );

  yield* waitUntil('fields');
  yield* fields(1, 0.6);

  yield* waitUntil('bevy');
  const viewport = panels.viewport();
  const clone = <Layout grow={1} />;
  const parent = viewport.parent();
  const tab = panels.gameTab();
  tab.position.save();
  tab.size.save();
  tab.reparent(view);
  tab.moveOffset(new Vector2(-0.1, 1));
  viewport.size.save();
  viewport.position.save();
  viewport.reparent(view).radius(theme.radius).layout(true).direction('column');
  const buttons = createRef<Layout>();
  viewport.add(
    <>
      <Layout clip ref={buttons} shrink={0} height={0} justifyContent={'end'}>
        <Buttons value={theme.buttons} />
      </Layout>
      <Rect grow={1} radius={theme.radius} clip />
    </>,
  );

  viewport.childAs(2).add(three());

  const position = tab.position().sub(viewport.topLeft());
  tab.position(() => viewport.topLeft().add(position));

  viewport.stroke(theme.game).fill(theme.game);
  parent.add(clone);
  clone.moveToBottom();
  const lerp = Vector2.createArcLerp(true, 2);
  yield* all(
    panels.right().margin.right(-560, 0.6),
    panels.assets().margin.bottom(-340, 0.6),
    panels.appbar().opacity(0, 0.6),
    tab.opacity(0, 0.6),
    tab.height(0, 0.6),
    tab.padding([0, 40], 0.6),
    viewport.size([840, 640], 0.6, easeInOutCubic, lerp),
    viewport.position([0, 0], 0.6, easeInOutCubic, lerp),
    viewport.fill(theme.window, 0.6),
    ripple().fill(theme.window, 0.6),
    viewport.stroke(theme.window, 0.6),
    viewport.lineWidth(16, 0.6),
    buttons().height(40 - 8, 0.6),
    buttons().padding.bottom(10, 0.6),
  );
  outline().remove();

  yield* waitUntil('external');
  const random = useRandom();
  const windows = createRefArray<Window>();
  const papers = createRefArray<Rect>();
  const subtheme = {
    ...theme,
    window: theme.stroke,
  };
  view.add(
    <Layout
      layout
      padding={40 + 8}
      gap={40 + 16}
      size={'100%'}
      direction={'column'}
    >
      <Layout grow={1} gap={160} alignItems={'center'}>
        <Window ref={windows} theme={subtheme} height={'100%'} width={480}>
          <Rect size={'100%'} radius={theme.radius} clip fill={theme.bg}>
            <Tetrahedron
              size={'100%'}
              radius={3}
              orbit={40}
              grid={theme.bgDark}
              lineWidth={8}
              stroke={theme.stroke}
            />
          </Rect>
        </Window>
        <Paper ref={papers} width={180} height={240} fill={theme.bg}>
          <Tetrahedron
            size={'100%'}
            radius={1.4}
            orbit={30}
            lineWidth={8}
            stroke={theme.stroke}
          />
        </Paper>
      </Layout>
      <Layout grow={1} gap={160} alignItems={'center'}>
        <Window ref={windows} theme={subtheme} height={'100%'} width={480}>
          <Rect
            size={'100%'}
            radius={theme.radius}
            clip
            alignItems={'center'}
            fill={theme.bgDark}
          >
            <Rect fill={theme.bg} width={'100%'} height={'60%'}>
              <Line
                layout={false}
                lineWidth={8}
                stroke={theme.stroke}
                points={range(-20, 21).map(i => {
                  const x = i * 8;
                  const scale = Math.cos((i * Math.PI) / 20) + 1;
                  let y = random.nextInt(2, 20) * scale;
                  if (i % 2 === 0) {
                    y *= -1;
                  }

                  if (i == -20) {
                    return [-400, 0];
                  }

                  if (i == 20) {
                    return [400, 0];
                  }

                  return [x, y];
                })}
              />
            </Rect>
          </Rect>
        </Window>
        <Paper ref={papers} width={180} height={240} fill={theme.bg}>
          <Path
            layout={false}
            fill={theme.stroke}
            scale={0.1}
            x={-48}
            y={48 + 10}
            data="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"
          />
        </Paper>
      </Layout>
      <Layout grow={1} gap={160} alignItems={'center'}>
        <Window ref={windows} theme={subtheme} height={'100%'} width={480}>
          <Rect size={'100%'} radius={theme.radius} clip fill={theme.bg}>
            <Grid
              layout={false}
              x={5}
              y={5}
              width={640}
              height={320}
              lineWidth={10}
              stroke={theme.bgDark}
              spacing={20}
              lineDashOffset={15}
              lineDash={[10, 10]}
            />
            <Img
              layout={false}
              src={jeff}
              smoothing={false}
              scale={10}
              x={720}
              y={1060}
            />
          </Rect>
        </Window>
        <Paper ref={papers} width={180} height={240} fill={theme.bg}>
          <Path
            layout={false}
            fill={theme.stroke}
            scale={0.1}
            x={-48}
            y={48 + 10}
            data="M176-120q-19-4-35.5-20.5T120-176l664-664q21 5 36 20.5t21 35.5L176-120Zm-56-252v-112l356-356h112L120-372Zm0-308v-80q0-33 23.5-56.5T200-840h80L120-680Zm560 560 160-160v80q0 33-23.5 56.5T760-120h-80Zm-308 0 468-468v112L484-120H372Z"
          />
        </Paper>
      </Layout>
    </Layout>,
  );

  const arrows = createRefArray<Ray>();
  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];
    const paper = papers[i];
    window
      .parent()
      .add(
        <Ray
          ref={arrows}
          layout={false}
          from={window.right}
          to={paper.left}
          startOffset={28}
          endOffset={20}
          endArrow
          end={0}
          lineWidth={8}
          stroke={theme.stroke}
        />,
      );
    window.scale(0.9).opacity(0);
    paper.scale(0.9).opacity(0);
  }

  viewport.moveToTop();
  yield viewport.x(492, 0.6);
  yield* sequence(
    0.1,
    ...arrows.map((a, i) =>
      all(
        a.end(1, 0.6),
        windows[i].scale(1, 0.6),
        papers[i].scale(1, 0.6),
        windows[i].opacity(1, 0.6),
        papers[i].opacity(1, 0.6),
      ),
    ),
  );

  yield* waitUntil('question');
  yield all(viewport.scale(0.9, 0.6), viewport.opacity(0, 0.6));
  yield* sequence(
    0.1,
    ...arrows.map((a, i) =>
      all(
        a.start(1, 0.6),
        windows[i].scale(0.9, 0.6),
        papers[i].scale(0.9, 0.6),
        windows[i].opacity(0, 0.6),
        papers[i].opacity(0, 0.6),
      ),
    ),
  );

  const group = (
    <Node>
      <Paper
        ref={papers}
        width={180}
        height={240}
        fill={theme.bg}
        scale={0.9}
        opacity={0}
      >
        <Path
          layout={false}
          fill={theme.stroke}
          scale={0.1}
          x={-48}
          y={48 + 10}
          data="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"
        />
      </Paper>
    </Node>
  );
  view.add(group);
  yield group.scale(2, 20, linear);
  yield* all(papers.at(-1).opacity(1, 0.6), papers.at(-1).scale(1, 0.6));

  yield* waitUntil('next');
  finishScene();
  yield* all(
    papers.at(-1).opacity(0, 0.6),
    papers.at(-1).scale(0.9, 0.6),
    view.fill(null, 0.6),
  );
});

function fromTo(a: Node, b: Node, value: SignalValue<PossibleVector2>) {
  return modify(value, v => {
    const world = a.worldToParent().inverse().transformPoint(new Vector2(v));
    return b.worldToLocal().transformPoint(world);
  });
}
