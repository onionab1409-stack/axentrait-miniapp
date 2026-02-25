import type { CSSProperties } from 'react';
import { Diamond, Grid3X3, Play, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const DiamondFilled = ({ size = 16, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
);

const items = [
  { key: 'services', label: 'Услуги',  icon: Diamond,       to: '/services' },
  { key: 'cases',    label: 'Кейсы',   icon: Grid3X3,       to: '/cases' },
  { key: 'ai',       label: 'AI-демо', icon: DiamondFilled, to: '/ai' },
  { key: 'lead',     label: 'Заявка',  icon: Play,          to: '/lead' },
  { key: 'account',  label: 'Профиль', icon: User,          to: '/account' },
];

const navStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: 'var(--ax-shell-max)',
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  background: 'linear-gradient(180deg, rgba(5, 10, 15, 0.85), rgba(5, 10, 15, 0.98))',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  zIndex: 100,
};

const activeTabStyle: CSSProperties = {
  color: '#22D3EE',
  filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))',
};

const inactiveTabStyle: CSSProperties = {
  color: 'rgba(240, 246, 252, 0.38)',
};

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={navStyle} aria-label="Bottom navigation">
      {items.map((item) => {
        const active = location.pathname.startsWith(item.to);
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 56,
              minHeight: 56,
              gap: 2,
              fontSize: 11,
              ...(active ? activeTabStyle : inactiveTabStyle),
            }}
          >
            <Icon size={16} />
            <span>{item.label}</span>
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: active ? '#22D3EE' : 'transparent',
                marginTop: 4,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
