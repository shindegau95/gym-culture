# Trainer App — Vis

React Native 0.85 (bare CLI) — Personal Trainer app. Phase 0 ships only the auth shell:
`Login → (Pending | HomeShell)` driven by Firebase Auth + backend `GET /auth/me`.

Mirror of `client-app/` per spec — only the bundle ID (`in.vis.trainer`), the
`HomeShell` text, and the login subtitle differ.

## Local-only Firebase config (NEVER commit)

These come from the Firebase Console for the **Trainer App** entries
(`in.vis.trainer`). Both files are `.gitignore`d.

| File | Source | Drop into |
| -- | -- | -- |
| `google-services.json` | Firebase Console → Android app `in.vis.trainer` | `android/app/google-services.json` |
| `GoogleService-Info.plist` | Firebase Console → iOS app `in.vis.trainer` | `ios/TrainerApp/GoogleService-Info.plist` (also drag-drop into the Xcode project) |

Then update `src/config.ts` with the Firebase Console "Web SDK configuration → Web client ID"
value. (Same project as Client App, so the same Web client ID works.)

## First-run setup

```bash
npm install
cd ios && pod install && cd ..
```

## Run

```bash
npx react-native run-ios
npx react-native run-android   # with an emulator running
```

See `client-app/README.md` for the full auth-flow walkthrough — identical here.
