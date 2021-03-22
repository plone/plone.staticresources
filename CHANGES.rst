Changelog
=========

.. You should *NOT* be adding new change log entries to this file.
   You should create a file in the news directory instead.
   For helpful instructions, please see:
   https://github.com/plone/plone.releaser/blob/master/ADD-A-NEWS-ITEM.rst

.. towncrier release notes start

1.4.3 (2021-03-22)
------------------

Bug fixes:


- Reduce bundle sizes by not inlining fonts in each bundle - moved plone-fontello and glyphicons to their own bundle. Icon font bundles use fonts from ++plone++static/fonts/.
  Based on mockup 1.2.6.
  [agitator] (#131)


1.4.2 (2021-02-19)
------------------

New features:


- Upgrade to latest mockup from 3.x branch with structure fixes, 3.2.5.
  [thet] (#125)


Bug fixes:


- Remove bundle with typo.
  [petschki] (#123)
- Include upgrade step 12, which was missing.
  [thet] (#123)
- Replaced most upgrade profiles with one last_compilation profile.
  [maurits] (#126)


1.4.1 (2020-11-11)
------------------

Bug fixes:


- Update mockup to 3.2.4.
  [maurits] (#1031)


1.4.0 (2020-10-30)
------------------

New features:


- Updated Bootstrap Icons to 1.0.0 final.
  [santonelli] (#3162)


Bug fixes:


- Bumps bl from 4.0.2 to 4.0.3. [dependabot, jensens] (#97)
- Build bundles with latest mockup 3.x.
  [maurits] (#1026)
- Fixed deprecation warning for zope.site.hooks.
  [maurits] (#3130)


1.3.2 (2020-08-14)
------------------

Bug fixes:


- Update static resources.
  [pbauer] (#94)
- Fix content type icons not showing in the toolbar Add menu on Safari.
  This fixes https://github.com/plone/Products.CMFPlone/issues/3163
  [vincentfretin] (#95)


1.3.1 (2020-07-17)
------------------

Bug fixes:


- Update static resources.  Now in line with mockup 3.2.1.
  [vincentfretin] (#91)


1.3.0 (2020-06-28)
------------------

New features:


- Add figcaption support - https://github.com/plone/mockup/pull/911
  [thet] (#30)
- Register icon resources & add bootstrap-icons
  [agitator] (#75)
- Adapt ``pat-plone-modal`` and ``pat-inlinevalidation`` to work with barceloneta LTS.
  Add missing ``plone.svg`` icon.
  [petschki, agitator] (#76)
- Update static resources.
  [thet] (#82)


Bug fixes:


- Fix buildout and use latest Plone 5.2.
  [thet] (#51)
- Fix missing styles in plone-datatables bundle.
  [agitator] (#62)
- Upgrade resources with latest mockup.
  [thet] (#64)
- Move ``metadata.xml`` from async/registry profile directory to correct location. (#65)
- Add jQuery workaround for XSS vulnerability - https://github.com/plone/plone.staticresources/issues/69
  [frapell] (#69)
- Fix ``pat-querystring`` to set value of RelativeDateWidget correctly when editing
  [petschki] (#78)
- Hide upgrade profile
  [petschki] (#83)
- fix syntax in `upgrades/profiles/8/registry.xml`
  [petschki] (#85)


1.2.1 (2020-01-12)
------------------

Bug fixes:


- Fixed drag problem on click on sortable items in folder contents. (#56)
- Fix problem with TTW compilation of bundles. (#58)


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


