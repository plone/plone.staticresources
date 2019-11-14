Changelog
=========

.. You should *NOT* be adding new change log entries to this file.
   You should create a file in the news directory instead.
   For helpful instructions, please see:
   https://github.com/plone/plone.releaser/blob/master/ADD-A-NEWS-ITEM.rst

.. towncrier release notes start

1.2.0 (2019-11-14)
------------------

New features:


- Update jQuery from version 1.11.3 to 1.12.4
  [davilima6] (#34)
- Recompile 'plone' bundle after updating jQuery-related packages (#40)
- Update all components and recompile bundles. (#44)
- Split up bundles for more flexibility and optimized resource loading.
  Move select2 and datepicker to logged-in bundle.
  Move toolbar, portletmanager, querystring and structure pattern to editor bundle.
  Move tinymce to it's own bundle.
  Single out moment.js to reduce plone bundle size and allow async loading.
  Add optional datatables bundle.
  [agitator] (#46)


Bug fixes:


- Fix autotoc pattern: activate the element link with active class during initialization
  [mamico] (#37)
- Fix Tinymce pattern: Link popup looses tab selection on active linktype
  [mamico] (#37)
- build js/css for mockup changes plone/mockup#922
  [mamico] (#37)
- When compiling a bundle and including a resource from a request, open the
  temporary file in binary mode.
  [frapell] (#38)
- Bring fix for https://github.com/plone/mockup/issues/923
  [frapell] (#41)
- Fix "TTW Bundle compilation broken".
  Refs: https://github.com/plone/Products.CMFPlone/issues/2969
  [thet] (#43)


1.1.0 (2019-06-22)
------------------

New features:

- Add support for asynchronous loading of javascript resources.
  A new plone-base bundle is added with the minimum required scripts from plone bundle.
  Import the extra profile to enable experimental async loading.
  [agitator] (#27)

Bug fixes:

- Fixes plone/mockup#895 again. (#24)
- Fixed plone/Products.CMFPlone#2490 conflict in z-index between main toolbar and structure pattern toolbar (#25)
- Integrate https://github.com/plone/mockup/pull/906 which fixes wrong in-path marking for similar pathnames. #26
  [agitator] (#26)


1.0.2 (2019-03-21)
------------------

Bug fixes:

- Fix highlight of current item in nav for image and file.
  [agitator] (#18)
- Fix less building error.
  [vangheem] (#19)
- Update resources after alignment fix in Select2-based widgets
  [davilima6] (#21)


1.0.1 (2019-03-12)
------------------

Bug fixes:

- Fix highlight of current item in nav for image and file.
  [agitator] (#18)
- Update resources after alignment fix in Select2-based widgets
  [davilima6] (#21)


1.0.0 (2019-03-04)
------------------

New features:

- Ship moment.js without locales, which are now lazily loaded in 'mockup' package
  [davilima6] (#10)

Bug fixes:

- Customize select2 to work better with relateditems pattern, update compiled resources: plone, logged-in
  [MrTango] (#16)


1.0a1 (2019-02-13)
------------------

New features:

- Put together all Plone assets in a single package. [thet] (#1)


