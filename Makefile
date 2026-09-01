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

# Create and push release tag from VERSION file
release:
	@VERSION=$$(cat VERSION | tr -d ' \n\r'); \
	echo "🚀 Tagging and releasing v$$VERSION from VERSION file..."; \
	git tag -a "v$$VERSION" -m "Release v$$VERSION" && \
	git push origin "v$$VERSION"

# Clean build artifacts
clean:
	rm -rf dist dev-dist .dist_old calculator-*.apk
