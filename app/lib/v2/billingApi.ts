import { apiPost } from './apiClient';

export async function createCheckoutSession(): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/billing/checkout');
}
