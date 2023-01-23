import {createSignal} from '@motion-canvas/core/lib/signals';
import {loadImage} from '@motion-canvas/core/lib/media';
import {Color, Vector2} from '@motion-canvas/core/lib/types';

export class Sampler {
  private static imageLookup: Record<string, HTMLImageElement> = {};
  private static async getImageFor(url: string) {
    if (url in this.imageLookup) {
      return this.imageLookup[url];
    }

    const image = await loadImage(url);
    this.imageLookup[url] = image;
    return image;
  }

  private readonly context: CanvasRenderingContext2D;
  private image: HTMLImageElement;
  private url = createSignal<string | null>(null);

  public constructor() {
    const canvas = document.createElement('canvas');
    this.context = canvas.getContext('2d', {willReadFrequently: true});
  }

  async setUrl(value: string) {
    this.image = await Sampler.getImageFor(value);
    this.context.canvas.width = this.image.naturalWidth;
    this.context.canvas.height = this.image.naturalHeight;
    this.context.drawImage(this.image, 0, 0);
    this.url(value);
  }

  public getColorAtPoint(position: Vector2) {
    const data = this.context.getImageData(position.x, position.y, 1, 1).data;
    return new Color({
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3] / 255,
    });
  }
}

export async function createSampler(url: string): Promise<Sampler> {
  const sampler = new Sampler();
  await sampler.setUrl(url);
  return sampler;
}
