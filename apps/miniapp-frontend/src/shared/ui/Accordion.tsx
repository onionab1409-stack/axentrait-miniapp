import { useState } from 'react';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="ax-card ax-col" style={{ gap: 8, padding: 12 }}>
      <button
        type="button"
        className="ax-btn ax-btn-ghost"
        onClick={() => setOpen((prev) => !prev)}
        style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
      >
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open ? <div>{children}</div> : null}
    </section>
  );
}
