const PII_KEYS = new Set([
  'email',
  'contactEmail',
  'phone',
  'contactPhone',
  'contact_email',
  'contact_phone',
]);

export const redactPii = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactPii);
  }
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      next[key] = PII_KEYS.has(key) ? '***' : redactPii(nested);
    }
    return next;
  }
  return value;
};
