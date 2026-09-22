Ignore unnecessary resources from original icon packages.

When updating icons with update-bootstrap-icons and update-country-flags some
resources (.gitignore files, scripts, unused CSS and SCSS files, fonts) are
installed, which we do not use nor want. These are git-ignored and not added to
the repository.
