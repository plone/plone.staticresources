YARN   ?= npx yarn


install:
	$(YARN) install

.PHONY: clean
clean:
	rm -Rf node_modules
	rm -Rf src/plone/staticresources/static/bundle-plone/*

.PHONY: build
build:: clean install
	$(YARN) run build

#
