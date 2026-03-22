import { createBilingualText } from './bilingual-copy';

export const recordingScreenCopy = {
  hero: {
    kicker: 'recording shell',
    title: createBilingualText('ابدأ محاولة تسميع قصيرة', 'Start a short recitation attempt'),
    body: createBilingualText(
      'اطلب إذن الميكروفون أولاً، ثم ابدأ التسجيل وأوقفه متى انتهيت.',
      'Request microphone access first, then start and stop the attempt when you are ready.',
    ),
  },
  target: {
    label: createBilingualText('المقطع المحدد', 'Selected target'),
    title: createBilingualText('سورة الفاتحة', 'Surah Al-Fatiha'),
    body: createBilingualText(
      'هدف قصير مناسب لأول اختبار تسجيل في المرحلة الأولى.',
      'A short target that fits the first MVP recording flow.',
    ),
    change: createBilingualText('اختر مقطعًا آخر', 'Choose another target'),
  },
  permission: {
    label: createBilingualText('إذن الميكروفون', 'Microphone permission'),
    ready: createBilingualText('الإذن متاح ويمكن بدء المحاولة.', 'Permission is ready for recording.'),
    prompt: createBilingualText(
      'نحتاج إذن الميكروفون قبل بدء التلاوة.',
      'Microphone access is required before the attempt can start.',
    ),
    denied: createBilingualText(
      'تم رفض الإذن. فعّل الميكروفون من إعدادات الجهاز ثم حاول مرة أخرى.',
      'Permission was denied. Enable the microphone in device settings and try again.',
    ),
    error: createBilingualText(
      'تعذر طلب الإذن الآن. أعد المحاولة بعد لحظات.',
      'The permission request failed. Try again in a moment.',
    ),
    checking: createBilingualText(
      'جارٍ فحص حالة الإذن الحالية.',
      'Checking the current permission state.',
    ),
    cta: createBilingualText('اطلب إذن الميكروفون', 'Request microphone access'),
  },
  recorder: {
    label: createBilingualText('حالة المحاولة', 'Attempt status'),
    idle: createBilingualText('جاهز لبدء تسجيل جديد.', 'Ready to start a new recording attempt.'),
    recording: createBilingualText(
      'التسجيل يعمل الآن. أوقفه عند انتهاء التلاوة.',
      'Recording is in progress. Stop it when the recitation is complete.',
    ),
    cancelled: createBilingualText(
      'تم إلغاء المحاولة الحالية بدون حفظ.',
      'The current attempt was cancelled without saving.',
    ),
    start: createBilingualText('ابدأ التسجيل', 'Start recording'),
    stop: createBilingualText('أوقف التسجيل', 'Stop recording'),
    cancel: createBilingualText('إلغاء المحاولة', 'Cancel attempt'),
  },
  mockReview: {
    label: createBilingualText('المراجعة التجريبية', 'Mock review'),
    body: createBilingualText(
      'أرسل المحاولة الحالية إلى خدمة التحليل التجريبية حتى يكون مسار النتيجة جاهزًا للخطوة التالية.',
      'Submit the current attempt through the fixture-backed analysis service so the result path is ready for the next slice.',
    ),
    cta: createBilingualText('أرسل النتيجة التجريبية', 'Submit mock result'),
    submitting: createBilingualText('جارٍ إرسال النتيجة التجريبية', 'Submitting mock result'),
    error: createBilingualText(
      'تعذر تجهيز النتيجة الآن. حاول مرة أخرى بعد لحظات.',
      'The mock result could not be prepared right now. Try again in a moment.',
    ),
  },
  notices: [
    createBilingualText(
      'المسار الحالي يركز على واجهة التسجيل فقط، بينما ربط الصوت الفعلي سيأتي في خطوة لاحقة.',
      'This task covers the recording shell only; audio capture wiring lands in the next step.',
    ),
    createBilingualText(
      'إذا أوقفت المحاولة فسيبقى المقطع المحدد كما هو لبدء محاولة جديدة مباشرة.',
      'Stopping the attempt keeps the selected target ready for the next retry.',
    ),
  ],
} as const;

export type RecordingScreenCopy = typeof recordingScreenCopy;
