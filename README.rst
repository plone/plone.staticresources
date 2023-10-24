plone.staticresources
=====================

This add-on contains Fonts, Icons and JavaScript used by Plone Classic-UI.

Version Information
-------------------

- Version 2.2.x -> Plone 6.1
- Version 2.1.x -> Plone 6.0
- Version 1.x   -> Plone 5.2

Note on Version 2.2.x:

This version introduces TinyMCE 6. It is also compatible with ``Plone>=6.0.7``.


How to upgrade the resources in this package
--------------------------------------------

> NOTE:
> Changes to JavaScript functionality must be done outside this package.
> If you want to fix something or add functionality please go to
> the [mockup](https://github.com/plone/mockup.git) repository and follow the
> instructions there. This package is only to deliver the generated bundles.

1. Add ``plone.staticresources`` and ``mockup`` to ``checkouts.cfg`` in ``buildout.coredev``
   and do the buildout.

2. Update JavaScript resources in ``mockup`` and request a release
   on `npmjs <https://www.npmjs.org/@plone/mockup>`_.

3. Update dependency versions (eg. new mockup release) in ``package.json`` here.
   Use `yarn upgrade-interactive --latest` for conveniently update all the versions in package.json at once.
   Since plone.staticresources should contain deterministically reproducible builds use fixed versions and not version ranges in package.json.
   For example use `"@plone/mockup": "5.0.11"` instead of `"@plone/mockup": "^5.0.11"`.

4. Run ``make all`` to compile the bundles and map Bootstrap icons to the registry files
   located in ``src/plone/staticresources/profiles/default/registry/icons_*.xml``.

5. Submit a Pull Request and run the tests on Jenkins.


What has changed
----------------

Since Plone 6.x we use webpack to compile bundles.
See configuration in ``webpack.config.js``.


Bundle build analyzation
------------------------

https://survivejs.com/webpack/optimizing/build-analysis/
https://formidable.com/blog/2018/finding-webpack-duplicates-with-inspectpack-plugin/

Build the stats.json file::

   npx yarn stats

Check dependency tree and why which package was included
https://www.npmjs.com/package/whybundled
::

   npx whybundled stats.json

Visualize dependency tree and analyze bundle size:
https://www.npmjs.com/package/webpack-bundle-analyzer
::

   npx webpack-bundle-analyzer stats.json


License
-------

The project is licensed under the GPLv2.
