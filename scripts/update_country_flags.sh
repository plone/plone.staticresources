#!/bin/sh
# Invoked by make from the repository root.
set -e

COUNTRY_FLAGS_DIR=${1:?COUNTRY_FLAGS_DIR is required}

COUNTRY_FLAGS_REPO=https://github.com/hampusborgos/country-flags

TMP_DIR=$(mktemp -d)
trap 'rm -Rf "$TMP_DIR"' EXIT

echo "🧪 Copy country-flags from GitHub."

# The npm package svg-country-flags is outdated, so get the commit hash of the
# main branch (without using the rate limited GitHub API) and download that
# exact revision.
COUNTRY_FLAGS_REVISION=$(git ls-remote "$COUNTRY_FLAGS_REPO" refs/heads/main | cut -f1)
if ! printf '%s' "$COUNTRY_FLAGS_REVISION" | grep -Eq '^[0-9a-f]{40}$'; then
    echo "❌ Cannot get the main branch revision of ${COUNTRY_FLAGS_REPO}." >&2
    exit 1
fi
if ! curl -fsSL "${COUNTRY_FLAGS_REPO}/archive/${COUNTRY_FLAGS_REVISION}.tar.gz" \
    | tar -xzf - -C "$TMP_DIR"; then
    echo "❌ Cannot download or extract country-flags ${COUNTRY_FLAGS_REVISION}." >&2
    exit 1
fi
COUNTRY_FLAGS_SRC="$TMP_DIR/country-flags-${COUNTRY_FLAGS_REVISION}"
# Use the package version for the changelog and commit message.
COUNTRY_FLAGS_VERSION=$(jq -er '.version | strings | select(length > 0)' "${COUNTRY_FLAGS_SRC}/package.json")
echo "🏷️  Country flags version is: ${COUNTRY_FLAGS_VERSION}"
# Replace the old country flags with the new ones.
rm -Rf "${COUNTRY_FLAGS_DIR}"
mv "${COUNTRY_FLAGS_SRC}" "${COUNTRY_FLAGS_DIR}"

echo "🔰 Register flag icons"
./.venv/bin/python src/plone/staticresources/_scripts/register_flag_icons.py
./.venv/bin/python src/plone/staticresources/_scripts/iconmap_json.py

echo "🧪 Check for resource changes."
git add "${COUNTRY_FLAGS_DIR}"
git add src/plone/staticresources/profiles/default/registry/icons_country_flags.xml
git add src/plone/staticresources/profiles/default/registry/icons_language_flags.xml
git add src/plone/staticresources/static/iconmap.json
if git diff --cached --quiet -- "${COUNTRY_FLAGS_DIR}" \
    src/plone/staticresources/profiles/default/registry/icons_country_flags.xml \
    src/plone/staticresources/profiles/default/registry/icons_language_flags.xml \
    src/plone/staticresources/static/iconmap.json; then
    echo "ℹ️ Country flags are unchanged; no changelog entry or commit created."
    exit 0
fi

echo "🧪 Git add and commit."
# Add changelog entry
./.venv/bin/towncrier create +update-country-flags.feature \
    --content "Update country flags icons to ${COUNTRY_FLAGS_VERSION}."
# Add with a `*` in case a number was appended due to a naming conflict.
git add news/+update-country-flags.feature*

# commit
git commit -m"Update country flags icons to ${COUNTRY_FLAGS_VERSION}." > /dev/null

# Spit out info.
echo ""
echo "📦 Country flags icons static folder size is: "
cd "${COUNTRY_FLAGS_DIR}"
du -sh
echo ""
echo "🚀 Updated country flags icons to ${COUNTRY_FLAGS_VERSION}."
echo "‼️ Don't forget to create an upgrade step for the new icons (see upgrade 217 for an example) ‼️"
echo ""
