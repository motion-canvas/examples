import {makeScene2D, Node} from '@motion-canvas/2d';
import {
  all,
  clamp,
  Color,
  createComputed,
  createRef,
  createSignal,
  delay,
  easeInOutExpo,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  finishScene,
  join,
  linear,
  loop,
  map,
  Matrix2D,
  spawn,
  Vector2,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {Binary, PlainCode} from '../nodes';
import shader from '../shaders/background.glsl';
import {CodeColors, DataColors} from '../styles';

export default makeScene2D(function* (view) {
  const data = createRef<Node>();
  const code = createRef<Node>();
  const dataContent = createRef<Node>();
  const codeContent = createRef<Node>();

  const order = createSignal(-1);
  const binaryAlpha = createSignal(-0.2);
  const rotation = createSignal(0);
  const rotationVector = createComputed(() => Vector2.fromDegrees(rotation()));
  const edge = createSignal(0);
  const morph = createSignal(0);
  const backgroundSd = createSignal(0);
  const background = Color.createSignal('#00000000');
  const shape = createSignal(0);

  const codeFill = Color.createSignal(CodeColors.main);
  const codeStroke = Color.createSignal(CodeColors.stroke);
  const codeBg = Color.createSignal(CodeColors.bg);
  const codeLine = createSignal(40);
  const dataFill = Color.createSignal(DataColors.main);
  const dataStroke = Color.createSignal(DataColors.stroke);
  const dataBg = Color.createSignal(DataColors.bg);
  const dataLine = createSignal(150);

  view.add(
    <>
      <Binary
        reveal={binaryAlpha}
        fontSize={80}
        fontWeight={700}
        fontFamily={'JetBrains Mono'}
        fill={'red'}
        size={'100%'}
        shaders={{
          fragment: shader,
          uniforms: {
            blur: 0.5,
            background,
            backgroundSd,
            shape,
            codeFill,
            codeStroke,
            codeBg,
            dataFill,
            dataStroke,
            dataBg,
            order,
            dataRadius: dataLine,
            codeRadius: codeLine,
            dataMatrix: () => new Matrix2D(data().worldToLocal()),
            codeMatrix: () => new Matrix2D(code().worldToLocal()),
            edge,
            morph,
          },
        }}
      />
      <Node>
        <Node ref={data} x={() => rotationVector().x * (view.width() / -4.3)} />
      </Node>
      <Node
        x={() => rotationVector().x * (view.width() / 4.3)}
        ref={node =>
          spawn(loop(() => node.rotation(0).rotation(360, 8, linear)))
        }
      >
        <Node ref={code} />
      </Node>
      <Node ref={dataContent}>
        <PlainCode
          fontSize={32}
          fill={'white'}
          code={`
       Data {
  number:    ,
  boolean:     ,
  array: [   ; 3]
}`}
        />
        <PlainCode
          fontSize={32}
          highlighter={null}
          fontWeight={700}
          fill={DataColors.main}
          code={`
struct       
          f32 
           bool 
          i32    
 `}
        />
      </Node>
      <Node ref={codeContent}>
        <PlainCode
          fontSize={32}
          fill={'white'}
          code={`
   code() {
       {
       !update() {
           ;
    } 
  }
}`}
        />
        <PlainCode
          fontSize={32}
          fontWeight={700}
          fill={CodeColors.main.brighten(0.6)}
          code={`
fn         
  loop  
    if            
      break 
          
     
 `}
        />
      </Node>
    </>,
  );

  dataContent().absolutePosition(data().absolutePosition);
  dataContent().absoluteScale(data().absoluteScale);
  dataContent().opacity(() => -rotationVector().y);
  codeContent().absolutePosition(code().absolutePosition);
  codeContent().absoluteScale(code().absoluteScale);
  codeContent().opacity(() => rotationVector().y);

  const dataY = createSignal(-40);
  const dataYScale = createSignal(1);
  data().y(() => dataY() * dataYScale());

  data().scale(0.0001).rotation(code().absoluteRotation);
  code().scale(0.0001);
  yield* waitFor(0.3);
  yield loop(() =>
    all(
      dataY(40, 2).back(2),
      dataLine(40, 2).back(2),
      code().rotation(0).rotation(120, 2, easeInOutExpo).wait(2),
      codeLine(150, 2).back(2),
    ),
  );

  yield* waitUntil('code');
  const taskCode = yield all(
    code().scale(1, 1.4, easeOutExpo),
    backgroundSd(500, 1.4, easeOutExpo),
  );

  yield* waitUntil('data');
  const taskData = yield all(
    data().scale(1, 1.4, easeOutExpo),
    edge(1, 1, easeOutCubic),
  );

  yield* join(taskCode, taskData);
  backgroundSd(10000);
  yield* waitUntil('zoom_code');
  data().scale(() => map(1, 0.2, rotationVector().y));
  code().scale(() => map(1, 0.2, -rotationVector().y));
  codeFill(() =>
    Color.lerp(
      CodeColors.main,
      CodeColors.stroke,
      clamp(0, 1, rotationVector().y),
    ),
  );
  dataFill(() =>
    Color.lerp(
      DataColors.main,
      DataColors.stroke,
      clamp(0, 1, rotationVector().y),
    ),
  );
  yield* all(rotation(90, 2), dataYScale(0, 2));
  codeFill(CodeColors.stroke);
  dataFill(DataColors.stroke);

  yield* waitUntil('zoom_data');
  yield delay(1, () => order(1));
  yield* rotation(270, 2);

  yield* waitUntil('zoom_out');
  codeFill(() =>
    Color.lerp(
      CodeColors.main,
      CodeColors.stroke,
      clamp(0, 1, -rotationVector().y),
    ),
  );
  dataFill(() =>
    Color.lerp(
      DataColors.main,
      DataColors.stroke,
      clamp(0, 1, -rotationVector().y),
    ),
  );
  yield* all(rotation(360, 2), dataYScale(1, 2));

  yield* waitUntil('binary');
  const mixBg = '#141414';
  const mixStroke = '#242424';
  const mixFill = '#aaa';
  order(0);
  const task = yield all(
    code().parent().x(0, 2),
    data().x(0, 2),
    morph(1, 2),
    dataBg(mixBg, 2),
    codeBg(mixBg, 2),
    dataStroke(mixStroke, 2),
    codeStroke(mixStroke, 2),
    dataFill(mixFill, 1.5),
    codeFill(mixFill, 1.5),
    dataYScale(0, 2),
  );

  yield* waitUntil('bits');
  yield binaryAlpha(1, 4);
  yield* join(task);

  yield* waitUntil('triangle');
  yield* all(
    shape(1, 1.6, easeOutElastic),
    dataBg(CodeColors.bg, 0.3),
    codeBg(CodeColors.bg, 0.3),
    dataStroke(CodeColors.stroke, 0.3),
    codeStroke(CodeColors.stroke, 0.3),
    dataFill(CodeColors.main, 0.3),
    codeFill(CodeColors.main, 0.3),
  );

  yield* waitUntil('circle');
  yield* all(
    shape(-1, 1.6, easeOutElastic),
    dataBg(DataColors.bg, 0.3),
    codeBg(DataColors.bg, 0.3),
    dataStroke(DataColors.stroke, 0.3),
    codeStroke(DataColors.stroke, 0.3),
    dataFill(DataColors.main, 0.3),
    codeFill(DataColors.main, 0.3),
  );

  yield* waitUntil('useful');
  yield* all(
    morph(0, 2),
    code()
      .parent()
      .x(view.width() / 4.3, 2),
    data().x(view.width() / -4.3, 2),
    shape(0, 1),
    codeBg(CodeColors.bg, 2),
    codeStroke(CodeColors.stroke, 2),
    codeFill(CodeColors.main, 2),
    dataYScale(1, 2),
  );

  yield* waitUntil('hide');
  backgroundSd(640);
  background('#00000000');
  finishScene();
  yield* all(
    code().parent().y(view.height(), 2),
    data().parent().y(-view.height(), 2),
    backgroundSd(100, 2),
  );
});
