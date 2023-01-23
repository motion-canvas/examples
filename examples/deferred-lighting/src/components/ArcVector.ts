import {
  computed,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import {Vector2, Vector2Signal} from '@motion-canvas/core/lib/types';
import {VectorBase, VectorBaseProps} from './VectorBase';
import {SimpleSignal} from '@motion-canvas/core/lib/signals';

export interface ArcVectorProps extends VectorBaseProps {
  counter?: boolean;
  x?: number;
  y?: number;
  position?: Vector2;
  from?: number;
  to?: number;
  radius?: number;
}

export class ArcVector extends VectorBase {
  @initial(false)
  @signal()
  public declare readonly counter: SimpleSignal<boolean, this>;

  @initial(0)
  @signal()
  public declare readonly from: SimpleSignal<number, this>;

  @initial(90)
  @signal()
  public declare readonly to: SimpleSignal<number, this>;

  @initial(100)
  @signal()
  public declare readonly radius: SimpleSignal<number, this>;

  @vector2Signal()
  public declare readonly position: Vector2Signal<this>;

  @computed()
  public length(): number {
    const to = this.to();
    const from = this.from();

    let angle = to - from;
    angle %= 360;
    if (angle < 0) {
      angle += 360;
    }

    const radius = this.radius();

    return (Math.PI * radius * radius * angle) / 360;
  }

  public constructor(props: ArcVectorProps) {
    super(props);
  }

  @computed()
  public center(): Vector2 {
    const angle = (this.to() - this.from()) / 2;
    return Vector2.fromRadians((angle / 180) * Math.PI).scale(this.radius());
  }

  public override localToParent(): DOMMatrix {
    return new DOMMatrix([1, 0, 0, 1, this.position.x(), this.position.y()]);
  }

  protected override draw(context: CanvasRenderingContext2D) {
    context.save();
    this.applyStyle(context);
    const startArrow = this.startArrow();
    const endArrow = this.endArrow();
    const startOffset = this.startOffset();
    const endOffset = this.endOffset();
    let start = this.start();
    let end = this.end();

    if (end < start) {
      [end, start] = [start, end];
    }

    const counter = this.counter();
    const radius = this.radius();
    let from = (this.from() / 180) * Math.PI;
    let to = (this.to() / 180) * Math.PI;

    from += counter ? startOffset / -radius : startOffset / radius;
    to -= counter ? endOffset / -radius : endOffset / radius;

    let angle = to - from;
    to = from + angle * end;
    from = from + angle * start;
    angle = to - from;

    if (angle !== 0) {
      const arrowSize = Math.min(
        this.arrowSize(),
        (Math.abs(angle) * radius) / 2,
      );
      let arrowDistance = arrowSize / radius;
      if (counter) {
        arrowDistance *= -1;
      }

      context.beginPath();
      context.arc(
        0,
        0,
        radius,
        from + (startArrow ? arrowDistance : 0),
        to - (endArrow ? arrowDistance : 0),
        counter,
      );
      context.stroke();

      if (startArrow) {
        const direction = Vector2.fromRadians(from).scale(radius);
        const arrow = Vector2.fromRadians(
          from + arrowDistance / 2,
        ).perpendicular.scale(counter ? arrowSize : -arrowSize);

        this.drawArrow(context, direction, arrow);
      }

      if (endArrow) {
        const direction = Vector2.fromRadians(to).scale(radius);
        const arrow = Vector2.fromRadians(
          to - arrowDistance / 2,
        ).perpendicular.scale(counter ? -arrowSize : arrowSize);

        this.drawArrow(context, direction, arrow);
      }
    }

    context.restore();
    super.draw(context);
  }
}
