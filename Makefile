PNPM = pnpm

.PHONY: all
all: build update-icons

.PHONY: clean
clean:
	# remove mockup from sources
	rm -Rf node_modules
	rm -Rf src/plone/staticresources/static/bundle-plone/*
	rm -Rf .venv

install: clean
	$(PNPM) install
	`which python3` -m venv .venv
	./.venv/bin/pip install lxml

.PHONY: build
build: install
	$(PNPM) run build

.PHONY: update-icons
update-icons: install
	./.venv/bin/python src/plone/staticresources/_scripts/register_icons.py
	./.venv/bin/python src/plone/staticresources/_scripts/register_flag_icons.py
	./.venv/bin/python src/plone/staticresources/_scripts/iconmap_json.py
