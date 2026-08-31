# Chromebook & Linux Calculator PWA

A fast, lightweight, offline-first Progressive Web App (PWA) calculator tailored for ChromeOS (Chromebook) and Linux desktop environments.

[![CI Pipeline](https://github.com/dvanhoucke/calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dvanhoucke/calculator/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

---

## ✨ Features

- **PWA & Offline-First:** Instant launch and 100% functional without an active internet connection via Service Workers.
- **ChromeOS & Linux Native Feel:** Installs as a standalone desktop app with full app-launcher and taskbar integration.
- **Physical Keyboard Support:** Direct input with standard number keys, arithmetic operators (`+`, `-`, `*`, `/`), `Enter`/`=` for evaluation, `Backspace`, and `Escape` (`AC`).
- **Dark & Light Mode:** Seamless theme switching with automatic `localStorage` persistence.
- **High-Precision Calculations:** Accurate floating-point handling (eliminates JavaScript `0.1 + 0.2` rounding anomalies).
- **Operation History & Chained Operations:** Easily keep track of previous calculations.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS v20+ recommended, managed via `nvm`)
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/dvanhoucke/calculator.git
cd calculator
npm install
```

### Running Locally (Development)

```bash
npm run dev
```

The dev server will automatically bind to `0.0.0.0:5173`:
- **Local:** `http://localhost:5173/`
- **Network / Chromebook:** `http://<your-lan-ip>:5173/`

---

## 🛠️ Scripts & Quality Checks

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server with Hot Module Replacement (HMR). |
| `npm run test` | Runs the Vitest test suite. |
| `npm run test:watch` | Runs unit tests in watch mode. |
| `npm run lint` | Checks code formatting and TypeScript rules with ESLint. |
| `npm run lint:fix` | Automatically fixes linting issues. |
| `npm run format` | Formats codebase using Prettier. |
| `npm run build` | Compiles TypeScript and generates production PWA bundle in `dist/`. |
| `npm run preview` | Locally serves the production `dist/` build. |

---

## 🔄 CI/CD & Automation

- **CI Pipeline (`.github/workflows/ci.yml`):** Runs linter, unit tests, and production build checks on every push and pull request.
- **Security Scanner (`.github/workflows/security.yml`):** Automatically scans for dependency vulnerabilities weekly.
- **Dependabot (`.github/dependabot.yml`):** Automated weekly pull requests for outdated npm dependencies and GitHub Actions.
- **Automated Releases (`.github/workflows/release.yml`):** Creates GitHub releases with packaged `dist/` tarballs when git version tags (`v*`) are pushed.
- **GitHub Pages Deployment (`.github/workflows/deploy.yml`):** Automatically deploys the latest PWA to GitHub Pages on every push to `main`.

---

## 👤 Author

**David Vanhoucke**
- Email: [vanhouckedavid@gmail.com](mailto:vanhouckedavid@gmail.com)

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**. See the [LICENSE](LICENSE) file for details.
