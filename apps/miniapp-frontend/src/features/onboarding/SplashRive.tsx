import { RiveAnimation } from '../../components/ui/RiveAnimation';
import { RIVE_ANIMATIONS } from '../../config/riveAnimations';

export function SplashRive() {
  return (
    <RiveAnimation
      src={RIVE_ANIMATIONS['splash-logo']}
      width={130}
      height={130}
      fallback={<div className="splash-logo-fallback" />}
    />
  );
}
