import {
  analysisServiceResponseSchema,
  type ComparisonResult,
  type RecitationAttempt,
  type TargetPassage,
} from '../types';
import {
  createFixtureAnalysisService,
  mapAnalysisResponseToComparisonResult,
} from '../models/recitation-fixtures';

export interface SubmitRecitationAttemptInput {
  attempt: RecitationAttempt;
  target: TargetPassage;
}

export async function submitRecitationAttempt({
  attempt,
  target,
}: SubmitRecitationAttemptInput): Promise<ComparisonResult> {
  const response = await createFixtureAnalysisService().analyzeRecitationAttempt({
    attemptId: attempt.id,
    locale: 'ar',
    target: {
      id: target.id,
      selectionType: target.selectionType,
      pageNumber: target.pageNumber,
      surahNumber: target.surahNumber,
      ayahStart: target.ayahStart,
      ayahEnd: target.ayahEnd,
      displayName: {
        ar: target.displayNameAr,
        en: target.displayNameEn,
      },
      canonicalText: target.canonicalText,
      canonicalReference: target.canonicalReference,
    },
    audio: {
      uri: 'file:///mock/current-attempt.m4a',
      durationMs: 12000,
      mimeType: 'audio/m4a',
    },
  });

  return mapAnalysisResponseToComparisonResult(analysisServiceResponseSchema.parse(response));
}
