import {Node, NodeProps} from '@motion-canvas/2d/lib/components';
import {
  CanvasStyleSignal,
  canvasStyleSignal,
  initial,
  signal,
} from '@motion-canvas/2d/lib/decorators';
import {Vector2} from '@motion-canvas/core/lib/types';
import {PossibleCanvasStyle} from '@motion-canvas/2d/lib/partials';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {resolveCanvasStyle} from '@motion-canvas/2d/lib/utils';

export interface VectorBaseProps extends NodeProps {
  startArrow?: SignalValue<boolean>;
  endArrow?: SignalValue<boolean>;
  start?: SignalValue<number>;
  end?: SignalValue<number>;
  startOffset?: SignalValue<number>;
  endOffset?: SignalValue<number>;
  arrowSize?: SignalValue<number>;
  stroke?: SignalValue<PossibleCanvasStyle>;
  lineWidth?: SignalValue<number>;
  lineJoin?: SignalValue<CanvasLineJoin>;
  lineCap?: SignalValue<CanvasLineCap>;
  lineDash?: SignalValue<number>[];
  lineDashOffset?: SignalValue<number>;
}

export class VectorBase extends Node {
  @initial(false)
  @signal()
  public declare readonly startArrow: SimpleSignal<boolean, this>;
  @initial(true)
  @signal()
  public declare readonly endArrow: SimpleSignal<boolean, this>;
  @initial(0)
  @signal()
  public declare readonly start: SimpleSignal<number, this>;
  @initial(1)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;
  @initial(0)
  @signal()
  public declare readonly startOffset: SimpleSignal<number, this>;
  @initial(0)
  @signal()
  public declare readonly endOffset: SimpleSignal<number, this>;
  @initial(16)
  @signal()
  public declare readonly arrowSize: SimpleSignal<number, this>;
  @canvasStyleSignal()
  public declare readonly stroke: CanvasStyleSignal<this>;
  @initial(false)
  @signal()
  public declare readonly strokeFirst: SimpleSignal<boolean, this>;
  @initial(0)
  @signal()
  public declare readonly lineWidth: SimpleSignal<number, this>;
  @initial('round')
  @signal()
  public declare readonly lineJoin: SimpleSignal<CanvasLineJoin, this>;
  @initial('round')
  @signal()
  public declare readonly lineCap: SimpleSignal<CanvasLineCap, this>;
  @initial([])
  @signal()
  public declare readonly lineDash: SimpleSignal<number[], this>;
  @initial(0)
  @signal()
  public declare readonly lineDashOffset: SimpleSignal<number, this>;

  protected applyStyle(context: CanvasRenderingContext2D) {
    context.strokeStyle = context.fillStyle = resolveCanvasStyle(
      this.stroke(),
      context,
    );
    context.lineWidth = this.lineWidth();
    context.lineJoin = this.lineJoin();
    context.lineCap = this.lineCap();
    context.setLineDash(this.lineDash());
    context.lineDashOffset = this.lineDashOffset();
  }

  public constructor(props: VectorBaseProps) {
    super(props);
  }

  protected drawArrow(
    context: CanvasRenderingContext2D,
    position: Vector2,
    direction: Vector2,
  ) {
    const offset = direction.perpendicular.scale(1 / 1.415);
    const left = position.add(offset).add(direction);
    const right = position.add(offset.flipped).add(direction);

    context.beginPath();
    context.moveTo(position.x, position.y);
    context.lineTo(left.x, left.y);
    context.lineTo(right.x, right.y);
    context.closePath();
    context.fill();
  }
}
