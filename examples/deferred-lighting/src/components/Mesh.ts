import {
  Circle,
  Node,
  Shape,
  ShapeProps,
} from '@motion-canvas/2d/lib/components';
import {
  computed,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import {Color, Vector2, Vector2Signal} from '@motion-canvas/core/lib/types';
import {Vector} from './Vector';
import {SimpleSignal} from '@motion-canvas/core/lib/signals';
import {lineTo, moveTo} from '@motion-canvas/2d/lib/utils';

export interface MeshProps extends ShapeProps {
  children: Node[];
  vertices?: Vertex[];
  triangles?: [number, number, number][];
}

export class Mesh extends Shape {
  @initial([])
  @signal()
  public declare readonly triangles: SimpleSignal<
    [number, number, number][],
    this
  >;

  @computed()
  public vertices(): Vertex[] {
    return this.children().filter(
      (child): child is Vertex => child instanceof Vertex,
    );
  }

  public constructor(props: MeshProps) {
    super({
      fill: '#242424',
      stroke: 'white',
      lineWidth: 8,
      ...props,
    });
  }

  protected getPath(): Path2D {
    const path = new Path2D();
    const vertices = this.vertices();
    for (const [a, b, c] of this.triangles()) {
      moveTo(path, vertices[a].position());
      lineTo(path, vertices[b].position());
      lineTo(path, vertices[c].position());
      path.closePath();
    }
    return path;
  }
}

export interface VertexProps extends ShapeProps {
  tangentScale?: number;
  tangent?: Vector2;
  tangentX?: number;
  tangentY?: number;
}

export class Vertex extends Circle {
  @initial(0)
  @signal()
  public declare readonly tangentScale: SimpleSignal<number, this>;

  @vector2Signal('tangent')
  public declare readonly tangent: Vector2Signal<this>;

  public readonly vector: Vector;

  public constructor(props: VertexProps) {
    super({
      width: 30,
      height: 30,
      fill: 'white',
      ...props,
    });
    this.vector = new Vector({
      lineWidth: 8,
      arrowSize: 24,
    });
    this.vector.to(() => this.tangent().scale(this.tangentScale()));
    this.vector.stroke(() => {
      const packed = this.tangent()
        .mul(new Vector2(1, -1))
        .add(Vector2.one)
        .scale(0.5);

      return new Color({
        r: packed.x * 255,
        g: packed.y * 255,
        b: 128,
        a: 1,
      });
    });
    this.add(this.vector);
  }
}
