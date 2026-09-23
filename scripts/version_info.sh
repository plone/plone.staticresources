# Helpers for the resource-versions.json file, which records the versions of
# the installed resources. Source this file from the update scripts.

VERSION_INFO_FILE=resource-versions.json

# set_version_info KEY JSON
#
# Set the entry KEY to the JSON object and stage the file.
set_version_info() {
    [ -f "$VERSION_INFO_FILE" ] || echo '{}' > "$VERSION_INFO_FILE"
    jq --sort-keys --arg key "$1" --argjson value "$2" '.[$key] = $value' \
        "$VERSION_INFO_FILE" > "${VERSION_INFO_FILE}.tmp"
    mv "${VERSION_INFO_FILE}.tmp" "$VERSION_INFO_FILE"
    git add "$VERSION_INFO_FILE"
}
