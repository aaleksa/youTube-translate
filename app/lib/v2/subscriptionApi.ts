import type { PremiumAccessInfo } from '../../../v2-core/types';
import { apiGet } from './apiClient';

export async function getSubscriptionAccess(): Promise<PremiumAccessInfo> {
  return apiGet<PremiumAccessInfo>('/subscription');
}
