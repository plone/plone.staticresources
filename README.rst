=====================
plone.staticresources
=====================

Static JS and CSS resources for Plone.


This add on contains all JavaScript and CSS resources used by Plone.

Prior to Plone 5.2, they were located in ``static/`` directory of
``Products.CMFPlone`` package.

Due to the specific tooling and workflows used to build frontend resources, and
also the different maintenance and release needs of ``Products.CMFPlone``
itself, Plone static resources are now distributed in this package. For a
complete list of reasons, read the§ `PLIP
1653<https://github.com/plone/Products.CMFPlone/issues/1653>`_.

.. note::

  A note on yarn: We require the use of yarn, because it supports installing
  packages in a custom named directory, which npm doesn't (even using
  ``--prefix``, ``node_modules`` is hardcoded). Our package directory is
  located at: ``src/plone/staticresources/static/components``.


Target audience
---------------

This documentation aims at:

Integrators and Developers
^^^^^^^^^^^^^^^^^^^^^^^^^^

Who want to customize and/or maintain the frontend of a Plone site for their
customers:

- upgrade existing versions or install new ``npm`` packages
- integrate new JavaScript/CSS behavior, eventually wrapped in a ``pattern``
for optimal integration and reuse within Plone frontend ecosystem


Themers
^^^^^^^

Who want to change the look and feel of a Plone site and need to:

- understand how to correctly bundle changes made into existing or new frontend
code
-


Plone Core Developers
^^^^^^^^^^^^^^^^^^^^^

Who want to want to help add/enhance this add-on itself.


Workflow
--------

Default Plone buildout configuration adds an executable in
`./bin/plone-compile-resources` which generates compiled bundles (normal,
minified and respective maps) in `plone/staticresources/static/`.

.. note::

  You can see all the options of this executable by running
  ``./bin/plone-compile-resources --help``

The files in this directory are served by Plone. In production mode URLs will
be similar to:

- http://localhost:8080//++plone++static/++unique++2019-01-08%2006%3A53%3A49.000248/plone-compiled.min.js
- http://localhost:8080/++plone++static/++unique++2019-01-08%2006%3A53%3A49.040248/plone-logged-in-compiled.min.js

In development mode, XXX: Explain what happens/entry point roles of:

- http://localhost:8080/++resource++plone.js
- http://localhost:8080/++resource++plone-logged-in.js
- http://demo.plone.org/++plone++static/plone.less
- http://localhost:8080//++plone++static/plone-logged-in.less


How to develop on ``patterns``
------------------------------

All JavaScript code in this package is downloaded via ``yarn`` into
``src/plone/staticresources/static/components``. Nothing in that directory
should be manually edited. If you need to fix something, do it in the original
repository and eventually upgrade its version (next section).

For Mockup, the original repository is: https://github.com/plone/mockup/

For Patternslib, visit: http://github.com/patternslib/Patterns


How to upgrade the resources in this package
--------------------------------------------

- Increase ``npm`` package versions in ``package.json``, i.e. sections
``dependencies`` or ``devDependencies``.
- Run ``yarn upgrade`` (cannot be ``npm``)
- Run ``./bin/plone-compile-resources -b plone``,
``./bin/plone-compile-resources -b plone-logged-in`` and whatever bundle you're
going to build in your buildout's root directory.
  .. For more info on ``plone-compile-resources`` see: XXX
- Increase the ``last_compilation`` date in
``src/plone/staticresources/profiles/default/registry/bundles.xml``.
- Submit a PR and run the tests on Jenkins.


How to generate the ``plone-compile-resources`` script
------------------------------------------------------

The ``plone-compile-resources`` script can be used to compile bundles from the
command line. In a glimpse, the script starts up a Plone instance, reads the
resources and bundles configured in the registry and compiles a JS/CSS bundle
based on that configuration. See ``plone-compile-resources --help`` for more
information.

When using the coredev buildout, ``plone-compile-resources`` script is
automatically generated. If you use a custom buildout, you might need to add
something similar to:

.. code-block:: ini
  [buildout]
  parts =
    # ...
    zopepy
  # ...
  [instance]
  # ...

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

- All static resources - bundle resources, compiled bundles, external packages -
from ``Products.CMFPlone.static`` have been moved here.
- The bundle and resource registrations from ``Products.CMFPlone``'s
``dependencies`` profile have also been moved here.
- The ``plone-compile-resources`` script has been moved here.
- The ``thememapper`` bundle from plone.app.theming has been moved here.
- The ``plone.resourceeditor`` bundle from ``plone.resourceeditor``
package has been moved here.
- The ``toolbar`` pattern from ``Products.CMFPlone.static.toolbar`` has been
moved to ``mockup`` package.
- ``mockup`` package now uses npm registry and yarn instead of bower.


Warning
-------

If you update ``r.js`` or ``less``, you'll need to manually re-apply a patch
that gets us cache busting resource downloads so we can build through the web. See:
- https://github.com/plone/Products.CMFPlone/commit/2d3865805efc6b72dce236eb68e502d8c57717b6
and
- https://github.com/plone/Products.CMFPlone/commit/bd1f9ba99d1ad40bb7fe1c00eaa32b8884aae5e2


License
-------

The project is licensed under the GPLv2.
