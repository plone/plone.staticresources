Changelog
=========

.. You should *NOT* be adding new change log entries to this file.
   You should create a file in the news directory instead.
   For helpful instructions, please see:
   https://github.com/plone/plone.releaser/blob/master/ADD-A-NEWS-ITEM.rst

.. towncrier release notes start

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
- - Integrate https://github.com/plone/mockup/pull/906 which fixes wrong in-path marking for similar pathnames. #26
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


