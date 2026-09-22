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

# npm_prerelease PACKAGE
#
# Find the newest pre-release among the dist-tags `alpha`, `beta` and `rc`.
# Only versions higher than `latest` are considered, so stale pre-release tags
# of older release lines are ignored. Versions are compared by semver, not by
# publish date, as maintenance releases may be published after pre-releases.
# Sets NPM_PRERELEASE_TAG and NPM_PRERELEASE_VERSION; returns 1 if there is no
# such pre-release.
npm_prerelease() {
    npm_package=$1

    if ! npm_meta=$(curl -fsSL -H "Accept: application/vnd.npm.install-v1+json" \
        "${NPM_REGISTRY}/${npm_package}"); then
        echo "❌ Cannot get the dist-tags of ${npm_package} from ${NPM_REGISTRY}." >&2
        exit 1
    fi
    npm_prerelease=$(printf '%s' "$npm_meta" | jq -r '
        # Semver sort key: releases sort after their pre-releases, numeric
        # identifiers before alphanumeric ones (numbers < strings < objects).
        def semver_key:
            sub("\\+.*$"; "")
            | capture("^(?<main>[0-9]+\\.[0-9]+\\.[0-9]+)(-(?<pre>.*))?$")
            | [(.main | split(".") | map(tonumber)),
               (if .pre then .pre | split(".") | map(tonumber? // .) else [{}] end)];
        ."dist-tags" as $tags
        | ($tags.latest | semver_key) as $latest
        | [$tags | to_entries[]
           | select(.key == "alpha" or .key == "beta" or .key == "rc")
           | select((.value | semver_key) > $latest)]
        | if length == 0 then empty else max_by(.value | semver_key) | "\(.key) \(.value)" end
    ')
    if [ -z "$npm_prerelease" ]; then
        echo "❌ No ${npm_package} pre-release (dist-tag alpha, beta or rc) newer than latest found." >&2
        return 1
    fi
    NPM_PRERELEASE_TAG=${npm_prerelease%% *}
    NPM_PRERELEASE_VERSION=${npm_prerelease#* }
}
