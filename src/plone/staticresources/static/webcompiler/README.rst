Scripts for TTW compilation of resources
========================================

These scripts are used for through-the-web compilation of resources in the ``@@resourceregistry-controlpanel``.

All resources are downloaded to the client browser and compiled there to bundles.
The bundles are then re-uploaded to the server and stored in a plone.resource directory in the ZODB.

If you update ``r.js`` or ``less``, you will need to manually re-apply a patch that gives us cache busting resource downloads so we can build through the web.
See:

- https://github.com/plone/plone.staticresources/commit/a8f7d5e0d9711423d95317ef3e1b9ed6df1609e9
- https://github.com/plone/plone.staticresources/commit/4effd0d5803a794267e6b433fe55e323002508cf


1) Get original resources
-------------------------
::
  wget https://raw.githubusercontent.com/requirejs/r.js/2.1.15/dist/r.js
  wget https://raw.githubusercontent.com/less/less.js/v2.1.2/dist/less.js
  git add .
  git commit -m'Get original resources of less.js and r.js'


2) Apply patches
----------------
::
  git apply less.js.patch
  git apply r.js.patch

