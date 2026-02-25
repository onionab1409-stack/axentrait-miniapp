import { Injectable } from '@nestjs/common';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+?\d[\d()\-\s]{6,}\d)/g;
const INN_REGEX = /\b\d{10,12}\b/g;
const INJECTION_PATTERNS = [
  /ignore\s+system/gi,
  /forget\s+previous/gi,
  /забудь\s+правил/gi,
  /игнорируй\s+инструкц/gi,
];

@Injectable()
export class SafetyLayer {
  sanitizeInput(message: string): { clean: string; warnings: string[]; rejected: boolean; rejectCode?: string } {
    const warnings: string[] = [];
    let clean = message.trim();

    if (clean.length === 0) {
      return { clean, warnings, rejected: true, rejectCode: 'EMPTY_MESSAGE' };
    }

    if (clean.length > 4000) {
      clean = clean.slice(0, 4000);
      warnings.push('input_truncated');
    }

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(clean)) {
        return {
          clean,
          warnings,
          rejected: true,
          rejectCode: 'PROMPT_INJECTION_DETECTED',
        };
      }
    }

    const masked = clean
      .replace(EMAIL_REGEX, '[email_hidden]')
      .replace(PHONE_REGEX, '[phone_hidden]')
      .replace(INN_REGEX, '[inn_hidden]');

    if (masked !== clean) {
      warnings.push('pii_masked');
      clean = masked;
    }

    return {
      clean,
      warnings,
      rejected: false,
    };
  }

  sanitizeOutput(response: string): string {
    return response
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  }
}
