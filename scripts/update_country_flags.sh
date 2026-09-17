#!/bin/sh
# Invoked by make from the repository root.
set -e

COUNTRY_FLAGS_DIR=${1:?COUNTRY_FLAGS_DIR is required}

echo "🧪 Copy country-flags from GitHub."

# Get the commit hash and download that exact revision.
REVISION=$(curl -fsSL https://api.github.com/repos/hampusborgos/country-flags/commits/main)
COUNTRY_FLAGS_REVISION=$(printf '%s' "$REVISION" | jq -er '.sha | strings | select(test("^[0-9a-f]{40}$"))')
wget "https://github.com/hampusborgos/country-flags/archive/$COUNTRY_FLAGS_REVISION.zip" -O country-flags.zip 1> /dev/null 2> /dev/null
unzip country-flags.zip > /dev/null
# Replace the old country flags with the new ones.
rm -Rf "${COUNTRY_FLAGS_DIR}"
mv "country-flags-$COUNTRY_FLAGS_REVISION" "${COUNTRY_FLAGS_DIR}"
# Cleanup.
rm country-flags.zip

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
    --content "Update country flags icons to commit $COUNTRY_FLAGS_REVISION."
# Add with a `*` in case a number was appended due to a naming conflict.
git add news/+update-country-flags.feature*

# commit
git commit -m"Update country flags icons." > /dev/null

# Spit out info.
echo ""
echo "📦 Country flags icons static folder size is: "
cd "${COUNTRY_FLAGS_DIR}"
du -sh
echo ""
echo "🚀 Updated country flags icons."
echo "‼️ Don't forget to create an upgrade step for the new icons (see upgrade 217 for an example) ‼️"
echo ""
