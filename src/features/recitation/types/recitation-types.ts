export type SupportedLocale = 'ar' | 'en';

export type SelectionType = 'page' | 'surah' | 'ayahRange';

export type AttemptStatus =
  | 'draft'
  | 'recording'
  | 'uploading'
  | 'analyzing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type ComparisonKind =
  | 'match'
  | 'omission'
  | 'insertion'
  | 'substitution'
  | 'uncertain';

export type ConfidenceBand = 'high' | 'medium' | 'low';

export type BilingualText = {
  ar: string;
  en: string;
};

export type TargetPassage = {
  id: string;
  selectionType: SelectionType;
  pageNumber: number | null;
  surahNumber: number | null;
  ayahStart: number | null;
  ayahEnd: number | null;
  displayNameAr: string;
  displayNameEn: string;
  canonicalText: string;
  canonicalReference: string;
};

export type RecitationAttempt = {
  id: string;
  targetPassageId: string;
  status: AttemptStatus;
  audioUri: string | null;
  durationMs: number;
  startedAt: string;
  completedAt: string | null;
  failureReason: string | null;
};

export type ComparisonSegment = {
  id: string;
  kind: ComparisonKind;
  expectedText: string;
  observedText: string | null;
  confidence: number;
  startTokenIndex: number;
  endTokenIndex: number;
  messageAr: string;
  messageEn: string;
};

export type ComparisonResult = {
  attemptId: string;
  targetPassageId: string;
  overallConfidence: number;
  confidenceBand: ConfidenceBand;
  summaryAr: string;
  summaryEn: string;
  segments: readonly ComparisonSegment[];
  retryRecommended: boolean;
  manualVerificationRecommended: boolean;
};

export type SessionRecord = {
  id: string;
  targetPassage: TargetPassage;
  attempt: RecitationAttempt;
  result: ComparisonResult | null;
  createdAt: string;
};

export type RecitationAudioPayload = {
  uri: string;
  durationMs: number;
  mimeType: string;
};

export type AnalysisServiceTarget = {
  id: string;
  selectionType: SelectionType;
  pageNumber: number | null;
  surahNumber: number | null;
  ayahStart: number | null;
  ayahEnd: number | null;
  displayName: BilingualText;
  canonicalText: string;
  canonicalReference: string;
};

export type AnalysisServiceSegment = {
  id: string;
  kind: ComparisonKind;
  expectedText: string;
  observedText: string | null;
  confidence: number;
  startTokenIndex: number;
  endTokenIndex: number;
  message: BilingualText;
};

export type AnalyzeRecitationRequest = {
  attemptId: string;
  locale: SupportedLocale;
  target: AnalysisServiceTarget;
  audio: RecitationAudioPayload;
};

export type AnalyzeRecitationResponse = {
  attemptId: string;
  targetPassageId: string;
  overallConfidence: number;
  confidenceBand: ConfidenceBand;
  summary: BilingualText;
  segments: readonly AnalysisServiceSegment[];
  retryRecommended: boolean;
  manualVerificationRecommended: boolean;
};
