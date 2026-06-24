export interface CoachAdviceRequest {
  learningLevel: string;
  streak: number;
  quizAccuracyPercent: number | null;
  srsSuccessRatePercent: number | null;
  weakWords: string[];
  dueToday: number;
  cardsReviewedToday: number;
  dailyCardGoal: number;
  vocabularySaved: number;
  vocabularyGoal: number;
  taskLanguage?: string;
  interfaceLanguage?: string;
}

export interface CoachAdviceResponse {
  summary: string;
  focusTips: string[];
}
