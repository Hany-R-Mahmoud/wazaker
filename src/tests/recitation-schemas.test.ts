import {
  analysisServiceResponseSchema,
  comparisonResultSchema,
  targetPassageSchema,
} from '../features/recitation/types';

describe('recitation schemas', () => {
  it('accepts a valid ayah range target passage', () => {
    expect(() =>
      targetPassageSchema.parse({
        id: 'target-1',
        selectionType: 'ayahRange',
        pageNumber: null,
        surahNumber: 2,
        ayahStart: 1,
        ayahEnd: 5,
        displayNameAr: 'البقرة ١-٥',
        displayNameEn: 'Al-Baqarah 1-5',
        canonicalText: 'الم',
        canonicalReference: '2:1-5',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid target mode combination', () => {
    expect(() =>
      targetPassageSchema.parse({
        id: 'target-2',
        selectionType: 'page',
        pageNumber: 1,
        surahNumber: 1,
        ayahStart: null,
        ayahEnd: null,
        displayNameAr: 'الصفحة ١',
        displayNameEn: 'Page 1',
        canonicalText: 'text',
        canonicalReference: 'page-1',
      }),
    ).toThrow(/page targets cannot include surah or ayah range values/i);
  });

  it('accepts a confidence-aware comparison result', () => {
    expect(() =>
      comparisonResultSchema.parse({
        attemptId: 'attempt-1',
        targetPassageId: 'target-1',
        overallConfidence: 0.82,
        confidenceBand: 'medium',
        summaryAr: 'هناك مواضع تحتاج مراجعة.',
        summaryEn: 'There are sections that need review.',
        retryRecommended: true,
        manualVerificationRecommended: false,
        segments: [
          {
            id: 'segment-1',
            kind: 'substitution',
            expectedText: 'الرحمن',
            observedText: 'الرحيم',
            confidence: 0.73,
            startTokenIndex: 0,
            endTokenIndex: 0,
            messageAr: 'يبدو أن هناك استبدالًا في هذا الموضع.',
            messageEn: 'This section appears to contain a substitution.',
          },
        ],
      }),
    ).not.toThrow();
  });

  it('accepts an OpenAPI-shaped analysis response payload', () => {
    expect(() =>
      analysisServiceResponseSchema.parse({
        attemptId: 'attempt-1',
        targetPassageId: 'target-1',
        overallConfidence: 0.61,
        confidenceBand: 'low',
        summary: {
          ar: 'النتيجة غير مؤكدة وتحتاج مراجعة.',
          en: 'The result is uncertain and needs review.',
        },
        retryRecommended: true,
        manualVerificationRecommended: true,
        segments: [
          {
            id: 'segment-2',
            kind: 'uncertain',
            expectedText: 'مالك',
            observedText: null,
            confidence: 0.32,
            startTokenIndex: 1,
            endTokenIndex: 1,
            message: {
              ar: 'الإشارة ضعيفة في هذا الموضع.',
              en: 'The signal is weak in this segment.',
            },
          },
        ],
      }),
    ).not.toThrow();
  });
});
