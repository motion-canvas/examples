import {makeProject} from '@motion-canvas/core';

import overlay from './scenes/overlay?scene';

export default makeProject({
  experimentalFeatures: true,
  scenes: [overlay],
});
