import {Shape, ShapeConfig} from 'konva/lib/Shape';
import type {Context} from 'konva/lib/Context';
import type {GetSet} from 'konva/lib/types';
import {getset, KonvaNode} from '@motion-canvas/core/lib/decorators';
import {CanvasHelper} from '@motion-canvas/core/lib/helpers';

interface TimelineConfig extends ShapeConfig {
  frames?: number;
  density?: number;
  playhead?: number;
}

@KonvaNode({centroid: false})
export class Timeline extends Shape {
  @getset(100)
  public frames: GetSet<TimelineConfig['frames'], this>;
  @getset(10)
  public density: GetSet<TimelineConfig['density'], this>;
  @getset(0)
  public playhead: GetSet<TimelineConfig['playhead'], this>;

  public constructor(config: ShapeConfig) {
    super(config);
  }

  public _sceneFunc(context: Context) {
    const size = this.getLayoutSize();
    const frames = this.frames();
    const density = this.density();
    const playhead = this.playhead() / frames;
    const length = size.width - 80;

    context.beginPath();
    for (let i = 0; i <= frames; i += density) {
      context.moveTo((i / frames) * length + 40, 40);
      context.lineTo((i / frames) * length + 40, size.height);
    }
    context._context.lineWidth = 2;
    context._context.strokeStyle = '#080808';
    context.stroke();

    for (let i = density / 2; i <= frames; i += density) {
      context.moveTo((i / frames) * length + 40, 40);
      context.lineTo((i / frames) * length + 40, size.height);
    }
    context._context.lineWidth = 1;
    context.stroke();

    context._context.fillStyle = '#080808';
    context.fillRect(0, 0, size.width, 40);

    context._context.font = '20px JetBrains Mono';
    context._context.fillStyle = 'white';
    context._context.textBaseline = 'middle';
    context._context.textAlign = 'center';

    for (let i = 0; i <= frames; i += density) {
      context.fillText(i.toString(), (i / frames) * length + 40, 22);
    }

    context._context.fillStyle = 'white';
    CanvasHelper.roundRect(
      context._context,
      10 + length * playhead,
      4,
      60,
      32,
      8,
    );
    context.fill();
    context.beginPath();
    context.moveTo(40 + length * playhead, 36);
    context.lineTo(40 + length * playhead, size.height);

    context._context.lineWidth = 4;
    context._context.strokeStyle = 'white';
    context.stroke();

    context._context.fillStyle = 'black';
    context._context.font = 'bold 20px JetBrains Mono';
    context.fillText(
      Math.round(this.playhead()).toString(),
      40 + length * playhead,
      22,
    );
  }
}
