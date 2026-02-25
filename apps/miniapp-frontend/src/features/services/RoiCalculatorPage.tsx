import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoiCalculatorView } from '../../components/domain/RoiCalculatorView';
import { fetchService } from '../../shared/api/contentApi';
import { track } from '../../shared/analytics/track';

const roiSchema = z.object({
  employees_count: z.number().min(1, 'Минимум 1'),
  hours_wasted_per_week: z.number().min(1, 'Минимум 1 час'),
  avg_hourly_cost: z.number().min(100, 'Минимум 100 ₽'),
  automation_percent: z.number().min(5, 'Минимум 5%').max(95, 'Максимум 95%'),
  implementation_cost_range: z.number().min(50_000, 'Минимум 50 000 ₽'),
});

type RoiFormValues = z.infer<typeof roiSchema>;

function formatRub(value: number) {
  return value.toLocaleString('ru-RU');
}

export default function RoiCalculatorPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [result, setResult] = useState<{
    monthlySavings: number;
    annualSavings: number;
    roiPercent: number;
    paybackMonths: number;
  } | null>(null);

  const serviceQuery = useQuery({
    queryKey: ['content', 'service', id],
    queryFn: () => fetchService(id),
  });

  useEffect(() => {
    track('calculator_opened', { screen_id: 'SCR-SVC-040' });
  }, []);

  const form = useForm<RoiFormValues>({
    resolver: zodResolver(roiSchema as any),
    defaultValues: {
      employees_count: 20,
      hours_wasted_per_week: 4,
      avg_hourly_cost: 1600,
      automation_percent: 35,
      implementation_cost_range: 900_000,
    },
    mode: 'onSubmit',
  });

  const formulaText = useMemo(
    () =>
      'monthly_savings = employees_count × hours_wasted_per_week × 4.33 × avg_hourly_cost × (automation_percent / 100)',
    [],
  );

  const submit = form.handleSubmit((values) => {
    const monthlySavings =
      values.employees_count *
      values.hours_wasted_per_week *
      4.33 *
      values.avg_hourly_cost *
      (values.automation_percent / 100);
    const annualSavings = monthlySavings * 12;
    const paybackMonths = values.implementation_cost_range / Math.max(monthlySavings, 1);
    const roiPercent = ((annualSavings - values.implementation_cost_range) / values.implementation_cost_range) * 100;

    setResult({
      monthlySavings,
      annualSavings,
      roiPercent,
      paybackMonths,
    });

    localStorage.setItem(
      'axentrait.roi.last',
      JSON.stringify({
        ...values,
        monthlySavings,
        annualSavings,
        roiPercent,
        paybackMonths,
      }),
    );

    track('calculator_used', { screen_id: 'SCR-SVC-040' });
  });

  return (
    <AppShell title="ROI калькулятор" showBack showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 8 }}>
          <h1 className="h2">{serviceQuery.data?.title ?? 'Оценка экономического эффекта'}</h1>
          <p className="p muted">Мы считаем по введённым данным и показываем формулу, чтобы оценка была прозрачной.</p>
        </div>
      </Card>

      <Card>
        <form
          className="ax-col"
          style={{ gap: 12 }}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <RoiCalculatorView register={form.register} errors={form.formState.errors} />

          <div className="ax-row ax-row-wrap">
            <Button onClick={() => void submit()}>Рассчитать</Button>
            <Button
              variant="secondary"
              onClick={() => {
                form.reset({
                  employees_count: 10,
                  hours_wasted_per_week: 3,
                  avg_hourly_cost: 1400,
                  automation_percent: 30,
                  implementation_cost_range: 600_000,
                });
              }}
            >
              Быстрая оценка
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="ax-col" style={{ gap: 8 }}>
          <strong>Формула</strong>
          <code style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{formulaText}</code>
        </div>
      </Card>

      {result ? (
        <Card>
          <div className="ax-grid ax-grid-2">
            <div className="ax-col">
              <span className="muted">Экономия в месяц</span>
              <strong className="metric" style={{ fontSize: 24, color: 'var(--app-accent)' }}>
                {formatRub(result.monthlySavings)} ₽
              </strong>
            </div>
            <div className="ax-col">
              <span className="muted">Экономия в год</span>
              <strong className="metric" style={{ fontSize: 24 }}>
                {formatRub(result.annualSavings)} ₽
              </strong>
            </div>
            <div className="ax-col">
              <span className="muted">Окупаемость</span>
              <strong className="metric" style={{ fontSize: 24 }}>
                {result.paybackMonths.toFixed(1)} мес.
              </strong>
            </div>
            <div className="ax-col">
              <span className="muted">ROI</span>
              <strong className="metric" style={{ fontSize: 24 }}>
                {result.roiPercent.toFixed(0)}%
              </strong>
            </div>
          </div>

          <div className="ax-row ax-row-wrap" style={{ marginTop: 12 }}>
            <Button
              onClick={() => {
                track('calculator_result_shared', { source: 'roi_page' });
                track('cta_consultation_clicked', { source_screen: 'SCR-SVC-040' });
                navigate(
                  `/lead?problem=${encodeURIComponent(
                    `Нужна проверка ROI: экономия ~${formatRub(result.monthlySavings)} ₽/мес, окупаемость ~${result.paybackMonths.toFixed(1)} мес.`,
                  )}`,
                );
              }}
            >
              Отправить расчет в заявку
            </Button>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
