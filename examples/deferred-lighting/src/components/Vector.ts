import {computed, vector2Signal} from '@motion-canvas/2d/lib/decorators';
import {
  PossibleVector2,
  BBox,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';
import {VectorBase, VectorBaseProps} from './VectorBase';
import {SignalValue} from '@motion-canvas/core/lib/signals';

export interface VectorProps extends VectorBaseProps {
  from?: SignalValue<PossibleVector2>;
  fromX?: SignalValue<number>;
  fromY?: SignalValue<number>;
  to?: SignalValue<PossibleVector2>;
  toX?: SignalValue<number>;
  toY?: SignalValue<number>;
}

export class Vector extends VectorBase {
  @vector2Signal('from')
  public declare readonly from: Vector2Signal<this>;

  @vector2Signal('to')
  public declare readonly to: Vector2Signal<this>;

  @computed()
  public length(): number {
    return this.from().sub(this.to()).magnitude;
  }

  public constructor(props: VectorProps) {
    super(props);
  }

  public override localToParent(): DOMMatrix {
    const to = this.to();
    const from = this.from();

    const direction = to.sub(from).normalized;
    const center = from.add(to).scale(0.5);

    return new DOMMatrix([
      direction.x,
      direction.y,
      -direction.y,
      direction.x,
      center.x,
      center.y,
    ]);
  }

  protected override draw(context: CanvasRenderingContext2D) {
    context.save();
    this.applyStyle(context);
    const length = this.length();
    const startArrow = this.startArrow();
    const endArrow = this.endArrow();
    const startOffset = this.startOffset();
    const endOffset = this.endOffset();
    let start = this.start();
    let end = this.end();

    if (end < start) {
      [end, start] = [start, end];
    }

    let startDistance = length / -2 + startOffset;
    let endDistance = length / 2 - endOffset;
    let distance = endDistance - startDistance;
    endDistance = startDistance + distance * end;
    startDistance = startDistance + distance * start;
    distance = endDistance - startDistance;

    const arrowSize = Math.min(this.arrowSize(), distance / 2);
    context.lineWidth = Math.min(this.lineWidth(), distance / 2);

    if (distance > 0) {
      context.beginPath();
      context.moveTo(startDistance + (startArrow ? arrowSize : 0), 0);
      context.lineTo(endDistance - (endArrow ? arrowSize : 0), 0);
      context.stroke();

      if (startArrow) {
        this.drawArrow(
          context,
          new Vector2(startDistance, 0),
          Vector2.right.scale(arrowSize),
        );
      }

      if (endArrow) {
        this.drawArrow(
          context,
          new Vector2(endDistance, 0),
          Vector2.left.scale(arrowSize),
        );
      }
    }

    context.restore();
    super.draw(context);
  }

  protected getCacheRect(): BBox {
    const length = this.length();
    const arrowSize = (this.arrowSize() * 2) / 1.415;
    return new BBox(length / -2, arrowSize / -2, length, arrowSize);
  }
}
