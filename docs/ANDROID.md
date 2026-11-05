# Android app & releases

The Android app is the same Next.js UI exported statically (`npm run build:static` -> `out/`) and wrapped by
[Capacitor](https://capacitorjs.com/). Package id: `com.expensetracker.app`.

## Automatic releases

`.github/workflows/release.yml` runs on every push to `main`:

1. Reads `version` from `package.json`. If tag `vX.Y.Z` already exists, it stops (nothing to release).
2. Fails if `docs/CHANGELOG.md` has no `## [X.Y.Z]` section.
3. Builds the static web bundle, syncs it into `android/`, runs `./gradlew assembleRelease`.
4. Creates the GitHub release `vX.Y.Z` with `ExpenseTracker-vX.Y.Z.apk`, `SHA256SUMS.txt` and the changelog section as release notes.

You can also run it manually from the Actions tab (**Run workflow**) to rebuild/replace the assets of the current version.

## One-time setup (repository secrets)

| Secret | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web config baked into the bundle (same values as `.env.local`). **Required**, otherwise the APK can't sign in or load data. |
| `GOOGLE_SERVICES_JSON` | Full contents of `google-services.json` (Firebase console -> Project settings -> Android app `com.expensetracker.app`). Needed for native Google sign-in. |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Release signing key. Optional: without them the APK is signed with the debug key (installable, but updates from a differently signed build will be rejected). |

### Create a signing key

```bash
keytool -genkeypair -v -keystore release.keystore -alias expensetracker \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.keystore   # paste into ANDROID_KEYSTORE_BASE64
```

Keep the keystore safe and never commit it. Losing it means users cannot update in place.

### Google sign-in on Android

1. In Firebase console add an Android app with package `com.expensetracker.app`.
2. Add the **SHA-1 and SHA-256** of the key you sign with (`keytool -list -v -keystore release.keystore`).
   If you use the debug-key fallback, add the debug key's fingerprints instead.
3. Enable Google as a sign-in provider and download `google-services.json` -> `GOOGLE_SERVICES_JSON` secret.

### Firestore rules

Deploy `firestore.rules` before shipping: `firebase deploy --only firestore:rules`.

## Local build

Requires JDK 21 and the Android SDK (API 36).

```bash
npm ci
cp /path/to/google-services.json android/app/google-services.json   # optional
npm run android:debug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```
