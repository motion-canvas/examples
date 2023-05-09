import {Node, NodeProps} from '@motion-canvas/2d/lib/components/Node';
import {makeRef} from '@motion-canvas/core/lib/utils';
import {Img} from '@motion-canvas/2d/lib/components';

import aLayer from '../images/layers/a-foreground.png';
import bLayer from '../images/layers/b-central.png';
import bLayerAlt from '../images/layers/b-light.png';
import cLayer from '../images/layers/c-background.png';
import dLayer from '../images/layers/d-background.png';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {initial, signal} from '@motion-canvas/2d/lib/decorators';
import {Vector2} from '@motion-canvas/core/lib/types';
import {map} from '@motion-canvas/core/lib/tweening';
import {Repeater} from './Repeater';

export interface ParallaxProps extends NodeProps {
  camera?: SignalValue<number>;
  upscale?: SignalValue<number>;
  ratios?: SignalValue<number[]>;
  snap?: SignalValue<number>;
  light?: boolean;
}

const ParallaxSize = new Vector2(44, 9);

export class Parallax extends Node {
  @initial(0)
  @signal()
  public declare readonly camera: SimpleSignal<number, this>;

  @initial(8)
  @signal()
  public declare readonly upscale: SimpleSignal<number, this>;

  @initial(0)
  @signal()
  public declare readonly snap: SimpleSignal<number, this>;

  @initial([0, 0.5, 1, 3])
  @signal()
  public declare readonly ratios: SimpleSignal<number[], this>;

  public readonly layers: Repeater[] = [];
  public readonly images: string[];

  public constructor(props: ParallaxProps) {
    super(props);
    this.images = [dLayer, cLayer, props.light ? bLayerAlt : bLayer, aLayer];
    this.add(
      <>
        {this.images.map((layer, index) => (
          <Repeater
            ref={makeRef(this.layers, index)}
            copies={5}
            start={-2}
            x={() => {
              const scale = this.upscale();
              const value =
                (this.camera() * (this.ratios()[index] - 1)) %
                (ParallaxSize.x * scale);
              return map(value, Math.round(value / scale) * scale, this.snap());
            }}
          >
            <Img
              layout={false}
              smoothing={false}
              x={() => ParallaxSize.x * this.upscale()}
              src={layer}
              width={() => ParallaxSize.x * this.upscale()}
            />
          </Repeater>
        ))}
      </>,
    );
  }
}
