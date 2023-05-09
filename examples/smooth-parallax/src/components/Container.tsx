import {Colors, WhiteLabel} from '../styles';
import {Rect, RectProps, Txt} from '@motion-canvas/2d/lib/components';
import {makeRef, makeRefs} from '@motion-canvas/core/lib/utils';

interface ContainerRefs {
  rect: Rect;
  label: Txt;
}

export interface ContainerProps extends RectProps {
  label?: string;
  refs?: ContainerRefs;
}

export function Container({
  label = '',
  refs = {} as ContainerRefs,
  children,
  ref,
  ...rest
}: ContainerProps) {
  return (
    <Rect
      ref={ref ?? makeRef(refs, 'rect')}
      fill={Colors.surface}
      direction={'column'}
      radius={8}
      padding={40}
      gap={20}
      layout
      {...rest}
    >
      <Txt
        ref={makeRef(refs, 'label')}
        lineHeight={60}
        marginTop={-20}
        {...WhiteLabel}
      >
        {label}
      </Txt>
      {children}
    </Rect>
  );
}

export const makeContainer = makeRefs<typeof Container>;
