=====================
plone.staticresources
=====================

Static JS and CSS resources for Plone.


This add on contains all JavaScript and CSS resources from Plone.
Prior to Plone 5.2, they were located in Products.CMFPlone.

.. note::
  A note on yarn: We require the use of yarn, because yarn supports installing the packages in a custom directory, which npm doesn't.
  Our package directory is located at: ``src/plone/staticresources/static/components``.


How to develop on patterns
--------------------------

All JavaScript code in this package is downloaded via yarn into ``src/plone/staticresources/static/components``.
Nothing in this directory should be touched.
If you need to fix something, fix it in the original repository and eventually upgrade the version (described below).
For Mockup, the original repository is: https://github.com/plone/mockup/
For Patternslib, visit: http://github.com/patternslib/Patterns


How to upgrade the resources in this package
--------------------------------------------

- Increase the npm package versions in package.json.
- Run ``yarn upgrade``.
- Run ``./bin/plone-compile-resources -b plone``, ``./bin/plone-compile-resources -b plone-logged-in`` and whatever bundle you're going to build in your buildout's root directory.
  For more info on ``plone-compile-resources`` see: XXX
- Increase the ``last_compilation`` date in ``src/plone/staticresources/profiles/default/registry/bundles.xml``.
- Submit a PR and run the tests on Jenkins.


How to generate the ``plone-compile-resources`` script
------------------------------------------------------

The ``plone-compile-resources`` script can be used to compile bundles from the command line.
In a glimpse, the script starts up a Plone instance, reads the resource- and bundle registrations from the registry and compiles a JS/CSS bundle out of that information.
See ``plone-compile-resources --help`` for more information.

When using the coredev buildout, the ``plone-compile-resources`` script is automatically generated.
If you use a custom buildout, you might need to add something similar like::

  [buildout]
  parts =
    ...
    zopepy
  ...
  [instance]
  ...

  [zopepy]
  recipe = zc.recipe.egg
  eggs =
      ${instance:eggs}
  interpreter = zopepy
  scripts =
      zopepy
      plone-compile-resources


What has changed since Plone 5.1
--------------------------------

- All static resources - bundle resources, compiled bundles, external packages - from Products.CMFPlone.static has been moved here.
- The bundle and resource registrations from the dependencies profile have been moved here.
- The ``plone-compile-resources`` script has been moved here.
- The toolbar pattern from Products.CMFPlone.static.toolbar has been moved to Mockup.
- Mockup has been changed to use npm/yarn instead of bower.
- The thememapper bundle from plone.app.theming has been moved here.
- The resource editor bundle from plone.resourceeditor has been moved here.


Warning
-------

If you update r.js or less, you'll need to manually re-apply a patch
that gets us cache busting resource downloads so we can build
TTW.

See https://github.com/plone/Products.CMFPlone/commit/2d3865805efc6b72dce236eb68e502d8c57717b6
and https://github.com/plone/Products.CMFPlone/commit/bd1f9ba99d1ad40bb7fe1c00eaa32b8884aae5e2


License
-------

The project is licensed under the GPLv2.
