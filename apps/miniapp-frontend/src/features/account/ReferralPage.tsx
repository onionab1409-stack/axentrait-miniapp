import { useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { tgInitDataUnsafe } from '../../shared/telegram/tg';
import { tgOpenLink } from '../../shared/telegram/tgLinks';

function buildReferralLink(userId: string | number | null) {
  const base = window.location.origin + window.location.pathname;
  const ref = userId ? String(userId) : 'guest';
  return `${base}#/?ref=${encodeURIComponent(ref)}`;
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const initData = tgInitDataUnsafe();
  const user = (initData.user as Record<string, unknown> | undefined) ?? {};
  const userId = typeof user.id === 'number' || typeof user.id === 'string' ? user.id : null;

  const referralLink = useMemo(() => buildReferralLink(userId), [userId]);

  return (
    <AppShell title="Рефералы" showBack showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h1 className="h2" style={{ fontSize: 22 }}>
            Ваша реферальная ссылка
          </h1>
          <p className="p muted">Поделитесь ссылкой: если контакт оставит заявку, менеджер отметит источник вручную.</p>
          <code style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{referralLink}</code>
        </div>
      </Card>

      <div className="ax-row ax-row-wrap">
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(referralLink);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? 'Скопировано' : 'Скопировать'}
        </Button>
        <Button variant="secondary" onClick={() => tgOpenLink(referralLink)}>
          Открыть ссылку
        </Button>
      </div>
    </AppShell>
  );
}
