plone.staticresources
=====================

This add-on contains Fonts, Icons and JavaScript used by Plone Classic-UI.


How to upgrade the resources in this package
--------------------------------------------

.. note::
  Changes to JavaScript functionality must be done outside this package.
  If you want to fix something or add functionality in Mockup you have to do it there.
  This package is only to deliver the generated bundles.

1. Add ``plone.staticresources`` and ``mockup`` to ``checkouts.cfg`` in ``buildout.coredev``
   and do the buildout.

2. Update JavaScript resources in ``mockup`` and request a release on `npmjs <https://www.npmjs.org/@plone/mockup>`_.
   See `mockup <https://github.com/plone/mockup/README.rst>`_ on details how to contribute there.

3. Update dependency versions (eg. new mockup release) in ``package.json`` here.

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

Build the stats.json file:

```
npx yarn stats
```

Check dependency tree and why which package was included:
https://www.npmjs.com/package/whybundled

```
npx whybundled stats.json
```

Visualize dependency tree and analyze bundle size:
https://www.npmjs.com/package/webpack-bundle-analyzer

```
npx webpack-bundle-analyzer stats.json
```


License
-------

The project is licensed under the GPLv2.
