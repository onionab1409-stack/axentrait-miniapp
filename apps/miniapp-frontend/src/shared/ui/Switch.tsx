type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="ax-row" style={{ justifyContent: 'space-between', minHeight: 44 }}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 999,
          border: '1px solid var(--app-border)',
          background: checked ? 'var(--app-accent)' : 'var(--app-card)',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 2,
            left: checked ? 23 : 3,
            transition: 'left var(--ax-dur-fast) var(--ax-ease-out)',
          }}
        />
      </button>
    </label>
  );
}
