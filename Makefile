BUNDLE_DIR = src/plone/staticresources/static/bundle-plone
BOOTSTRAP_ICONS_DIR = src/plone/staticresources/static/icons-bootstrap
BOOTSTRAP_ICONS_BASENAME = bootstrap-icons-$(patsubst v%,%,$(BOOTSTRAP_ICONS_VERSION))
COUNTRY_FLAGS_DIR = src/plone/staticresources/static/icons-country-flags

# Run each recipe in one shell so an early exit skips its remaining commands.
# Keep stopping immediately when a command fails.
.ONESHELL:
.SHELLFLAGS = -ec


# Prerequisites:
# - make
# - curl
# - git
# - jq


.PHONY: all
all: update-mockup update-bootstrap-icons update-country-flags


.PHONY: clean
clean:
	rm -Rf .venv


./.venv/bin/python install:
	`which python3` -m venv .venv
	./.venv/bin/pip install lxml


# Download a Mockup universal bundle from GitHub releases and replace
# the existing one.
#
# You can use the `MOCKUP_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `MOCKUP_VERSION=5.7.0-alpha.2 make update-mockup`
#
.PHONY: update-mockup
update-mockup:
ifndef MOCKUP_VERSION
	@echo "🧪 Get the latest Mockup version from GitHub (no pre-release)."

	@# If no MOCKUP_VERSION environment variable is defined,
	@# Get the latest version from the GitHub API.
	# Also see: https://stackoverflow.com/a/42040905/1337474
	$(eval MOCKUP_VERSION := $(shell curl https://api.github.com/repos/plone/mockup/releases/latest -s | jq .tag_name -r))
	@echo "🏷️  Mockup version is: $(MOCKUP_VERSION)"

endif
	@echo "🧪 Copy bundle from GitHub."

	@# Download the Mockup bundle.
	wget https://github.com/plone/mockup/releases/download/$(MOCKUP_VERSION)/mockup-bundle-$(MOCKUP_VERSION).zip 1> /dev/null 2> /dev/null
	@unzip mockup-bundle-$(MOCKUP_VERSION).zip > /dev/null
	@# Replace the old Mockup bundle with the new one.
	@rm -Rf $(BUNDLE_DIR)
	@mv mockup-bundle-$(MOCKUP_VERSION) $(BUNDLE_DIR)
	@# Cleanup.
	@rm mockup-bundle-$(MOCKUP_VERSION).zip

	@echo "🧪 Check for resource changes."
	@git add $(BUNDLE_DIR)
	@if git diff --cached --quiet -- $(BUNDLE_DIR); then
		echo "ℹ️ Mockup is unchanged; no changelog entry or commit created."
		exit 0
	fi

	@echo "🧪 Git add and commit."
	@# Add changelog entry
	@towncrier create +update-mockup.feature \
		--content "Update Mockup to $(MOCKUP_VERSION)."
	@# Add with a `*` in case a number was appended due to a naming conflict.
	@git add news/+update-mockup.feature*

	@# commit
	@git commit -m"Update Mockup to $(MOCKUP_VERSION)." > /dev/null

	@# Spit out info.
	@echo ""
	@echo "📦 Mockup static folder size is: "
	@cd $(BUNDLE_DIR) && du -sh
	@echo ""
	@echo "🚀 Updated Mockup to $(MOCKUP_VERSION)."
	@echo ""


# Download bootstrap-icons from GitHub releases and replace the existing one.
#
# You can use the `BOOTSTRAP_ICONS_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `BOOTSTRAP_ICONS_VERSION=5.7.0-alpha.2 make update-bootstrap-icons`
#
.PHONY: update-bootstrap-icons
update-bootstrap-icons: install
ifndef BOOTSTRAP_ICONS_VERSION
	@echo "🧪 Get the latest Bootstrap Icons version from GitHub (no pre-release)."

	@# If no BOOTSTRAP_ICONS_VERSION environment variable is defined,
	@# Get the latest version from the GitHub API.
	# Also see: https://stackoverflow.com/a/42040905/1337474
	$(eval BOOTSTRAP_ICONS_VERSION := $(shell curl https://api.github.com/repos/twbs/icons/releases/latest -s | jq .tag_name -r))
	@echo "🏷️  Bootstrap Icons version is: $(BOOTSTRAP_ICONS_VERSION)"

endif
	@echo "🧪 Copy bootstrap-icons from GitHub."

	@# Download the Bootstrap Icons bundle.
	wget https://github.com/twbs/icons/releases/download/$(BOOTSTRAP_ICONS_VERSION)/$(BOOTSTRAP_ICONS_BASENAME).zip 1> /dev/null 2> /dev/null
	@unzip $(BOOTSTRAP_ICONS_BASENAME).zip > /dev/null
	@# Replace the old Bootstrap Icons bundle with the new one.
	@rm -Rf $(BOOTSTRAP_ICONS_DIR)
	@mv $(BOOTSTRAP_ICONS_BASENAME) $(BOOTSTRAP_ICONS_DIR)
	@# Cleanup.
	@rm $(BOOTSTRAP_ICONS_BASENAME).zip

	@echo "✳️ Register bootstrap icons"
	./.venv/bin/python src/plone/staticresources/_scripts/register_icons.py
	./.venv/bin/python src/plone/staticresources/_scripts/iconmap_json.py

	@echo "🧪 Check for resource changes."
	@git add $(BOOTSTRAP_ICONS_DIR)
	@git add src/plone/staticresources/profiles/default/registry/icons_bootstrap.xml
	@git add src/plone/staticresources/static/iconmap.json
	@if git diff --cached --quiet -- $(BOOTSTRAP_ICONS_DIR) \
		src/plone/staticresources/profiles/default/registry/icons_bootstrap.xml \
		src/plone/staticresources/static/iconmap.json; then
		echo "ℹ️ Bootstrap Icons are unchanged; no changelog entry or commit created."
		exit 0
	fi

	@echo "🧪 Git add and commit."
	@# Add changelog entry
	@towncrier create +update-bootstrap-icons.feature \
		--content "Update Bootstrap Icons to $(BOOTSTRAP_ICONS_VERSION)."
	@# Add with a `*` in case a number was appended due to a naming conflict.
	@git add news/+update-bootstrap-icons.feature*

	@# commit
	@git commit -m"Update Bootstrap Icons to $(BOOTSTRAP_ICONS_VERSION)." > /dev/null

	@# Spit out info.
	@echo ""
	@echo "📦 Bootstrap Icons static folder size is: "
	@cd $(BOOTSTRAP_ICONS_DIR) && du -sh
	@echo ""
	@echo "🚀 Updated Bootstrap Icons to $(BOOTSTRAP_ICONS_VERSION)."
	@echo "‼️ Don't forget to create an upgrade step for the new icons (see upgrade 217 for an example) ‼️"
	@echo ""


# Download country-flags from GitHub and replace the existing one.
#
# Country flags have no releases, so resolve main to an exact commit.
.PHONY: update-country-flags
update-country-flags: install
	@echo "🧪 Copy country-flags from GitHub."

	@# Get the commit hash and download that exact revision.
	@COUNTRY_FLAGS_REVISION=$$(curl -fsSL https://api.github.com/repos/hampusborgos/country-flags/commits/main | jq -er '.sha | strings | select(test("^[0-9a-f]{40}$$"))')
	wget https://github.com/hampusborgos/country-flags/archive/$$COUNTRY_FLAGS_REVISION.zip -O country-flags.zip 1> /dev/null 2> /dev/null
	@unzip country-flags.zip > /dev/null
	@# Replace the old country flags with the new ones.
	@rm -Rf $(COUNTRY_FLAGS_DIR)
	@mv country-flags-$$COUNTRY_FLAGS_REVISION $(COUNTRY_FLAGS_DIR)
	@# Cleanup.
	@rm country-flags.zip

	@echo "🔰 Register flag icons"
	./.venv/bin/python src/plone/staticresources/_scripts/register_flag_icons.py
	./.venv/bin/python src/plone/staticresources/_scripts/iconmap_json.py

	@echo "🧪 Check for resource changes."
	@git add $(COUNTRY_FLAGS_DIR)
	@git add src/plone/staticresources/profiles/default/registry/icons_country_flags.xml
	@git add src/plone/staticresources/profiles/default/registry/icons_language_flags.xml
	@git add src/plone/staticresources/static/iconmap.json
	@if git diff --cached --quiet -- $(COUNTRY_FLAGS_DIR) \
		src/plone/staticresources/profiles/default/registry/icons_country_flags.xml \
		src/plone/staticresources/profiles/default/registry/icons_language_flags.xml \
		src/plone/staticresources/static/iconmap.json; then
		echo "ℹ️ Country flags are unchanged; no changelog entry or commit created."
		exit 0
	fi

	@echo "🧪 Git add and commit."
	@# Add changelog entry
	@towncrier create +update-country-flags.feature \
		--content "Update country flags icons to commit $$COUNTRY_FLAGS_REVISION."
	@# Add with a `*` in case a number was appended due to a naming conflict.
	@git add news/+update-country-flags.feature*

	@# commit
	@git commit -m"Update country flags icons." > /dev/null

	@# Spit out info.
	@echo ""
	@echo "📦 Country flags icons static folder size is: "
	@cd $(COUNTRY_FLAGS_DIR) && du -sh
	@echo ""
	@echo "🚀 Updated country flags icons."
	@echo "‼️ Don't forget to create an upgrade step for the new icons (see upgrade 217 for an example) ‼️"
	@echo ""
