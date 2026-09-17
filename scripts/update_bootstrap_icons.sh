#!/bin/sh
# Invoked by make from the repository root.
set -e

BOOTSTRAP_ICONS_DIR=${1:?BOOTSTRAP_ICONS_DIR is required}
BOOTSTRAP_ICONS_VERSION=${2:-}

if [ -z "${BOOTSTRAP_ICONS_VERSION}" ]; then
    echo "🧪 Get the latest Bootstrap Icons version from GitHub (no pre-release)."
    RELEASE=$(curl -fsSL https://api.github.com/repos/twbs/icons/releases/latest)
    BOOTSTRAP_ICONS_VERSION=$(printf '%s' "$RELEASE" | jq -er '.tag_name | strings | select(length > 0)')
    echo "🏷️  Bootstrap Icons version is: ${BOOTSTRAP_ICONS_VERSION}"
fi

BOOTSTRAP_ICONS_BASENAME=bootstrap-icons-${BOOTSTRAP_ICONS_VERSION#v}

echo "🧪 Copy bootstrap-icons from GitHub."

# Download the Bootstrap Icons bundle.
wget "https://github.com/twbs/icons/releases/download/${BOOTSTRAP_ICONS_VERSION}/${BOOTSTRAP_ICONS_BASENAME}.zip" 1> /dev/null 2> /dev/null
unzip "${BOOTSTRAP_ICONS_BASENAME}.zip" > /dev/null
# Replace the old Bootstrap Icons bundle with the new one.
rm -Rf "${BOOTSTRAP_ICONS_DIR}"
mv "${BOOTSTRAP_ICONS_BASENAME}" "${BOOTSTRAP_ICONS_DIR}"
# Cleanup.
rm "${BOOTSTRAP_ICONS_BASENAME}.zip"

echo "✳️ Register bootstrap icons"
./.venv/bin/python src/plone/staticresources/_scripts/register_icons.py
./.venv/bin/python src/plone/staticresources/_scripts/iconmap_json.py

echo "🧪 Check for resource changes."
git add "${BOOTSTRAP_ICONS_DIR}"
git add src/plone/staticresources/profiles/default/registry/icons_bootstrap.xml
git add src/plone/staticresources/static/iconmap.json
if git diff --cached --quiet -- "${BOOTSTRAP_ICONS_DIR}" \
    src/plone/staticresources/profiles/default/registry/icons_bootstrap.xml \
    src/plone/staticresources/static/iconmap.json; then
    echo "ℹ️ Bootstrap Icons are unchanged; no changelog entry or commit created."
    exit 0
fi

echo "🧪 Git add and commit."
# Add changelog entry
towncrier create +update-bootstrap-icons.feature \
    --content "Update Bootstrap Icons to ${BOOTSTRAP_ICONS_VERSION}."
# Add with a `*` in case a number was appended due to a naming conflict.
git add news/+update-bootstrap-icons.feature*

# commit
git commit -m"Update Bootstrap Icons to ${BOOTSTRAP_ICONS_VERSION}." > /dev/null

# Spit out info.
echo ""
echo "📦 Bootstrap Icons static folder size is: "
cd "${BOOTSTRAP_ICONS_DIR}"
du -sh
echo ""
echo "🚀 Updated Bootstrap Icons to ${BOOTSTRAP_ICONS_VERSION}."
echo "‼️ Don't forget to create an upgrade step for the new icons (see upgrade 217 for an example) ‼️"
echo ""
