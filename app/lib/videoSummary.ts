export interface VideoSummaryResult {
  summary: string;
}

export function parseSummaryResponse(raw: string): VideoSummaryResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      summary?: string;
    };

    const summary = parsed.summary?.trim();
    if (!summary) return null;

    return { summary };
  } catch {
    const trimmed = raw.trim();
    return trimmed ? { summary: trimmed } : null;
  }
}
