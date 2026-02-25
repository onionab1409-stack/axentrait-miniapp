import type { PropsWithChildren } from 'react';

export function Page({ children }: PropsWithChildren) {
  return <main className="ax-page">{children}</main>;
}
