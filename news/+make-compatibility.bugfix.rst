Makefile: Improve compatibility with macOS.

The previous Makefile used `.ONESHELL` and `.SHELLFLAGS`, features of GNU make
3.82. macOS ships with GNU make 3.81 and those features are not available. For
better compatibility (and maybe even maintainability), move the shell commands
into their own shell scripts.

Download Mockup and Bootstrap Icons from the npm registry instead of GitHub
releases. `make update-mockup` uses the npm dist-tag `latest`,
`make update-mockup-prerelease` the dist-tag `alpha` (configurable via
`MOCKUP_PRERELEASE_TAG`). The Mockup update fails if the npm package contains no
built bundle. Country flags are downloaded as a tarball of the `main` branch,
which is resolved via `git ls-remote`. The update scripts do not use the rate
limited GitHub API, `wget` or `unzip` anymore.

@thet @petschki
