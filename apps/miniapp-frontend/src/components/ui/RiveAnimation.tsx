import { Suspense, lazy } from 'react';

const RiveComponent = lazy(() =>
  import('@rive-app/react-canvas').then((mod) => ({
    default: function RiveWrapper(props: { src: string; style?: React.CSSProperties }) {
      const { RiveComponent: RC } = mod.useRive({
        src: props.src,
        autoplay: true,
      });
      return <RC style={props.style} />;
    },
  })),
);

type RiveAnimationProps = {
  src: string | null;
  fallback?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
};

export function RiveAnimation({ src, fallback, width, height, style }: RiveAnimationProps) {
  if (!src) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Suspense fallback={fallback ?? <div style={{ width, height }} />}>
      <RiveComponent src={src} style={{ width, height, ...style }} />
    </Suspense>
  );
}
