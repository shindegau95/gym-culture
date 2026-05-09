import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {signInWithGoogle} from '../services/authService';

export function LoginScreen(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPress = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // AppNavigator picks up the new auth state via onAuthStateChanged
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>GymCulture Pro</Text>
        <Text style={styles.subtitle}>PT Member</Text>

        <Pressable
          onPress={onPress}
          disabled={loading}
          style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue with Google</Text>
          )}
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#16161A',
    borderRadius: 22,
    padding: 32,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    color: '#F5F4F2',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(235,235,245,0.6)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  button: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FF2D55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#FF5A55',
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
});
