# Capacitor Android App Setup

This document explains how to build and run LUMINA as a native Android app using Capacitor.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Android Studio](https://developer.android.com/studio) with Android SDK
- [Java Development Kit (JDK)](https://openjdk.org/) version 11 or newer

## Setup Android Development Environment

1. **Install Android Studio** and open it
2. **Install Android SDK** (API level 30 or higher recommended)
3. **Set environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Build and Run

### Option 1: Using Android Studio (Recommended)

1. **Install dependencies and sync:**
   ```bash
   npm install
   npm run cap:sync
   ```

2. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **Run the app:**
   - Connect an Android device or start an emulator
   - Click the "Run" button in Android Studio

### Option 2: Command Line

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync Capacitor:**
   ```bash
   npm run cap:sync
   ```

3. **Run on device/emulator:**
   ```bash
   npm run cap:run:android
   ```

### Option 3: Build APK/AAB

1. **Build for production:**
   ```bash
   npm run cap:build:android
   ```

## Available Scripts

- `npm run cap:add:android` - Add Android platform (already done)
- `npm run cap:sync` - Sync web assets and configuration
- `npm run cap:run:android` - Build and run on Android device/emulator
- `npm run cap:build:android` - Build production APK/AAB

## Configuration

The app is configured in `capacitor.config.ts`:

- **App ID:** `com.lumina.rocks`
- **App Name:** `LUMINA`
- **Server URL:** Points to `https://lumina.rocks` (production)

### For Development

To run against a local development server, update `capacitor.config.ts`:

```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true
}
```

Then run `npm run cap:sync` to apply changes.

## App Metadata

- **Package ID:** `com.lumina.rocks`
- **App Name:** `LUMINA`
- **Version:** Matches `package.json` version (currently 0.1.28)

## Troubleshooting

### Common Issues

1. **Build fails:** Ensure Android SDK is properly installed and `ANDROID_HOME` is set
2. **App won't load:** Check that the server URL in `capacitor.config.ts` is accessible
3. **Sync issues:** Try `npm run cap:sync` after making configuration changes

### Development Tips

- Use Chrome DevTools to debug the WebView: `chrome://inspect`
- Check Android logs: `adb logcat | grep Capacitor`
- Clear app data if experiencing cache issues

## Features

The Android app includes:

✅ **WebView Integration** - Runs the Next.js app in a native WebView
✅ **Native App Shell** - Proper Android app structure with launcher icon
✅ **Splash Screen** - Native Android splash screen
✅ **Status Bar** - Native status bar integration
✅ **File Provider** - For sharing and file operations

### Future Enhancements

- Push notifications support
- Native camera integration
- Offline capabilities
- App shortcuts

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/lumina/rocks/
│   │   └── res/
│   └── build.gradle
├── gradle/
└── build.gradle
```

The Android project is included in version control with build artifacts excluded.