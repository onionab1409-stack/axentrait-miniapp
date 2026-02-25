import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Field } from '../ui/Field';

type RoiFormValues = {
  employees_count: number;
  hours_wasted_per_week: number;
  avg_hourly_cost: number;
  automation_percent: number;
  implementation_cost_range: number;
};

export function RoiCalculatorView({
  register,
  errors,
}: {
  register: UseFormRegister<RoiFormValues>;
  errors: FieldErrors<RoiFormValues>;
}) {
  return (
    <div className="ax-grid">
      <Field label="Сотрудников в процессе" error={errors.employees_count?.message}>
        <input className="ax-input" type="number" min={1} {...register('employees_count', { valueAsNumber: true })} />
      </Field>

      <Field label="Потери часов в неделю (на человека)" error={errors.hours_wasted_per_week?.message}>
        <input className="ax-input" type="number" min={1} {...register('hours_wasted_per_week', { valueAsNumber: true })} />
      </Field>

      <Field label="Средняя стоимость часа (₽)" error={errors.avg_hourly_cost?.message}>
        <input className="ax-input" type="number" min={100} step={100} {...register('avg_hourly_cost', { valueAsNumber: true })} />
      </Field>

      <Field label="Доля автоматизации (%)" hint="Подсказка: для первых пилотов обычно 30-50%" error={errors.automation_percent?.message}>
        <input className="ax-input" type="number" min={5} max={95} {...register('automation_percent', { valueAsNumber: true })} />
      </Field>

      <Field label="Стоимость внедрения (₽)" error={errors.implementation_cost_range?.message}>
        <input className="ax-input" type="number" min={50000} step={10000} {...register('implementation_cost_range', { valueAsNumber: true })} />
      </Field>
    </div>
  );
}
