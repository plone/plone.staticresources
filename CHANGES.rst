Changelog
=========

.. You should *NOT* be adding new change log entries to this file.
   You should create a file in the news directory instead.
   For helpful instructions, please see:
   https://github.com/plone/plone.releaser/blob/master/ADD-A-NEWS-ITEM.rst

.. towncrier release notes start

2.0.0b4 (2022-07-20)
--------------------

New features:


- Mockup update: register jquery and bootstrap globally.
  [petschki] (#231)
- Upgrade to @plone/mockup 5.0.0-alpha.17. (#232)


Bug fixes:


- Fix `exclude_from_nav` in `pat-structure` for items without metadata information.
  [petschki] (#230)
- Fix tinymce link/image modals.
  [petschki] (#233)
- Mockup update: `pat-relateditems` customizable templates.
  [petschki] (#234)


2.0.0b3 (2022-06-27)
--------------------

Bug fixes:


- Previous release is not installable, for unknown reasons.
  Rerelease, now also as wheel.  Maybe this helps.
  [maurits] (#200)


2.0.0b2 (2022-06-27)
--------------------

Bug fixes:


- Add Upgrade Stept for image full screen support
  [1letter] (#229)


2.0.0b1 (2022-06-24)
--------------------

New features:


- Integrate bootstrap and jquery bundles with module federation. They now live in the bundle-plone directory.
  [thet] (222-1)
- Makefile: Separate update-icons from build target.
  [thet] (222-2)
- Update iconmap.json.
  [thet] (222-3)
- Update README.rst
  [petschki] (#213)
- Update toolbar toggler.
  [agitator] (#220)
- Update to latest Mockup with module federation.
  [thet] (#222)
- Add image full screen support thru full screen API
  [MrTango] (#226)


Bug fixes:


- structure pattern fixes:

  - row actions cut/copy/default_page
  - datatable manual sorting

  [petschki] (#224)
- Fix popover positioning in structure pattern.
  [petschki] (#225)
- Refactor pat-recurrence:

  - remove jquerytools.overlay -> use `pat-plone-modal` instead
  - remove jquerytools.calendar -> use native <input type="date" />
  - update forms to Bootstrap 5

  [petschki] (#227)


2.0.0a3 (2022-04-08)
--------------------

Breaking changes:


- New version with Mockup ES6 support and removed TTW compilation (PLIP 3211). (#119)


New features:


- Restructure searchbox markup for mobile navigation as offcanvas sidebar.
  [agitator] (#202)
- Make pat-inject from patternslib available
  [agitator] (#208)
- Adding support for images in liveSearch results.
  [agitator] (#217)


Bug fixes:


- Italian translations have been updated [yurj] (#178)
- Remove obsolete plone-logged-in bundle.
  [pbauer] (#205)
- Add mimetype icons and change pdf icon
  [pbauer] (#215)
- Update `icons_bootstrap.xml` and `iconmap.json`, also automate this for future updates.
  [jensens] (#216)


2.0.0a2 (2021-10-22)
--------------------

New features:


- Created last_compilation profile as only place with last_compilation values.
  Moved the last_compilation values out of the default profile.
  Then we do not need a complete profile when we add an upgrade step for updating the last_compilation date of a bundle.
  [mauritsvanrees] (172-1)
- Hide the upgrades package from site-creation and quickinstaller.
  This way, we do not need to add each new upgrade profile to the list of non installable products.
  [mauritsvanrees] (172-2)
- Upgrade to Mockup 4.0.2.
  [thet] (172-3)
- Register new icons.
  [thet] (172-4)
- Adapt gitignore to only include necessary and registered dependencies.
  [thet] (174-1)
- Update Bootstrap to 5.1.1
  Update Bootstrap Icons to 1.5.0
  [petschki] (#164)


Bug fixes:


- Fix underscore version to 1.9.1 due to incompatibilities with backbone.paginator. (174-5)
- Add missing upgrade step for datatables.net-autofill resource location.
  [thet] (174-6)
- Update svg toolbar icons
  [agitator] (#165)


2.0.0a1 (2021-06-14)
--------------------

New features:


- Upgrade Mockup to version 4, patternslib to version 3 and jQuery to 3.5.1.
  [thet] (#102)
- Update Bootstrap to 5.0.0-alpha2
  Add bootstrap-js bundle
  [agitator] (#111)
- Provide a wide variety of SVG  based flags using the icon infrastructure
  Register new Resources
  Add NPM Package as source for Country Flags
  Add Custom SVG Language Flags
  [1letter] (#140)
- Update link type icons.
  [agitator] (#144)
- Update Bootstrap to 5.0.1
  [agitator] (#157)


Bug fixes:


- Remove bundle with typo
  [petschki] (#121)
- Increase Python package version number to 2.0.dev0.
  Start with the 2.x version numbers from 200 to not have same version numbers for multiple branches and stay aligned with the python package version.
  [thet] (#124)
- Fix selectors for ``sort_reversed`` checkbox in ``pat-querystring``
  [petschki] (#132, #145)
- Reduce bundle sizes by not inlining fonts in each bundle - moved plone-fontello and glyphicons to their own bundle. Icon font bundles use fonts from ++plone++static/fonts/.
  [agitator] (#134)


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


