import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTgBackButton } from '../../shared/telegram/useTgBackButton';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { ToastHost } from '../ui/ToastHost';

type AppShellProps = {
  title: string;
  children: React.ReactNode;
  showBottomNav?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

export function AppShell({ title, children, showBottomNav, showBack, onBack, rightSlot }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultBack = useCallback(() => {
    if (location.key === 'default') navigate('/welcome');
    else navigate(-1);
  }, [location.key, navigate]);

  const backAction = onBack ?? defaultBack;

  useTgBackButton(Boolean(showBack), backAction);

  return (
    <main className="ax-shell">
      <TopBar title={title} onBack={showBack ? backAction : undefined} rightSlot={rightSlot} />
      <section
        className="ax-content page-enter"
        style={
          showBottomNav
            ? {
                paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 16px))',
              }
            : undefined
        }
      >
        {children}
      </section>
      {showBottomNav ? <BottomNav /> : null}
      <ToastHost />
    </main>
  );
}
