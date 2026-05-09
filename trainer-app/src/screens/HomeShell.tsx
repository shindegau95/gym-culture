import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {UserResponse} from '../services/apiService';
import {signOut} from '../services/authService';

interface Props {
  user: UserResponse;
}

export function HomeShell({user}: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{user.branchName ?? 'GymCulture'}</Text>
          <Text style={styles.title}>Hey, {user.name.split(' ')[0]}</Text>
        </View>
        <Pressable onPress={signOut} style={({pressed}) => [styles.signOut, pressed && styles.signOutPressed]}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Trainer App — Phase 0 auth verified.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Account</Text>
        <Text style={styles.row}>{user.role}</Text>
        <Text style={styles.row}>{user.email ?? user.phone ?? '—'}</Text>
        {user.branchName && <Text style={styles.row}>Branch: {user.branchName}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    padding: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: {
    color: 'rgba(235,235,245,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F5F4F2',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  signOut: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
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
    fontSize: 13,
  },
  banner: {
    backgroundColor: '#16161A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,45,85,0.4)',
    padding: 14,
    marginBottom: 16,
  },
  bannerText: {
    color: '#FF7B5A',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#16161A',
    borderRadius: 18,
    padding: 20,
  },
  cardLabel: {
    color: 'rgba(235,235,245,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    color: '#F5F4F2',
    fontSize: 15,
    marginTop: 4,
  },
});
