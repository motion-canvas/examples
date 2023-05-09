import {makeProject} from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import parallax from './scenes/parallax?scene';
import layers from './scenes/layers?scene';
import upscale from './scenes/upscale?scene';
import rasterization from './scenes/rasterization?scene';
import merge from './scenes/merge?scene';
import rendering from './scenes/rendering?scene';
import lights from './scenes/lights?scene';
import outro from './scenes/outro?scene';
import audio from './voice.wav';

export default makeProject({
  scenes: [
    intro,
    parallax,
    layers,
    upscale,
    rasterization,
    merge,
    rendering,
    lights,
    outro,
  ],
  audio,
});
