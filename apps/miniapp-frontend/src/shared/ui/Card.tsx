import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <section className="ax-card">{children}</section>;
}
