import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './recording-screen.styles';
import { recordingScreenCopy } from '../../../shared/i18n/recording-screen-copy';
import { useRecitationSession } from '../hooks/use-recitation-session';
import {
  createFixtureAnalysisService,
  mapAnalysisResponseToComparisonResult,
} from '../../../test/fixtures/recitation-analysis';

type AttemptStatus = 'idle' | 'recording' | 'cancelled';
type PermissionState = 'checking' | 'prompt' | 'denied' | 'ready';
type AudioPermissionResponse = NonNullable<ReturnType<typeof Audio.usePermissions>[0]>;
type RecordingScreenProps = {
  onSelectDifferentTarget?: () => void;
};

function resolvePermissionState(
  permissionResponse: AudioPermissionResponse | null,
): PermissionState {
  if (permissionResponse == null) {
    return 'checking';
  }

  if (permissionResponse.granted) {
    return 'ready';
  }

  return permissionResponse.canAskAgain ? 'prompt' : 'denied';
}

function getStatusLabel(permissionState: PermissionState, attemptStatus: AttemptStatus): string {
  if (attemptStatus === 'recording') {
    return 'Recording';
  }

  if (attemptStatus === 'cancelled') {
    return 'Cancelled';
  }

  switch (permissionState) {
    case 'ready':
      return 'Permission ready';
    case 'denied':
      return 'Permission denied';
    case 'prompt':
      return 'Permission required';
    case 'checking':
    default:
      return 'Checking permission';
  }
}

export function RecordingScreen({ onSelectDifferentTarget }: RecordingScreenProps) {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus>('idle');
  const [permissionError, setPermissionError] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const { currentAttempt, currentResult, currentTarget, startAttempt, stopAttempt, cancelAttempt, completeAttempt } =
    useRecitationSession();

  const permissionState = resolvePermissionState(permissionResponse);
  const canStartRecording = permissionState === 'ready' && attemptStatus !== 'recording';

  const handlePermissionRequest = async (): Promise<void> => {
    setPermissionError(false);
    setIsRequestingPermission(true);

    try {
      await requestPermission();
    } catch {
      setPermissionError(true);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleStartRecording = async (): Promise<void> => {
    if (attemptStatus === 'recording') {
      return;
    }

    if (permissionState !== 'ready') {
      await handlePermissionRequest();
      return;
    }

    setAttemptStatus('recording');
    startAttempt();
  };

  const handleStopRecording = (): void => {
    if (attemptStatus !== 'recording') {
      return;
    }

    setAttemptStatus('idle');
    stopAttempt();
  };

  const handleCancelAttempt = (): void => {
    setAttemptStatus('cancelled');
    cancelAttempt();
  };

  const handleSubmitForMockReview = async (): Promise<void> => {
    const attemptId = currentAttempt?.id ?? startAttempt().id;
    setSubmissionError(false);
    setIsSubmittingResult(true);

    try {
      const response = await createFixtureAnalysisService().analyzeRecitationAttempt({
        attemptId,
        locale: 'ar',
        target: {
          id: currentTarget.id,
          selectionType: currentTarget.selectionType,
          pageNumber: currentTarget.pageNumber,
          surahNumber: currentTarget.surahNumber,
          ayahStart: currentTarget.ayahStart,
          ayahEnd: currentTarget.ayahEnd,
          displayName: {
            ar: currentTarget.displayNameAr,
            en: currentTarget.displayNameEn,
          },
          canonicalText: currentTarget.canonicalText,
          canonicalReference: currentTarget.canonicalReference,
        },
        audio: {
          uri: 'file:///mock/current-attempt.m4a',
          durationMs: 12000,
          mimeType: 'audio/m4a',
        },
      });

      await completeAttempt(mapAnalysisResponseToComparisonResult(response));
    } catch {
      setSubmissionError(true);
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const permissionBody = permissionError
    ? recordingScreenCopy.permission.error
    : permissionState === 'ready'
      ? recordingScreenCopy.permission.ready
      : permissionState === 'denied'
        ? recordingScreenCopy.permission.denied
        : permissionState === 'prompt'
          ? recordingScreenCopy.permission.prompt
          : recordingScreenCopy.permission.checking;

  const recorderBody =
    attemptStatus === 'recording'
      ? recordingScreenCopy.recorder.recording
      : attemptStatus === 'cancelled'
        ? recordingScreenCopy.recorder.cancelled
        : recordingScreenCopy.recorder.idle;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{recordingScreenCopy.hero.kicker}</Text>
          <Text style={styles.heroArabic}>{recordingScreenCopy.hero.title.ar}</Text>
          <Text style={styles.heroEnglish}>{recordingScreenCopy.hero.title.en}</Text>
          <Text style={styles.heroBodyArabic}>{recordingScreenCopy.hero.body.ar}</Text>
          <Text style={styles.heroBodyEnglish}>{recordingScreenCopy.hero.body.en}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.labelArabic}>{recordingScreenCopy.target.label.ar}</Text>
          <Text style={styles.labelEnglish}>{recordingScreenCopy.target.label.en}</Text>
          <Text style={styles.bodyArabic}>{currentTarget.displayNameAr}</Text>
          <Text style={styles.bodyEnglish}>{currentTarget.displayNameEn}</Text>
          <Text style={styles.bodyArabic}>{currentTarget.canonicalReference}</Text>
          <Text style={styles.bodyEnglish}>{recordingScreenCopy.target.body.en}</Text>
          <Pressable accessibilityRole="button" onPress={onSelectDifferentTarget} style={styles.button}>
            <Text style={styles.buttonText}>Choose another target</Text>
            <Text style={styles.buttonText}>اختر مقطعًا آخر</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <View style={styles.badgeRow}>
            <View>
              <Text style={styles.labelArabic}>{recordingScreenCopy.permission.label.ar}</Text>
              <Text style={styles.labelEnglish}>{recordingScreenCopy.permission.label.en}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {getStatusLabel(permissionState, attemptStatus)}
              </Text>
            </View>
          </View>
          <Text style={styles.bodyArabic}>{permissionBody.ar}</Text>
          <Text style={styles.bodyEnglish}>{permissionBody.en}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isRequestingPermission || permissionState === 'ready'}
            onPress={handlePermissionRequest}
            style={[
              styles.button,
              styles.buttonPrimary,
              (isRequestingPermission || permissionState === 'ready') && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {recordingScreenCopy.permission.cta.en}
            </Text>
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {recordingScreenCopy.permission.cta.ar}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.panel, styles.controls]}>
          <Text style={styles.labelArabic}>{recordingScreenCopy.recorder.label.ar}</Text>
          <Text style={styles.labelEnglish}>{recordingScreenCopy.recorder.label.en}</Text>
          <Text style={styles.bodyArabic}>{recorderBody.ar}</Text>
          <Text style={styles.bodyEnglish}>{recorderBody.en}</Text>

          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              disabled={!canStartRecording}
              onPress={handleStartRecording}
              style={[styles.button, styles.buttonPrimary, !canStartRecording && styles.buttonDisabled]}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {recordingScreenCopy.recorder.start.en}
              </Text>
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {recordingScreenCopy.recorder.start.ar}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={attemptStatus !== 'recording'}
              onPress={handleStopRecording}
              style={[styles.button, attemptStatus !== 'recording' && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>{recordingScreenCopy.recorder.stop.en}</Text>
              <Text style={styles.buttonText}>{recordingScreenCopy.recorder.stop.ar}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleCancelAttempt}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{recordingScreenCopy.recorder.cancel.en}</Text>
              <Text style={styles.buttonText}>{recordingScreenCopy.recorder.cancel.ar}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.labelArabic}>المراجعة التجريبية</Text>
          <Text style={styles.labelEnglish}>Mock review</Text>
          <Text style={styles.bodyArabic}>
            أرسل المحاولة الحالية إلى خدمة التحليل التجريبية حتى يكون مسار النتيجة جاهزًا للخطوة
            التالية.
          </Text>
          <Text style={styles.bodyEnglish}>
            Submit the current attempt through the fixture-backed analysis service so the result
            path is ready for the next slice.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmittingResult}
            onPress={handleSubmitForMockReview}
            style={[
              styles.button,
              styles.buttonPrimary,
              isSubmittingResult && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {isSubmittingResult ? 'Submitting mock result' : 'Submit mock result'}
            </Text>
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {isSubmittingResult ? 'جارٍ إرسال النتيجة التجريبية' : 'أرسل النتيجة التجريبية'}
            </Text>
          </Pressable>
          {submissionError ? (
            <>
              <Text style={styles.bodyArabic}>تعذر تجهيز النتيجة الآن. حاول مرة أخرى بعد لحظات.</Text>
              <Text style={styles.bodyEnglish}>
                The mock result could not be prepared right now. Try again in a moment.
              </Text>
            </>
          ) : null}
          {currentResult != null ? (
            <>
              <Text style={styles.bodyArabic}>{currentResult.summaryAr}</Text>
              <Text style={styles.bodyEnglish}>{currentResult.summaryEn}</Text>
            </>
          ) : null}
        </View>

        {recordingScreenCopy.notices.map((notice) => (
          <View key={notice.en} style={styles.noticeCard}>
            <Text style={styles.bodyArabic}>{notice.ar}</Text>
            <Text style={styles.bodyEnglish}>{notice.en}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
