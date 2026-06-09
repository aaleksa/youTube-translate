export interface NotesSection {
  heading: string;
  bullets: string[];
}

export interface VideoNotesResult {
  title: string;
  mainIdeas: string[];
  sections: NotesSection[];
}

export function parseNotesResponse(raw: string): VideoNotesResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      title?: string;
      mainIdeas?: unknown;
      sections?: Array<{
        heading?: string;
        bullets?: unknown;
      }>;
    };

    const mainIdeas = Array.isArray(parsed.mainIdeas)
      ? parsed.mainIdeas
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];

    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
          .map((section) => {
            const heading = section.heading?.trim();
            const bullets = Array.isArray(section.bullets)
              ? section.bullets
                  .map((item) => String(item).trim())
                  .filter(Boolean)
              : [];

            if (!heading || bullets.length === 0) return null;

            return { heading, bullets };
          })
          .filter((section): section is NotesSection => section !== null)
      : [];

    if (mainIdeas.length === 0 && sections.length === 0) {
      return null;
    }

    return {
      title: parsed.title?.trim() || 'Конспект відео',
      mainIdeas,
      sections,
    };
  } catch {
    return null;
  }
}
