import {Node, NodeProps} from '@motion-canvas/2d/lib/components/Node';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {initial, signal} from '@motion-canvas/2d/lib/decorators';
import {BBox, Vector2} from '@motion-canvas/core/lib/types';

export interface RepeaterProps extends NodeProps {
  children: Node;
  copies?: SignalValue<number>;
  start?: SignalValue<number>;
}

export class Repeater extends Node {
  @initial(1)
  @signal()
  public declare readonly copies: SimpleSignal<number, this>;

  @initial(0)
  @signal()
  public declare readonly start: SimpleSignal<number, this>;

  public constructor(props: RepeaterProps) {
    super(props);
  }

  public override cacheBBox(): BBox {
    const cache = this.getCacheBBox();

    const points: Vector2[] = cache.corners;

    const child = this.children()[0];
    const childCache: BBox = (child as any).fullCacheBBox();
    const matrix = child.localToParent();
    const inverse = matrix.inverse();
    const current = new DOMMatrix();

    const offset = this.start();
    for (let i = offset; i <= 0; i++) {
      current.multiplySelf(inverse);
    }

    for (let i = 1; i < offset; i++) {
      current.multiplySelf(matrix);
    }

    for (let i = 0; i < this.copies(); i++) {
      points.push(...childCache.corners.map(r => r.transformAsPoint(current)));
      current.multiplySelf(matrix);
    }

    return BBox.fromPoints(...points);
  }

  protected override drawChildren(context: CanvasRenderingContext2D) {
    const child = this.children()[0];
    const matrix = child.localToParent();
    const inverse = matrix.inverse();

    const offset = this.start();
    for (let i = offset; i <= 0; i++) {
      context.transform(
        inverse.a,
        inverse.b,
        inverse.c,
        inverse.d,
        inverse.e,
        inverse.f,
      );
    }

    for (let i = 1; i < offset; i++) {
      context.transform(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f,
      );
    }

    for (let i = 0; i < this.copies(); i++) {
      child.render(context);
      context.transform(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f,
      );
    }
  }
}
