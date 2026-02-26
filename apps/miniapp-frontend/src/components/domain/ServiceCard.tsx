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
  variant = 'default',
  onClick,
}: {
  service: Service;
  category?: string;
  variant?: 'default' | 'minimal';
  onClick?: () => void;
}) {
  const imageId = SERVICE_IMAGE_MAP[service.slug] ?? 'svc-process';

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          flex: 1,
          minHeight: 0,
          cursor: onClick ? 'pointer' : 'default',
          background: 'transparent',
          textAlign: 'left',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <MjImage id={imageId} height="100%" borderRadius={0} scrim={false} alt={service.title} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, transparent 40%, rgba(5,10,15,0.8) 100%)',
          borderRadius: 18,
        }} />
        <span style={{
          fontSize: 15,
          fontWeight: 300,
          lineHeight: 1.25,
          letterSpacing: '0.5px',
          color: '#7EE8F2',
          position: 'relative',
          zIndex: 2,
        }}>
          {service.title}
        </span>
      </button>
    );
  }

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
