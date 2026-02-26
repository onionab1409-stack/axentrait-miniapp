/**
 * Mapping id -> Midjourney asset path.
 * If an asset is missing, a CSS gradient fallback is used.
 */
export const IMAGE_MAP = {
  // Heroes
  'hero-main': '/images/heroes/hero-main.webp',
  'hero-ai-hub': '/images/heroes/hero-ai-hub.webp',
  'splash-bg': '/images/heroes/splash-bg.webp',
  'survey-bg': '/images/heroes/survey-bg.webp',

  // Cases
  'case-fintech': '/images/cases/case-fintech.webp',
  'case-retail': '/images/cases/case-retail.webp',
  'case-logistics': '/images/cases/case-logistics.webp',
  'case-medtech': '/images/cases/case-medtech.webp',
  'case-saas': '/images/cases/case-saas.webp',
  'case-manufacturing': '/images/cases/case-manufacturing.webp',
  'case-ecommerce': '/images/cases/case-ecommerce.webp',

  // Services
  'svc-security': '/images/services/svc-security.webp',
  'svc-process': '/images/services/svc-process.webp',
  'svc-automation': '/images/services/svc-automation.webp',
  'svc-ai': '/images/services/svc-ai.webp',
  'svc-devops': '/images/services/svc-devops.webp',
  'svc-iot': '/images/services/svc-iot.webp',
  'svc-data': '/images/services/svc-data.webp',
};

/** CSS gradients used until assets are uploaded. */
export const FALLBACK_GRADIENTS: Record<string, string> = {
  'hero-main': 'radial-gradient(ellipse at 50% 30%, rgba(47,107,255,0.15), rgba(5,10,15,0.95) 70%)',
  'hero-ai-hub': 'radial-gradient(ellipse at 50% 40%, rgba(34,211,238,0.12), rgba(5,10,15,0.95) 70%)',
  'splash-bg': 'radial-gradient(circle at 50% 45%, rgba(34,211,238,0.08), rgba(5,10,15,0.98) 60%)',
  'survey-bg': 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.12), rgba(5,10,15,0.95) 70%)',

  'case-fintech': 'linear-gradient(145deg, rgba(47,107,255,0.12), rgba(5,10,15,0.95))',
  'case-retail': 'linear-gradient(145deg, rgba(34,211,238,0.10), rgba(5,10,15,0.95))',
  'case-logistics': 'linear-gradient(145deg, rgba(34,211,238,0.08), rgba(10,20,35,0.95))',
  'case-medtech': 'linear-gradient(145deg, rgba(34,211,238,0.12), rgba(5,15,25,0.95))',
  'case-saas': 'linear-gradient(145deg, rgba(47,107,255,0.10), rgba(5,10,15,0.95))',
  'case-manufacturing': 'linear-gradient(145deg, rgba(34,211,238,0.08), rgba(8,15,25,0.95))',
  'case-ecommerce': 'linear-gradient(145deg, rgba(47,107,255,0.08), rgba(5,10,15,0.95))',

  'svc-security': 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(47,107,255,0.10), rgba(5,10,15,0.95))',
  'svc-process': 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(47,107,255,0.06), rgba(5,10,15,0.95))',
  'svc-automation': 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,211,238,0.08), rgba(5,10,15,0.95))',
  'svc-ai': 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.10), rgba(5,10,15,0.95))',
  'svc-devops': 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(47,107,255,0.06), rgba(5,10,15,0.95))',
  'svc-iot': 'linear-gradient(135deg, rgba(34,211,238,0.10), rgba(16,185,129,0.06), rgba(5,10,15,0.95))',
  'svc-data': 'linear-gradient(135deg, rgba(47,107,255,0.10), rgba(34,211,238,0.06), rgba(5,10,15,0.95))',
};

export function getBackground(id: string): string {
  const src = (IMAGE_MAP as unknown as Record<string, string | undefined>)[id];
  if (src) {
    return `url(${src})`;
  }
  return FALLBACK_GRADIENTS[id] ?? 'linear-gradient(145deg, rgba(15,30,50,0.9), rgba(5,10,20,0.95))';
}
