import {makeProject} from '@motion-canvas/core';
import {Vector2} from '@motion-canvas/core/lib/types';

import logo from './scenes/logo?scene';

export default makeProject({
  scenes: [logo],
  background: '#36393F',
  size: new Vector2(512),
});
