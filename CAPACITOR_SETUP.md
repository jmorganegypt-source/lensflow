# LensFlow + Lumen — Native iOS/Android via Capacitor

When you're ready to publish to the **App Store** and **Google Play**, follow this
guide on your **own Mac** (iOS builds need Xcode). You'll reuse 100% of your
existing React code — no rewrite.

Estimated first-time setup: ~45 minutes.

---

## What you need

| Tool | Required for | Get it |
|---|---|---|
| **Node 18+** | Build the React app | https://nodejs.org |
| **Yarn** | Install deps (this project uses yarn, not npm) | `npm install -g yarn` |
| **Xcode 15+** | iOS build | Mac App Store (free, ~7GB) |
| **Android Studio** | Android build | https://developer.android.com/studio |
| **Apple Developer account** | App Store submission | $99/year — https://developer.apple.com |
| **Google Play Developer** | Play Store submission | $25 one-time — https://play.google.com/console |

---

## Step 1 — Export the code from Emergent

1. In the Emergent chat header, click **Save to GitHub**.
2. Choose or create a repo (e.g. `lensflow-project-emergent`).
3. On your Mac, clone it:
   ```bash
   git clone https://github.com/<you>/lensflow-project-emergent.git
   cd lensflow-project-emergent/frontend
   yarn install
   ```

---

## Step 2 — Install Capacitor (one time)

```bash
cd frontend
yarn add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
yarn add @capacitor/camera @capacitor/share @capacitor/preferences @capacitor/splash-screen
```

---

## Step 3 — `capacitor.config.ts` (frontend root)

Create `frontend/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.lensflow.app',          // ← unique bundle ID (reverse-domain). Keep lowercase, no dashes.
  appName: 'LensFlow',
  webDir: 'build',                    // CRA outputs to ./build (Vite uses ./dist)
  server: {
    androidScheme: 'https',           // required for camera/mic on Android
    // For dev: point to your live preview while iterating locally
    // url: 'https://luxury-video-studio-1.preview.emergentagent.com',
    // cleartext: false,
  },
  ios: { contentInset: 'always' },
  android: { backgroundColor: '#050505' },
};

export default config;
```

> **Want Lumen as a SEPARATE app on the stores?** Create a second config:
> `capacitor.lumen.config.ts` with `appId: 'app.lumen.tomorrow'`, `appName: 'Lumen'`,
> and a `server.url` pointing to `/lumen` on your deployed domain. You can ship two
> native apps from one codebase.

---

## Step 4 — Fix MediaRecorder for iOS Safari

iOS doesn't support `video/webm`. Open `frontend/src/pages/app/Recorder.jsx` AND
`frontend/src/pages/lumen/app/Create.jsx` and replace the `MediaRecorder` line:

```javascript
// Pick the best supported format for the device
const mimeType = MediaRecorder.isTypeSupported('video/mp4')
  ? 'video/mp4'
  : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

const mr = new MediaRecorder(streamRef.current, { mimeType });
```

And when building the blob:

```javascript
const blob = new Blob(recordedChunksRef.current, { type: mimeType });
```

---

## Step 5 — Build the React app and add native platforms

```bash
cd frontend
yarn build            # writes ./build
npx cap add ios       # creates ./ios   (one time)
npx cap add android   # creates ./android (one time)
npx cap sync          # copies build/ into native projects
```

---

## Step 6 — iOS permissions (`ios/App/App/Info.plist`)

Add inside the top-level `<dict>`:

```xml
<key>NSCameraUsageDescription</key>
<string>LensFlow needs your camera to record property videos.</string>
<key>NSMicrophoneUsageDescription</key>
<string>LensFlow needs your microphone to record audio alongside your video.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>LensFlow saves recorded takes to your Photos library.</string>
```

---

## Step 7 — Android permissions (`android/app/src/main/AndroidManifest.xml`)

Add inside `<manifest>`, **above** the `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

---

## Step 8 — Run on a device

```bash
# iOS — opens Xcode. Plug in iPhone, select it, hit Play.
npx cap open ios

# Android — opens Android Studio. Plug in phone (USB-debug on), hit Run.
npx cap open android
```

Live-reload while you iterate locally:
```bash
npx cap run ios     --livereload --external
npx cap run android --livereload --external
```

---

## Step 9 — App icons & splash screens

Generate from a single 1024×1024 master:
```bash
yarn add -D @capacitor/assets
yarn cap-assets generate --iconBackgroundColor "#050505" --iconBackgroundColorDark "#050505" --splashBackgroundColor "#050505"
```

Drop your 1024×1024 master at `frontend/assets/icon.png` and `frontend/assets/splash.png` first.

For Lumen use `--iconBackgroundColor "#FF6B6B"` instead.

---

## Step 10 — Submission checklist

### iOS (App Store Connect)
- [ ] Bundle ID in Xcode matches `capacitor.config.ts` AND App Store Connect
- [ ] 1024×1024 app icon (no alpha channel, no rounded corners — Apple adds them)
- [ ] Set min iOS to 15 in Xcode → Targets → Deployment Info
- [ ] Privacy declarations for Camera, Microphone, Photos
- [ ] Submit via Xcode → Product → Archive → Distribute → App Store

### Android (Google Play Console)
- [ ] `applicationId` in `android/app/build.gradle` matches what's registered on Play Console
- [ ] `minSdkVersion 24`, `targetSdkVersion 34`
- [ ] Signed AAB: Android Studio → Build → Generate Signed Bundle → upload to Play Console
- [ ] Privacy policy URL (host one on your deployed site)

---

## Step 11 — Point the native shell at your deployed backend

The `REACT_APP_BACKEND_URL` env var that lives in `frontend/.env` gets baked into the
build. When you run `yarn build`, make sure it points at your **production** backend
(your Emergent deployment URL), not localhost.

```bash
# frontend/.env (for production build)
REACT_APP_BACKEND_URL=https://your-deployed-app.emergentagent.com
```

Then rebuild + sync:
```bash
yarn build && npx cap sync
```

---

## Recommended Capacitor plugins to add later

| Plugin | What it gives you |
|---|---|
| `@capacitor/camera` | Native camera picker fallback if MediaDevices fails |
| `@capacitor/share` | Cleaner native share sheet (we already use Web Share API) |
| `@capacitor/preferences` | Encrypted local storage (better than localStorage for tokens) |
| `@capacitor/splash-screen` | Branded launch screen |
| `@capacitor/push-notifications` | Push from Firebase to your installed users |
| `@capacitor/haptics` | Tap feedback on buttons |
| `@capacitor/media` | Save recorded videos to Photos / Gallery |

---

## You don't need to do any of this yet

The PWA install (already shipped) gives you 80% of the "real app" feel for $0 and 0 hours.
Reach for Capacitor when you have:
- Paying customers asking for App Store presence, OR
- A specific native feature you can't get in the browser (background uploads, e.g.)

Until then — ship the PWA, gather feedback, and come back to this guide when you're ready.
