export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  firebase: {
    // Paste the Admin Web firebaseConfig snippet from 1Password ("Admin Web — firebaseConfig").
    // These keys are not secrets — Firebase ships them in every web bundle. Auth is gated by
    // Firebase Auth providers + backend verification, not by hiding these.
    apiKey: 'REPLACE_ME',
    authDomain: 'vis-prod.firebaseapp.com',
    projectId: 'vis-prod',
    storageBucket: 'vis-prod.appspot.com',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
};
