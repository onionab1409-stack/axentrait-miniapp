/** Mapping tag slugs to readable labels for UI chips and badges. */
export const TAG_LABELS: Record<string, string> = {
  ecommerce: 'E-commerce',
  'e-commerce': 'E-commerce',
  'data-platform': 'Платформа данных',
  manufacturing: 'Производство',
  iot: 'IoT',
  fintech: 'Финтех',
  logistics: 'Логистика',
  medtech: 'Медтех',
  saas: 'SaaS',
  retail: 'Ритейл',
  rpa: 'RPA',
  crm: 'CRM',
  erp: 'ERP',
  wms: 'WMS',
  ml: 'ML',
  nlp: 'NLP',
  devops: 'DevOps',
  'ci-cd': 'CI/CD',
  bi: 'BI',
  'bi-dashboard': 'BI-дашборды',
  cloud: 'Облако',
  security: 'Безопасность',
  'security-audit': 'Аудит ИБ',
  'pdn-compliance': 'Комплаенс ПДн',
  'penetration-testing': 'Пентест',
  'soc-monitoring': 'SOC-мониторинг',
  automation: 'Автоматизация',
  ai: 'AI',
  'digital-twin': 'Цифровой двойник',
  'process-optimization': 'Оптимизация',
  clickhouse: 'ClickHouse',
  'data-quality': 'Качество данных',
  mlops: 'MLOps',
  kubernetes: 'Kubernetes',
  docker: 'Docker',
  terraform: 'Terraform',
  scada: 'SCADA',
  predictive: 'Предиктивная аналитика',
};

export function getTagLabel(slug: string): string {
  const key = slug.toLowerCase().trim();
  if (TAG_LABELS[key]) return TAG_LABELS[key];
  return slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}
