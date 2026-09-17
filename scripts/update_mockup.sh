#!/bin/sh
# Invoked by make from the repository root.
set -e

BUNDLE_DIR=${1:?BUNDLE_DIR is required}
MOCKUP_VERSION=${2:-}

if [ -z "${MOCKUP_VERSION}" ]; then
    echo "🧪 Get the latest Mockup version from GitHub (no pre-release)."
    RELEASE=$(curl -fsSL https://api.github.com/repos/plone/mockup/releases/latest)
    MOCKUP_VERSION=$(printf '%s' "$RELEASE" | jq -er '.tag_name | strings | select(length > 0)')
    echo "🏷️  Mockup version is: ${MOCKUP_VERSION}"
fi

echo "🧪 Copy bundle from GitHub."

# Download the Mockup bundle.
wget "https://github.com/plone/mockup/releases/download/${MOCKUP_VERSION}/mockup-bundle-${MOCKUP_VERSION}.zip" 1> /dev/null 2> /dev/null
unzip "mockup-bundle-${MOCKUP_VERSION}.zip" > /dev/null
# Replace the old Mockup bundle with the new one.
rm -Rf "${BUNDLE_DIR}"
mv "mockup-bundle-${MOCKUP_VERSION}" "${BUNDLE_DIR}"
# Cleanup.
rm "mockup-bundle-${MOCKUP_VERSION}.zip"

echo "🧪 Check for resource changes."
git add "${BUNDLE_DIR}"
if git diff --cached --quiet -- "${BUNDLE_DIR}"; then
    echo "ℹ️ Mockup is unchanged; no changelog entry or commit created."
    exit 0
fi

echo "🧪 Git add and commit."
# Add changelog entry
towncrier create +update-mockup.feature \
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
