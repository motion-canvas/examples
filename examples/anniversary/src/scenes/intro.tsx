import {
  Circle,
  Gradient,
  Img,
  Layout,
  makeScene2D,
  Rect,
  Node,
  Txt,
  blur,
} from '@motion-canvas/2d';
import {
  all,
  chain,
  Color,
  createRef,
  createRefMap,
  createSignal,
  delay,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  linear,
  useDuration,
  Vector2,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import Videos from '../videos';
import Commits from '../commits.json';
import oldSrc from '../images/old.png';
import currentSrc from '../images/current.png';
import fullSrc from '../images/fullscreen.png';

const COMMIT_REGEX = /^(\w+)(\(.+\))?!?: ([^(\[]+)/;

export default makeScene2D(function* (view) {
  view.fontFamily('Roboto').fontSize(40);

  const labels = createRefMap<Txt>();
  const card = createRef<Rect>();
  const preview = createRef<Rect>();
  const videoCard = createRef<Rect>();
  const avatar = createRef<Img>();
  const backgrounds = createRef<Node>();

  const previewSize = view.size().sub(160);
  const backgroundFrom = Color.createSignal('rgba(85,88,218,1)');
  const backgroundTo = Color.createSignal('rgba(95,209,249,1)');
  const themeColor = Color.createSignal(backgroundTo());
  const imageMask = createRef<Circle>();

  view.fill(
    new Gradient({
      type: 'linear',
      from: view.size().scale(-0.5),
      to: view.size().scale(0.5),
      stops: [
        {offset: 0, color: backgroundFrom},
        {offset: 1, color: backgroundTo},
      ],
    }),
  );

  view.add(
    <Rect
      ref={preview}
      size={previewSize}
      radius={20}
      direction={'column'}
      justifyContent={'end'}
      clip
      // cache
    >
      <Node ref={backgrounds}>
        <Img src={currentSrc} width={previewSize.width} />
        <Node cache>
          <Img src={oldSrc} width={previewSize.width} />
          <Circle
            fill={'red'}
            ref={imageMask}
            scale={0}
            position={previewSize.scale(-0.5)}
            size={previewSize.magnitude * 2}
            compositeOperation={'destination-out'}
          />
        </Node>
      </Node>
      <Circle
        opacity={0}
        stroke={'black'}
        lineWidth={20}
        position={previewSize.scale(-0.5)}
        size={() => previewSize.magnitude * 2 * imageMask().scale.x()}
        filters={[blur(20)]}
      />
      <Rect
        ref={card}
        height={450}
        width={800}
        fill={'#141414'}
        radius={4}
        direction={'column'}
        clip
        layout
        padding={40}
        gap={40}
      >
        <Rect
          size={'100%'}
          fill={'white'}
          layout={false}
          compositeOperation={'destination-out'}
        />
        <Layout layout={false}>
          <Txt
            ref={labels.thanks}
            opacity={0}
            textAlign={'center'}
            width={600}
            fill={'rgba(255,255,255,0.6)'}
          >
            <Txt.b
              fill={
                new Gradient({
                  type: 'linear',
                  fromX: -210,
                  fromY: -10,
                  toX: 110,
                  toY: 10,
                  stops: [
                    {offset: 0, color: 'rgb(220,74,95)'},
                    {offset: 1, color: 'rgb(255, 148, 114)'},
                  ],
                })
              }
            >
              THANK YOU
            </Txt.b>
            {'\n'}
            <Txt>for an amazing year!</Txt>
          </Txt>
        </Layout>
        <Layout justifyContent={'space-between'}>
          <Txt ref={labels.date} fill={'rgba(255,255,255,0.5)'}>
            February 4, 2023
          </Txt>
          <Txt fontFamily={'JetBrains Mono'} textAlign={'end'}>
            <Txt fill={'rgba(255,255,255,0.5)'} ref={labels.prefix}>
              &nbsp;&nbsp;
            </Txt>
            <Txt fill={backgroundTo} ref={labels.version}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Txt>
          </Txt>
        </Layout>
        <Txt textWrap fill={'white'}>
          <Txt fill={backgroundTo} ref={labels.type} />
          <Txt ref={labels.message} />
        </Txt>
        <Layout grow={1} />
        <Rect ref={videoCard} gap={20} alignItems={'center'}>
          <Img
            ref={avatar}
            size={80}
            radius={240}
            src={'https://avatars.githubusercontent.com/u/64662184?v=4'}
          />
          <Layout direction={'column'}>
            <Txt ref={labels.author} fill={'white'}>
              aarthificial
            </Txt>
            <Txt
              ref={labels.title}
              fontSize={32}
              fill={'rgba(255,255,255,0.5)'}
            />
          </Layout>
        </Rect>
      </Rect>
    </Rect>,
  );

  yield avatar().src.context;

  const cardSize = card().size();
  const cardPosition = new Vector2(20, -125);
  preview().size(cardSize).height(0);

  yield* all(
    preview().height(cardSize.height, 0.6, easeInOutCubic),
    card()
      .y(-cardSize.height / 2)
      .y(0, 0.6, easeInOutCubic),
  );

  yield* all(
    labels.message().text('Motion Canvas is now Open Source!', 0.5),
    chain(
      waitFor(0.2),
      labels.prefix().text('v.', 0.05, linear),
      labels.version().text('2.0.0', 0.1, easeOutCubic),
    ),
  );

  yield* waitUntil('commits');

  const transition = useDuration('transition');
  yield chain(
    waitFor(2),
    all(
      preview().size(previewSize, 1.2, easeInOutCubic, Vector2.arcLerp),
      card().position(
        cardPosition,
        1.2,
        easeInOutCubic,
        Vector2.createArcLerp(false, cardSize.sub(previewSize).ctg),
      ),
    ),
    waitFor(0.2),
    all(
      backgroundFrom('rgb(255, 148, 114)', transition, easeOutCubic),
      backgroundTo('rgb(220,74,95)', transition, easeInCubic),
      themeColor('rgb(220,74,95)', transition),
      imageMask().scale(1, transition, linear),
    ),
  );

  const duration = createSignal(0.5);
  yield duration(1 / 60, 9.6, easeOutCubic);

  for (let i = Commits.length - 1; i >= 0; i--) {
    const commit = Commits[i];
    const match = COMMIT_REGEX.exec(commit.message);
    if (!match) continue;
    const [, type, scope, header] = match;

    const time = duration();

    labels.author().text(commit.raw.author?.login);
    yield avatar().src(commit.avatar ?? null).src.context;
    labels.type().text(type);

    if (type === 'ci' && scope === '(release)') {
      labels.version().text(header);
      labels.message().text(`: release ${header}`);
    } else {
      labels.message().text(': ' + header);
    }
    labels.date().text(parseDate(commit.date));
    yield* waitFor(time);
  }

  backgrounds()
    .position(cardPosition)
    .children()
    .forEach(node => node.position(cardPosition.flipped));
  backgrounds().scale(() => card().width() / cardSize.width);

  yield* waitUntil('zoom-in');
  videoCard().fill('#141414').radius(120).alignSelf('start').padding.right(80);

  labels.title().height(38).margin.top(-38);
  yield all(
    preview().size(view.size(), 0.3),
    preview().radius(0, 0.3),
    card().size(view.size(), 0.4),
    card().radius(0, 0.4),
    card().position(0, 0.4),
    card().fill('blue', 0.4),
    avatar().size(100, 0.4),
    videoCard().padding([20, 80, 20, 20], 0.4),
    labels.title().margin.bottom(-8, 0.4),
    labels.title().margin.top(0, 0.4),
    labels.date().opacity(0, 0.2),
    labels.message().opacity(0, 0.2),
    labels.prefix().opacity(0, 0.2),
    labels.version().opacity(0, 0.2),
    labels.type().opacity(0, 0.2),
  );
  const clipTransition = 0.3;
  for (let i = 0; i < Videos.length; i++) {
    const video = Videos[i];
    yield* waitUntil(`video-${i}`);
    yield videoCard().fill(
      video.color === undefined ? '#141414' : video.color,
      clipTransition,
    );
    yield labels.title().text(video.title, clipTransition);
    yield labels.author().childAs<Txt>(0).text(video.channel, clipTransition);
    yield* avatar()
      .rotation(0)
      .rotation(90, clipTransition / 2, easeInCubic);
    yield avatar().src(video.avatar).src.context;
    yield* avatar()
      .rotation(-90)
      .rotation(0, clipTransition / 2, easeOutCubic);
    yield* waitFor(clipTransition / 2);
  }

  yield* waitUntil('return');
  backgrounds().childAs<Img>(0).src(fullSrc).size(view.size());
  yield* all(
    card().size(cardSize, 0.6),
    card().radius(4, 0.6),
    card().position(cardPosition, 0.6),
    videoCard().opacity(0, 0.3),
    delay(0.3, labels.thanks().opacity(1, 0.3)),
  );

  yield* waitUntil('next');
});

function parseDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }

  const month = date.toLocaleString('default', {month: 'long'});
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}
