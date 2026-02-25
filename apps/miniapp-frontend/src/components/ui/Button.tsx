import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isDisabled?: boolean;
  onClick?: () => void;
}

const styles: Record<Exclude<ButtonVariant, 'destructive'>, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 50%, #0891B2 100%)',
    color: '#050A0F',
    border: 'none',
    boxShadow: '0 4px 16px rgba(34, 211, 238, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  secondary: {
    background: 'rgba(34, 211, 238, 0.08)',
    color: '#22D3EE',
    border: '1px solid rgba(34, 211, 238, 0.2)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'rgba(240, 246, 252, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'none',
  },
  accent: {
    background: 'linear-gradient(135deg, #2F6BFF, #1D4ED8)',
    color: '#F0F6FC',
    border: 'none',
    boxShadow: '0 4px 16px rgba(47, 107, 255, 0.25)',
  },
};

const sizes: Record<ButtonSize, React.CSSProperties> = {
  sm: { minHeight: 40, padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
  md: { minHeight: 44, padding: '12px 24px', fontSize: '15px', borderRadius: '12px' },
  lg: { minHeight: 52, padding: '16px 32px', fontSize: '16px', borderRadius: '14px' },
};

function resolveVariant(variant: ButtonVariant): Exclude<ButtonVariant, 'destructive'> {
  if (variant === 'destructive') {
    return 'secondary';
  }
  return variant;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  isLoading,
  fullWidth = false,
  icon,
  leftIcon,
  rightIcon,
  isDisabled,
  disabled,
  style,
  onClick,
  type = 'button',
  ...props
}: PropsWithChildren<ButtonProps>) {
  const isBusy = Boolean(loading ?? isLoading);
  const isBlocked = Boolean(disabled || isDisabled || isBusy);
  const normalizedVariant = resolveVariant(variant);
  const leadingIcon = leftIcon ?? icon;

  return (
    <button
      type={type}
      disabled={isBlocked}
      onClick={onClick}
      style={{
        ...styles[normalizedVariant],
        ...sizes[size],
        width: fullWidth ? '100%' : undefined,
        fontWeight: 600,
        cursor: isBlocked ? 'not-allowed' : 'pointer',
        opacity: isBlocked ? 0.45 : 1,
        transition: 'all var(--ax-duration-base, 250ms) var(--ax-ease, cubic-bezier(0.16,1,0.3,1))',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: '0.01em',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        ...style,
      }}
      {...props}
    >
      {isBusy ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : null}
      {!isBusy && leadingIcon ? leadingIcon : null}
      {children}
      {!isBusy && rightIcon ? rightIcon : null}
    </button>
  );
}
