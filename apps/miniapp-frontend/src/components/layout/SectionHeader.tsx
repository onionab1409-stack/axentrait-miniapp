export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="ax-col" style={{ gap: 4 }}>
      <h2 className="h2">{title}</h2>
      {description ? <p className="p muted">{description}</p> : null}
    </div>
  );
}
