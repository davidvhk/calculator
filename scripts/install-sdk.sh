#!/usr/bin/env bash
set -e

# Auto-detect modern Java JDK (Java 21/17)
if [ -z "$JAVA_HOME" ] || [ ! -d "$JAVA_HOME" ]; then
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

SDK_DIR="${HOME}/Android/Sdk"
echo "📥 Setting up Android SDK in: ${SDK_DIR}..."

mkdir -p "${SDK_DIR}/cmdline-tools"
cd "${SDK_DIR}/cmdline-tools"

if [ ! -d "latest" ]; then
  echo "📦 Downloading Android Command-Line Tools from Google..."
  curl -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q cmdline-tools.zip
  rm -rf latest
  mv cmdline-tools latest
  rm cmdline-tools.zip
fi

export ANDROID_HOME="${SDK_DIR}"
export PATH="${SDK_DIR}/cmdline-tools/latest/bin:${SDK_DIR}/platform-tools:${PATH}"

echo "📜 Accepting licenses & downloading Android Build Tools 34..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"

mkdir -p /home/david/calculator/android
echo "sdk.dir=${SDK_DIR}" > /home/david/calculator/android/local.properties

echo "✅ Android SDK successfully configured! You can now run: make apk"
