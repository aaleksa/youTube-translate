export function getFreeAiDailyLimit(): number {
  const configured = Number(process.env.FREE_AI_DAILY_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? configured : 20;
}

export function getPremiumAiDailyLimit(): number | null {
  const raw = process.env.PREMIUM_AI_DAILY_LIMIT?.trim().toLowerCase();

  if (!raw || raw === 'unlimited') {
    return null;
  }

  const configured = Number(raw);
  return Number.isFinite(configured) && configured > 0 ? configured : null;
}

export function formatUsagePeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
