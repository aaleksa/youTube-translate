import { getDifficultyCache } from './difficultyCache';
import { downloadSubtitleFile } from './exportSubtitles';
import { getGrammarCache } from './grammarCache';
import { getNotesCache } from './notesCache';
import type { InterfaceLanguage } from './i18n';
import { getQuizCache } from './quizCache';
import { getSummaryCache } from './summaryCache';
import { getTimelineCache } from './timelineCache';
import { formatTimestamp } from './timestamp';
import { getTranslationLanguageName } from './translationLanguages';

export interface StudyExportTranscriptLine {
  text: string;
  start?: string;
}

export interface StudyExportLabels {
  documentTitle: string;
  videoUrl: string;
  generatedAt: string;
  sectionTranscript: string;
  sectionSummary: string;
  sectionGrammar: string;
  sectionNotes: string;
  sectionDifficulty: string;
  sectionTimeline: string;
  sectionQuiz: string;
  mainIdeas: string;
  noAnalysis: string;
  english: string;
}

export interface StudyExportInput {
  videoId: string;
  title?: string;
  url?: string;
  transcript: StudyExportTranscriptLine[];
  fullText: string;
  interfaceLanguage: InterfaceLanguage;
  translations?: string[] | null;
  translationLanguage?: string;
  labels: StudyExportLabels;
}

interface StudyAnalysis {
  summary: ReturnType<typeof getSummaryCache>;
  grammar: ReturnType<typeof getGrammarCache>;
  notes: ReturnType<typeof getNotesCache>;
  difficulty: ReturnType<typeof getDifficultyCache>;
  timeline: ReturnType<typeof getTimelineCache>;
  quiz: ReturnType<typeof getQuizCache>;
}

function gatherAnalysis(input: StudyExportInput): StudyAnalysis {
  const textLength = input.fullText.length;
  return {
    summary: getSummaryCache(input.videoId, textLength),
    grammar: getGrammarCache(input.videoId, textLength),
    notes: getNotesCache(input.videoId, textLength),
    difficulty: getDifficultyCache(
      input.videoId,
      textLength,
      input.interfaceLanguage
    ),
    timeline: getTimelineCache(
      input.videoId,
      textLength,
      input.interfaceLanguage
    ),
    quiz: getQuizCache(input.videoId, textLength),
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTranscriptMarkdown(input: StudyExportInput): string {
  const lines: string[] = [];
  const translationLabel = input.translationLanguage
    ? getTranslationLanguageName(input.translationLanguage)
    : null;
  const hasTranslations =
    Boolean(input.translations?.length) &&
    input.translations!.some((line) => line.trim());

  if (hasTranslations && translationLabel) {
    lines.push(`| ${input.labels.english} | ${translationLabel} |`);
    lines.push('| --- | --- |');
    input.transcript.forEach((line, index) => {
      const en = line.text.trim();
      const tr = input.translations?.[index]?.trim() ?? '';
      if (!en && !tr) return;
      lines.push(`| ${en} | ${tr} |`);
    });
    return lines.join('\n');
  }

  input.transcript.forEach((line) => {
    const text = line.text.trim();
    if (!text) return;
    const ts = formatTimestamp(line.start);
    lines.push(ts ? `[${ts}] ${text}` : text);
  });

  return lines.join('\n');
}

function buildTranscriptHtml(input: StudyExportInput): string {
  const translationLabel = input.translationLanguage
    ? getTranslationLanguageName(input.translationLanguage)
    : null;
  const hasTranslations =
    Boolean(input.translations?.length) &&
    input.translations!.some((line) => line.trim());

  if (hasTranslations && translationLabel) {
    const rows = input.transcript
      .map((line, index) => {
        const en = escapeHtml(line.text.trim());
        const tr = escapeHtml(input.translations?.[index]?.trim() ?? '');
        if (!en && !tr) return '';
        return `<tr><td>${en}</td><td>${tr}</td></tr>`;
      })
      .filter(Boolean)
      .join('');

    return `<table>
      <thead><tr><th>${escapeHtml(input.labels.english)}</th><th>${escapeHtml(translationLabel)}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  const items = input.transcript
    .map((line) => {
      const text = escapeHtml(line.text.trim());
      if (!text) return '';
      const ts = formatTimestamp(line.start);
      return `<p>${ts ? `<code>${escapeHtml(ts)}</code> ` : ''}${text}</p>`;
    })
    .filter(Boolean)
    .join('');

  return items;
}

function buildAnalysisMarkdown(
  analysis: StudyAnalysis,
  labels: StudyExportLabels
): string[] {
  const sections: string[] = [];

  if (analysis.summary?.summary) {
    sections.push(
      `## ${labels.sectionSummary}\n\n${analysis.summary.summary.trim()}`
    );
  }

  if (analysis.difficulty) {
    sections.push(
      `## ${labels.sectionDifficulty}\n\n**${analysis.difficulty.level}**\n\n${analysis.difficulty.explanation.trim()}`
    );
  }

  if (analysis.notes) {
    const parts = [`## ${labels.sectionNotes}\n`];
    if (analysis.notes.title) {
      parts.push(`### ${analysis.notes.title.trim()}\n`);
    }
    if (analysis.notes.mainIdeas.length > 0) {
      parts.push(`### ${labels.mainIdeas}\n`);
      analysis.notes.mainIdeas.forEach((idea) => {
        parts.push(`- ${idea.trim()}`);
      });
      parts.push('');
    }
    analysis.notes.sections.forEach((section) => {
      parts.push(`### ${section.heading.trim()}\n`);
      section.bullets.forEach((bullet) => {
        parts.push(`- ${bullet.trim()}`);
      });
      parts.push('');
    });
    sections.push(parts.join('\n').trim());
  }

  if (analysis.grammar && analysis.grammar.highlights.length > 0) {
    const lines = [`## ${labels.sectionGrammar}\n`];
    analysis.grammar.highlights.forEach((item) => {
      lines.push(`- **${item.pattern.trim()}** (×${item.count}) — ${item.note.trim()}`);
    });
    sections.push(lines.join('\n'));
  }

  if (analysis.timeline && analysis.timeline.moments.length > 0) {
    const lines = [`## ${labels.sectionTimeline}\n`];
    analysis.timeline.moments.forEach((moment) => {
      lines.push(`- \`${moment.timestamp}\` ${moment.description.trim()}`);
    });
    sections.push(lines.join('\n'));
  }

  if (analysis.quiz && analysis.quiz.questions.length > 0) {
    const lines = [`## ${labels.sectionQuiz}\n`];
    analysis.quiz.questions.forEach((question, index) => {
      lines.push(`### ${index + 1}. ${question.question.trim()}\n`);
      question.options.forEach((option, optionIndex) => {
        const marker = optionIndex === question.correctIndex ? '✓' : '-';
        lines.push(`${marker} ${option.trim()}`);
      });
      if (question.explanation?.trim()) {
        lines.push(`\n_${question.explanation.trim()}_\n`);
      }
      lines.push('');
    });
    sections.push(lines.join('\n').trim());
  }

  return sections;
}

function buildAnalysisHtml(
  analysis: StudyAnalysis,
  labels: StudyExportLabels
): string {
  const parts: string[] = [];

  if (analysis.summary?.summary) {
    parts.push(
      `<h2>${escapeHtml(labels.sectionSummary)}</h2>`,
      `<p>${escapeHtml(analysis.summary.summary.trim())}</p>`
    );
  }

  if (analysis.difficulty) {
    parts.push(
      `<h2>${escapeHtml(labels.sectionDifficulty)}</h2>`,
      `<p><strong>${escapeHtml(analysis.difficulty.level)}</strong></p>`,
      `<p>${escapeHtml(analysis.difficulty.explanation.trim())}</p>`
    );
  }

  if (analysis.notes) {
    parts.push(`<h2>${escapeHtml(labels.sectionNotes)}</h2>`);
    if (analysis.notes.title) {
      parts.push(`<h3>${escapeHtml(analysis.notes.title.trim())}</h3>`);
    }
    if (analysis.notes.mainIdeas.length > 0) {
      parts.push(
        `<h3>${escapeHtml(labels.mainIdeas)}</h3>`,
        '<ul>',
        ...analysis.notes.mainIdeas.map(
          (idea) => `<li>${escapeHtml(idea.trim())}</li>`
        ),
        '</ul>'
      );
    }
    analysis.notes.sections.forEach((section) => {
      parts.push(
        `<h3>${escapeHtml(section.heading.trim())}</h3>`,
        '<ul>',
        ...section.bullets.map((bullet) => `<li>${escapeHtml(bullet.trim())}</li>`),
        '</ul>'
      );
    });
  }

  if (analysis.grammar && analysis.grammar.highlights.length > 0) {
    parts.push(
      `<h2>${escapeHtml(labels.sectionGrammar)}</h2>`,
      '<ul>',
      ...analysis.grammar.highlights.map(
        (item) =>
          `<li><strong>${escapeHtml(item.pattern.trim())}</strong> (×${item.count}) — ${escapeHtml(item.note.trim())}</li>`
      ),
      '</ul>'
    );
  }

  if (analysis.timeline && analysis.timeline.moments.length > 0) {
    parts.push(
      `<h2>${escapeHtml(labels.sectionTimeline)}</h2>`,
      '<ul>',
      ...analysis.timeline.moments.map(
        (moment) =>
          `<li><code>${escapeHtml(moment.timestamp)}</code> ${escapeHtml(moment.description.trim())}</li>`
      ),
      '</ul>'
    );
  }

  if (analysis.quiz && analysis.quiz.questions.length > 0) {
    parts.push(`<h2>${escapeHtml(labels.sectionQuiz)}</h2>`);
    analysis.quiz.questions.forEach((question, index) => {
      parts.push(`<h3>${index + 1}. ${escapeHtml(question.question.trim())}</h3>`, '<ul>');
      question.options.forEach((option, optionIndex) => {
        const prefix = optionIndex === question.correctIndex ? '✓ ' : '';
        parts.push(`<li>${escapeHtml(prefix + option.trim())}</li>`);
      });
      parts.push('</ul>');
      if (question.explanation?.trim()) {
        parts.push(`<p><em>${escapeHtml(question.explanation.trim())}</em></p>`);
      }
    });
  }

  return parts.join('');
}

export function buildStudyReportMarkdown(input: StudyExportInput): string {
  const analysis = gatherAnalysis(input);
  const title = input.title?.trim() || input.videoId;
  const url = input.url?.trim() || `https://www.youtube.com/watch?v=${input.videoId}`;
  const generated = new Date().toLocaleString();

  const parts = [
    `# ${title}`,
    '',
    `**${input.labels.videoUrl}:** ${url}`,
    `**${input.labels.generatedAt}:** ${generated}`,
    '',
    `## ${input.labels.sectionTranscript}`,
    '',
    buildTranscriptMarkdown(input),
  ];

  const analysisSections = buildAnalysisMarkdown(analysis, input.labels);
  if (analysisSections.length > 0) {
    parts.push('', ...analysisSections);
  } else {
    parts.push('', `> ${input.labels.noAnalysis}`);
  }

  return parts.join('\n').trim() + '\n';
}

const STUDY_REPORT_STYLES = `
  .study-report { font-family: system-ui, sans-serif; line-height: 1.5; color: #111; max-width: 800px; }
  .study-report h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .study-report h2 { font-size: 1.15rem; margin-top: 1.5rem; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; }
  .study-report h3 { font-size: 1rem; margin-top: 1rem; }
  .study-report p, .study-report li { font-size: 0.95rem; }
  .study-report table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.9rem; }
  .study-report th, .study-report td { border: 1px solid #ddd; padding: 0.4rem 0.5rem; vertical-align: top; text-align: left; }
  .study-report th { background: #f5f5f5; }
  .study-report code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.85em; }
  .study-report ul { padding-left: 1.25rem; }
  .study-report .meta { color: #555; font-size: 0.9rem; margin-bottom: 1rem; }
`;

function buildStudyReportBodyHtml(input: StudyExportInput): string {
  const analysis = gatherAnalysis(input);
  const title = escapeHtml(input.title?.trim() || input.videoId);
  const url = escapeHtml(
    input.url?.trim() || `https://www.youtube.com/watch?v=${input.videoId}`
  );
  const generated = escapeHtml(new Date().toLocaleString());
  const analysisHtml = buildAnalysisHtml(analysis, input.labels);
  const analysisBlock =
    analysisHtml ||
    `<p><em>${escapeHtml(input.labels.noAnalysis)}</em></p>`;

  return `<div class="study-report">
  <h1>${title}</h1>
  <div class="meta">
    <div><strong>${escapeHtml(input.labels.videoUrl)}:</strong> ${url}</div>
    <div><strong>${escapeHtml(input.labels.generatedAt)}:</strong> ${generated}</div>
  </div>
  <h2>${escapeHtml(input.labels.sectionTranscript)}</h2>
  ${buildTranscriptHtml(input)}
  ${analysisBlock}
</div>`;
}

export function buildStudyReportHtml(input: StudyExportInput): string {
  const title = escapeHtml(input.title?.trim() || input.videoId);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${STUDY_REPORT_STYLES}</style>
</head>
<body>
  ${buildStudyReportBodyHtml(input)}
</body>
</html>`;
}

export function downloadStudyReportMarkdown(input: StudyExportInput): void {
  const content = buildStudyReportMarkdown(input);
  const filename = `${input.videoId}-study-report.md`;
  downloadSubtitleFile(content, filename, 'text/markdown;charset=utf-8');
}

export async function downloadStudyReportPdf(
  input: StudyExportInput
): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.innerHTML = `<style>${STUDY_REPORT_STYLES}</style>${buildStudyReportBodyHtml(input)}`;
  document.body.appendChild(container);

  try {
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `${input.videoId}-study-report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
