import {
  Image,
  ImageProps,
  Rect,
  RectProps,
  Text,
} from '@motion-canvas/2d/lib/components';
import {WhiteLabel} from '../styles';
import color from '../images/frames/colors.png';
import normals from '../images/frames/normals.png';
import shaded from '../images/lights/shaded.png';
import {makeRef, makeRefs} from '@motion-canvas/core/lib/utils';
import {RefsProperty} from '@motion-canvas/core/lib/utils/createRef';

export function Frame({
  name,
  refs,
  ref,
  ...props
}: {
  name: string;
  refs: {value: Image; text: Text};
} & ImageProps) {
  return (
    <Image
      ref={refs ? makeRef(refs, 'value') : ref}
      radius={8}
      width={'100%'}
      fill="#141414"
      clip
      smoothing={false}
      {...props}
    >
      <Text
        layout={false}
        offsetX={-1}
        offsetY={-1}
        ref={makeRef(refs, 'text')}
        position={() => refs.value.size().scale(-0.5).addX(20).addY(10)}
        {...WhiteLabel}
      >
        {name}
      </Text>
    </Image>
  );
}

export function GBuffer({
  refs,
  hidden = false,
  ...props
}: {
  hidden?: boolean;
  refs: {
    value: Rect;
    text: Text;
    color: RefsProperty<typeof Frame>;
    normals: RefsProperty<typeof Frame>;
  };
} & RectProps) {
  const colorRef = makeRefs<typeof Frame>();
  const normalsRef = makeRefs<typeof Frame>();

  const nodes = (
    <Buffer refs={refs} text="G-BUFFER" {...props}>
      <Frame name="COLOR" refs={colorRef} src={color} />
      <Frame name="NORMAL" refs={normalsRef} src={normals} />
    </Buffer>
  );

  if (hidden) {
    colorRef.text.text('');
    colorRef.value.alpha(0);
    normalsRef.text.text('');
    normalsRef.value.alpha(0);
  }

  refs.color = colorRef;
  refs.normals = normalsRef;

  return nodes;
}

export function LBuffer({
  refs,
  ...props
}: {
  refs: {
    value: Rect;
    text: Text;
    color: RefsProperty<typeof Frame>;
  };
} & RectProps) {
  const colorRef = makeRefs<typeof Frame>();

  const nodes = (
    <Buffer refs={refs} text="OUTPUT BUFFER" {...props}>
      <Frame name="SHADED COLOR" refs={colorRef} src={shaded} />
    </Buffer>
  );

  refs.color = colorRef;

  return nodes;
}

export function Buffer({
  refs,
  ref,
  text,
  children,
  ...props
}: {text: string; refs: {value: Rect; text: Text}} & RectProps) {
  return (
    <Rect
      ref={refs ? makeRef(refs, 'value') : ref}
      direction="column"
      layout
      fill="#242424"
      radius={8}
      padding={40}
      gap={20}
      {...props}
    >
      <Text ref={makeRef(refs, 'text')} {...WhiteLabel} marginTop={-20}>
        {text}
      </Text>
      {children}
    </Rect>
  );
}
