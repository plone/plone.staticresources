Makefile: Improve compatibility with macOS.

The previous Makefile used `.ONESHELL` and `.SHELLFLAGS`, features of GNU make
3.82. macOS ships with GNU make 3.81 and those features are not available. For
better compatibility (and maybe even maintainability), move the shell commands
into their own shell scripts.

@thet

Co-authored-by: Codex <noreply@openai.com>
