=====================
plone.staticresources
=====================

Static JS and CSS resources for Plone.


This add-on contains all JavaScript and CSS resources used by Plone.

Prior to Plone 5.2, they were located in ``static/`` directory of ``Products.CMFPlone`` package.

Due to the specific tooling and workflows used to build frontend resources, and also the different maintenance and release needs of ``Products.CMFPlone`` itself, Plone static resources are now distributed in this package.
For a complete list of reasons, read the `PLIP 1653 <https://github.com/plone/Products.CMFPlone/issues/1653>`_.

.. note::

  A note on yarn: we require the use of yarn, because it supports installing packages in a custom named directory, which npm does not (even using ``--prefix``, ``node_modules`` is hardcoded).
  Our package directory is located at: ``src/plone/staticresources/static/components``.


Target audience
---------------

This documentation aims at:

Integrators and Developers
^^^^^^^^^^^^^^^^^^^^^^^^^^

Who want to customize or maintain the front end of a Plone site for their customers:

- upgrade existing versions or install new ``npm`` packages.

- integrate new JavaScript/CSS behavior, eventually wrapped in a ``pattern`` for optimal integration and reuse within Plone front end ecosystem.


Themer authors
^^^^^^^^^^^^^^

Who want to change the look and feel of a Plone site and need to:

- understand how to correctly bundle changes from existing or new frontend code.


Plone Core Developers
^^^^^^^^^^^^^^^^^^^^^

Who want to help enhance this add-on itself.


Compiling bundles
-----------------

The default Plone buildout configuration adds an executable in ``./bin/plone-compile-resources``.
This script generates compiled bundles (normal, minified and respective maps) in ``plone/staticresources/static/`` or whereever the ``csscompilation`` and ``jscompilation`` attributes of the bundle registration in the resource registry points to.

.. note::

  You can see all the options of this executable by running ``./bin/plone-compile-resources --help``


Building the ``plone`` bundle::

  ./bin/plone-compile-resources -b plone


Building the ``plone-logged-in`` bundle::

  ./bin/plone-compile-resources -b plone-logged-in


Developing patterns
-------------------

All JavaScript code in this package is downloaded via ``yarn`` into ``src/plone/staticresources/static/components``.
Nothing in that directory should be manually edited.
If you need to fix something, do it in the original repository and eventually upgrade its version (next section).

For Mockup, the original repository is: https://github.com/plone/mockup/

For Patternslib, visit: http://github.com/patternslib/Patterns


How to upgrade the resources in this package
--------------------------------------------

- Increase ``npm`` package versions in ``package.json``, in sections ``dependencies`` or ``devDependencies``.

- Run ``yarn upgrade`` (cannot be ``npm``).

- Run ``./bin/plone-compile-resources -b plone``, ``./bin/plone-compile-resources -b plone-logged-in`` or whatever bundle you are going to build in your buildout's root directory.

- Increase the ``last_compilation`` date in ``src/plone/staticresources/profiles/default/registry/bundles.xml``.

- Submit a PR and run the tests on Jenkins.


How to generate the ``plone-compile-resources`` script
------------------------------------------------------

The ``plone-compile-resources`` script can be used to compile bundles from the command line.
In short, the script starts up a Plone instance, reads the resources and bundles configured in the registry and compiles a JS/CSS bundle based on that configuration. See ``plone-compile-resources --help`` for more information.

When using buildout, ``plone-compile-resources`` script is automatically generated.
If you use a custom buildout, you might need to add something similar to:

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

- All static resources - bundle resources, compiled bundles, external packages - from ``Products.CMFPlone.static`` have been moved here.

- The bundle and resource registrations from ``Products.CMFPlone``'s ``dependencies`` profile have also been moved here.

- The ``plone-compile-resources`` script has been moved here.

- The ``thememapper`` bundle from ``plone.app.theming`` has been moved here.

- The ``plone.resourceeditor`` bundle from ``plone.resourceeditor`` package has been moved here.

- The ``toolbar`` pattern from ``Products.CMFPlone.static.toolbar`` has been moved to ``mockup`` package.

- ``mockup`` package now uses npm registry and yarn instead of bower.


The resource registry and it's production and development modes
---------------------------------------------------------------

The files in  the directory ``plone/staticresources/static/`` are served by Plone.
In production mode Plone will combine the bundles (if configured) into single files.
The URLs will be similar to:

- http://localhost:8080//++plone++production/++unique++2019-01-08%2006%3A53%3A49.000248/default.js
- http://localhost:8080//++plone++production/++unique++2019-01-08%2006%3A53%3A49.000248/default.css


In development mode all bundles are served separately as non-compiled versions.
The URLs will be similar to:


- http://localhost:8080/++resource++plone.js
- http://localhost:8080/++resource++plone-logged-in.js
- http://localhost:8080/++plone++static/plone.less
- http://localhost:8080//++plone++static/plone-logged-in.less


If you set the resource registry to development mode you can set "Develop JavaScript" and "Develop CSS" for individual bundles.
Then each of the bundle resources are served individually, which makes it easy to develop on Mockup.
In this case, the bundle resources are served from the Mockup package instead of plone.staticresources.
The URLs will be similar to:

http://localhost:8080/Plone/++resource++mockup/livesearch/pattern.js
http://localhost:8080/Plone/++resource++mockup/livesearch/pattern.livesearch.less

Have a look on how plone.staticresources and mockup register their resources:

In ZCML:

https://github.com/plone/mockup/blob/master/mockup/configure.zcml
https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/configure.zcml

In the resource registry:

https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/profiles/default/registry/bundles.xml
https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/profiles/default/registry/resources.xml


For more information on the Plone resource registry see the documentation at:

https://docs.plone.org/adapt-and-extend/theming/resourceregistry.html


Warning
-------

If you update ``r.js`` or ``less``, you willl need to manually re-apply a patch that gives us cache busting resource downloads so we can build through the web. See:

- https://github.com/plone/Products.CMFPlone/commit/2d3865805efc6b72dce236eb68e502d8c57717b6

- https://github.com/plone/Products.CMFPlone/commit/bd1f9ba99d1ad40bb7fe1c00eaa32b8884aae5e2


License
-------

The project is licensed under the GPLv2.
