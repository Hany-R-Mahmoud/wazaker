import {
  analysisRequestSchema,
  analysisResponseSchema,
  comparisonResultSchema,
  targetPassageSchema,
} from '../features/recitation/types';

describe('recitation types and schemas', () => {
  it('validates a page target passage', () => {
    expect(
      targetPassageSchema.parse({
        id: 'target-1',
        selectionType: 'page',
        pageNumber: 2,
        surahNumber: null,
        ayahStart: null,
        ayahEnd: null,
        displayNameAr: 'الصفحة 2',
        displayNameEn: 'Page 2',
        canonicalText: 'بِسْمِ اللَّهِ',
        canonicalReference: '1:1',
      }),
    ).toMatchObject({
      selectionType: 'page',
      pageNumber: 2,
    });
  });

  it('rejects invalid ayah ranges', () => {
    expect(() =>
      targetPassageSchema.parse({
        id: 'target-2',
        selectionType: 'ayahRange',
        pageNumber: null,
        surahNumber: 2,
        ayahStart: 5,
        ayahEnd: 4,
        displayNameAr: 'البقرة 5-4',
        displayNameEn: 'Al-Baqarah 5-4',
        canonicalText: 'text',
        canonicalReference: '2:5-4',
      }),
    ).toThrow();
  });

  it('validates the analysis request and response contract shapes', () => {
    const request = analysisRequestSchema.parse({
      attemptId: 'attempt-1',
      locale: 'ar',
      target: {
        id: 'target-1',
        selectionType: 'surah',
        pageNumber: null,
        surahNumber: 1,
        ayahStart: null,
        ayahEnd: null,
        displayName: {
          ar: 'الفاتحة',
          en: 'Al-Fatiha',
        },
        canonicalText: 'بِسْمِ اللَّهِ',
        canonicalReference: '1',
      },
      audio: {
        uri: 'file:///tmp/recitation.m4a',
        durationMs: 1200,
        mimeType: 'audio/m4a',
      },
    });

    expect(request.locale).toBe('ar');

    const response = analysisResponseSchema.parse({
      attemptId: 'attempt-1',
      targetPassageId: 'target-1',
      overallConfidence: 0.92,
      confidenceBand: 'high',
      summary: {
        ar: 'مطابقة جيدة',
        en: 'Good match',
      },
      segments: [
        {
          id: 'segment-1',
          kind: 'match',
          expectedText: 'بِسْمِ اللَّهِ',
          observedText: 'بِسْمِ اللَّهِ',
          confidence: 0.99,
          startTokenIndex: 0,
          endTokenIndex: 0,
          message: {
            ar: 'مطابق',
            en: 'Matches expected text',
          },
        },
      ],
      retryRecommended: false,
      manualVerificationRecommended: false,
    });

    expect(response.confidenceBand).toBe('high');
  });

  it('validates the comparison result schema', () => {
    expect(
      comparisonResultSchema.parse({
        attemptId: 'attempt-1',
        targetPassageId: 'target-1',
        overallConfidence: 0.6,
        confidenceBand: 'medium',
        summaryAr: 'يوجد فرق بسيط',
        summaryEn: 'There is a minor difference',
        segments: [],
        retryRecommended: true,
        manualVerificationRecommended: false,
      }),
    ).toMatchObject({
      confidenceBand: 'medium',
      retryRecommended: true,
    });
  });
});
