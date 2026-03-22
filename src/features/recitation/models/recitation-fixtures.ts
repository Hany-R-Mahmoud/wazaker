import { createAnalysisService, type AnalysisService } from '../services/analysis-service';
import type {
  AnalyzeRecitationRequest,
  AnalyzeRecitationResponse,
  ComparisonResult,
  SessionRecord,
  TargetPassage,
} from '../types';

export const recitationFixtureTargets: readonly TargetPassage[] = [
  {
    id: 'target-al-fatiha-1-7',
    selectionType: 'ayahRange',
    pageNumber: null,
    surahNumber: 1,
    ayahStart: 1,
    ayahEnd: 7,
    displayNameAr: 'سورة الفاتحة ١-٧',
    displayNameEn: 'Surah Al-Fatiha 1-7',
    canonicalText:
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    canonicalReference: '1:1-7',
  },
  {
    id: 'target-al-baqarah-1-5',
    selectionType: 'ayahRange',
    pageNumber: null,
    surahNumber: 2,
    ayahStart: 1,
    ayahEnd: 5,
    displayNameAr: 'البقرة ١-٥',
    displayNameEn: 'Al-Baqarah 1-5',
    canonicalText: 'الم ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ',
    canonicalReference: '2:1-5',
  },
  {
    id: 'target-page-1',
    selectionType: 'page',
    pageNumber: 1,
    surahNumber: null,
    ayahStart: null,
    ayahEnd: null,
    displayNameAr: 'الصفحة الأولى',
    displayNameEn: 'Page 1',
    canonicalText:
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    canonicalReference: 'Page 1',
  },
] as const;

export const defaultRecitationFixtureTarget = recitationFixtureTargets[0];

export const successfulAnalysisFixture: AnalyzeRecitationResponse = {
  attemptId: 'attempt-success',
  targetPassageId: defaultRecitationFixtureTarget.id,
  overallConfidence: 0.92,
  confidenceBand: 'high',
  summary: {
    ar: 'المحاولة قوية مع موضع واحد يحتاج مراجعة خفيفة.',
    en: 'The attempt is strong with one segment that needs a light review.',
  },
  segments: [
    {
      id: 'segment-match-1',
      kind: 'match',
      expectedText: 'بِسْمِ اللَّهِ',
      observedText: 'بِسْمِ اللَّهِ',
      confidence: 0.98,
      startTokenIndex: 0,
      endTokenIndex: 1,
      message: {
        ar: 'البداية متطابقة مع الهدف.',
        en: 'The opening matches the target.',
      },
    },
    {
      id: 'segment-substitution-1',
      kind: 'substitution',
      expectedText: 'الرَّحْمَٰنِ',
      observedText: 'الرَّحِيمِ',
      confidence: 0.78,
      startTokenIndex: 2,
      endTokenIndex: 2,
      message: {
        ar: 'هناك لفظ قريب يحتاج تصحيحًا.',
        en: 'A close wording difference needs correction.',
      },
    },
  ],
  retryRecommended: true,
  manualVerificationRecommended: false,
};

export const lowConfidenceAnalysisFixture: AnalyzeRecitationResponse = {
  attemptId: 'attempt-low-confidence',
  targetPassageId: defaultRecitationFixtureTarget.id,
  overallConfidence: 0.44,
  confidenceBand: 'low',
  summary: {
    ar: 'الإشارة غير كافية للحكم الكامل، والأفضل إعادة المحاولة أو المراجعة يدويًا.',
    en: 'The signal is too weak for a full judgment, so retrying or checking manually is safer.',
  },
  segments: [
    {
      id: 'segment-uncertain-1',
      kind: 'uncertain',
      expectedText: 'الْحَمْدُ لِلَّهِ',
      observedText: null,
      confidence: 0.31,
      startTokenIndex: 3,
      endTokenIndex: 4,
      message: {
        ar: 'المقطع غير واضح بما يكفي، لذلك لا نقدّم حكمًا نهائيًا.',
        en: 'This segment is too unclear for a final judgment.',
      },
    },
  ],
  retryRecommended: true,
  manualVerificationRecommended: true,
};

export function mapAnalysisResponseToComparisonResult(
  response: AnalyzeRecitationResponse,
): ComparisonResult {
  return {
    attemptId: response.attemptId,
    targetPassageId: response.targetPassageId,
    overallConfidence: response.overallConfidence,
    confidenceBand: response.confidenceBand,
    summaryAr: response.summary.ar,
    summaryEn: response.summary.en,
    segments: response.segments.map((segment) => ({
      id: segment.id,
      kind: segment.kind,
      expectedText: segment.expectedText,
      observedText: segment.observedText,
      confidence: segment.confidence,
      startTokenIndex: segment.startTokenIndex,
      endTokenIndex: segment.endTokenIndex,
      messageAr: segment.message.ar,
      messageEn: segment.message.en,
    })),
    retryRecommended: response.retryRecommended,
    manualVerificationRecommended: response.manualVerificationRecommended,
  };
}

export function createFixtureAnalysisService(): AnalysisService {
  return createAnalysisService((request: AnalyzeRecitationRequest) => {
    const template =
      request.target.id === defaultRecitationFixtureTarget.id
        ? successfulAnalysisFixture
        : lowConfidenceAnalysisFixture;

    return {
      ...template,
      attemptId: request.attemptId,
      targetPassageId: request.target.id,
    };
  });
}

export const sampleSessionHistory: readonly SessionRecord[] = [
  {
    id: 'session-1',
    targetPassage: defaultRecitationFixtureTarget,
    attempt: {
      id: 'attempt-success',
      targetPassageId: defaultRecitationFixtureTarget.id,
      status: 'completed',
      audioUri: 'file:///mock/al-fatiha.m4a',
      durationMs: 18000,
      startedAt: '2026-03-19T19:40:00.000Z',
      completedAt: '2026-03-19T19:40:18.000Z',
      failureReason: null,
    },
    result: mapAnalysisResponseToComparisonResult(successfulAnalysisFixture),
    createdAt: '2026-03-19T19:40:18.000Z',
  },
] as const;
