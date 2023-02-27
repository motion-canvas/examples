import {
  Circle,
  Layout,
  LayoutProps,
  Rect,
} from '@motion-canvas/2d/lib/components';
import {ColorSignal} from '@motion-canvas/core/lib/types';
import {colorSignal, initial, signal} from '@motion-canvas/2d/lib/decorators';
import {makeRef} from '@motion-canvas/core/lib/utils';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {map} from '@motion-canvas/core/lib/tweening';

export interface SliderProps extends LayoutProps {
  value?: SignalValue<number>;
  highlight?: SignalValue<number>;
  color?: SignalValue<string>;
}

export class Slider extends Layout {
  @initial(0)
  @signal()
  public declare readonly value: SimpleSignal<number, this>;

  @initial('white')
  @colorSignal()
  public declare readonly color: ColorSignal<this>;

  @initial(0)
  @signal()
  public declare readonly highlight: SimpleSignal<number, this>;

  public readonly handle: Circle;
  public readonly handleHighlight: Circle;
  public readonly track: Rect;
  public readonly activeTrack: Rect;

  public constructor(props?: SliderProps) {
    super({
      layout: true,
      ...props,
    });

    this.add(
      <Rect
        ref={makeRef(this, 'track')}
        height={0}
        width="100%"
        stroke="rgba(255, 255, 255, 0.16)"
        lineWidth={8}
        lineJoin="round"
        marginLeft={4}
        marginRight={4}
      >
        <Rect
          ref={makeRef(this, 'activeTrack')}
          height={0}
          stroke="blue"
          lineWidth={8}
          lineJoin="round"
        />
        <Circle
          layout={false}
          ref={makeRef(this, 'handleHighlight')}
          width={60}
          height={60}
        >
          <Circle ref={makeRef(this, 'handle')} width={30} height={30} />
        </Circle>
      </Rect>,
    );

    this.handleHighlight.size(() => map(20, 60, this.highlight()));
    this.handleHighlight.position.x(() => this.size.x() * (this.value() - 0.5));
    this.handleHighlight.fill(() =>
      this.color().alpha(map(0, 0.2, this.highlight())),
    );

    this.handle.fill(this.color);

    this.activeTrack.stroke(this.color);
    this.activeTrack.size.x(() => `${this.value() * 100}%`);
  }

  protected draw(context: CanvasRenderingContext2D) {
    super.draw(context);
  }
}
