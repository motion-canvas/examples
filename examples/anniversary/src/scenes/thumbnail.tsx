import {
  Img,
  Node,
  makeScene2D,
  saturate,
  contrast,
  brightness,
  Rect,
  Gradient,
} from '@motion-canvas/2d';
import {waitFor} from '@motion-canvas/core';
import logoSrc from '../images/logosvg.svg';

const VIDEOS = [
  'WTUafAwrunE',
  'H5GETOP7ivs',
  'GLPWxQhAvAE',
  'mXrnD3kfYvs',
  '6v4au72nWNE',
  'lb0HfBUSshA',
  'BK0Vxe_i0Bs',
  'oPpzT6JKGk0',
  'zBhhckL5Q4k',
  'HsOKwUwL1bE',
  'R6vQ9VmMz2w',
  'c_3TLN2gHow',
  'jB9PVK1DuN0',
  'Rhods9EWmu0',
  'IZ9jlHCTZFA',
  'NpFzCfCZxaQ',
  'AsVDIrriA-Y',
  'ltsSVVA4x3k',
  'otO3G7u-bXo',
  '11qRfcnTl8w',
  'GN9T7pDbLBU',
  'STn33z8V6kM',
  '3IAlJSIjvH0',
  'u3qAxOnjAEI',
  'lbTlEY0j4bU',
  'k6ZsRiLSyvY',
  'Enq64V_HmSM',
  'oAU-pC4gE0g',
  'myZcNjKcVGw',
  'sZpOR7WuTII',
  'HtwuAGND-8I',
  'SP3N2ktFu84',
  'ffhp0yfRPpk',
  'clT-KrXtUSk',
  'Rs_gsAhtb2U',
  'NhvHKtjhH_o',
];

const Rows = 6;

export default makeScene2D(function* (view) {
  const size = view.size().scale(1 / Rows);
  view.add(
    <Node filters={[saturate(0), contrast(0.6), brightness(1)]}>
      {VIDEOS.map((id, i) => (
        <Img
          offset={-1}
          x={size.x * (i % Rows) - view.width() / 2}
          y={size.y * Math.floor(i / Rows) - view.height() / 2}
          size={size}
          src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
        />
      ))}
    </Node>,
  );
  view.add(
    <Rect
      size={view.size()}
      compositeOperation={'multiply'}
      fill={
        new Gradient({
          type: 'linear',
          from: view.size().scale(-0.5),
          to: view.size().scale(0.5),
          stops: [
            {offset: 0, color: '#43a8f5'},
            {offset: 1, color: '#ff5463'},
          ],
        })
      }
    />,
  );
  view.add(
    <Img
      shadowColor={'rgba(0, 0, 0, 0.32)'}
      shadowBlur={80}
      height={view.height()}
      src={logoSrc}
    />,
  );

  yield* waitFor(5);
});
