import {
  drawImage,
  Img,
  ImgProps,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d';
import {
  BBox,
  PossibleVector2,
  ReferenceReceiver,
  SignalValue,
  SimpleSignal,
  useThread,
  Vector2Signal,
} from '@motion-canvas/core';

export interface AtlasProps extends ImgProps {
  grid?: SignalValue<PossibleVector2>;
  gridX?: SignalValue<number>;
  gridY?: SignalValue<number>;
  index?: SignalValue<number>;
}

export function animate(
  from: number,
  length: number,
  duration: number = 0.1,
  ref?: ReferenceReceiver<Atlas>,
): ReferenceReceiver<Atlas> {
  const time = useThread().time;
  return atlas => {
    ref?.(atlas);
    atlas.index(() => {
      const frames = Math.round(time() / duration);
      return from + (frames % length);
    });
  };
}

export class Atlas extends Img {
  @initial(1)
  @vector2Signal('grid')
  public declare readonly grid: Vector2Signal<this>;

  @initial(0)
  @signal()
  public declare readonly index: SimpleSignal<number, this>;

  public constructor(props: AtlasProps) {
    super({
      smoothing: false,
      ...props,
    });
  }

  protected draw(context: CanvasRenderingContext2D) {
    this.drawShape(context);
    const alpha = this.alpha();
    if (alpha > 0) {
      const box = BBox.fromSizeCentered(this.computedSize());
      context.save();
      context.clip(this.getPath());
      if (alpha < 1) {
        context.globalAlpha *= alpha;
      }
      context.imageSmoothingEnabled = this.smoothing();
      const image = this.image();
      const grid = this.grid();
      const width = image.naturalWidth / grid.x;
      const height = image.naturalHeight / grid.y;
      const index = this.index();
      const x = index % grid.x;
      const y = Math.floor(index / grid.x);
      const source = new BBox(x * width, y * height, width, height);

      drawImage(context, this.image(), source, box);
      context.restore();
    }

    if (this.clip()) {
      context.clip(this.getPath());
    }

    this.drawChildren(context);
  }
}
