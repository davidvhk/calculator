#!/usr/bin/env bash
set -e

# Auto-detect modern Java JDK (Java 21/17)
if [ -z "$JAVA_HOME" ] || [ ! -d "$JAVA_HOME" ] || [ "$("$JAVA_HOME/bin/java" -version 2>&1 | grep -c '1.8')" -gt 0 ]; then
  for candidate in \
    "/usr/lib/jvm/java-21-openjdk" \
    "/usr/lib/jvm/java-17-openjdk" \
    "/usr/lib/jvm/java-21" \
    "/usr/lib/jvm/java-17"; do
    if [ -d "$candidate" ]; then
      export JAVA_HOME="$candidate"
      export PATH="$JAVA_HOME/bin:$PATH"
      break
    fi
  done
fi

if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  echo "☕ Using Java JDK: $($JAVA_HOME/bin/java -version 2>&1 | head -n 1)"
fi

# Auto-detect Android SDK directory
if [ -z "$ANDROID_HOME" ] || [ ! -d "$ANDROID_HOME" ]; then
  for candidate in \
    "$HOME/Android/Sdk" \
    "$HOME/android-sdk" \
    "/usr/lib/android-sdk" \
    "/opt/android-sdk"; do
    if [ -d "$candidate" ]; then
      export ANDROID_HOME="$candidate"
      break
    fi
  done
fi

if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
  echo "📱 Using Android SDK: $ANDROID_HOME"
  mkdir -p android
  echo "sdk.dir=$ANDROID_HOME" > android/local.properties
else
  echo "⚠️ Android SDK not found in standard locations."
  echo "👉 Run 'make setup-sdk' (or ./scripts/install-sdk.sh) to automatically set it up in ~/Android/Sdk."
fi

echo "🔨 [1/3] Building Web bundle & syncing to Capacitor..."
npm run cap:build

echo "📦 [2/3] Compiling Android APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "🎉 [3/3] Copying APK to root directory..."
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk ./calculator-debug.apk

echo "✅ Success! APK generated at: $(pwd)/calculator-debug.apk"
