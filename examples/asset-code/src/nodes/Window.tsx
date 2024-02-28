import {Layout, Ray, Rect, RectProps} from '@motion-canvas/2d';
import {Color, makeRef, PossibleColor} from '@motion-canvas/core';

export interface WindowProps extends RectProps {
  theme: WindowTheme;
}

export interface WindowTheme {
  window?: PossibleColor;
  buttons?: PossibleColor;
}

export class Window extends Rect {
  public readonly inner: Layout;

  public constructor({children, theme = {}, direction, ...props}: WindowProps) {
    super({
      layout: true,
      clip: true,
      direction: 'column',
      radius: 8,
      fill: theme.window,
      stroke: theme.window,
      lineWidth: 16,
      strokeFirst: true,
      shadowBlur: 80,
      ...props,
    });

    this.add(
      <>
        <Rect
          height={40}
          marginTop={-8}
          width={'100%'}
          padding={[0, 6]}
          shrink={0}
          justifyContent={'end'}
          zIndex={100}
        >
          <Buttons value={theme.buttons} />
        </Rect>
        <Layout
          direction={direction}
          size={'100%'}
          ref={makeRef(this, 'inner')}
        >
          {children}
        </Layout>
      </>,
    );
  }
}

export function Buttons({value}: {value: PossibleColor}) {
  const buttonColor = new Color(value);
  const color = buttonColor.alpha(1);
  const alpha = buttonColor.alpha();

  return (
    <>
      <Layout height={'100%'} width={40} opacity={alpha}>
        <Ray
          layout={false}
          fromX={-10}
          toX={10}
          y={6}
          lineWidth={4}
          stroke={color}
        />
      </Layout>
      <Layout height={'100%'} width={40} opacity={alpha}>
        <Rect
          layout={false}
          width={16}
          height={12}
          lineWidth={4}
          stroke={color}
        />
      </Layout>
      <Layout height={'100%'} width={40} opacity={alpha}>
        <Ray layout={false} from={-8} to={8} lineWidth={4} stroke={color} />
        <Ray
          layout={false}
          from={-8}
          to={8}
          lineWidth={4}
          stroke={color}
          rotation={90}
        />
      </Layout>
    </>
  );
}
