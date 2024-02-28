import {
  Code,
  CodeProps,
  FunctionComponent,
  Layout,
  Node,
  PossibleCodeScope,
  Rect,
  RectProps,
  Txt,
} from '@motion-canvas/2d';
import {
  createSignal,
  makeRef,
  makeRefs,
  SignalValue,
  SimpleSignal,
} from '@motion-canvas/core';
import {ATxt} from './ATxt';
import {RSCode} from './Code';

export function createPageRef() {
  return makeRefs<typeof Page>();
}

export function Page({
  refs,
  code,
  label,
  theme,
  badge,
  component = RSCode,
  lineHeight = '150%',
  ...props
}: RectProps & {
  code: SignalValue<PossibleCodeScope>;
  component?: FunctionComponent<CodeProps>;
  label?: SignalValue<string>;
  badge?: SignalValue<string>;
  theme: {
    bg: string;
    bgDark: string;
    radius: number;
  };
  refs: {
    rect: Rect;
    inner: Rect;
    code: Code;
    wrapper: Node;
    badge: Txt;
    scroll: SimpleSignal<number>;
  };
}) {
  refs.scroll = createSignal(0);
  const CodeComponent = component;

  return (
    <Rect
      fill={theme.bg}
      radius={theme.radius}
      layout
      padding={40}
      height={1080 - 80}
      direction={'column'}
      clip
      {...props}
      ref={makeRef(refs, 'rect')}
    >
      <Node ref={makeRef(refs, 'wrapper')}>
        <Layout justifyContent={'space-between'}>
          <ATxt text={label} />
          {badge && <ATxt text={badge} ref={makeRef(refs, 'badge')} />}
        </Layout>
        <Rect fill={theme.bgDark} height={8} shrink={0} margin={[40, -40]} />
        <Rect grow={1} clip ref={makeRef(refs, 'inner')}>
          <Layout layout={false} position={() => refs.inner.size().scale(-0.5)}>
            <CodeComponent
              ref={makeRef(refs, 'code')}
              offset={-1}
              y={refs.scroll}
              lineHeight={lineHeight}
              code={code}
            />
          </Layout>
        </Rect>
      </Node>
    </Rect>
  );
}
