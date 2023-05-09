import {makeProject} from '@motion-canvas/core';

import signals from './scenes/signals?scene';
import signalsCode from './scenes/signalsCode?scene';
import layouts from './scenes/layouts?scene';
import layoutsCode from './scenes/layoutsCode?scene';
import interfaceScene from './scenes/interface?scene';

import audio from './audio/voice.mp3';

export default makeProject({
  scenes: [signals, signalsCode, layouts, layoutsCode, interfaceScene],
  audio,
});
