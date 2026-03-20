import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './recording-screen.styles';
import { recordingScreenCopy } from '../../../shared/i18n/recording-screen-copy';

type AttemptStatus = 'idle' | 'recording' | 'cancelled';
type PermissionState = 'checking' | 'prompt' | 'denied' | 'ready';
type AudioPermissionResponse = NonNullable<ReturnType<typeof Audio.usePermissions>[0]>;

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

export function RecordingScreen() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus>('idle');
  const [permissionError, setPermissionError] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

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
  };

  const handleStopRecording = (): void => {
    if (attemptStatus !== 'recording') {
      return;
    }

    setAttemptStatus('idle');
  };

  const handleCancelAttempt = (): void => {
    setAttemptStatus('cancelled');
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
          <Text style={styles.bodyArabic}>{recordingScreenCopy.target.title.ar}</Text>
          <Text style={styles.bodyEnglish}>{recordingScreenCopy.target.title.en}</Text>
          <Text style={styles.bodyArabic}>{recordingScreenCopy.target.body.ar}</Text>
          <Text style={styles.bodyEnglish}>{recordingScreenCopy.target.body.en}</Text>
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
