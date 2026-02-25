import { z } from 'zod';

export const LeadCreateSchema = z.object({
  serviceSlug: z.string().min(1),
  source: z.string().max(64).optional(),
  notes: z.string().max(4000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(32).optional(),
});

export const ProfilePatchSchema = z.object({
  fullName: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  role: z.string().max(120).optional(),
});

export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
export type ProfilePatchInput = z.infer<typeof ProfilePatchSchema>;
