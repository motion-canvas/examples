import {Node, Rect, RectProps} from '@motion-canvas/2d/lib/components';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {BBox, Vector2} from '@motion-canvas/core/lib/types';
import {drawImage} from '@motion-canvas/2d/lib/utils';
import {computed, initial, signal} from '@motion-canvas/2d/lib/decorators';
import {getContext} from '@motion-canvas/core/lib/utils';

export interface CanvasSourceProps extends RectProps {
  src?: SignalValue<Node>;
  factor?: SignalValue<number>;
  ratio?: SignalValue<number>;
  smoothing?: SignalValue<boolean>;
}

export class Upscale extends Rect {
  @initial(true)
  @signal()
  public declare readonly smoothing: SimpleSignal<boolean, this>;

  @initial(null)
  @signal()
  public declare readonly src: SimpleSignal<Node, this>;

  @initial(1)
  @signal()
  public declare readonly factor: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly ratio: SimpleSignal<number, this>;

  public constructor(props: CanvasSourceProps) {
    super(props);
  }

  @computed()
  protected srcCanvas() {
    return getContext();
  }

  @computed()
  protected drawnSrcCanvas() {
    const context = this.srcCanvas();
    const size = this.size().scale(this.ratio());
    const factor = 1 / this.factor();
    context.canvas.width = size.width * factor;
    context.canvas.height = size.height * factor;
    context.save();
    context.scale(factor, factor);
    this.src()?.draw(context);
    context.restore();

    return context;
  }

  protected override draw(context: CanvasRenderingContext2D) {
    this.drawShape(context);
    if (this.clip()) {
      context.clip(this.getPath());
    }
    const size = this.size();
    if (!size.equals(Vector2.zero)) {
      const src = this.drawnSrcCanvas();
      const box = BBox.fromSizeCentered(this.computedSize());
      context.save();
      context.imageSmoothingEnabled = this.smoothing();
      drawImage(context, src.canvas, box);
      context.restore();
    }

    this.drawChildren(context);
  }
}
