import {Layout, LayoutProps} from '@motion-canvas/2d/lib/components';
import {computed, initial, signal} from '@motion-canvas/2d/lib/decorators';
import {Vector2} from '@motion-canvas/core/lib/types';
import {
  Camera,
  Color,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import {SimpleSignal} from '@motion-canvas/core/lib/signals';

interface RenderCallback {
  (renderer: WebGLRenderer, scene: Scene, camera: Camera): void;
}

export interface ThreeProps extends LayoutProps {
  scene?: Scene;
  camera?: Camera;
  quality?: number;
  background?: string;
  zoom?: number;
  onRender?: RenderCallback;
}

export class Three extends Layout {
  @initial(1)
  @signal()
  public declare readonly quality: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly camera: SimpleSignal<Camera | null, this>;

  @initial(null)
  @signal()
  public declare readonly scene: SimpleSignal<Scene | null, this>;

  @initial(null)
  @signal()
  public declare readonly background: SimpleSignal<string | null, this>;

  @initial(1)
  @signal()
  public declare readonly zoom: SimpleSignal<number, this>;

  private readonly renderer: WebGLRenderer;
  private readonly context: WebGLRenderingContext;
  private readonly pixelSample = new Uint8Array(4);
  public onRender: RenderCallback;

  public constructor({onRender, ...props}: ThreeProps) {
    super(props);
    this.renderer = borrow();
    this.context = this.renderer.getContext();
    this.onRender =
      onRender ?? ((renderer, scene, camera) => renderer.render(scene, camera));
  }

  protected override draw(context: CanvasRenderingContext2D) {
    const {width, height} = this.computedSize();
    const quality = this.quality();
    const scene = this.configuredScene();
    const camera = this.configuredCamera();
    const renderer = this.configuredRenderer();

    if (width > 0 && height > 0) {
      this.onRender(renderer, scene, camera);
      context.imageSmoothingEnabled = false;
      context.drawImage(
        renderer.domElement,
        0,
        0,
        quality * width,
        quality * height,
        width / -2,
        height / -2,
        width,
        height,
      );
    }

    super.draw(context);
  }

  @computed()
  private configuredRenderer(): WebGLRenderer {
    const size = this.computedSize();
    const quality = this.quality();

    this.renderer.setSize(size.width * quality, size.height * quality);
    return this.renderer;
  }

  @computed()
  private configuredCamera(): Camera {
    const size = this.computedSize();
    const camera = this.camera();
    const ratio = size.width / size.height;
    const scale = this.zoom() / 2;
    if (camera instanceof OrthographicCamera) {
      camera.left = -ratio * scale;
      camera.right = ratio * scale;
      camera.bottom = -scale;
      camera.top = scale;
      camera.updateProjectionMatrix();
    } else if (camera instanceof PerspectiveCamera) {
      camera.aspect = ratio;
      camera.updateProjectionMatrix();
    }

    return camera;
  }

  @computed()
  private configuredScene(): Scene | null {
    const scene = this.scene();
    const background = this.background();
    if (scene) {
      scene.background = background ? new Color(background) : null;
    }
    return scene;
  }

  public getColorAtPoint(position: Vector2) {
    const relativePosition = position.scale(this.quality());
    this.context.readPixels(
      relativePosition.x,
      relativePosition.y,
      1,
      1,
      this.context.RGBA,
      this.context.UNSIGNED_BYTE,
      this.pixelSample,
    );
    const color = new Color();
    color.setRGB(
      this.pixelSample[0] / 255,
      this.pixelSample[1] / 255,
      this.pixelSample[2] / 255,
    );
    return color;
  }

  public dispose() {
    dispose(this.renderer);
  }
}

const pool: WebGLRenderer[] = [];
function borrow() {
  if (pool.length) {
    return pool.pop();
  } else {
    return new WebGLRenderer({
      canvas: document.createElement('canvas'),
      // antialias: true,
      alpha: true,
      stencil: true,
    });
  }
}
function dispose(renderer: WebGLRenderer) {
  pool.push(renderer);
}
