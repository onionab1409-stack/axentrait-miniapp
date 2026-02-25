import { useState } from 'react';
import { getBackground } from '../../config/imageMap';

type MjImageProps = {
  // New id-based mode
  id?: string;
  height?: number | string;
  borderRadius?: number;
  scrim?: boolean;
  scrimHeight?: string;
  children?: React.ReactNode;

  // Legacy src-based mode (kept for compatibility)
  src?: string;
  fallbackGradient?: string;

  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

function resolveFallback(id?: string, fallbackGradient?: string): string {
  if (fallbackGradient) {
    return fallbackGradient;
  }
  if (id) {
    return getBackground(id);
  }
  return 'linear-gradient(145deg, rgba(15,30,50,0.9), rgba(5,10,20,0.95))';
}

export function MjImage({
  id,
  height = 180,
  borderRadius = 18,
  scrim = true,
  scrimHeight = '65%',
  children,
  src,
  fallbackGradient,
  alt = 'Visual asset',
  className,
  style,
  onClick,
}: MjImageProps) {
  const [error, setError] = useState(false);

  // Keep old behaviour for direct image rendering.
  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          borderRadius,
          ...style,
          cursor: onClick ? 'pointer' : style?.cursor,
        }}
        onClick={onClick}
        onError={() => setError(true)}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const background = src && error ? resolveFallback(id, fallbackGradient) : id ? getBackground(id) : resolveFallback(id, fallbackGradient);

  return (
    <div
      className={className}
      onClick={onClick}
      aria-label={alt}
      style={{
        height,
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: background,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {scrim ? (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: scrimHeight,
            background: 'linear-gradient(transparent, rgba(5, 10, 15, 0.85))',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {children ? <div style={{ position: 'relative', zIndex: 1, padding: 16 }}>{children}</div> : null}
    </div>
  );
}
