BUNDLE_DIR = src/plone/staticresources/static/bundle-plone
BOOTSTRAP_ICONS_DIR = src/plone/staticresources/static/icons-bootstrap
COUNTRY_FLAGS_DIR = src/plone/staticresources/static/icons-country-flags

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


.PHONY: install
./.venv/bin/python install:
	`which python3` -m venv .venv
	./.venv/bin/pip install lxml towncrier


# Download a Mockup universal bundle from GitHub releases and replace
# the existing one.
#
# You can use the `MOCKUP_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `MOCKUP_VERSION=5.7.0-alpha.2 make update-mockup`
#
.PHONY: update-mockup
update-mockup: install
	@sh scripts/update_mockup.sh "$(BUNDLE_DIR)" "$(MOCKUP_VERSION)"


# Download bootstrap-icons from GitHub releases and replace the existing one.
#
# You can use the `BOOTSTRAP_ICONS_VERSION` environment variable to download a
# specific version, e.g. a pre-release version which would not be picked up
# automatically:
# `BOOTSTRAP_ICONS_VERSION=5.7.0-alpha.2 make update-bootstrap-icons`
#
.PHONY: update-bootstrap-icons
update-bootstrap-icons: install
	@sh scripts/update_bootstrap_icons.sh "$(BOOTSTRAP_ICONS_DIR)" "$(BOOTSTRAP_ICONS_VERSION)"


# Download country-flags from GitHub and replace the existing one.
#
# Country flags have no releases, so resolve main to an exact commit.
.PHONY: update-country-flags
update-country-flags: install
	@sh scripts/update_country_flags.sh "$(COUNTRY_FLAGS_DIR)"
