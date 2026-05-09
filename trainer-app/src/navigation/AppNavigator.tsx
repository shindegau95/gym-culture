import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthUser, onAuthStateChanged} from '../services/authService';
import {fetchMe, UserResponse} from '../services/apiService';
import {HomeShell} from '../screens/HomeShell';
import {LoginScreen} from '../screens/LoginScreen';
import {PendingScreen} from '../screens/PendingScreen';

type AuthStage = 'resolving' | 'signed-out' | 'pending' | 'ready';

const Stack = createNativeStackNavigator();

export function AppNavigator(): React.JSX.Element | null {
  const [stage, setStage] = useState<AuthStage>('resolving');
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    return onAuthStateChanged(async (firebaseUser: AuthUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setStage('signed-out');
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
        setStage('ready');
      } catch (err: unknown) {
        const status = (err as {response?: {status?: number}}).response?.status;
        if (status === 404) {
          setStage('pending');
        } else {
          // network or 5xx — fall back to pending so the user is not stuck on a blank screen
          setStage('pending');
        }
      }
    });
  }, []);

  if (stage === 'resolving') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#FF2D55" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {stage === 'signed-out' && <Stack.Screen name="Login" component={LoginScreen} />}
        {stage === 'pending' && <Stack.Screen name="Pending" component={PendingScreen} />}
        {stage === 'ready' && user && (
          <Stack.Screen name="Home">{() => <HomeShell user={user} />}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E10',
  },
});
