import {Shape, ShapeConfig} from 'konva/lib/Shape';
import {KonvaNode} from '@motion-canvas/core/lib/decorators';
import {getset} from '@motion-canvas/core/lib/decorators/getset';
import {Context} from 'konva/lib/Context';
import {GetSet, Vector2d} from 'konva/lib/types';

export interface MouseConfig extends ShapeConfig {
  press?: number;
}

@KonvaNode()
export class Mouse extends Shape {
  @getset(1)
  public declare press: GetSet<MouseConfig['press'], this>;

  private isSelecting = false;
  private selectionStart: Vector2d;

  public constructor(config?: MouseConfig) {
    super(config);
  }

  public startSelecting() {
    this.isSelecting = true;
    this.selectionStart = this.position();
  }

  public stopSelecting() {
    this.isSelecting = false;
  }

  public _sceneFunc(context: Context) {
    const position = this.position();

    if (this.isSelecting) {
      const offset = {
        x: this.selectionStart.x - position.x,
        y: this.selectionStart.y - position.y,
      };

      context.beginPath();
      context.moveTo(offset.x, offset.y);
      context.lineTo(offset.x, 0);
      context.moveTo(0, 0);
      context.lineTo(offset.x, 0);
      context.moveTo(offset.x, offset.y);
      context.lineTo(0, offset.y);
      context.moveTo(0, 0);
      context.lineTo(0, offset.y);

      context.save();
      context._context.globalCompositeOperation = 'difference';
      context._context.strokeStyle = 'white';
      context._context.lineWidth = 4;
      context._context.setLineDash([10]);
      context.stroke();
      context.restore();
    }

    const scale = this.press();
    const size = 50 * scale;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, size);
    context.lineTo(
      (size / Math.sqrt(2) / 2) * 0.9,
      ((size + size / Math.sqrt(2)) / 2) * 0.9,
    );
    context.lineTo(size / Math.sqrt(2), size / Math.sqrt(2));
    context.closePath();
    context._context.shadowColor = '#000';
    context._context.shadowOffsetY = 3;
    context._context.shadowBlur = 10;
    context._context.fillStyle = '#fff';
    context._context.strokeStyle = '#242424';
    context._context.lineJoin = 'round';
    context._context.lineWidth = 4;
    context.fill();
    context._context.shadowColor = 'transparent';
    context.stroke();
  }
}
