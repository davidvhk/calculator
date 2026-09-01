# 🧮 Multi-Platform Calculator Suite (PWA & Wear OS APK)

A fast, offline-first, dual-platform calculator suite designed for **ChromeOS (Chromebook)**, **Linux desktop**, **smartphones**, and **Wear OS smartwatches (Google Pixel Watch / Galaxy Watch)**.

[![CI Pipeline](https://github.com/dvanhoucke/calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dvanhoucke/calculator/actions/workflows/ci.yml)
[![Build Android APK](https://github.com/dvanhoucke/calculator/actions/workflows/build-apk.yml/badge.svg)](https://github.com/dvanhoucke/calculator/actions/workflows/build-apk.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://davidvhk.github.io/calculator/)

---

## 🌟 2-in-1 Multi-Platform Ecosystem

This repository provides two complete products in one unified codebase:

1. **💻 Progressive Web App (PWA)**: Full-featured desktop, phone, and Chromebook calculator running at [davidvhk.github.io/calculator](https://davidvhk.github.io/calculator/).
2. **⌚ Native Wear OS Android App (`.apk`)**: Standalone, lightweight native Android app built specifically for circular smartwatches like the **Google Pixel Watch** (100% native Java engine, zero external WebView required).

---

## ✨ Features

### 💻 Web & Desktop PWA Features
- **PWA & Offline-First:** Instant launch and 100% functional without an active internet connection via Service Workers.
- **Scientific Mode:** Complete scientific toolkit with Trigonometry (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`), Degree/Radian toggle, Logarithms (`ln`, `log₁₀`), Exponentiation (`xʸ`, `eˣ`, `10ˣ`, `x²`, `x³`), Roots (`√`, `∛`), Factorial (`x!`), Reciprocal (`1/x`), Absolute value (`|x|`), and Constants ($\pi$, $e$).
- **Stack-Based Parentheses Evaluation:** Live expression tracker with nested parentheses level badge indicators `( )` and `(2)`.
- **5 Aesthetic Themes:**
  - 📼 **Vintage 80s LCD**: Authentic greenish-gray LCD screen with olive liquid-crystal font and classic beige/putty chassis.
  - 🌑 **OLED Midnight**: Pure `#000000` pitch black background for maximum contrast and battery savings.
  - ⚡ **Cyberpunk Neon**: Glowing cyan display, hot magenta operators, and electric yellow equals key.
  - 🌙 **Modern Dark**: Polished Catppuccin Mocha palette with indigo and cyan accents.
  - ☀️ **Modern Light**: Clean, minimalist daylight theme.
- **Interactive History Tape:** Calculation drawer with equation details, click-to-reuse results, individual deletion, and **mobile swipe-to-delete** gesture support.
- **Synthesized Mechanical Key Sound:** Zero-latency mechanical key click synthesized on-the-fly with Web Audio API oscillators (no external audio files needed), with toggle switch.
- **Click-to-Copy & Clipboard Paste:** Short tap or long-press the display to copy results with visual toast feedback; paste expressions directly via `Ctrl+V` / `Cmd+V`.
- **Physical Keyboard Support:** Standard numbers, arithmetic keys (`+`, `-`, `*`, `/`), `Enter`/`=` for evaluation, `Backspace`, and `Escape` (`AC`).
- **Security Hardened:** Strict Content Security Policy (CSP), Permissions-Policy, and zero dependency audit vulnerabilities.

---

### ⌚ Wear OS Smartwatch Features (Google Pixel Watch)
- **100% Native Android Engine:** Starts in under 10ms with **zero external WebView or browser dependencies**.
- **Circular Screen Geometry:** Specially formatted with circular top/bottom insets and curved button rows for 30mm round watch dials without edge clipping.
- **Live Operator Indicator:** Shows active operator (`+`, `-`, `×`, `÷`) alongside digits.
- **Keypad Shortcuts:**
  - **Long-press `C` or `±`:** Cycles between 4 watch themes (*OLED Midnight*, *Vintage 80s LCD*, *Cyberpunk Neon*, *Modern Light*).
  - **Long-press `=`:** Opens the scrollable Calculation History dialog to tap and reuse past results.
- **Native Hardware Haptics:** Tactile vibration pulse on every key tap.
- **Persistent Memory:** Themes and calculation history persist across watch restarts via `SharedPreferences`.

---

## 🚀 Getting Started (PWA Web)

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)

### Installation & Local Development
```bash
git clone https://github.com/dvanhoucke/calculator.git
cd calculator
npm install

# Start development server
make dev   # or: npm run dev
```
Visit `http://localhost:5173/` in your browser.

---

## 📦 Building the Android / Wear OS APK

### Option A: Local Build (Terminal / Makefile)

1. **One-Time Android SDK Setup:**
   ```bash
   make setup-sdk
   ```
   *(Automatically installs Google Command-Line Tools & Android 34 build-tools into `~/Android/Sdk`)*.

2. **Compile the APK:**
   ```bash
   make apk   # or: npm run build:apk
   ```
   The compiled APK will be generated at `./calculator-debug.apk`.

### Option B: Cloud Build (GitHub Actions)
You don't need Android SDK installed on your PC:
* Every commit pushed to `main` builds the APK in GitHub Actions under the **Actions** tab.
* Creating a git release tag (e.g. `v1.1.0`) automatically attaches `calculator-v1.1.0.apk` to the GitHub Release page.

---

## ⌚ Installing on Google Pixel Watch (Sideloading over Wi-Fi)

1. **Enable Developer Options on your Pixel Watch:**
   * Go to **Settings** ⚙️ > **System** > **About** > **Versions** > Tap **Build Number** **7 times**.
   * Go to **Settings** > **Developer options**:
     * Turn **ON** **ADB debugging**.
     * Turn **ON** **Wireless debugging** > Tap **Pair new device** (note the pairing port and 6-digit code).

2. **Pair & Connect from Linux/PC Terminal:**
   ```bash
   # 1. Pair device (replace with port & code shown on watch)
   adb pair 192.168.1.xxx:<PAIRING_PORT>

   # 2. Connect (use the port on main Wireless debugging screen)
   adb connect 192.168.1.xxx:<CONNECT_PORT>

   # 3. Install the APK
   adb install -r calculator-debug.apk
   ```

3. **Launch the App:**
   Press the crown button on your watch — **Calculator** will appear in your watch app list!

---

## 🛠️ Makefile Commands

| Command | Description |
| :--- | :--- |
| `make dev` | Starts local web development server with HMR. |
| `make build` | Compiles production web bundle to `dist/`. |
| `make test` | Runs the 26 unit tests via Vitest. |
| `make lint` | Checks code with ESLint. |
| `make format` | Formats code with Prettier. |
| `make setup-sdk` | Automatically installs Android SDK in `~/Android/Sdk`. |
| `make apk` | Builds the native Android / Wear OS `.apk`. |
| `make open` | Opens Android project in Android Studio. |
| `make clean` | Cleans build artifacts and generated APKs. |

---

## 🔄 CI/CD & Automation

- **`ci.yml`**: Runs linter, Vitest test suite, and web build on every push and PR.
- **`build-apk.yml`**: Automatically compiles the native Android APK and uploads downloadable workflow artifacts.
- **`release.yml`**: Packages both web bundles (`.tar.gz`) and the native `.apk` into official GitHub Releases upon version tagging.
- **`deploy.yml`**: Deploys the latest PWA version to GitHub Pages automatically.
- **`security.yml`**: Performs automated weekly vulnerability scans.

---

## 👤 Author

**David Vanhoucke**
- App ID: `org.vhkzone.calculator`

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**. See the [LICENSE](LICENSE) file for details.
