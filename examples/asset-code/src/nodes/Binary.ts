import {initial, Shape, ShapeProps, vector2Signal} from '@motion-canvas/2d';
import {
  clampRemap,
  createSignal,
  loop,
  PossibleVector2,
  Random,
  SignalValue,
  spawn,
  usePlayback,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core';

export interface BinaryProps extends ShapeProps {
  reveal: SignalValue<PossibleVector2>;
}

export class Binary extends Shape {
  @initial(0)
  @vector2Signal()
  public declare readonly reveal: Vector2Signal<this>;

  private progress = createSignal(0);

  public constructor(props: BinaryProps) {
    super(props);
    spawn(
      loop(() => {
        this.progress(this.progress() + usePlayback().deltaTime);
      }),
    );
  }

  protected draw(context: CanvasRenderingContext2D) {
    this.requestFontUpdate();

    context.save();
    this.applyStyle(context);
    this.applyText(context);
    context.font = this.styles.font;
    context.textBaseline = 'top';
    const size = this.computedSize();
    context.translate(size.x / -2, size.y / -2);
    const char = new Vector2(50, 80);
    const steps = size.div(char).ceiled;
    const random = new Random(1);
    const progress = this.progress();
    const reveal = this.reveal();
    for (let x = -1; x <= steps.x; x++) {
      const array = random.floatArray(steps.y);
      for (let y = -1; y <= steps.y; y++) {
        const cycles = Math.floor(progress);
        let zero: number;
        let charY: number;
        charY = char.y * (y + 1 - (progress % 1));
        zero = array[(y + cycles) % steps.y] > 0.5 ? 1 : 0;
        const position = new Vector2(x, y + 1)
          .sub(steps.div(2))
          .div(steps.x).magnitude;
        // context.globalAlpha = ((y + 1) / steps.y) > reveal.y ? 0 : 1;
        // context.globalAlpha *= x / steps.x > reveal.x ? 0 : 1;
        context.globalAlpha = clampRemap(
          -0.05,
          0.05,
          0,
          1,
          reveal.x - position,
        );
        context.fillText(zero > 0.5 ? '1' : '0', char.x * x, charY);
      }
    }

    context.restore();
  }
}
