import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {config} from '../config';

GoogleSignin.configure({
  webClientId: config.googleWebClientId,
  offlineAccess: false,
});

export type AuthUser = FirebaseAuthTypes.User;
export type AuthStateListener = (user: AuthUser | null) => void;

export async function signInWithGoogle(): Promise<AuthUser> {
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  const result = await GoogleSignin.signIn();
  // typings vary across versions; tolerate both shapes
  const idToken =
    (result as unknown as {idToken?: string}).idToken ??
    (result as unknown as {data?: {idToken?: string}}).data?.idToken;
  if (!idToken) {
    throw new Error('Google sign-in did not return an idToken');
  }
  const credential = auth.GoogleAuthProvider.credential(idToken);
  const userCred = await auth().signInWithCredential(credential);
  return userCred.user;
}

export async function signInWithPhone(
  phoneNumber: string,
): Promise<FirebaseAuthTypes.ConfirmationResult> {
  return auth().signInWithPhoneNumber(phoneNumber);
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — user may have signed in via phone, not Google
  }
  await auth().signOut();
}

export function onAuthStateChanged(listener: AuthStateListener): () => void {
  return auth().onAuthStateChanged(listener);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  return user ? user.getIdToken() : null;
}
