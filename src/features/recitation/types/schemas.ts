import { z } from 'zod';

export const bilingualTextSchema = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
});

export const selectionTypeSchema = z.enum(['page', 'surah', 'ayahRange']);

export const targetPassageSchema = z
  .object({
    id: z.string().min(1),
    selectionType: selectionTypeSchema,
    pageNumber: z.number().int().min(1).nullable(),
    surahNumber: z.number().int().min(1).nullable(),
    ayahStart: z.number().int().min(1).nullable(),
    ayahEnd: z.number().int().min(1).nullable(),
    displayNameAr: z.string().min(1),
    displayNameEn: z.string().min(1),
    canonicalText: z.string().min(1),
    canonicalReference: z.string().min(1),
  })
  .superRefine((value, context) => {
    if (value.selectionType === 'page') {
      if (value.pageNumber === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'pageNumber is required when selectionType is page',
          path: ['pageNumber'],
        });
      }

      if (value.surahNumber !== null || value.ayahStart !== null || value.ayahEnd !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'page targets cannot include surah or ayah range values',
        });
      }
    }

    if (value.selectionType === 'surah') {
      if (value.surahNumber === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'surahNumber is required when selectionType is surah',
          path: ['surahNumber'],
        });
      }

      if (value.pageNumber !== null || value.ayahStart !== null || value.ayahEnd !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'surah targets cannot include page or ayah range values',
        });
      }
    }

    if (value.selectionType === 'ayahRange') {
      if (value.surahNumber === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'surahNumber is required when selectionType is ayahRange',
          path: ['surahNumber'],
        });
      }

      if (value.ayahStart === null || value.ayahEnd === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ayahStart and ayahEnd are required when selectionType is ayahRange',
        });
      }

      if (value.pageNumber !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ayahRange targets cannot include pageNumber',
          path: ['pageNumber'],
        });
      }
    }

    if (
      value.selectionType === 'ayahRange' &&
      value.ayahStart !== null &&
      value.ayahEnd !== null &&
      value.ayahStart > value.ayahEnd
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ayahStart must be less than or equal to ayahEnd',
        path: ['ayahEnd'],
      });
    }
  });

export const comparisonKindSchema = z.enum([
  'match',
  'omission',
  'insertion',
  'substitution',
  'uncertain',
]);

export const comparisonSegmentSchema = z
  .object({
    id: z.string().min(1),
    kind: comparisonKindSchema,
    expectedText: z.string().min(1),
    observedText: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    startTokenIndex: z.number().int().min(0),
    endTokenIndex: z.number().int().min(0),
    messageAr: z.string().min(1),
    messageEn: z.string().min(1),
  })
  .superRefine((value, context) => {
    if (value.endTokenIndex < value.startTokenIndex) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTokenIndex must be greater than or equal to startTokenIndex',
        path: ['endTokenIndex'],
      });
    }

    if (
      value.kind === 'uncertain' &&
      /definit|exact|confirmed|certain/i.test(`${value.messageAr} ${value.messageEn}`)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'uncertain segments must not use definitive language',
        path: ['messageEn'],
      });
    }
  });

export const comparisonResultSchema = z.object({
  attemptId: z.string().min(1),
  targetPassageId: z.string().min(1),
  overallConfidence: z.number().min(0).max(1),
  confidenceBand: z.enum(['high', 'medium', 'low']),
  summaryAr: z.string().min(1),
  summaryEn: z.string().min(1),
  segments: z.array(comparisonSegmentSchema),
  retryRecommended: z.boolean(),
  manualVerificationRecommended: z.boolean(),
});

export const recitationAttemptSchema = z.object({
  id: z.string().min(1),
  targetPassageId: z.string().min(1),
  status: z.enum(['draft', 'recording', 'uploading', 'analyzing', 'completed', 'cancelled', 'failed']),
  audioUri: z.string().min(1).nullable(),
  durationMs: z.number().int().min(0),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1).nullable(),
  failureReason: z.string().min(1).nullable(),
});

export const sessionRecordSchema = z.object({
  id: z.string().min(1),
  targetPassage: targetPassageSchema,
  attempt: recitationAttemptSchema,
  result: comparisonResultSchema.nullable(),
  createdAt: z.string().min(1),
});

export const sessionRecordArraySchema = z.array(sessionRecordSchema);

export const analysisServiceTargetSchema = z.object({
  id: z.string().min(1),
  selectionType: selectionTypeSchema,
  pageNumber: z.number().int().min(1).nullable(),
  surahNumber: z.number().int().min(1).nullable(),
  ayahStart: z.number().int().min(1).nullable(),
  ayahEnd: z.number().int().min(1).nullable(),
  displayName: bilingualTextSchema,
  canonicalText: z.string().min(1),
  canonicalReference: z.string().min(1),
});

export const recitationAudioPayloadSchema = z.object({
  uri: z.string().min(1),
  durationMs: z.number().int().min(1),
  mimeType: z.string().min(1),
});

export const analysisServiceRequestSchema = z.object({
  attemptId: z.string().min(1),
  locale: z.enum(['ar', 'en']),
  target: analysisServiceTargetSchema,
  audio: recitationAudioPayloadSchema,
});

export const analysisServiceSegmentSchema = z.object({
  id: z.string().min(1),
  kind: comparisonKindSchema,
  expectedText: z.string().min(1),
  observedText: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  startTokenIndex: z.number().int().min(0),
  endTokenIndex: z.number().int().min(0),
  message: bilingualTextSchema,
});

export const analysisServiceResponseSchema = z.object({
  attemptId: z.string().min(1),
  targetPassageId: z.string().min(1),
  overallConfidence: z.number().min(0).max(1),
  confidenceBand: z.enum(['high', 'medium', 'low']),
  summary: bilingualTextSchema,
  segments: z.array(analysisServiceSegmentSchema),
  retryRecommended: z.boolean(),
  manualVerificationRecommended: z.boolean(),
});

export const analysisRequestSchema = analysisServiceRequestSchema;
export const analysisResponseSchema = analysisServiceResponseSchema;

export type TargetPassageInput = z.infer<typeof targetPassageSchema>;
export type ComparisonResultInput = z.infer<typeof comparisonResultSchema>;
export type AnalysisServiceRequestInput = z.infer<typeof analysisServiceRequestSchema>;
export type AnalysisServiceResponseInput = z.infer<typeof analysisServiceResponseSchema>;
