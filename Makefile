.PHONY: all dev build test lint format sync apk open clean

all: build

# Start local development server
dev:
	npm run dev

# Build production web bundle
build:
	npm run build

# Run unit tests
test:
	npm test

# Check linting
lint:
	npm run lint

# Auto-format codebase
format:
	npm run format

# Sync web assets to Capacitor Android project
sync:
	npm run cap:sync

# Build native Android APK locally
apk:
	@chmod +x scripts/build-apk.sh
	@./scripts/build-apk.sh

# Setup Android SDK command-line tools
setup-sdk:
	@chmod +x scripts/install-sdk.sh
	@./scripts/install-sdk.sh

# Open Android project in Android Studio
open:
	npm run cap:open

# Clean build artifacts
clean:
	rm -rf dist dev-dist .dist_old calculator-*.apk
