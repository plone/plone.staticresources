YARN   ?= npx yarn


install:
	$(YARN) install

.PHONY: clean
clean:
	rm -Rf node_modules
	rm -Rf src/plone/staticresources/static/bundle-plone/*

.PHONY: update-icons
update-icons:
	(cd src/plone/staticresources/_scripts && `which python3` register_icons.py)
	(cd src/plone/staticresources/_scripts && `which python3` register_flag_icons.py)
	(cd src/plone/staticresources/_scripts && `which python3` iconmap_json.py)

.PHONY: build
build:: clean install update-icons
	$(YARN) run build
