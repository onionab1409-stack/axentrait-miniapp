import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { tgInitDataUnsafe } from '../../shared/telegram/tg';
import { track } from '../../shared/analytics/track';
import { useServices } from '../services/hooks/useServices';
import { useSubmitLead } from './hooks/useSubmitLead';

const leadSchema = z.object({
  company_name: z.string().min(2, 'Укажите компанию'),
  role: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Некорректный email').optional().or(z.literal('')),
  problem_statement: z.string().min(24, 'Опишите задачу минимум в 24 символах'),
  service_interest: z.array(z.string()).min(1, 'Выберите минимум 1 направление'),
  preferred_contact_method: z.enum(['telegram', 'phone', 'email']),
});

type LeadFormValues = z.infer<typeof leadSchema>;

type LeadPrefill = {
  companyName?: string;
  role?: string;
  contactPhone?: string;
  contactEmail?: string;
  problemStatement?: string;
  serviceInterest?: string[];
  preferredContactMethod?: 'telegram' | 'phone' | 'email';
  source?: string;
};

type LeadLocationState = {
  prefill?: LeadPrefill;
};

export default function LeadFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const servicesQuery = useServices();
  const submitLead = useSubmitLead();

  const locationState = (location.state as LeadLocationState | null) ?? null;
  const prefill = locationState?.prefill;
  const problemFromRoute = searchParams.get('problem') ?? prefill?.problemStatement ?? '';

  const initDataUnsafe = tgInitDataUnsafe();

  const profileLabel = useMemo(() => {
    const user = (initDataUnsafe.user as Record<string, unknown> | undefined) ?? {};
    const firstName = typeof user.first_name === 'string' ? user.first_name : '';
    const username = typeof user.username === 'string' ? user.username : '';
    if (!firstName && !username) return 'Продолжить без персонализации';
    if (username) return `${firstName} (@${username})`.trim();
    return firstName;
  }, [initDataUnsafe.user]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema as any),
    defaultValues: {
      company_name: prefill?.companyName ?? '',
      role: prefill?.role ?? '',
      contact_phone: prefill?.contactPhone ?? '',
      contact_email: prefill?.contactEmail ?? '',
      problem_statement: problemFromRoute,
      service_interest: prefill?.serviceInterest ?? [],
      preferred_contact_method: prefill?.preferredContactMethod ?? 'telegram',
    },
    mode: 'onBlur',
  });

  const selectedServices = form.watch('service_interest');
  const trackedFields = useRef(new Set<string>());

  useEffect(() => {
    track('lead_form_opened', { screen_id: 'SCR-LEAD-001' });
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const trackFieldFilled = (field: string) => {
    if (trackedFields.current.has(field)) return;
    trackedFields.current.add(field);
    track('lead_field_filled', { field });
  };

  const toggleService = (serviceSlug: string) => {
    const selected = form.getValues('service_interest');
    const next = selected.includes(serviceSlug)
      ? selected.filter((slug) => slug !== serviceSlug)
      : [...selected, serviceSlug];
    form.setValue('service_interest', next, { shouldValidate: true, shouldTouch: true });
  };

  const doSubmit = form.handleSubmit(async (values) => {
    if (!isOnline || submitLead.isPending) return;

    const payload = {
      companyName: values.company_name,
      contactPhone: values.contact_phone || undefined,
      contactEmail: values.contact_email || undefined,
      problemStatement: values.problem_statement,
      serviceInterest: values.service_interest,
      preferredContactMethod: values.preferred_contact_method,
      source: prefill?.source ?? 'miniapp',
    };

    const result = await submitLead.mutateAsync(payload);

    track('lead_submitted', {
      screen_id: 'SCR-LEAD-001',
      lead_id: result.id,
    });

    navigate(`/lead/success?leadId=${encodeURIComponent(result.id)}`);
  });

  return (
    <AppShell title="Заявка" showBack showBottomNav>
      {!isOnline ? (
        <ErrorState
          title="Форма недоступна офлайн"
          description="Подключитесь к интернету, чтобы отправить заявку."
        />
      ) : null}

      <Card>
        <div className="ax-col" style={{ gap: 8 }}>
          <h1 className="h2" style={{ fontSize: 22 }}>
            Запрос консультации
          </h1>
          <p className="p muted">{profileLabel}</p>
        </div>
      </Card>

      <Card>
        <form
          className="ax-col"
          style={{ gap: 12 }}
          onSubmit={(event) => {
            event.preventDefault();
            void doSubmit();
          }}
        >
          <Field label="Компания" error={form.formState.errors.company_name?.message}>
            <input
              className="ax-input"
              placeholder="ООО Пример"
              {...form.register('company_name')}
              onBlur={() => trackFieldFilled('company_name')}
            />
          </Field>

          <Field
            label="Роль"
            hint="Если уже указали в онбординге, можно пропустить"
            error={form.formState.errors.role?.message}
          >
            <input
              className="ax-input"
              placeholder="CTO / COO / Директор"
              {...form.register('role')}
              onBlur={() => trackFieldFilled('role')}
            />
          </Field>

          <Field label="Телефон (опционально)" error={form.formState.errors.contact_phone?.message}>
            <input
              className="ax-input"
              placeholder="+7..."
              {...form.register('contact_phone')}
              onBlur={() => trackFieldFilled('contact_phone')}
            />
          </Field>

          <Field label="Email (опционально)" error={form.formState.errors.contact_email?.message}>
            <input
              className="ax-input"
              placeholder="team@company.com"
              {...form.register('contact_email')}
              onBlur={() => trackFieldFilled('contact_email')}
            />
          </Field>

          <Field
            label="Описание задачи"
            hint="Формат: текущий процесс, где узкое место, целевой эффект"
            error={form.formState.errors.problem_statement?.message}
          >
            <textarea
              className="ax-textarea"
              placeholder="Например: цикл согласования 12 дней, хотим сократить до 4..."
              {...form.register('problem_statement')}
              onBlur={() => trackFieldFilled('problem_statement')}
            />
          </Field>

          <div className="ax-col" style={{ gap: 8 }}>
            <strong>Интересующие направления</strong>

            {servicesQuery.isLoading ? (
              <div className="ax-col" style={{ gap: 8 }}>
                <Skeleton height={36} />
                <Skeleton height={36} />
              </div>
            ) : null}

            {!servicesQuery.isLoading && servicesQuery.isError ? (
              <ErrorState
                title="Не удалось загрузить список услуг"
                description="Попробуйте обновить данные и выберите направление снова."
                onRetry={() => {
                  void servicesQuery.refetch();
                }}
              />
            ) : null}

            {!servicesQuery.isLoading && !servicesQuery.isError && (servicesQuery.data?.length ?? 0) === 0 ? (
              <EmptyState title="Услуги не найдены" description="Сейчас список услуг недоступен." />
            ) : null}

            {!servicesQuery.isLoading && !servicesQuery.isError && (servicesQuery.data?.length ?? 0) > 0 ? (
              <div className="ax-row ax-row-wrap" style={{ gap: 8 }}>
                {(servicesQuery.data ?? []).map((service) => (
                  <Chip
                    key={service.id}
                    active={selectedServices.includes(service.slug)}
                    onClick={() => {
                      toggleService(service.slug);
                      trackFieldFilled('service_interest');
                    }}
                  >
                    {service.title}
                  </Chip>
                ))}
              </div>
            ) : null}

            {form.formState.errors.service_interest?.message ? (
              <span className="ax-error">{form.formState.errors.service_interest.message}</span>
            ) : null}
          </div>

          <Field
            label="Предпочтительный канал связи"
            error={form.formState.errors.preferred_contact_method?.message}
          >
            <select
              className="ax-select"
              {...form.register('preferred_contact_method')}
              onBlur={() => trackFieldFilled('preferred_contact_method')}
            >
              <option value="telegram">Telegram</option>
              <option value="phone">Телефон</option>
              <option value="email">Email</option>
            </select>
          </Field>

          {submitLead.isError ? (
            <ErrorState
              title="Не удалось отправить заявку"
              description={submitLead.error instanceof Error ? submitLead.error.message : 'Попробуйте снова через минуту.'}
              onRetry={() => {
                void doSubmit();
              }}
            />
          ) : null}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!form.formState.isValid || !isOnline || submitLead.isPending}
            loading={submitLead.isPending}
            type="submit"
            style={{ marginTop: 24, marginBottom: 32 }}
          >
            Отправить заявку
          </Button>

          <div className="ax-row ax-row-wrap">
            <Button variant="secondary" onClick={() => navigate('/services')}>
              Вернуться к услугам
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
