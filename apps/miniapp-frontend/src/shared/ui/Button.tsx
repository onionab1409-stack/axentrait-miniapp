import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, ...props }: Props) {
  return (
    <button className="ax-button" {...props}>
      {children}
    </button>
  );
}
