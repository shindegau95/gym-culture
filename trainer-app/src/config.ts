import {Platform} from 'react-native';

// Android emulator → host loopback. iOS simulator can use localhost.
const localhost = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const config = {
  apiBaseUrl: __DEV__ ? localhost : 'https://api.thegymculture.in',

  // Firebase Web client ID for Google sign-in. Pull this from the Firebase
  // Console → Project Settings → General → Web SDK configuration → Web client ID.
  // It is not a secret (ships in the app bundle anyway) but each Firebase project
  // has its own.
  googleWebClientId: 'REPLACE_ME.apps.googleusercontent.com',
};
