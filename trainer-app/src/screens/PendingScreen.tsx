import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {signOut} from '../services/authService';

export function PendingScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Account Pending</Text>
        <Text style={styles.title}>Almost there</Text>
        <Text style={styles.body}>
          Your account hasn't been activated yet. Visit your gym branch and have a staff member
          register you, then sign in again.
        </Text>
        <Pressable onPress={signOut} style={({pressed}) => [styles.signOut, pressed && styles.signOutPressed]}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
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
  eyebrow: {
    color: '#FFB13D',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F5F4F2',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  body: {
    color: 'rgba(235,235,245,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  signOut: {
    marginTop: 24,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutPressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: 'rgba(235,235,245,0.7)',
    fontSize: 14,
  },
});
