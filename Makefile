PNPM = pnpm

.PHONY: all
all: build update-icons

.PHONY: clean
clean:
	# remove mockup from sources
	rm -Rf node_modules
	rm -Rf src/plone/staticresources/static/bundle-plone/*

install: clean
	$(PNPM) install

.PHONY: build
build: install
	$(PNPM) run build

.PHONY: update-icons
update-icons:
	(cd src/plone/staticresources/_scripts && `which python3` register_icons.py)
	(cd src/plone/staticresources/_scripts && `which python3` register_flag_icons.py)
	(cd src/plone/staticresources/_scripts && `which python3` iconmap_json.py)
