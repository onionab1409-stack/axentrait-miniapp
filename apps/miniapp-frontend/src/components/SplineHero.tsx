import { Suspense, lazy } from 'react';
import { MjImage } from './ui/MjImage';

const SplineScene = lazy(async () => ({
  default: function DisabledSpline() {
    return null;
  },
}));

type SplineWithFallbackProps = {
  scene: string;
  fallbackSrc: string;
};

// SplineWithFallback: render static MJ fallback when 3D is unavailable.
export function SplineWithFallback({ scene, fallbackSrc }: SplineWithFallbackProps) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return <MjImage src={fallbackSrc} fallbackGradient="radial-gradient(ellipse at 50% 30%, rgba(47,107,255,0.12), var(--ax-surface-0) 70%)" alt="Spline fallback" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }

  return (
    <Suspense fallback={<MjImage src={fallbackSrc} fallbackGradient="radial-gradient(ellipse at 50% 30%, rgba(47,107,255,0.12), var(--ax-surface-0) 70%)" alt="Spline fallback" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}>
      <div data-scene={scene} style={{ width: '100%', height: '100%' }}>
        <SplineScene />
      </div>
    </Suspense>
  );
}
