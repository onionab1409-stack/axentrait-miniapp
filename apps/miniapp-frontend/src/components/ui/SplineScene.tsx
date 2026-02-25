import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline').then((mod) => ({ default: mod.default })));

type SplineSceneProps = {
  sceneUrl: string | null;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
};

export function SplineScene({ sceneUrl, fallback, style }: SplineSceneProps) {
  if (!sceneUrl) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        ...style,
      }}
    >
      <Suspense
        fallback={
          fallback ?? (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at 50% 40%, rgba(34,211,238,0.08), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '2px solid rgba(34,211,238,0.3)',
                  borderTopColor: '#22D3EE',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          )
        }
      >
        <Spline scene={sceneUrl} />
      </Suspense>
    </div>
  );
}
