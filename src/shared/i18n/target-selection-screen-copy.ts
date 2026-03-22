import { createBilingualText } from './bilingual-copy';

export const targetSelectionScreenCopy = {
  hero: {
    kicker: 'selected passage flow',
    title: createBilingualText('اختر مقطع المراجعة', 'Choose the revision target'),
    body: createBilingualText(
      'هذا هو أول مسار حقيقي في التطبيق: اختيار المقطع قبل التسجيل مع إبقاء الجلسات السابقة ظاهرة وآمنة.',
      'This is the first real app flow: choose the target before recording while keeping prior sessions visible and safe.',
    ),
  },
  suggestedTargets: {
    label: createBilingualText('المقاطع المقترحة', 'Suggested targets'),
  },
  sessionHistory: {
    label: createBilingualText('الجلسات المحلية', 'Local session history'),
    ready: createBilingualText(
      'يظهر هنا آخر ما تم حفظه محليًا حتى يبقى التكرار السريع ممكنًا.',
      'The latest saved local sessions stay visible here so fast retry remains possible.',
    ),
    degraded: createBilingualText(
      'تعذر تحميل السجل المحلي بالكامل، لكن آخر بيانات متاحة ما زالت معروضة.',
      'Local history could not be fully loaded, but the latest available data is still shown.',
    ),
  },
  continueCta: createBilingualText('المتابعة إلى التسجيل', 'Continue to recording'),
} as const;

export type TargetSelectionScreenCopy = typeof targetSelectionScreenCopy;
