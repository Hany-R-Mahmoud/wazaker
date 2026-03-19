import { createBilingualText, type BilingualText } from './bilingual-copy';

type RecitationListItem = {
  title: BilingualText;
  detail: BilingualText;
};

type RecitationSessionItem = {
  title: BilingualText;
  status: BilingualText;
  time: string;
};

type RecitationFeedbackItem = {
  label: BilingualText;
  value: BilingualText;
};

export const recitationHomeCopy = {
  hero: {
    kicker: 'wazaker',
    title: createBilingualText('رفيق مراجعة التلاوة', 'AI-guided Quran recitation revision'),
    body: createBilingualText(
      'منصة تبدأ باختيار المقطع، ثم التسجيل، ثم مراجعة النتائج بعناية.',
      'Arabic-first mobile foundation for selecting a passage, reciting from memory, receiving careful feedback, and retrying fast.',
    ),
  },
  focus: {
    label: createBilingualText('التركيز الحالي', 'Current focus'),
    body: createBilingualText(
      'المرحلة الأولى تركز فقط على التسميع الذكي، اختيار المقطع، النتيجة، ثم إعادة المحاولة.',
      'Phase 1 is limited to smart recitation, passage selection, results, and quick retry.',
    ),
  },
  quickActions: [
    {
      title: createBilingualText('ابدأ التسميع', 'Start Recitation'),
      detail: createBilingualText('سجّل تسميعك وراجع الأخطاء', 'Record and review mistakes'),
    },
    {
      title: createBilingualText('اختر المقطع', 'Choose Passage'),
      detail: createBilingualText('حدّد السورة أو الصفحة المستهدفة', 'Select surah, ayah range, or page'),
    },
    {
      title: createBilingualText('نتائج سابقة', 'Recent Results'),
      detail: createBilingualText('راجع آخر الجلسات المحفوظة', 'Review saved sessions'),
    },
  ] satisfies readonly RecitationListItem[],
  sessions: [
    {
      title: createBilingualText('الفاتحة', 'Al-Fatiha'),
      status: createBilingualText('دقة جيدة', 'Good accuracy'),
      time: 'Today · 7:40 PM',
    },
    {
      title: createBilingualText('البقرة 1-5', 'Al-Baqarah 1-5'),
      status: createBilingualText('يحتاج مراجعة', 'Needs revision'),
      time: 'Yesterday · 9:15 PM',
    },
  ] satisfies readonly RecitationSessionItem[],
  feedback: [
    {
      label: createBilingualText('حذف', 'Omission'),
      value: createBilingualText('كلمات أو آية سقطت', 'Words or ayah skipped'),
    },
    {
      label: createBilingualText('استبدال', 'Substitution'),
      value: createBilingualText('لفظ مختلف عن المتوقع', 'Different wording detected'),
    },
    {
      label: createBilingualText('ثقة منخفضة', 'Low confidence'),
      value: createBilingualText('لا نجزم عند ضعف الإشارة', 'Avoid overclaiming when uncertain'),
    },
  ] satisfies readonly RecitationFeedbackItem[],
  footer: {
    title: createBilingualText('الهدف التالي', 'Next implementation target'),
    body: createBilingualText(
      'اختيار المقطع، التسجيل، النتيجة، ثم سجل الجلسات المحلية.',
      'Passage selection, recorder flow, mock result screen, and local session history.',
    ),
  },
} as const;

export type RecitationHomeCopy = typeof recitationHomeCopy;
