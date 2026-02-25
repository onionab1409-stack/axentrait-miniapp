import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { tgInitDataUnsafe } from '../../shared/telegram/tg';
import { tgOpenTelegramLink } from '../../shared/telegram/tgLinks';
import { useMe } from '../../shared/hooks/useMe';
import { useMyLeads } from '../leads/hooks/useMyLeads';

export default function AccountPage() {
  const navigate = useNavigate();
  const initData = tgInitDataUnsafe();
  const unsafeUser = (initData.user as Record<string, unknown> | undefined) ?? {};

  const meQuery = useMe();
  const leadsQuery = useMyLeads(Boolean(meQuery.data));

  const profileName = useMemo(() => {
    if (meQuery.data?.firstName || meQuery.data?.lastName) {
      return `${meQuery.data.firstName ?? ''} ${meQuery.data.lastName ?? ''}`.trim();
    }

    const firstName = typeof unsafeUser.first_name === 'string' ? unsafeUser.first_name : '';
    const lastName = typeof unsafeUser.last_name === 'string' ? unsafeUser.last_name : '';
    return `${firstName} ${lastName}`.trim() || 'Пользователь';
  }, [meQuery.data?.firstName, meQuery.data?.lastName, unsafeUser.first_name, unsafeUser.last_name]);

  const username =
    meQuery.data?.username || (typeof unsafeUser.username === 'string' ? unsafeUser.username : null);

  const isLoading = meQuery.isLoading || (meQuery.isSuccess && leadsQuery.isLoading);
  const isError = meQuery.isError || leadsQuery.isError;

  return (
    <AppShell title="Профиль" showBottomNav>
      {isLoading ? (
        <div className="ax-col" style={{ gap: 12 }}>
          <Skeleton height={130} />
          <Skeleton height={150} />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <ErrorState
          title="Профиль временно недоступен"
          description="Не удалось загрузить данные аккаунта и историю заявок."
          onRetry={() => {
            void meQuery.refetch();
            void leadsQuery.refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Card>
            <div className="ax-col" style={{ gap: 8 }}>
              <h1 className="h2" style={{ fontSize: 22 }}>
                {profileName}
              </h1>
              <p className="p muted">{username ? `@${username}` : 'без username'}</p>
              <div className="ax-row ax-row-wrap">
                {meQuery.data?.profile?.role ? <Badge>Роль: {meQuery.data.profile.role}</Badge> : null}
                <Badge>Сегментов: {meQuery.data?.profile?.segments?.length ?? 0}</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <div className="ax-col" style={{ gap: 10 }}>
              <h2 className="h2" style={{ fontSize: 20 }}>
                История заявок
              </h2>

              {(leadsQuery.data?.length ?? 0) === 0 ? (
                <EmptyState title="Пока нет заявок" description="Отправьте первую заявку, и она появится здесь." />
              ) : (
                (leadsQuery.data ?? []).slice(0, 5).map((lead) => (
                  <article key={lead.id} className="ax-card" style={{ padding: 12 }}>
                    <div className="ax-col" style={{ gap: 6 }}>
                      <strong>{lead.companyName ?? 'Без названия компании'}</strong>
                      <p className="p muted" style={{ margin: 0 }}>
                        {lead.problemStatement}
                      </p>
                      <div className="ax-row ax-row-wrap">
                        <Badge>{lead.preferredContactMethod}</Badge>
                        <Badge>{lead.status}</Badge>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Card>

          <div className="ax-row ax-row-wrap">
            <Button onClick={() => navigate('/referral')} variant="secondary">
              Реферальная ссылка
            </Button>
            <Button onClick={() => tgOpenTelegramLink('https://t.me/axentrait')}>
              Связаться с менеджером
            </Button>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
