import {
  canvasStyleSignal,
  CanvasStyleSignal,
  computed,
  initial,
  Shape,
  ShapeProps,
  signal,
} from '@motion-canvas/2d';
import {
  clamp,
  Color,
  DEG2RAD,
  PossibleColor,
  SignalValue,
  SimpleSignal,
  Vector2,
} from '@motion-canvas/core';
import {Group, PerspectiveCamera, Vector3, Vector4} from 'three';

export interface TetrahedronProps extends ShapeProps {
  radius?: SignalValue<number>;
  orbit?: SignalValue<number>;
  v0?: SignalValue<Vector3>;
  v1?: SignalValue<Vector3>;
  v2?: SignalValue<Vector3>;
  v3?: SignalValue<Vector3>;
  transform?: SignalValue<Group>;
  grid?: SignalValue<PossibleColor>;
}

export class Tetrahedron extends Shape {
  public static readonly indices = [
    [0, 2, 1],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ];

  @initial(0)
  @signal()
  public declare readonly radius: SimpleSignal<number, this>;

  @initial(0)
  @signal()
  public declare readonly orbit: SimpleSignal<number, this>;

  @initial(null)
  @canvasStyleSignal()
  public declare readonly grid: CanvasStyleSignal<this>;

  @initial(createTetrahedron()[0])
  @signal()
  public declare readonly v0: SimpleSignal<Vector3, this>;

  @initial(createTetrahedron()[1])
  @signal()
  public declare readonly v1: SimpleSignal<Vector3, this>;

  @initial(createTetrahedron()[2])
  @signal()
  public declare readonly v2: SimpleSignal<Vector3, this>;

  @initial(createTetrahedron()[3])
  @signal()
  public declare readonly v3: SimpleSignal<Vector3, this>;

  private readonly group = new Group();
  private readonly perspective = new PerspectiveCamera(10, 1, 1, 1000);

  public constructor(props: TetrahedronProps) {
    super(props);

    this.group.position.set(0, 20, 0);
    this.group.rotation.order = 'YXZ';
    this.group.rotation.set(Math.PI / 2, 0, 0);

    this.perspective.translateZ(60);
  }

  @computed()
  private apply() {
    this.group.rotation.set(Math.PI / 2, this.orbit() * DEG2RAD, 0);
    this.group.updateWorldMatrix(false, false);
    this.perspective.lookAt(this.group.position);
    this.perspective.updateProjectionMatrix();
    this.perspective.updateWorldMatrix(false, false);
  }

  public projectPoint(v: Vector3) {
    return this.localToWorld().transformPoint(
      this.project(v.clone().multiplyScalar(this.radius())),
    );
  }

  public project(v: Vector3) {
    this.apply();
    const vector = new Vector4(v.x, v.y, v.z);
    vector
      .applyMatrix4(this.group.matrixWorld)
      .applyMatrix4(this.perspective.matrixWorldInverse)
      .applyMatrix4(this.perspective.projectionMatrix);
    vector.divideScalar(vector.w);

    return new Vector2(vector.x, vector.y).mul(200);
  }

  private isFront([v0, v1, v2]: Vector3[]) {
    this.apply();
    const a = v1.clone().sub(v0);
    const b = v2.clone().sub(v0);
    const normal = a.cross(b);

    const v = this.perspective.getWorldPosition(new Vector3()).sub(v0);
    return normal.dot(v) > 0;
  }

  @computed()
  public vertices() {
    const scale = this.radius();
    return [
      this.v0().clone().multiplyScalar(scale),
      this.v1().clone().multiplyScalar(scale),
      this.v2().clone().multiplyScalar(scale),
      this.v3().clone().multiplyScalar(scale),
    ];
  }

  @computed()
  public projectedVertices() {
    return this.vertices().map(v => this.project(v));
  }

  @computed()
  private worldVertices() {
    this.apply();
    return this.vertices().map(v =>
      v.clone().applyMatrix4(this.group.matrixWorld),
    );
  }

  private lineInfo() {
    this.apply();
    const projectedVertices = this.projectedVertices();
    const worldVertices = this.worldVertices();
    const facing = Tetrahedron.indices.map(
      face => !this.isFront(face.map(i => worldVertices[i])),
    );

    return [
      {
        from: projectedVertices[0],
        to: projectedVertices[1],
        front: facing[0] || facing[1],
      },
      {
        from: projectedVertices[0],
        to: projectedVertices[2],
        front: facing[0] || facing[2],
      },
      {
        from: projectedVertices[0],
        to: projectedVertices[3],
        front: facing[1] || facing[2],
      },
      {
        from: projectedVertices[1],
        to: projectedVertices[2],
        front: facing[0] || facing[3],
      },
      {
        from: projectedVertices[1],
        to: projectedVertices[3],
        front: facing[1] || facing[3],
      },
      {
        from: projectedVertices[2],
        to: projectedVertices[3],
        front: facing[2] || facing[3],
      },
    ];
  }

  @computed()
  protected gridPath() {
    const path = new Path2D();
    for (let i = -10; i < 20; i++) {
      const point = new Vector3(i * 5, -200, 0);
      const from = this.project(point);
      const to = this.project(point.clone().setY(30));
      path.moveTo(from.x, from.y);
      path.lineTo(to.x, to.y);
    }
    for (let i = -20; i < 10; i++) {
      const point = new Vector3(-30, i * 5, 0);
      const from = this.project(point);
      const to = this.project(point.clone().setX(200));
      path.moveTo(from.x, from.y);
      path.lineTo(to.x, to.y);
    }

    return path;
  }

  protected drawShape(context: CanvasRenderingContext2D) {
    context.save();
    this.applyStyle(context);
    context.lineCap = 'round';
    context.fillStyle = context.strokeStyle;
    const grid = this.grid();

    if (grid instanceof Color) {
      const path = this.gridPath();
      context.save();
      const size = this.computedSize();
      const gradient = context.createLinearGradient(0, -size.height / 2, 0, 0);
      gradient.addColorStop(0, grid.alpha(0).serialize());
      gradient.addColorStop(1, grid.serialize());
      context.strokeStyle = gradient;
      context.stroke(path);
      context.restore();
    }

    const radius = this.radius();
    if (radius === 0) {
      context.restore();
      return;
    }

    context.lineWidth = this.lineWidth() * clamp(0, 1, radius);
    for (const {from, to, front} of this.lineInfo()) {
      context.save();
      context.beginPath();
      if (!front) {
        const distance = from.sub(to).magnitude;
        context.setLineDash([10, 20]);
        context.lineDashOffset = distance / -2;
      }

      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }

    for (const vertex of this.projectedVertices()) {
      context.beginPath();
      context.arc(vertex.x, vertex.y, context.lineWidth, 0, Math.PI * 2);
      context.closePath();
      context.fill();
    }

    context.restore();
  }
}

function createTetrahedron() {
  const sqrt8_9 = Math.sqrt(8 / 9);
  const sqrt2_3 = Math.sqrt(2 / 3);
  const sqrt2_9 = Math.sqrt(2 / 9);

  return [
    new Vector3(0, 0, 1),
    new Vector3(sqrt8_9, 0, -1 / 3),
    new Vector3(-sqrt2_9, sqrt2_3, -1 / 3),
    new Vector3(-sqrt2_9, -sqrt2_3, -1 / 3),
  ];
}
