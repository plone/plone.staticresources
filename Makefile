BUNDLE_DIR = src/plone/staticresources/static/bundle-plone
BOOTSTRAP_ICONS_DIR = src/plone/staticresources/static/icons-bootstrap
COUNTRY_FLAGS_DIR = src/plone/staticresources/static/icons-country-flags

# Prerequisites (checked by `make check-dependencies`):
# - make
# - curl
# - git
# - jq
# - tar
# - python3 (including the venv and ensurepip modules)
REQUIRED_COMMANDS = curl git jq tar python3


.PHONY: all
all: update-mockup update-bootstrap-icons update-country-flags


# Show the versions of the installed resources.
.PHONY: versions
versions:
	@jq . resource-versions.json


.PHONY: clean
clean:
	rm -Rf .venv


# Check that all commands required by the update scripts are available and
# print installation hints for the missing ones.
.PHONY: check-dependencies
check-dependencies:
	@missing=""; \
	for cmd in $(REQUIRED_COMMANDS); do \
		command -v "$$cmd" > /dev/null 2>&1 || missing="$$missing $$cmd"; \
	done; \
	if [ -n "$$missing" ]; then \
		echo "❌ Missing required commands:$$missing" >&2; \
		echo "   Install them with your package manager, e.g.:" >&2; \
		echo "   macOS (Homebrew): brew install$$missing" >&2; \
		echo "   Debian/Ubuntu:    sudo apt install$$missing" >&2; \
		echo "   Fedora:           sudo dnf install$$missing" >&2; \
		exit 1; \
	fi; \
	if ! python3 -c "import venv, ensurepip" > /dev/null 2>&1; then \
		echo "❌ python3 cannot create virtual environments (venv/ensurepip missing)." >&2; \
		echo "   Debian/Ubuntu: sudo apt install python3-venv" >&2; \
		exit 1; \
	fi


# Create the virtual environment only if it is missing or broken, e.g. when it
# was created by a Python interpreter which no longer exists. `--clear` avoids
# mixing different Python versions in the same virtual environment.
.PHONY: install
install: check-dependencies
	@if ! ./.venv/bin/python -c "import lxml" > /dev/null 2>&1 \
		|| ! ./.venv/bin/towncrier --version > /dev/null 2>&1; then \
		echo "🐍 Create virtual environment in .venv with `command -v python3`."; \
		python3 -m venv --clear .venv \
		&& ./.venv/bin/pip install --quiet lxml towncrier; \
	fi


# Download the Mockup universal bundle with the npm dist-tag `latest` from the
# npm registry and replace the existing one.
#
# You can use the `MOCKUP_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `MOCKUP_VERSION=5.7.0-alpha.2 make update-mockup`
#
.PHONY: update-mockup
update-mockup: install
	@sh scripts/update_mockup.sh "$(BUNDLE_DIR)" "$(MOCKUP_VERSION)" latest


# Download the newest Mockup pre-release from the npm registry: the highest
# version among the dist-tags `alpha`, `beta` and `rc`, which is higher than
# `latest`. Use `MOCKUP_VERSION` to select a specific version instead.
.PHONY: update-mockup-prerelease
update-mockup-prerelease: install
	@sh scripts/update_mockup.sh "$(BUNDLE_DIR)" "$(MOCKUP_VERSION)" prerelease


# Download bootstrap-icons from the npm registry and replace the existing one.
# Only the SVG icons are copied.
#
# You can use the `BOOTSTRAP_ICONS_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `BOOTSTRAP_ICONS_VERSION=1.13.1 make update-bootstrap-icons`
#
.PHONY: update-bootstrap-icons
update-bootstrap-icons: install
	@sh scripts/update_bootstrap_icons.sh "$(BOOTSTRAP_ICONS_DIR)" "$(BOOTSTRAP_ICONS_VERSION)"


# Download country-flags from the main branch on GitHub and replace the
# existing one.
#
# Country flags have no releases and the npm package is outdated, so we cannot
# download a specific version.
# Anyways, the package.json file include a version specifier, which is used for
# the changelog entry and commit message.
.PHONY: update-country-flags
update-country-flags: install
	@sh scripts/update_country_flags.sh "$(COUNTRY_FLAGS_DIR)"
