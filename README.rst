plone.staticresources
=====================

This add-on contains all static JavaScript and CSS resources used by Plone.


Target audience
---------------

This documentation aims at:

- **Theme Authors:** who want to change the look and feel of a Plone site and need to:

  - understand how to correctly bundle changes made into existing or new frontend code.

- **Integrators and Developers:** who want to customize or maintain the front end of a Plone site for their customers:

  - upgrade existing versions or install new ``npm`` packages.

  - integrate new JavaScript/CSS behavior, eventually wrapped in a ``pattern`` for optimal integration and reuse within Plone front end ecosystem.

- **Plone Core Developers:** who want to fix Plone bugs or enhance this add-on.


How to upgrade the resources in this package
--------------------------------------------

.. note::
  Changes to JavaScript functionality must be done outside this package.
  If you want to fix something or add functionality in Mockup you have to do it there.
  This package is only to deliver the generated bundles as well as the npm dependencies so that building bundles is possible.

1. Add ``plone.staticresources`` (and maybe also ``mockup``) to ``checkouts.cfg`` in ``buildout.coredev``
   and do the buildout. This is important because otherwise ``./bin/plone-compile-resources`` will put the
   generated bundles in the released egg!

2. Don't run ``yarn upgrade`` in this package. If you want to upgrade all
   packages, do it in ``../src/mockup`` with ``rm yarn.lock && yarn`` (important: cannot be ``npm``) and execute the tests
   with ``make test`` there, commit the changes if all looks good.

3. In this package, increase npm package versions in ``package.json``, in sections ``dependencies`` or ``devDependencies``.
   If you increase the mockup version, please verify the resolutions section in
   ``package.json`` matches the one from mockup ``package.json``.
   Verify that the jquery version used is the same version that in mockup too.
   Then copy the yarn.lock from mockup ``cp ../src/mockup/yarn.lock .`` and run ``yarn``.
   This is to be sure we create the bundles with the same versions that mockup
   was tested with. Commit the changes made to ``package.json`` and
   ``yarn.lock``. Do a separate commit with the changes made in the ``components`` folder.

4. Run ``./bin/plone-compile-resources -b plone`` or ``./bin/plone-compile-resources -b plone-logged-in`` (whichever bundle you need to re-build). If you are unsure, build them all: ``./bin/plone-compile-resources``

5. Increase the ``last_compilation`` date in ``src/plone/staticresources/profiles/last_compilation/registry/bundles.xml``.

6. Create an upgrade step in ``plone.staticresources`` (most probably increasing ``last_compilation`` date).
   See ``upgrades/14.zcml`` for an example.
   Increment the version in ``src/plone/staticresources/profiles/default/metadata.xml``.

7. Submit a Pull Request and run the tests on Jenkins.


What has changed
----------------

Between Plone 5.0 and 5.1 these resources were located in ``static/`` directory of ``Products.CMFPlone`` package.
Starting with Plone 5.2 they are distributed in this independent package due to the specific tooling and workflows used to build frontend resources and also the different maintenance and release needs of ``Products.CMFPlone``.
For a complete list of reasons, read `PLIP 1653 <https://github.com/plone/Products.CMFPlone/issues/1653>`_.

.. note::
  A note on Yarn: we require the use of Yarn because it supports installing packages in a custom named directory, which Npm does not (even using ``--prefix``, ``node_modules`` is hardcoded).
  Our package directory is located at: ``src/plone/staticresources/static/components``.

Changes since Plone 5.1.x
^^^^^^^^^^^^^^^^^^^^^^^^^

- The ``toolbar`` pattern from ``Products.CMFPlone.static.toolbar`` has been moved to ``mockup`` package.
- ``mockup`` package now uses Npm's registry and Yarn instead of Bower.

Besides the following has been moved in here:

- All static Resources from ``Products.CMFPlone.static``: bundle resources, compiled bundles, external packages
- Bundle and Resource registrations from ``Products.CMFPlone``'s ``dependencies`` profile
- ``plone-compile-resources`` script
- ``thememapper`` bundle from ``plone.app.theming``
- ``plone.resourceeditor`` bundle from ``plone.resourceeditor``


Compiling Bundles
-----------------

The front end resources in this package should be updated with the script called ``plone-compile-resources``, available in the ``bin`` directory of a default Plone buildout installation.
This script compiles the final CSS and JS resources that will be served to end users.

Building the ``plone`` bundle::

  ./bin/plone-compile-resources -b plone

Building the ``plone-logged-in`` bundle::

  ./bin/plone-compile-resources -b plone-logged-in

.. note::
  You can see all the options of this executable by running ``./bin/plone-compile-resources --help``.


Resources, Bundles, Patterns and the Resource Registry
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The ``plone-compile-resources`` script collects Resources from source packages (e.g. ``mockup``) and compiles them in ``plone/staticresources/static/`` into minified versions with source maps and, for JavaScript only, also into an un-minified version.
The output directory is configurable by using ``csscompilation`` and ``jscompilation`` attributes of the bundle registration.

Bundles are groups of resources. By default Plone comes configured to serve two main bundles:

- ``plone``: containing JS and CSS used for anonymous visitors
- ``plone-logged-in``: with additional resources for authenticated visitors, e.g. for editor and management user interfaces

Finally Plone encapsulates most of its CSS and JS into units called Patterns that live in the ``mockup`` package.
Although Patterns provide their own registered Resources, those are not registered to Plone main bundles.
Instead, they are imported through native LESS and Require JS "entry points" that live in ``plone.staticresource``:

- `plone/staticresources/static/plone.js
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone.js>`_
- `plone/staticresources/static/plone.less
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone.less>`_
- `plone/staticresources/static/plone-logged-in.js
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone-logged-in.js>`_
- `plone/staticresources/static/plone-logged-in.less
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone-logged-in.less>`_

When editing a pattern (e.g. in ``mockup`` package), it is important to know for which bundle it is registered, which can be done by checking where it is imported in the entry points above.
The bundle name will be useful as parameter for ``plone-compile-resources`` script.

.. note::
  Patterns are also available as independent resources in `Resource Registries` control panel but they are not registered to default Plone bundles, which instead use the entry point approach.
  Pattern's resources may be useful if needed to be injected in specific views.

In production mode (``./bin/instance start``), since version 5.1, Plone is configured to serve Aggregate Bundles, single files to minimize network requests (`aggregate bundles <https://docs.plone.org/adapt-and-extend/theming/resourceregistry.html#resource-bundle-aggregation>`_).
In that case final production resource URLs will be similar to:

- http://localhost:8080//++plone++production/++unique++TIMESTAMP/default.js
- http://localhost:8080//++plone++production/++unique++TIMESTAMP/default.css

If you enable `Development Mode` for JavaScript and CSS in `Resource Registries` control panel, Plone will omit timestamp from path and serve fresh copies of the resources of the selected bundle(s).
Those are compiled in-browser, on the fly for each page load and requested by XHR requests to URLs like:

- http://localhost:8080/++resource++plone.js
- http://localhost:8080/++plone++static/plone.less
- http://localhost:8080/++resource++plone-logged-in.js
- http://localhost:8080/++plone++static/plone-logged-in.less

These entry points will then cause Patterns themselves to be loaded through in-browser XHR requests to URLs like:

- http://localhost:8080/Plone/++resource++mockup/livesearch/pattern.js
- http://localhost:8080/Plone/++resource++mockup/livesearch/pattern.livesearch.less

If you do enable Development Mode, and yet do not select any bundles, Plone serves static resources in URLs similar to:

- http://localhost:8080/++plone++static/++unique++TIMESTAMP/plone-compiled.min.js
- http://localhost:8080/++plone++static/++unique++TIMESTAMP/plone-compiled.css
- http://localhost:8080/++plone++static/++unique++TIMESTAMP/plone-logged-in-compiled.min.js
- http://localhost:8080/++plone++static/++unique++TIMESTAMP/plone-logged-in-compiled.css


Development tips
^^^^^^^^^^^^^^^^

When fixing Plone bugs or improving functionality:

- Dependencies upgrades (e.g. ``moment.js``) should be done in ``mockup`` and after the PR is merged, propagated here (i.e. static resources needs to be recompiled)
- Likewise, CSS and JS should be developed not in ``plone.staticresources`` but in their own package's source (for instance, in ``mockup``)
- To see the new changes in the browser, enable `Development Mode` in `Resource Registries` control panel.
  Next the desired bundle (that contains the modified files) must be set to either "Develop JavaScript", "Develop CSS" or both.
  This causes each of the bundle resources to be served individually, easing development.
  In this case, bundle resources are served from the source package (e.g. ``mockup``) instead of ``plone.staticresources``.
- To identify which bundle contains the modified resource, see section "Entry Points" below.
  Keep in mind the more bundles selected for development mode the slower are page reloads, so it is recommended to select only what is being developed.
- Alternatively you may run ``./bin/plone-compile-resources`` between changes and avoid `Development Mode`'s in-browser compilation (fastest browser loading time).


Entry Points
^^^^^^^^^^^^

The current list of registered patterns for each entry point is available in:

- `plone/staticresources/static/plone.js
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone.js>`_
- `plone/staticresources/static/plone.less
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone.less>`_
- `plone/staticresources/static/plone-logged-in.js
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone-logged-in.js>`_
- `plone/staticresources/static/plone-logged-in.less
  <https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/static/plone-logged-in.less>`_

Here's a snapshot:

For anonymous users
~~~~~~~~~~~~~~~~~~~

+---------------------------------------+------------------------------------+
| JS                                    | LESS                               |
+=======================================+====================================+
| - jquery                              | - mockup-patterns-autotoc          |
| - pat-registry                        | - mockup-patterns-livesearch       |
| - mockup-patterns-base                | - mockup-patterns-markspeciallinks |
| - mockup-patterns-autotoc             | - mockup-patterns-modal            |
| - mockup-patterns-contentloader       | - mockup-patterns-pickadate        |
| - mockup-patterns-cookietrigger       | - mockup-patterns-select2          |
| - mockup-patterns-formautofocus       |                                    |
| - mockup-patterns-formunloadalert     |                                    |
| - mockup-patterns-livesearch          |                                    |
| - mockup-patterns-markspeciallinks    |                                    |
| - mockup-patterns-modal               |                                    |
| - mockup-patterns-moment              |                                    |
| - mockup-patterns-pickadate           |                                    |
| - mockup-patterns-navigationmarker    |                                    |
| - mockup-patterns-preventdoublesubmit |                                    |
| - mockup-patterns-select2             |                                    |
| - bootstrap-collapse                  |                                    |
| - bootstrap-dropdown                  |                                    |
| - bootstrap-tooltip                   |                                    |
+---------------------------------------+------------------------------------+

For logged-in users
~~~~~~~~~~~~~~~~~~~

+--------------------------------------------+--------------------------------+
| JS                                         | LESS                           |
+============================================+================================+
| - mockup-patterns-inlinevalidation         | - mockup-patterns-querystring  |
| - mockup-patterns-querystring              | - mockup-patterns-recurrence   |
| - mockup-patterns-recurrence               | - mockup-patterns-relateditems |
| - mockup-patterns-relateditems             | - mockup-patterns-structure    |
| - mockup-patterns-structure                | - mockup-patterns-tinymce      |
| - mockup-patterns-structureupdater         | - mockup-patterns-upload       |
| - mockup-patterns-textareamimetypeselector | - plone-patterns-toolbar       |
| - mockup-patterns-tinymce                  |                                |
| - plone-patterns-portletmanager            |                                |
| - plone-patterns-toolbar                   |                                |
+--------------------------------------------+--------------------------------+

Developing patterns
-------------------

All JavaScript code in this package is downloaded via ``yarn`` into ``src/plone/staticresources/static/components``.
Nothing in that directory should be manually edited.
If you need to fix something, do it in the original repository and eventually upgrade its version (next section).

For Mockup, the original repository is: https://github.com/plone/mockup/

For Patternslib, visit: http://github.com/patternslib/Patterns


Generating the ``plone-compile-resources`` script
-------------------------------------------------

The ``plone-compile-resources`` script can be used to compile bundles from the command line.
In short, the script starts up a Plone instance, reads the resources and bundles configured in the registry and compiles a JS/CSS bundle based on that configuration.
See ``plone-compile-resources --help`` for more information.

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


More on the Resource Registry and its modes
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Have a look on how ``plone.staticresources`` and ``mockup`` register their resources:

In ZCML:

- https://github.com/plone/mockup/blob/master/mockup/configure.zcml
- https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/configure.zcml

In the resource registry:

- https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/profiles/default/registry/bundles.xml
- https://github.com/plone/plone.staticresources/blob/master/src/plone/staticresources/profiles/default/registry/resources.xml

For more information on the Plone resource registry see the documentation at:

- https://docs.plone.org/adapt-and-extend/theming/resourceregistry.html


License
-------

The project is licensed under the GPLv2.
