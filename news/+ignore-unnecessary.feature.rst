Ignore unnecessary resources from original icon packages.

When updating icons with update-country-flags some resources (.gitignore files,
scripts) are installed, which we do not use nor want. These are git-ignored and
not added to the repository. update-bootstrap-icons only copies the SVG icons,
so the unused CSS and SCSS files and fonts are not installed at all.
