import { Audio } from 'expo-av';

import { RecordingScreen } from '../features/recitation/screens/recording-screen';
import { fireEvent, renderWithProviders, screen, waitFor } from './helpers/render';

type PermissionResponse = NonNullable<ReturnType<typeof Audio.usePermissions>[0]>;
type MockPermissionTuple = [PermissionResponse | null, jest.Mock<Promise<PermissionResponse>, []>];

let mockPermissionTuple: MockPermissionTuple;

jest.mock('expo-av', () => ({
  Audio: {
    usePermissions: () => mockPermissionTuple,
  },
}));

function createPermissionResponse(
  overrides: Partial<PermissionResponse>,
): PermissionResponse {
  return {
    canAskAgain: true,
    expires: 'never',
    granted: false,
    status: 'undetermined' as PermissionResponse['status'],
    ...overrides,
  };
}

describe('RecordingScreen', () => {
  beforeEach(() => {
    mockPermissionTuple = [
      createPermissionResponse({
        granted: true,
        status: 'granted' as PermissionResponse['status'],
      }),
      jest.fn(),
    ];
  });

  it('starts and stops a recording attempt when permission is already granted', () => {
    renderWithProviders(<RecordingScreen />);

    fireEvent.press(screen.getByText('Start recording'));
    expect(screen.getByText('Recording is in progress. Stop it when the recitation is complete.')).toBeTruthy();

    fireEvent.press(screen.getByText('Stop recording'));
    expect(screen.getByText('Ready to start a new recording attempt.')).toBeTruthy();
  });

  it('requests permission before recording when access is not granted', async () => {
    const requestPermission = jest.fn(async () =>
      createPermissionResponse({
        granted: true,
        status: 'granted' as PermissionResponse['status'],
      }),
    );

    mockPermissionTuple = [
      createPermissionResponse({
        granted: false,
        status: 'undetermined' as PermissionResponse['status'],
      }),
      requestPermission,
    ];

    renderWithProviders(<RecordingScreen />);

    fireEvent.press(screen.getByText('Request microphone access'));

    await waitFor(() => {
      expect(requestPermission).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Microphone access is required before the attempt can start.')).toBeTruthy();
  });

  it('shows the denied state and allows cancellation', () => {
    mockPermissionTuple = [
      createPermissionResponse({
        canAskAgain: false,
        granted: false,
        status: 'denied' as PermissionResponse['status'],
      }),
      jest.fn(),
    ];

    renderWithProviders(<RecordingScreen />);

    expect(
      screen.getByText('Permission was denied. Enable the microphone in device settings and try again.'),
    ).toBeTruthy();

    fireEvent.press(screen.getByText('Cancel attempt'));
    expect(screen.getByText('The current attempt was cancelled without saving.')).toBeTruthy();
  });
});
