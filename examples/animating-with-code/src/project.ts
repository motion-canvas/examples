import {bootstrap} from '@motion-canvas/core/lib/bootstrap';

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

import declarative from './scenes/declarative.scene';
import imperative from './scenes/imperative.scene';
import timing from './scenes/timing.scene';
import programming from './scenes/programming.scene';
import explanation from './scenes/explanation.scene';
import explanation2 from './scenes/explanation2.scene';

import audio from './sound/voice.wav';

bootstrap({
  name: 'animating-with-code',
  scenes: [
    declarative,
    imperative,
    timing,
    programming,
    explanation,
    explanation2,
  ],
  audio,
  audioOffset: -52,
});
