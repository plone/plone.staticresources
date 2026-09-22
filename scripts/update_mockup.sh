#!/bin/sh
# Invoked by make from the repository root.
set -e

BUNDLE_DIR=${1:?BUNDLE_DIR is required}
MOCKUP_VERSION=${2:-}
MOCKUP_DIST_TAG=${3:-latest}

. "$(dirname "$0")/npm.sh"

TMP_DIR=$(mktemp -d)
trap 'rm -Rf "$TMP_DIR"' EXIT

if [ -n "${MOCKUP_VERSION}" ]; then
    echo "🧪 Download Mockup ${MOCKUP_VERSION} from npm."
    npm_fetch @plone/mockup "${MOCKUP_VERSION}" "$TMP_DIR"
else
    echo "🧪 Download Mockup with dist-tag '${MOCKUP_DIST_TAG}' from npm."
    npm_fetch @plone/mockup "${MOCKUP_DIST_TAG}" "$TMP_DIR"
fi
MOCKUP_VERSION=$NPM_VERSION
echo "🏷️  Mockup version is: ${MOCKUP_VERSION}"

# The npm package also contains the sources. Make sure it contains the webpack
# built bundle, which is registered in the resource registry.
MOCKUP_DIST="$TMP_DIR/package/dist"
for file in bundle.min.js remote.min.js; do
    if [ ! -s "${MOCKUP_DIST}/${file}" ]; then
        echo "❌ The npm package of Mockup ${MOCKUP_VERSION} contains no built bundle (dist/${file} is missing or empty)." >&2
        exit 1
    fi
done
if [ -z "$(ls -A "${MOCKUP_DIST}/chunks" 2> /dev/null)" ]; then
    echo "❌ The npm package of Mockup ${MOCKUP_VERSION} contains no built bundle (dist/chunks/ is missing or empty)." >&2
    exit 1
fi

# Replace the old Mockup bundle with the new one.
rm -Rf "${BUNDLE_DIR}"
mv "${MOCKUP_DIST}" "${BUNDLE_DIR}"

echo "🧪 Check for resource changes."
git add "${BUNDLE_DIR}"
if git diff --cached --quiet -- "${BUNDLE_DIR}"; then
    echo "ℹ️ Mockup is unchanged; no changelog entry or commit created."
    exit 0
fi

echo "🧪 Git add and commit."
# Add changelog entry
./.venv/bin/towncrier create +update-mockup.feature \
    --content "Update Mockup to ${MOCKUP_VERSION}."
# Add with a `*` in case a number was appended due to a naming conflict.
git add news/+update-mockup.feature*

# commit
git commit -m"Update Mockup to ${MOCKUP_VERSION}." > /dev/null

# Spit out info.
echo ""
echo "📦 Mockup static folder size is: "
cd "${BUNDLE_DIR}"
du -sh
echo ""
echo "🚀 Updated Mockup to ${MOCKUP_VERSION}."
echo ""
