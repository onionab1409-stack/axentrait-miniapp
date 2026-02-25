type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
};

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div className="ax-row" style={{ gap: 8, overflowX: 'auto' }}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`ax-chip ${activeId === item.id ? 'active' : ''}`}
          style={{ minHeight: 44 }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
