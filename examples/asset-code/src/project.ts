import {makeProject} from '@motion-canvas/core';

import audio from './audio/voice.mp3';

import intro from './scenes/intro?scene';
import mesh from './scenes/mesh?scene';
import memory from './scenes/memory?scene';
import blender from './scenes/blender?scene';
import division from './scenes/division?scene';
import stateMachine from './scenes/state-machine?scene';
import division2 from './scenes/division2?scene';
import animator from './scenes/animator?scene';
import shaderGraph from './scenes/shader-graph?scene';
import editor from './scenes/editor?scene';
import reanimator from './scenes/reanimator?scene';
import ending from './scenes/ending?scene';

export default makeProject({
  experimentalFeatures: true,
  scenes: [
    intro,
    mesh,
    memory,
    blender,
    division,
    stateMachine,
    division2,
    animator,
    shaderGraph,
    editor,
    reanimator,
    ending,
  ],
  audio,
});
