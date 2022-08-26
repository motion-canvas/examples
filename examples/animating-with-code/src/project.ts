import {Project} from '@motion-canvas/core/lib';

import 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

import declarative from './scenes/declarative.scene?scene';
import imperative from './scenes/imperative.scene?scene';
import timing from './scenes/timing.scene?scene';
import programming from './scenes/programming.scene?scene';
import explanation from './scenes/explanation.scene?scene';
import explanation2 from './scenes/explanation2.scene?scene';

export default new Project({
  name: 'animating-with-code',
  background: '#141414',
  scenes: [
    declarative,
    imperative,
    timing,
    programming,
    explanation,
    explanation2,
  ],
});
