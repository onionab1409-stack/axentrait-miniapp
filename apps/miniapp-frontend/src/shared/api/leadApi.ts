import { apiFetch } from './apiClient';

export type LeadPayload = {
  companyName?: string;
  contactPhone?: string;
  contactEmail?: string;
  problemStatement: string;
  serviceInterest: string[];
  preferredContactMethod: 'telegram' | 'phone' | 'email';
  source?: string;
};

export type LeadRecord = {
  id: string;
  status: string;
  companyName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  preferredContactMethod: 'telegram' | 'phone' | 'email';
  problemStatement: string;
  serviceInterest: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reservedCount: number;
  isActive: boolean;
};

export type BookingReservation = {
  id: string;
  slotId: string;
  userId: string;
  leadId?: string | null;
  status: string;
  idempotencyKey: string;
  createdAt: string;
};

export async function submitLead(payload: LeadPayload): Promise<{ id: string; status: string }> {
  return apiFetch<{ id: string; status: string }>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyLeads(): Promise<LeadRecord[]> {
  return apiFetch<LeadRecord[]>('/leads/my');
}

export async function fetchBookingSlots(from?: string, to?: string): Promise<BookingSlot[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<BookingSlot[]>(`/booking/slots${suffix}`);
}

export async function reserveBookingSlot(payload: {
  slotId: string;
  idempotencyKey: string;
  leadId?: string;
}): Promise<BookingReservation> {
  return apiFetch<BookingReservation>('/booking/reserve', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
