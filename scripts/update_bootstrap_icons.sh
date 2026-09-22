#!/bin/sh
# Invoked by make from the repository root.
set -e

BOOTSTRAP_ICONS_DIR=${1:?BOOTSTRAP_ICONS_DIR is required}
BOOTSTRAP_ICONS_VERSION=${2:-}

. "$(dirname "$0")/npm.sh"

TMP_DIR=$(mktemp -d)
trap 'rm -Rf "$TMP_DIR"' EXIT

if [ -n "${BOOTSTRAP_ICONS_VERSION}" ]; then
    # Accept GitHub tag names like `v1.13.1`, too.
    echo "🧪 Download Bootstrap Icons ${BOOTSTRAP_ICONS_VERSION#v} from npm."
    npm_fetch bootstrap-icons "${BOOTSTRAP_ICONS_VERSION#v}" "$TMP_DIR"
else
    echo "🧪 Download the latest Bootstrap Icons from npm (no pre-release)."
    npm_fetch bootstrap-icons latest "$TMP_DIR"
fi
BOOTSTRAP_ICONS_VERSION=$NPM_VERSION
echo "🏷️  Bootstrap Icons version is: ${BOOTSTRAP_ICONS_VERSION}"

# Replace the old Bootstrap Icons with the new ones. Only the SVG icons are
# used; the sprite and the icon font are not copied.
rm -Rf "${BOOTSTRAP_ICONS_DIR}"
mv "$TMP_DIR/package/icons" "${BOOTSTRAP_ICONS_DIR}"

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
./.venv/bin/towncrier create +update-bootstrap-icons.feature \
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
