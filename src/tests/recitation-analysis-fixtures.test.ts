import {
  createFixtureAnalysisService,
  defaultRecitationFixtureTarget,
  lowConfidenceAnalysisFixture,
  mapAnalysisResponseToComparisonResult,
} from '../features/recitation/models/recitation-fixtures';

describe('recitation analysis fixtures', () => {
  it('maps fixture analysis responses into UI-facing comparison results', () => {
    expect(mapAnalysisResponseToComparisonResult(lowConfidenceAnalysisFixture)).toMatchObject({
      confidenceBand: 'low',
      manualVerificationRecommended: true,
      summaryEn: lowConfidenceAnalysisFixture.summary.en,
    });
  });

  it('returns deterministic fixture results for the default target', async () => {
    const service = createFixtureAnalysisService();

    await expect(
      service.analyzeRecitationAttempt({
        attemptId: 'attempt-123',
        locale: 'ar',
        target: {
          id: defaultRecitationFixtureTarget.id,
          selectionType: defaultRecitationFixtureTarget.selectionType,
          pageNumber: defaultRecitationFixtureTarget.pageNumber,
          surahNumber: defaultRecitationFixtureTarget.surahNumber,
          ayahStart: defaultRecitationFixtureTarget.ayahStart,
          ayahEnd: defaultRecitationFixtureTarget.ayahEnd,
          displayName: {
            ar: defaultRecitationFixtureTarget.displayNameAr,
            en: defaultRecitationFixtureTarget.displayNameEn,
          },
          canonicalText: defaultRecitationFixtureTarget.canonicalText,
          canonicalReference: defaultRecitationFixtureTarget.canonicalReference,
        },
        audio: {
          uri: 'file:///mock/audio.m4a',
          durationMs: 10000,
          mimeType: 'audio/m4a',
        },
      }),
    ).resolves.toMatchObject({
      attemptId: 'attempt-123',
      targetPassageId: defaultRecitationFixtureTarget.id,
      confidenceBand: 'high',
    });
  });
});
