# Helpers for downloading packages from the npm registry.
# Source this file from the update scripts; requires curl, jq and tar.

NPM_REGISTRY=https://registry.npmjs.org

# npm_fetch PACKAGE REF DEST_DIR
#
# Resolve REF (a dist-tag like `latest` or `alpha`, or an exact version) and
# extract the package tarball into DEST_DIR. The package contents end up in
# DEST_DIR/package. Sets NPM_VERSION to the resolved version.
npm_fetch() {
    npm_package=$1
    npm_ref=$2
    npm_dest=$3

    if ! npm_meta=$(curl -fsSL "${NPM_REGISTRY}/${npm_package}/${npm_ref}"); then
        echo "❌ Cannot resolve '${npm_ref}' for ${npm_package} on ${NPM_REGISTRY}." >&2
        echo "   Check that the version or dist-tag exists: ${NPM_REGISTRY}/${npm_package}" >&2
        exit 1
    fi
    NPM_VERSION=$(printf '%s' "$npm_meta" | jq -er '.version | strings | select(length > 0)')
    npm_tarball=$(printf '%s' "$npm_meta" | jq -er '.dist.tarball | strings | select(length > 0)')

    if ! curl -fsSL "$npm_tarball" | tar -xzf - -C "$npm_dest"; then
        echo "❌ Cannot download or extract ${npm_tarball}." >&2
        exit 1
    fi
}
