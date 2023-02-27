import {makeProject} from '@motion-canvas/core';

import renderer from './scenes/renderer?scene';
import layers from './scenes/layers?scene';
import color from './scenes/color?scene';
import normals from './scenes/normals?scene';
import normal from './scenes/normal?scene';
import lightBasics from './scenes/lightBasics?scene';
import light from './scenes/light?scene';
import lightComposite from './scenes/lightComposite?scene';
import shadows from './scenes/shadows?scene';
import projection from './scenes/projection?scene';
import shadowsComposite from './scenes/shadowsComposite?scene';
import shadowsFinal from './scenes/shadowsFinal?scene';
import transparency from './scenes/transparency?scene';
import ending from './scenes/ending?scene';

import voice from './audio/voice.mp3';

export default makeProject({
  scenes: [
    renderer,
    layers,
    color,
    normals,
    normal,
    lightBasics,
    light,
    lightComposite,
    shadows,
    projection,
    shadowsComposite,
    shadowsFinal,
    transparency,
    ending,
  ],
  audio: voice,
});
