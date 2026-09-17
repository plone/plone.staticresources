plone.staticresources
=====================

This add-on contains Fonts, Icons and JavaScript used by Plone Classic-UI.

Version Information
-------------------

Each release line of this package delivers one Mockup release line to one Plone version:

- Version 3.1.x -> Plone 6.3 (Mockup 5.7.x)
- Version 3.0.x -> Plone 6.2 (Mockup 5.6.x)
- Version 2.3.x -> Plone 6.1 (Mockup 5.4.x)
- Version 2.1.x -> Plone 6.0 (Mockup 5.1.x)
- Version 1.x   -> Plone 5.2

Note on Version 2.x:

Since version 2.2.x TinyMCE got updated to version 6. Version 2.2.x is also compatible with ``Plone>=6.0.7``.

Note on Version 3.x:

Version 3.0.0 switched to a PEP 420 native namespace package and requires ``Plone>=6.2`` and Python 3.10 or later.


How to upgrade the resources in this package
--------------------------------------------

Run::

  make update-mockup
  make update-bootstrap-icons
  make update-country-flags


This downloads and installs the latest versions of these packages.
The commits and changelog entries are automatically made.

Run ``make -k all`` to update all resources and continue with the other
updates if one fails. The command still reports failure if any update fails.

The update targets invoke POSIX shell scripts in ``scripts/`` from the
repository root.

See the Makefile for more information.

Then submit a Pull Request and run the tests on Jenkins.

.. note::

  If you want to fix something or add functionality please go to the
  `Mockup <https://github.com/plone/mockup.git>`_ repository and follow the
  instructions there. This package is only to deliver the generated bundles.

License
-------

The project is licensed under the GPLv2.
