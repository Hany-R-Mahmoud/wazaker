import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RecordingScreen } from '../../features/recitation/screens/recording-screen';
import { TargetSelectionScreen } from '../../features/recitation/screens/target-selection-screen';

export type RecitationStackParamList = {
  targetSelection: undefined;
  recording: undefined;
};

const Stack = createNativeStackNavigator<RecitationStackParamList>();

export function RecitationNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="targetSelection"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="targetSelection">
          {({ navigation }) => (
            <TargetSelectionScreen onContinue={() => navigation.navigate('recording')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="recording">
          {({ navigation }) => (
            <RecordingScreen onSelectDifferentTarget={() => navigation.navigate('targetSelection')} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
