import { Badge } from '../ui/Badge';
import { MjImage } from '../ui/MjImage';
import type { Service } from '../../shared/types/content';

const SERVICE_IMAGE_MAP: Record<string, string> = {
  'cybersecurity-audit-protection': 'svc-security',
  'process-optimization-audit-kpi': 'svc-process',
  'automation-rpa-crm-erp': 'svc-automation',
  'ai-integration-use-cases-mlops': 'svc-ai',
  'cloud-devops-ci-cd-platform': 'svc-devops',
  'iot-digital-twins-pilot-platform': 'svc-iot',
  'data-analytics-platform-bi': 'svc-data',
};

export function ServiceCard({
  service,
  category,
  onClick,
}: {
  service: Service;
  category?: string;
  onClick?: () => void;
}) {
  const imageId = SERVICE_IMAGE_MAP[service.slug] ?? 'svc-process';
  const formattedPrice = service.startingPrice ? Number(service.startingPrice).toLocaleString('ru-RU') : null;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '1px solid var(--app-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: 160,
        background: 'transparent',
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <MjImage id={imageId} height={160} borderRadius={0} alt={service.title}>
        {category ? <div style={{ fontSize: 11, color: 'rgba(240,246,252,0.45)', marginBottom: 4 }}>{category}</div> : null}
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{service.title}</div>
        <div style={{ fontSize: 12, color: 'rgba(240,246,252,0.75)', marginBottom: 8 }}>{service.shortPitch}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge>{service.typicalTimeline}</Badge>
          {formattedPrice ? <Badge>от {formattedPrice} ₽</Badge> : null}
        </div>
      </MjImage>
    </button>
  );
}
